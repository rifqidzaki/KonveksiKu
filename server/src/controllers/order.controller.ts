import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { catchAsync } from '../utils/catchAsync';

export const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { vendorId, items, shippingAddress, notes } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order must have at least one item' });
      return;
    }

    // Calculate total price (you should ideally fetch prices from DB)
    const totalPrice = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    const order = await prisma.order.create({
      data: {
        userId: userId as any,
        vendorId,
        shippingAddress,
        notes,
        totalPrice,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            designId: item.designId,
            quantity: item.quantity,
            price: item.price,
            requirements: item.requirements || '',
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json({ message: 'Order created', order });
});

export const getMyOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    let where: any = { userId };
    if (role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: userId as any } });
      if (vendor) where = { vendorId: vendor.id };
      else where = { vendorId: 'non-existent' };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        vendor: { select: { businessName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ orders });
});

export const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as any },
      include: {
        items: { include: { product: true, design: true } },
        vendor: { include: { user: { select: { name: true, phone: true } } } },
        user: { select: { name: true, email: true, phone: true, address: true } },
        payment: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: { sender: { select: { name: true, role: true } } },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({ order });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status, trackingNumber } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const order = await prisma.order.update({
      where: { id: req.params.id as any },
      data: {
        status: status as any,
        ...(trackingNumber && { trackingNumber }),
      },
      include: {
        items: { include: { product: true } },
        vendor: { include: { user: { select: { name: true } } } },
      },
    });

    res.status(200).json({ message: 'Order status updated', order });
});
