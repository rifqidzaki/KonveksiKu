import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

// Get payment status
export const getPaymentStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payment = await prisma.payment.findUnique({
      where: { orderId: req.params.orderId as any },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    res.status(200).json({ payment });
});
