import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "./auth";

export const apiRouter = Router();

apiRouter.use(requireAuth);

apiRouter.get("/state", async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaces: {
          include: {
            workspace: {
              include: {
                channels: {
                  include: {
                    messages: {
                      take: 50,
                      orderBy: { createdAt: 'desc' },
                      include: {
                        user: { select: { id: true, name: true, avatarUrl: true } }
                      }
                    }
                  }
                },
                users: {
                  include: {
                    user: { select: { id: true, name: true, avatarUrl: true, status: true, role: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      workspaces: user.workspaces, // The frontend will parse this structure to render the UI
    });
  } catch (error) {
    console.error("State error:", error);
    res.status(500).json({ error: "Failed to fetch state" });
  }
});
