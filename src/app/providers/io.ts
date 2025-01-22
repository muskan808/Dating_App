import { Server } from "socket.io";
import http from "http";
import { verifySocketToken } from "../http/middleware/Auth";
import { websiteEventHandler } from "../sockets/handlers/website.handler";
import { Users } from "../http/models/users.model";
import { getRoomList } from "../../utils/utils";
import { channelEventHandler } from "../sockets/handlers/channel.handler";

export const ioConnection = async (server: http.Server) => {
  const io = new Server(server, {
    serveClient: true,
    cors: {
      origin: true,
      credentials: true,
    },
    allowEIO3: true,
    pingTimeout: 7200000,
    pingInterval: 25000,
  });

  io.use(async (socket:any, next) => {
    if (
      socket.handshake.query.token &&
      typeof socket.handshake.query.token === "string"
    ) {
      const { error, decoded } = await verifySocketToken(
        socket.handshake.query.token
      );
      if (decoded) {
        socket.handshake.auth.decoded = decoded;
        socket.userId = socket.handshake.auth.decoded.userId
        next();
      } else {
        let errorJson = {
          status: false,
          message: error.message,
        };

        if (error && error.message == "jwt expired") {
          errorJson.message = "Auth Token expired";
        }

        return next(new Error(JSON.stringify(errorJson)));
      }
    } else {
      return next(new Error("Authentication Error"));
    }
  }).on("connection", async (socket: any) => {
    socket.join(socket.handshake.auth.decoded.userId);
    await Users.updateOne(
      { _id: socket.handshake.auth.decoded.userId },
      { $set: { online: true, lastSeen: null } }
    );
    io.emit("USER_STATUS_UPDATE", {
      online: true,
      lastSeen: null,
      userId: socket.handshake.auth.decoded.userId,
    });
    socket.onAny((arg: any, data: any) => {
      switch (socket.handshake.auth.decoded) {
        default:
          websiteEventHandler(arg, data, socket, io);
          channelEventHandler(arg, data, socket, io);
          break;
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected");
      socket.leave(socket.handshake.auth.decoded.userId);
      if (socket.handshake.auth.decoded.userId) {
        io.emit("USER_STATUS_UPDATE", {
          lastSeen: new Date(),
          online: false,
          userId: socket.handshake.auth.decoded.userId,
        });
        await Users.updateOne(
          { _id: socket.handshake.auth.decoded.userId },
          { $set: { lastSeen: new Date(), online: false } }
        );
      }
    });
  });
};
