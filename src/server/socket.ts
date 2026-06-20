import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-enterprise-key";

export function setupWebSockets(server: Server) {
  const io = new SocketIOServer(server, {
    cors: { origin: "*" },
  });

  // Middleware for auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      socket.data.user = decoded;
      next();
    } catch (e) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.user.id;
    console.log("Client connected:", socket.id, "User ID:", userId);

    // Update status to ONLINE
    await prisma.user.update({ where: { id: userId }, data: { status: "ONLINE" } });
    io.emit("user:status", { userId, status: "ONLINE" }); // Broadcast

    socket.on("channel:join", (channelId) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on("message:send", async (data) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            channelId: data.channelId,
            userId: userId,
          },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } }
          }
        });
        
        io.to(`channel:${data.channelId}`).emit("message:receive", message);
      } catch (error) {
        console.error("Message send error:", error);
      }
    });

    // WebRTC Signaling
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userId);

      socket.on("disconnect", () => {
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });

    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);
      await prisma.user.update({ where: { id: userId }, data: { status: "OFFLINE" } });
      io.emit("user:status", { userId, status: "OFFLINE" });
    });
  });

  return io;
}
