import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { orderId, rating, comment } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId as any },
    });

    if (!order || order.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to review this order' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: userId as any,
        orderId: orderId as any,
        vendorId: order.vendorId,
        rating,
        comment,
      },
    });

    res.status(201).json({ message: 'Review created', review });
});

export const getVendorReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await prisma.review.findMany({
      where: { vendorId: req.params.vendorId as any },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
    });

    res.status(200).json({ reviews });
});
