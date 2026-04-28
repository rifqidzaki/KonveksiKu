import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { vendorId, orderId, rating, comment } = req.body;

    if (!vendorId || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Vendor ID and rating (1-5) are required' });
      return;
    }

    // Verify user has a completed order with this vendor
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId, vendorId, status: 'DELIVERED' },
      });
      if (!order) {
        res.status(400).json({ error: 'You can only review after order is delivered' });
        return;
      }
    }

    // Check duplicate review
    const existing = await prisma.review.findFirst({
      where: { userId, vendorId, ...(orderId ? { orderId } : {}) },
    });
    if (existing) {
      res.status(400).json({ error: 'You already reviewed this vendor for this order' });
      return;
    }

    const review = await prisma.review.create({
      data: { userId, vendorId, orderId, rating, comment },
      include: { user: { select: { name: true, avatar: true } } },
    });

    // Update vendor rating
    const allReviews = await prisma.review.findMany({ where: { vendorId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { rating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length },
    });

    res.status(201).json({ message: 'Review submitted', review });
});

export const getVendorReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { vendorId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { vendorId: vendorId as string },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
    });

    res.status(200).json({ reviews });
});
