import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socketAuth';
import prisma from '../db/prisma';

export const setupChatHandler = (io: SocketServer) => {
  // Store online users: userId -> socketId
  const onlineUsers = new Map<string, string>();

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    console.log(`User ${userId} connected to chat`);

    // Add user to online users
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit('user-online', { userId });

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Handle joining a conversation room
    socket.on('join-conversation', async (data: { conversationId: string }) => {
      const { conversationId } = data;

      // Verify user is a participant in this conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: {
          participant1Id: true,
          participant2Id: true,
        },
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
        socket.emit('error', { message: 'Unauthorized access to conversation' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    // Handle leaving a conversation room
    socket.on('leave-conversation', (data: { conversationId: string }) => {
      socket.leave(`conversation:${data.conversationId}`);
    });

    // Handle sending a message
    socket.on('send-message', async (data: {
      conversationId: string;
      content: string;
      imageUrl?: string;
    }) => {
      try {
        const { conversationId, content, imageUrl } = data;

        // Verify user is a participant
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: {
            participant1Id: true,
            participant2Id: true,
          },
        });

        if (!conversation || (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content,
            imageUrl: imageUrl || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        });

        // Update conversation's last message
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessage: content.substring(0, 100), // Store first 100 chars
            lastMessageAt: new Date(),
          },
        });

        // Get the other participant
        const otherParticipantId = conversation.participant1Id === userId 
          ? conversation.participant2Id 
          : conversation.participant1Id;

        // Emit message to all clients in the conversation room
        io.to(`conversation:${conversationId}`).emit('new-message', message);

        // Send notification to other participant if they're not in the room
        io.to(`user:${otherParticipantId}`).emit('message-notification', {
          conversationId,
          message: {
            ...message,
            preview: content.substring(0, 50),
          },
        });

        console.log(`Message sent in conversation ${conversationId} by user ${userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle marking messages as read
    socket.on('mark-read', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;

        // Mark all unread messages in this conversation as read
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId }, // Messages from other users
            isRead: false,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        // Notify the sender that messages were read
        io.to(`conversation:${conversationId}`).emit('messages-read', {
          conversationId,
          readBy: userId,
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
        userId,
        conversationId: data.conversationId,
      });
    });

    socket.on('stop-typing', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user-stopped-typing', {
        userId,
        conversationId: data.conversationId,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from chat`);
      onlineUsers.delete(userId);
      socket.broadcast.emit('user-offline', { userId });
    });

    // Handle getting online status
    socket.on('get-online-status', (data: { userIds: string[] }) => {
      const statuses = data.userIds.map((id) => ({
        userId: id,
        isOnline: onlineUsers.has(id),
      }));
      socket.emit('online-statuses', statuses);
    });
  });
};

