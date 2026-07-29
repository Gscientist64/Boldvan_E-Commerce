import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Zap,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const OtpVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Auto-send OTP on page load
  useEffect(() => {
    if (!email) return;
    const autoSendOtp = async () => {
      try {
        const response = await fetch(`${API_URL}/otp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'REGISTRATION' }),
        });
        const data = await response.json();
        if (response.ok) {
          setCountdown(30);
        }
      } catch {
        // Silently fail - user can click resend
      }
    };
    autoSendOtp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = Math.min(digits.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex]?.focus();
      }
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, type: 'REGISTRATION' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess('Email verified successfully!');
      toast.success('Email verified! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setError('');
    setIsResending(true);
    try {
      const response = await fetch(`${API_URL}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'REGISTRATION' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0]?.focus();
      setCountdown(30);
      toast.success('New OTP sent to your email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <Card className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg text-slate-800 font-semibold mb-2">Missing Email</h2>
            <p className="text-sm text-slate-500 mb-4">No email address was provided. Please register first.</p>
            <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 overflow-hidden relative">
      {/* Top decorative bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-boldvan-500 to-emerald-500" />

      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-32 w-72 h-72 bg-teal-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-32 w-72 h-72 bg-boldvan-500/[0.04] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-wide">
            BOLD<span className="text-teal-600">VAN</span>
          </h1>
        </motion.div>

        <Card className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-boldvan-500 to-emerald-500 rounded-t-xl" />

          <CardHeader className="pb-2 pt-5 px-6">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100">
                <Mail className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <CardTitle className="text-lg text-center text-slate-800">
              Verify Your Email
            </CardTitle>
            <p className="text-center text-[11px] text-slate-500 mt-1">
              We sent a 6-digit code to
            </p>
            <p className="text-center text-sm font-medium text-teal-600 mt-0.5">{email}</p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <p className="text-[11px] text-red-600">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-emerald-700">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <Label className="text-slate-700 text-xs font-medium text-center block">
                Enter verification code
              </Label>
              <div className="flex items-center justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-bold bg-white border-slate-300 text-slate-800 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <Button
                onClick={handleVerify}
                className="w-full h-9 text-sm bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] transition-all duration-300"
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Verifying...</>
                ) : (
                  <>Verify Email <ShieldCheck className="ml-1.5 h-3.5 w-3.5" /></>
                )}
              </Button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-[11px] text-slate-500 mb-1">Didn't receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                  className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-500 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending
                    ? 'Sending...'
                    : countdown > 0
                      ? `Resend in ${countdown}s`
                      : 'Resend code'}
                </button>
              </div>

              {/* Back to login */}
              <div className="text-center pt-1">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowRight className="h-3 w-3 rotate-180" />
                  Back to login
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-4 text-[10px] text-slate-400"
        >
          &copy; 2026 BOLDVAN. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default OtpVerificationPage;
