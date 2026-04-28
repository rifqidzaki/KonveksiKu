import { Request, Response } from 'express';
import prisma from '../config/database';

export const saveDesign = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Save design error:', error);
    res.status(500).json({ error: 'Failed to save design' });
  }
};

export const getDesigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const designs = await prisma.design.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ designs });
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ error: 'Failed to get designs' });
  }
};

export const getDesignById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const design = await prisma.design.findFirst({
      where: { id, userId },
    });

    if (!design) {
      res.status(404).json({ error: 'Design not found' });
      return;
    }

    res.status(200).json({ design });
  } catch (error) {
    console.error('Get design error:', error);
    res.status(500).json({ error: 'Failed to get design' });
  }
};

export const updateDesign = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, canvasData, previewUrl } = req.body;

    const existing = await prisma.design.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Design not found' });
      return;
    }

    const design = await prisma.design.update({
      where: { id },
      data: { name, canvasData, previewUrl },
    });

    res.status(200).json({ message: 'Design updated', design });
  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({ error: 'Failed to update design' });
  }
};

export const deleteDesign = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const existing = await prisma.design.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Design not found' });
      return;
    }

    await prisma.design.delete({ where: { id } });
    res.status(200).json({ message: 'Design deleted' });
  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({ error: 'Failed to delete design' });
  }
};
