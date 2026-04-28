import { Request, Response } from 'express';
import prisma from '../config/database';

// Create payment (simulated Midtrans Snap token generation)
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, items: { include: { product: true } } },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if payment already exists
    if (order.payment) {
      if (order.payment.status === 'PAID') {
        res.status(400).json({ error: 'Order already paid' });
        return;
      }
      // Return existing pending payment
      res.status(200).json({
        payment: order.payment,
        snapToken: `SNAP-${order.payment.id.slice(0, 8).toUpperCase()}`,
      });
      return;
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.totalPrice,
        status: 'PENDING',
      },
    });

    // In production, you would generate a Midtrans Snap token here
    // For sandbox/demo, we return a simulated token
    const snapToken = `SNAP-${payment.id.slice(0, 8).toUpperCase()}`;

    res.status(201).json({
      message: 'Payment created',
      payment,
      snapToken,
      // In production: redirectUrl for Midtrans
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Simulate payment confirmation (in production, this is a Midtrans webhook)
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId, paymentMethod } = req.body;

    if (!paymentId) {
      res.status(400).json({ error: 'Payment ID is required' });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (payment.status === 'PAID') {
      res.status(400).json({ error: 'Payment already confirmed' });
      return;
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paymentMethod: paymentMethod || 'bank_transfer',
        paidAt: new Date(),
      },
    });

    // Update order status to CONFIRMED
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED' },
    });

    res.status(200).json({
      message: 'Payment confirmed',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// Get payment status
export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    res.status(200).json({ payment });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};
