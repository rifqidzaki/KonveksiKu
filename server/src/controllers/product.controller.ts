import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ products });
});

export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id as any } });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ product });
});
