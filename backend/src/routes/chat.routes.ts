import { Router, Response } from 'express';
import prisma from '../db/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all conversations for the authenticated user
router.get('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            primaryImage: true,
            salePrice: true,
            rentalPrice: true,
            isForRent: true,
            isForSale: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get or create a conversation between two users (optionally linked to a car)
router.post('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { otherUserId, carId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ error: 'otherUserId is required' });
    }

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Verify other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      return res.status(404).json({ error: 'Other user not found' });
    }

    // If carId is provided, verify it exists
    if (carId) {
      const car = await prisma.car.findUnique({
        where: { id: carId },
      });
      if (!car) {
        return res.status(404).json({ error: 'Car not found' });
      }
    }

    // Determine participant order (always use smaller ID as participant1 for consistency)
    const [participant1Id, participant2Id] = [userId, otherUserId].sort();

    // Check if conversation already exists
    // Handle null carId properly - Prisma requires explicit null handling
    const whereClause: any = {
      participant1Id,
      participant2Id,
      ...(carId ? { carId } : { carId: null }),
    };

    let conversation = await prisma.conversation.findFirst({
      where: whereClause,
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            primaryImage: true,
            salePrice: true,
            rentalPrice: true,
            isForRent: true,
            isForSale: true,
          },
        },
      },
    });

    // Create new conversation if it doesn't exist
    // Use transaction to prevent race conditions
    if (!conversation) {
      try {
        conversation = await prisma.$transaction(async (tx) => {
          // Double-check inside transaction to prevent duplicate creation
          const existing = await tx.conversation.findFirst({
            where: whereClause,
          });
          
          if (existing) {
            return existing;
          }

          // Create new conversation
          // Note: rentalId is NOT a field on Conversation - Rental has conversationId instead
          return await tx.conversation.create({
            data: {
              participant1Id,
              participant2Id,
              carId: carId || null,
            },
            include: {
              participant1: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  role: true,
                },
              },
              participant2: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  role: true,
                },
              },
              car: {
                select: {
                  id: true,
                  brand: true,
                  model: true,
                  year: true,
                  primaryImage: true,
                  salePrice: true,
                  rentalPrice: true,
                  isForRent: true,
                  isForSale: true,
                },
              },
            },
          });
        });
        
        // Fetch full conversation details if not included
        if (conversation && !conversation.participant1) {
          conversation = await prisma.conversation.findUnique({
            where: { id: conversation.id },
            include: {
              participant1: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  role: true,
                },
              },
              participant2: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  role: true,
                },
              },
              car: {
                select: {
                  id: true,
                  brand: true,
                  model: true,
                  year: true,
                  primaryImage: true,
                  salePrice: true,
                  rentalPrice: true,
                  isForRent: true,
                  isForSale: true,
                },
              },
            },
          });
        }
      } catch (createError: any) {
        // Handle unique constraint violation (race condition)
        if (createError.code === 'P2002') {
          // Conversation was created by another request, fetch it
          conversation = await prisma.conversation.findFirst({
            where: whereClause,
            include: {
              participant1: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  role: true,
                },
              },
              participant2: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  role: true,
                },
              },
              car: {
                select: {
                  id: true,
                  brand: true,
                  model: true,
                  year: true,
                  primaryImage: true,
                  salePrice: true,
                  rentalPrice: true,
                  isForRent: true,
                  isForSale: true,
                },
              },
            },
          });
        } else {
          throw createError;
        }
      }
    }

    res.json({ conversation });
  } catch (error: any) {
    console.error('Error creating/fetching conversation:', error);
    // Log the full error details for debugging
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
    if (error.meta) {
      console.error('Prisma error meta:', error.meta);
    }
    res.status(500).json({ 
      error: 'Failed to create/fetch conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participant1Id: true,
        participant2Id: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Convert to string for comparison (in case of UUID string vs string mismatch)
    const userIdStr = String(userId);
    const participant1Str = String(conversation.participant1Id);
    const participant2Str = String(conversation.participant2Id);

    if (participant1Str !== userIdStr && participant2Str !== userIdStr) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }

    // Build query
    const where: any = { conversationId };
    if (before) {
      where.createdAt = { lt: new Date(before as string) };
    }

    const messages = await prisma.message.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ messages: messages.reverse() }); // Reverse to get chronological order
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get a single conversation by ID
router.get('/conversations/:conversationId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            primaryImage: true,
            salePrice: true,
            rentalPrice: true,
            isForRent: true,
            isForSale: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export default router;

