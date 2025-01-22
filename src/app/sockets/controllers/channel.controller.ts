import mongoose from "mongoose";
import { Channels } from "../../http/models/channel.model";
import { ChannelMessageComments } from "../../http/models/channelMessageComments.model";
import { ChannelMessageReactions } from "../../http/models/channelMessageReaction.model";
import { ChannelMessages } from "../../http/models/channelMessages.model";
import { ChannelUsers } from "../../http/models/channelUsers.model";
import { readStatusEnum } from "../../http/types/channelMessageStatus.types";
import { ChannelMessageStatus } from "../../http/models/channelMessagesStatus.model";
import { deleteTypeEnum } from "../types/chat.types";

export default class channelController {
  public static async joinChannelRoom(socket: any, data: any, io: any) {
    try {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }

      const { channelId } = data;
      console.log(channelId, "maulik19");
      socket.join(channelId);
      console.log(io.sockets.adapter.rooms.get("userData.userId"), "maulik21");
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "JOIN_CHANNEL",
      });
    }
  }

  public static async sendMessage(socket: any, data: any, io: any) {
    try {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      const {
        channelId,
        message,
        messageType,
        attachedMessage,
        isComment,
        isSave,
        replyMessageId,
        forwarded,
        forwardedChannelId,
        musicLink,
      } = data;

      if (forwarded && forwardedChannelId?.length) {
        forwardedChannelId.forEach(async (cId: any) => {
          const findOwner: any = await ChannelUsers.findOne({
            userId: socket.userId,
            channelId: cId,
            isOwner: true,
          });

          console.log(findOwner, "maulik52");

          if (!findOwner) {
            throw new Error("You are not owner");
          }

          const messageData: any = await ChannelMessages.create({
            message,
            attachedMessage,
            messageType,
            senderId: socket.userId,
            channelId: cId,
            isComment,
            isSave,
            replyMessageId,
            forwarded,
            musicLink,
          });

          const channelDetails = await Channels.findOne({ _id: cId });

          messageData.channelDetails = channelDetails;

          io.to(cId).emit("RECEIVE_CHANNEL_MESSAGE", messageData);
          const findUsers: any = await ChannelUsers.find(
            { channelId: cId, deletedAt: null },
            { userId: 1 }
          );
          let findActiveUsers: any = [];
          let inActiveUsers: any = [];
          let insertUserStatus: any = [];
          findUsers.forEach((userData: any) => {
            if (io.sockets.adapter.rooms.get(userData.userId)) {
              findActiveUsers.push(
                io.sockets.adapter.rooms.get(userData.userId).values().next()
                  .value
              );
            } else {
              inActiveUsers.push(userData.userId);
            }
            insertUserStatus.push({
              messageId: messageData._id,
              status: readStatusEnum.SENDED,
              userId: userData._id,
              channelId: cId,
            });
          });

          if (findActiveUsers.length) {
            io.to(findActiveUsers).emit("LATEST_CHANNEL_HISTORY", messageData);
          }

          await ChannelMessageStatus.insertMany(insertUserStatus);

          if (inActiveUsers.length) {
            console.log("send notification");
          }
        });
      } else {
        const findOwner: any = await ChannelUsers.findOne({
          userId: socket.userId,
          channelId: channelId,
          isOwner: true,
        });

        console.log(findOwner, "maulik52");

        if (!findOwner) {
          throw new Error("You are not owner");
        }

        const messageData: any = await ChannelMessages.create({
          message,
          attachedMessage,
          messageType,
          senderId: socket.userId,
          channelId,
          isComment,
          isSave,
          replyMessageId,
          forwarded,
        });

        const channelDetails = await Channels.findOne({ _id: channelId });

        messageData.channelDetails = channelDetails;

        io.to(channelId).emit("RECEIVE_CHANNEL_MESSAGE", messageData);
        const findUsers: any = await ChannelUsers.find(
          { channelId, deletedAt: null },
          { userId: 1 }
        );
        let findActiveUsers: any = [];
        let inActiveUsers: any = [];
        let insertUserStatus: any = [];
        findUsers.forEach((userData: any) => {
          if (io.sockets.adapter.rooms.get(userData.userId)) {
            findActiveUsers.push(
              io.sockets.adapter.rooms.get(userData.userId).values().next()
                .value
            );
          } else {
            inActiveUsers.push(userData.userId);
          }
          insertUserStatus.push({
            messageId: messageData._id,
            status: readStatusEnum.SENDED,
            userId: userData._id,
            channelId: channelId,
          });
        });

        if (findActiveUsers.length) {
          io.to(findActiveUsers).emit("LATEST_CHANNEL_HISTORY", messageData);
        }

        await ChannelMessageStatus.insertMany(insertUserStatus);

        if (inActiveUsers.length) {
          console.log("send notification");
        }
      }
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "SEND_CHANNEL_MESSAGE",
      });
    }
  }

  public static async editMessage(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }

      const { chatId, message, messageType, attachedMessage, channelId } = data;

      const findOwner: any = await ChannelUsers.findOne({
        userId: socket.userId,
        channelId: channelId,
        isOwner: true,
      });

      if (!findOwner) {
        throw new Error("You are not owner");
      }

      const messageData: any = await ChannelMessages.findOne({ _id: chatId });

      if (messageData) {
        messageData.message = message;
        messageData.messageType = messageType;
        if (messageData.attachedMessage && attachedMessage) {
          messageData.attachedMessage = attachedMessage;
        }
        await messageData.save();
      }

      const channelDetails = await Channels.findOne({ _id: channelId });

      messageData.channelDetails = channelDetails;

      io.to(channelId).emit("RECEIVE_CHANNEL_MESSAGE", messageData);
      const findUsers: any = await ChannelUsers.find(
        { channelId, deletedAt: null },
        { userId: 1 }
      );
      let findActiveUsers: any = [];
      let inActiveUsers: any = [];
      let insertUserStatus: any = [];
      findUsers.forEach((userData: any) => {
        if (io.sockets.adapter.rooms.get(userData.userId)) {
          findActiveUsers.push(
            io.sockets.adapter.rooms.get(userData.userId).values().next().value
          );
        } else {
          inActiveUsers.push(userData.userId);
        }
        insertUserStatus.push({
          messageId: messageData._id,
          status: readStatusEnum.SENDED,
          userId: userData._id,
          channelId: channelId,
        });
      });

      if (findActiveUsers.length) {
        io.to(findActiveUsers).emit("LATEST_CHANNEL_HISTORY", messageData);
      }

      await ChannelMessageStatus.insertMany(insertUserStatus);

      if (inActiveUsers.length) {
        console.log("send notification");
      }
    } catch (error: any) {
      console.log("fff");
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "SEND_EDITED_MESSAGE_CHANNEL",
      });
    }
  }

  public static async deleteMessage(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }

      const { chatId, channelId } = data;

      const messageData: any = await ChannelMessages.findOne({ _id: chatId });

      if (messageData) {
        messageData.deletedAt = new Date();
        await messageData.save();
      }

      const channelDetails = await Channels.findOne({ _id: channelId });

      messageData.channelDetails = channelDetails;

      io.to(channelId).emit("RECEIVE_CHANNEL_MESSAGE", messageData);
      const findUsers: any = await ChannelUsers.find(
        { channelId, deletedAt: null },
        { userId: 1 }
      );
      let findActiveUsers: any = [];
      let inActiveUsers: any = [];
      let insertUserStatus: any = [];
      findUsers.forEach((userData: any) => {
        if (io.sockets.adapter.rooms.get(userData.userId)) {
          findActiveUsers.push(
            io.sockets.adapter.rooms.get(userData.userId).values().next().value
          );
        } else {
          inActiveUsers.push(userData.userId);
        }
        insertUserStatus.push({
          messageId: messageData._id,
          status: readStatusEnum.SENDED,
          userId: userData._id,
          channelId: channelId,
        });
      });

      if (findActiveUsers.length) {
        io.to(findActiveUsers).emit("LATEST_CHANNEL_HISTORY", messageData);
      }

      await ChannelMessageStatus.insertMany(insertUserStatus);

      if (inActiveUsers.length) {
        console.log("send notification");
      }
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "DELETE_MESSAGE",
      });
    }
  }

  public static async addOrRemoveReaction(socket: any, data: any, io: any) {
    try {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      const { channelId, messageId, reactionId, reaction, deleteReaction } =
        data;

      let reactionPayload: any = {};
      if (reactionId) {
        const findReaction: any = await ChannelMessageReactions.findOne({
          _id: reactionId,
          messageId,
          userId: socket.userId,
        });

        if (deleteReaction) {
          findReaction.deletedAt = new Date();
        } else {
          findReaction.message = reaction;
        }

        await findReaction.save();
        reactionPayload = findReaction;
      } else {
        reactionPayload = await ChannelMessageReactions.create({
          messageId,
          message: reaction,
          userId: socket.userId,
        });
      }

      io.to(channelId).emit("ADD_OR_REMOVE_REACTION_CHANNEL", reactionPayload);
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "ADD_OR_REMOVE_REACTION_CHANNEL",
      });
    }
  }

  public static async addOrRemoveComment(socket: any, data: any, io: any) {
    try {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      const { channelId, messageId, commentId, message, deleteComment } = data;

      let commentPayload: any = {};
      if (commentId) {
        const findComment: any = await ChannelMessageComments.findOne({
          _id: commentId,
          messageId,
          userId: socket.userId,
        });

        if (findComment && deleteComment) {
          findComment.deletedAt = new Date();
        } else {
          findComment.message = message;
        }

        await findComment.save();
        commentPayload = findComment;
      } else {
        commentPayload = await ChannelMessageComments.create({
          messageId,
          message: message,
          userId: socket.userId,
        });
      }

      io.to(channelId).emit("ACK_ADD_OR_REMOVE_COMMENT", commentPayload);
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "ADD_OR_REMOVE_COMMENT",
      });
    }
  }

  public static async addOrRemoveCommentReaction(
    socket: any,
    data: any,
    io: any
  ) {
    try {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      const { channelId, messageId, commentId, reaction, reactionMessageId } =
        data;

      const findComment: any = await ChannelMessageComments.findOne({
        _id: commentId,
        messageId,
        userId: socket.userId,
      });
      let commentPayload: any = {};
      if (findComment) {
        if (reactionMessageId) {
          findComment.reactions = findComment.reactions.filter(
            (reaction: any) => {
              return reaction._id.toString() != reactionMessageId;
            }
          );
        } else {
          findComment.reactions.push({
            reactionMessage: reaction,
            userId: socket.userId,
          });
        }
        await findComment.save();
        commentPayload = findComment;
      }
      io.to(channelId).emit(
        "ACK_ADD_OR_REMOVE_COMMENT_REACTION",
        commentPayload
      );
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "ADD_OR_REMOVE_COMMENT_REACTION",
      });
    }
  }

  public static async leaveChannelRoom(socket: any, data: any, io: any) {
    try {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      const { channelId } = data;
      socket.leave(channelId);
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "LEAVE_CHANNEL",
      });
    }
  }

  public static async readMessages(socket: any, data: any, io: any) {
    try {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      const { channelId } = data;

      console.log(socket.userId, "maulik399");

      const readChannelMessages = await ChannelMessageStatus.updateMany(
        { userId: socket.userId, channelId },
        { $set: { status: readStatusEnum.READED } }
      );

      io.to(socket.id).emit("ACK_READ_CHANNEL_MESSAGES", {
        status: true,
        message: "message readed",
      });
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "READ_CHANNEL_MESSAGES",
      });
    }
  }

  public static async addOrRemovePinMessage(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }

      const { chatId, deleted } = data;

      const findChat: any = await ChannelMessages.findOne({ _id: chatId });
      if (!findChat) {
        throw new Error("chat not found");
      }

      findChat.isPinned = deleted;
      await findChat.save();
      io.to(socket.handshake.auth.decoded.userId).emit(
        "ADD_OR_REMOVE_PIN_CHANNEL",
        { status: true, chatId: chatId, deleted: deleted }
      );
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "ADD_OR_REMOVE_PIN_CHANNEL",
      });
    }
  }
}
