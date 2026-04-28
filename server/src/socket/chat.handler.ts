import { Server, Socket } from 'socket.io';
import prisma from '../config/database';
import { verifyToken } from '../utils/jwt';

export const setupSocketHandlers = (io: Server) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }
    (socket as any).userId = decoded.id;
    (socket as any).userRole = decoded.role;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Join an order chat room
    socket.on('join_room', async (orderId: string) => {
      try {
        // Verify user has access to this order
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { vendor: true },
        });

        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        // Only order owner or vendor can join
        const isOwner = order.userId === userId;
        const isVendor = order.vendor.userId === userId;

        if (!isOwner && !isVendor) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(`order:${orderId}`);
        console.log(`User ${userId} joined room order:${orderId}`);

        // Load chat history
        const messages = await prisma.message.findMany({
          where: { orderId },
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, role: true, avatar: true } } },
        });

        socket.emit('chat_history', messages);

        // Mark messages as read
        await prisma.message.updateMany({
          where: {
            orderId,
            senderId: { not: userId },
            isRead: false,
          },
          data: { isRead: true },
        });
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send message
    socket.on('send_message', async (data: {
      orderId: string;
      content: string;
      attachmentUrl?: string;
    }) => {
      try {
        const { orderId, content, attachmentUrl } = data;

        if (!content?.trim() && !attachmentUrl) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            orderId,
            senderId: userId,
            content: content?.trim() || '',
            attachmentUrl,
          },
          include: {
            sender: { select: { id: true, name: true, role: true, avatar: true } },
          },
        });

        // Broadcast to room
        io.to(`order:${orderId}`).emit('new_message', message);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { orderId: string; isTyping: boolean }) => {
      socket.to(`order:${data.orderId}`).emit('user_typing', {
        userId,
        isTyping: data.isTyping,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (orderId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            orderId,
            senderId: { not: userId },
            isRead: false,
          },
          data: { isRead: true },
        });
        io.to(`order:${orderId}`).emit('messages_read', { userId, orderId });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
};
