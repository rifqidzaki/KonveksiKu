import { Request, Response } from 'express';
import prisma from '../config/database';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const where = category ? { category: category as string } : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};
