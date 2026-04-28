import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const getVendors = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { location, specialization, sort } = req.query;

  const where: any = { isVerified: true };
  if (location) where.location = { contains: location as string, mode: 'insensitive' };
  if (specialization) where.specialization = { has: specialization as string };

  const orderBy: any = sort === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' };

  const vendors = await prisma.vendor.findMany({
    where,
    orderBy,
    include: {
      user: { select: { name: true, avatar: true } },
    },
  });

  res.status(200).json({ vendors });
});

export const getVendorById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, avatar: true, phone: true } },
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!vendor) {
    res.status(404).json({ error: 'Vendor not found' });
    return;
  }

  res.status(200).json({ vendor });
});
