import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const getVendors = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const vendors = await prisma.vendor.findMany({
    include: {
      user: { select: { name: true, avatar: true } },
      _count: { select: { reviews: true } },
    },
  });

  res.status(200).json({ vendors });
});

export const getVendorById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: req.params.id as any },
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
