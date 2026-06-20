import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-enterprise-key";

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and a default workspace for them
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        status: "ONLINE",
        role: "SUPER_ADMIN", // For demo purposes, make first user super admin or normal user
        workspaces: {
          create: {
            role: "ADMIN",
            workspace: {
              create: {
                name: "My First Workspace",
                organization: {
                  create: {
                    name: "Acme Corp",
                    slug: `acme-${Date.now()}`
                  }
                },
                channels: {
                  create: [
                    { name: "general", isPrivate: false },
                    { name: "random", isPrivate: false }
                  ]
                }
              }
            }
          }
        }
      },
      include: {
        workspaces: {
          include: {
            workspace: {
              include: {
                channels: true
              }
            }
          }
        }
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

export const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
