import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.query;
    const where = category ? { category: category as string } : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ products });
});

export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: id as string } });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ product });
});
