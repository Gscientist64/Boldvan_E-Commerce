import express from 'express';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Create booking
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { serviceId, date, timeSlot, address, phone, notes } = req.body;

    // Validate service
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Service not available' });
    }

    // Check for conflicting bookings (simplified)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        serviceId,
        date: new Date(date),
        timeSlot,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({ 
        message: 'This time slot is already booked. Please choose another time.' 
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        date: new Date(date),
        timeSlot,
        address,
        phone,
        notes,
        status: 'PENDING'
      },
      include: {
        service: {
          select: {
            name: true,
            type: true,
            price: true,
            duration: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // In production: Send confirmation email
    // await sendBookingConfirmationEmail(booking);

    res.status(201).json({
      booking,
      message: 'Booking request submitted successfully. Our team will contact you shortly.'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          service: {
            select: {
              name: true,
              type: true,
              price: true,
              duration: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found or cannot be cancelled' 
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      booking: updatedBooking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;