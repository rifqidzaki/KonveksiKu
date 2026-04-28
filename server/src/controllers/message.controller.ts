import { Request, Response } from 'express';
import prisma from '../config/database';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;

    // Verify access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const isOwner = order.userId === userId;
    const isVendor = order.vendor.userId === userId;
    if (!isOwner && !isVendor) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, role: true, avatar: true } } },
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Get conversations (orders with chat) for current user
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let where: any = {};
    if (userRole === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId } });
      if (vendor) where = { vendorId: vendor.id };
    } else {
      where = { userId };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        vendor: { select: { businessName: true, user: { select: { name: true, avatar: true } } } },
        user: { select: { name: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, isRead: true, senderId: true },
        },
        _count: {
          select: {
            messages: { where: { senderId: { not: userId }, isRead: false } },
          },
        },
      },
    });

    const conversations = orders.map((order) => ({
      orderId: order.id,
      status: order.status,
      vendor: order.vendor,
      user: order.user,
      lastMessage: order.messages[0] || null,
      unreadCount: order._count.messages,
    }));

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};
