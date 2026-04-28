import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const getMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = String(req.user?.id);
    const orderId = String(req.params.orderId);

    // Verify access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const isOwner = order.userId === ownerId;
    const isVendor = order.vendor.userId === ownerId;
    if (!isOwner && !isVendor) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { orderId: orderId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, role: true, avatar: true } } },
    });

    res.status(200).json({ messages });
});

// Get conversations (orders with chat) for current user
export const getConversations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = String(req.user?.id);
    const userRole = String(req.user?.role);

    if (!userId || userId === 'undefined') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let where: any = {};
    if (userRole === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: userId } });
      if (vendor) where = { vendorId: vendor.id };
    } else {
      where = { userId: userId };
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
});
