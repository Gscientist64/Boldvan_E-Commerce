// backend/src/routes/webhooks.routes.ts
// Payment provider webhooks (Paystack + Flutterwave).
// - Paystack: HMAC-SHA512 signature over the raw body (x-paystack-signature).
// - Flutterwave: the transaction is re-verified server-to-server with the secret key.
// Both idempotently mark an order paid + CONFIRMED only after verification passes.

import express from 'express';
import crypto from 'crypto';
import { prisma } from '../utils/database';

const router = express.Router();

// Constant-time string comparison to avoid timing attacks
const safeEqual = (a: string, b: string): boolean => {
  const ba = Buffer.from(String(a), 'utf8');
  const bb = Buffer.from(String(b), 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
};

// Fetch with a bounded timeout
const providerFetch = async (url: string, secretKey: string): Promise<any | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: controller.signal
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Webhook provider fetch error:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

// The internal order id we embed in the provider metadata at checkout time.
const extractOrderId = (data: any): string | null => {
  const meta = data && data.metadata;
  if (Array.isArray(meta && meta.custom_fields)) {
    const field = meta.custom_fields.find(
      (f: any) => f && f.variable_name === 'order_id' && f.value
    );
    if (field) return String(field.value);
  }
  if (meta && meta.order_id) return String(meta.order_id);
  return null;
};

// Fallback: parse "PS-<orderId>-..." / "FLW-<orderId>-..." style references.
const orderIdFromReference = (reference: string | null | undefined, prefix: string): string | null => {
  if (!reference) return null;
  const parts = String(reference).split('-');
  if (parts[0] && parts[0].toUpperCase() === prefix && parts[1]) return parts[1];
  return null;
};

// Idempotently confirm an order once a payment is verified. amountSmallestUnit is
// compared against the stored order total (in kobo) when the provider reports it.
const confirmOrderPaid = async (
  orderId: string,
  reference: string | null,
  amountSmallestUnit: number | null,
  provider: string
): Promise<boolean> => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return false;

  // Idempotent: already recorded as paid.
  if (order.paymentStatus === 'paid') {
    return true;
  }

  // Amount defence: provider-reported amount must match the order total.
  if (amountSmallestUnit != null && Number.isFinite(amountSmallestUnit)) {
    const expected = Math.round(order.totalAmount * 100);
    if (Math.abs(amountSmallestUnit - expected) > 1) {
      console.warn(`Webhook amount mismatch for order ${orderId}: got ${amountSmallestUnit}, expected ${expected}`);
      return false;
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'paid',
      paymentReference: reference || order.paymentReference,
      paymentMethod: provider,
      status: 'CONFIRMED'
    }
  });
  return true;
};

// ============ Paystack ============
// Signed with HMAC-SHA512 of the RAW body using the Paystack secret key.
router.post('/paystack', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string | undefined;
    const rawBody = (req as any).rawBody as string | undefined;
    const settings = await prisma.marketplaceSettings.findFirst();

    if (!settings?.paystackSecretKey || !signature) {
      console.warn('Paystack webhook received but no secret configured; ignoring.');
      return res.status(200).end();
    }
    if (!rawBody) {
      console.warn('Paystack webhook received without a raw body; ignoring.');
      return res.status(200).end();
    }

    const expected = crypto
      .createHmac('sha512', settings.paystackSecretKey)
      .update(rawBody)
      .digest('hex');
    if (!safeEqual(expected, signature)) {
      console.warn('Paystack webhook signature mismatch; ignoring.');
      return res.status(401).end();
    }

    const event = JSON.parse(rawBody);
    if (event && event.event === 'charge.success') {
      const data = event.data || {};
      const orderId = extractOrderId(data) || orderIdFromReference(data.reference, 'PS');
      if (orderId) {
        await confirmOrderPaid(
          orderId,
          data.reference || null,
          typeof data.amount === 'number' ? data.amount : null,
          'paystack'
        );
      }
    }
    res.status(200).end();
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(200).end(); // always ack so the provider stops retrying
  }
});

// ============ Flutterwave ============
// Flutterwave's "verif-hash" is a dashboard-configured secret, so instead we
// re-verify the transaction server-to-server using the stored secret key.
router.post('/flutterwave', async (req, res) => {
  try {
    const settings = await prisma.marketplaceSettings.findFirst();
    const body = req.body || {};
    const data = body.data || {};

    if (!settings?.flutterwaveSecretKey) {
      console.warn('Flutterwave webhook received but no secret configured; ignoring.');
      return res.status(200).end();
    }

    const eventStatus = body.event === 'charge.completed' || data.status === 'successful';
    if (!eventStatus) {
      return res.status(200).end();
    }

    const txRef = data.tx_ref as string | undefined;
    const txId = data.id as string | number | undefined;
    if (!txRef && !txId) {
      return res.status(200).end();
    }

    const url = txRef
      ? `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`
      : `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(txId))}/verify`;

    const result = await providerFetch(url, settings.flutterwaveSecretKey);
    const tx = result && (Array.isArray(result.data) ? result.data[0] : result.data);

    if (!tx || tx.status !== 'successful') {
      return res.status(200).end();
    }

    const orderId = extractOrderId(data) || orderIdFromReference(txRef || data.tx_ref, 'FLW');
    if (orderId) {
      const amountKobo = typeof tx.amount === 'number' ? Math.round(tx.amount * 100) : null;
      await confirmOrderPaid(orderId, String(tx.id || txRef || ''), amountKobo, 'flutterwave');
    }
    res.status(200).end();
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    res.status(200).end();
  }
});

export default router;
