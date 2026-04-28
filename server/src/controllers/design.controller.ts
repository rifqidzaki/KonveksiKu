import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const saveDesign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { name, canvasData, previewUrl } = req.body;
  if (!name || !canvasData) {
    res.status(400).json({ error: 'Name and canvas data are required' });
    return;
  }

  const design = await prisma.design.create({
    data: { userId, name, canvasData, previewUrl },
  });

  res.status(201).json({ message: 'Design saved', design });
});

export const getDesigns = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const designs = await prisma.design.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ designs });
});

export const getDesignById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const design = await prisma.design.findFirst({
    where: { id: id as string, userId: userId as string },
  });

  if (!design) {
    res.status(404).json({ error: 'Design not found' });
    return;
  }

  res.status(200).json({ design });
});

export const updateDesign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { name, canvasData, previewUrl } = req.body;

  const existing = await prisma.design.findFirst({ where: { id: id as string, userId: userId as string } });
  if (!existing) {
    res.status(404).json({ error: 'Design not found' });
    return;
  }

  const design = await prisma.design.update({
    where: { id: id as string },
    data: { name, canvasData, previewUrl },
  });

  res.status(200).json({ message: 'Design updated', design });
});

export const deleteDesign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const existing = await prisma.design.findFirst({ where: { id: id as string, userId: userId as string } });
  if (!existing) {
    res.status(404).json({ error: 'Design not found' });
    return;
  }

  await prisma.design.delete({ where: { id: id as string } });
  res.status(200).json({ message: 'Design deleted' });
});
