import { Request, Response } from 'express';
import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';
import { catchAsync } from '../utils/catchAsync';
import { NextFunction } from 'express';

export const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { vendorId, shippingAddress, notes, items } = req.body;

    if (!vendorId || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Vendor, shipping address, and items are required' });
      return;
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }

    // Calculate total price
    let totalPrice = new Decimal(0);
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        res.status(404).json({ error: `Product ${item.productId} not found` });
        return;
      }

      // Price calculation: base price * quantity with bulk discount
      const qty = item.quantity || 1;
      let unitPrice = product.basePrice;

      // Bulk discount logic
      if (qty >= 100) unitPrice = new Decimal(Number(unitPrice) * 0.80);       // 20% off
      else if (qty >= 50) unitPrice = new Decimal(Number(unitPrice) * 0.85);   // 15% off
      else if (qty >= 24) unitPrice = new Decimal(Number(unitPrice) * 0.90);   // 10% off
      else if (qty >= 12) unitPrice = new Decimal(Number(unitPrice) * 0.95);   // 5% off

      // Material surcharge
      const premiumMaterials = ['Cotton Bamboo', 'French Terry', 'Lacoste Cotton'];
      if (premiumMaterials.includes(item.material)) {
        unitPrice = new Decimal(Number(unitPrice) * 1.15); // 15% premium
      }

      const subtotal = new Decimal(Number(unitPrice) * qty);
      totalPrice = new Decimal(Number(totalPrice) + Number(subtotal));

      orderItems.push({
        productId: item.productId,
        designId: item.designId || null,
        material: item.material,
        size: item.size,
        color: item.color,
        quantity: qty,
        unitPrice,
        subtotal,
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        vendorId,
        shippingAddress,
        notes,
        totalPrice,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true, design: true },
        },
        vendor: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    res.status(201).json({ message: 'Order created', order });
});

export const getOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    let where: any = {};

    if (userRole === 'VENDOR') {
      // Vendor sees orders assigned to them
      const vendor = await prisma.vendor.findUnique({ where: { userId } });
      if (vendor) where = { vendorId: vendor.id };
    } else {
      // User sees their own orders
      where = { userId };
    }

    const orders = await prisma.order.findMany({
      take: limit,
      skip: skip,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        vendor: { include: { user: { select: { name: true } } } },
        user: { select: { name: true, email: true } },
        payment: true,
      },
    });


    const total = await prisma.order.count({ where });
    res.status(200).json({ 
      orders, 
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } 
    });
});

export const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: id as string },
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
    const userId = req.user?.id;
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const order = await prisma.order.update({
      where: { id: id as string },
      data: {
        status: status as any,
        ...(trackingNumber && { trackingNumber }),
      },
      include: {
        items: { include: { product: true } },
        vendor: { include: { user: { select: { name: true } } } },
      },
    });

    res.status(200).json({ message: "Order status updated", order });
});

// Price calculator endpoint (no auth needed)
export const calculatePrice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { productId, material, quantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    let unitPrice = Number(product.basePrice);

    // Bulk discount
    let discountPercent = 0;
    if (quantity >= 100) discountPercent = 20;
    else if (quantity >= 50) discountPercent = 15;
    else if (quantity >= 24) discountPercent = 10;
    else if (quantity >= 12) discountPercent = 5;

    unitPrice = unitPrice * (1 - discountPercent / 100);

    // Premium material surcharge
    const premiumMaterials = ['Cotton Bamboo', 'French Terry', 'Lacoste Cotton'];
    let materialSurcharge = 0;
    if (premiumMaterials.includes(material)) {
      materialSurcharge = 15;
      unitPrice = unitPrice * 1.15;
    }

    const subtotal = unitPrice * (quantity || 1);

    res.status(200).json({
      basePrice: Number(product.basePrice),
      unitPrice: Math.round(unitPrice),
      quantity: quantity || 1,
      discountPercent,
      materialSurcharge,
      subtotal: Math.round(subtotal),
    });
});
