import mongoose from "mongoose";
import { Chats } from "../models/chat.model";
import {
  deleteTypeEnum,
  messageTypeEnum,
  readStatusEnum,
  scheduleMessageStatus,
} from "../types/chat.types";
import { Stickers } from "../../http/models/sticker.model";
import {
  getRoomList,
  lastSeenSettingVerify,
  verifyUserIsMuted,
} from "../../../utils/utils";
import { sendChatNotification } from "../../services/NotificationServices";
import { Users } from "../../http/models/users.model";
import schedule from "node-schedule";
import { ChatPinned } from "../models/chatPinned.model";
import { removingTimeEnum } from "../types/chatPinned.types";

export default class websiteController {
  public static async sendMessage(socket: any, data: any, io: any) {
    try {
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }

      const {
        userId,
        message,
        messageType,
        scheduleDate,
        isSilent,
        attachedMessage,
        messageId,
        deleteNow,
        scheduleNow,
        forwarded,
        replyMessageId,
        contactId,
        userIds,
        local_id
      } = data;

      const isOnline = getRoomList(io.sockets.adapter.rooms).includes(userId);
      const readStatus = isOnline ? "RECEIVED" : "SENDED";

      const muted = await verifyUserIsMuted(
        socket.handshake.auth.decoded.userId,
        userId
      );

      // Create the chat object
      const chatObject: any = {
        senderId: socket.handshake.auth.decoded.userId,
        message,
        messageType,
        receiverId: userId,
        readStatus,
        attachedMessage,
        forwarded,
        replyMessageId,
        contactId,
        local_id
      };

      // Handle scheduling or immediate sending
      if (scheduleDate) {
        chatObject.scheduleDate = scheduleDate;
        chatObject.scheduleStatus = scheduleMessageStatus.SCHEDULE;
      } else if (scheduleNow) {
        chatObject.scheduleDate = Date.now();
        chatObject.scheduleStatus = scheduleMessageStatus.SENT;
      }

      // Add deletion status if needed
      if (deleteNow) {
        chatObject.deletedAt = Date.now();
      }

      // Determine whether to update or create a new chat
      let chat: any;
      if (scheduleDate || messageId || deleteNow || scheduleNow) {
        if (messageId) {
          chat = await Chats.findOneAndUpdate(
            { _id: messageId },
            { $set: chatObject },
            { upsert: true, new: true }
          );
        } else {
          chat = await Chats.create(chatObject);
        }
        schedule.cancelJob(chat.scheduleName);
        if (scheduleDate) {
          const manageScheduleJob = async () => {
            const latestChat = await Chats.findOneAndUpdate(
              {
                _id: chat._id,
                scheduleStatus: scheduleMessageStatus.SCHEDULE,
                deletedAt: null,
              },
              {
                $set: {
                  ...chatObject,
                  scheduleStatus: scheduleMessageStatus.SENT,
                  scheduleName: "",
                },
              }
            );
            if (latestChat) {
              console.log("maulik90-cron-job", new Date().toTimeString());
              chat = await Chats.aggregate([
                {
                  $match: {
                    _id: new mongoose.Types.ObjectId(chat._id),
                  },
                },
                {
                  $lookup: {
                    from: "chats",
                    foreignField: "_id",
                    localField: "replyMessageId",
                    as: "replyMessage",
                    pipeline: [
                      {
                        $lookup: {
                          from: "users",
                          foreignField: "_id",
                          localField: "senderId",
                          as: "senderDetails",
                        },
                      },
                      {
                        $lookup: {
                          from: "users",
                          foreignField: "_id",
                          localField: "receiverId",
                          as: "receiverDetails",
                        },
                      },
                      {
                        $addFields: {
                          senderDetails: {
                            $arrayElemAt: ["$senderDetails", 0],
                          },
                          receiverDetails: {
                            $arrayElemAt: ["$receiverDetails", 0],
                          },
                        },
                      },
                    ],
                  },
                },
                {
                  $addFields: {
                    replyMessage: {
                      $arrayElemAt: ["$replyMessage", 0],
                    },
                  },
                },
              ]);
              chat = chat[0];
              chat.isSilent = isSilent;
              io.to(userId).emit("RECEIVE_CHAT_MESSAGE", chat);
              io.to(socket.handshake.auth.decoded.userId).emit(
                "RECEIVE_OWN_MESSAGE",
                chat
              );
              const findUser: any = await Users.findOne({ _id: socket.handshake.auth.decoded.userId });
              if (!muted) {
                await sendChatNotification(
                  chat.receiverId.toString(),
                  message,
                  "/chat",
                  "list",
                  "data",
                  findUser.name ?? ""
                );
              }
            }
          };
          const scheduleJob = schedule.scheduleJob(
            new Date(scheduleDate),
            manageScheduleJob
          );
          console.log(scheduleJob, "maulik92");

          await Chats.findOneAndUpdate(
            { _id: chat._id },
            { $set: { scheduleName: scheduleJob.name } }
          );
        }
        if (deleteNow === true) {
          await Chats.findOneAndUpdate(
            { _id: chat._id },
            { $set: { scheduleName: "" } }
          );
        }
        if (scheduleNow === true) {
          const latestChat = await Chats.findOneAndUpdate(
            {
              _id: chat._id,
              scheduleStatus: scheduleMessageStatus.SCHEDULE,
              deletedAt: null,
            },
            {
              $set: {
                ...chatObject,
                scheduleStatus: scheduleMessageStatus.SENT,
                scheduleName: "",
              },
            }
          );
          if (latestChat) {
            chat = await Chats.aggregate([
              {
                $match: {
                  _id: new mongoose.Types.ObjectId(chat._id),
                },
              },
              {
                $lookup: {
                  from: "chats",
                  foreignField: "_id",
                  localField: "replyMessageId",
                  as: "replyMessage",
                  pipeline: [
                    {
                      $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "senderId",
                        as: "senderDetails",
                      },
                    },
                    {
                      $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "receiverId",
                        as: "receiverDetails",
                      },
                    },
                    {
                      $addFields: {
                        senderDetails: { $arrayElemAt: ["$senderDetails", 0] },
                        receiverDetails: {
                          $arrayElemAt: ["$receiverDetails", 0],
                        },
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  replyMessage: {
                    $arrayElemAt: ["$replyMessage", 0],
                  },
                },
              },
            ]);
            chat = chat[0];
            chat.isSilent = isSilent;
            io.to(userId).emit("RECEIVE_CHAT_MESSAGE", chat);
            io.to(socket.handshake.auth.decoded.userId).emit(
              "RECEIVE_OWN_MESSAGE",
              chat
            );
          }
        }
      } else {
        if (forwarded && userIds.length) {
          let chatObjects: any = [];
          userIds.forEach((userIdDetail: any) => {
            let chatt = { ...chatObject };
            chatt.receiverId = userIdDetail;
            chatObjects.push(chatt);
          });
          chat = await Chats.insertMany(chatObjects);
        } else {
          chat = await Chats.create(chatObject);
        }
      }

      // Find the user and send notifications if not silent
      const findUser: any = await Users.findOne({ _id: socket.handshake.auth.decoded.userId });

      if (!isSilent && !muted) {
        const userName = findUser ? findUser.name : "";
        if (typeof chat == "object" && chat.length) {
          chat.forEach(async (chatData: any) => {
            await sendChatNotification(
              chatData.receiverId,
              messageType === messageTypeEnum.TEXT ? message : messageType,
              "/chat",
              "list",
              "data",
              userName
            );
          });
        } else {
          if (!scheduleDate || scheduleDate == "") {
            await sendChatNotification(
              userId,
              messageType === messageTypeEnum.TEXT ? message : messageType,
              "/chat",
              "list",
              "data",
              userName
            );
          }
        }
      }
      if (scheduleDate) {
        chat = await Chats.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(chat._id),
            },
          },
          {
            $lookup: {
              from: "chats",
              foreignField: "_id",
              localField: "replyMessageId",
              as: "replyMessage",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "senderId",
                    as: "senderDetails",
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "receiverId",
                    as: "receiverDetails",
                  },
                },
                {
                  $addFields: {
                    senderDetails: { $arrayElemAt: ["$senderDetails", 0] },
                    receiverDetails: { $arrayElemAt: ["$receiverDetails", 0] },
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              replyMessage: {
                $arrayElemAt: ["$replyMessage", 0],
              },
            },
          },
        ]);
        chat = chat[0];
        io.to(socket.handshake.auth.decoded.userId).emit(
          "RECEIVE_OWN_MESSAGE",
          chat
        );
      } else {
        if (forwarded && typeof chat == "object" && chat.length) {
          let chatListId: any = [];
          chat.forEach(function (chatData: any) {
            chatListId.push(new mongoose.Types.ObjectId(chatData._id));
          });
          chat = await Chats.aggregate([
            {
              $match: {
                _id: { $in: chatListId },
              },
            },
            {
              $lookup: {
                from: "chats",
                foreignField: "_id",
                localField: "replyMessageId",
                as: "replyMessage",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      foreignField: "_id",
                      localField: "senderId",
                      as: "senderDetails",
                    },
                  },
                  {
                    $lookup: {
                      from: "users",
                      foreignField: "_id",
                      localField: "receiverId",
                      as: "receiverDetails",
                    },
                  },
                  {
                    $addFields: {
                      senderDetails: { $arrayElemAt: ["$senderDetails", 0] },
                      receiverDetails: {
                        $arrayElemAt: ["$receiverDetails", 0],
                      },
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "contactId",
                pipeline: [
                  // { $match: { $expr: { $eq: ["$_id", "$$contactId"] } } },
                  {
                    $project: {
                      name: 1,
                      email: 1,
                      phoneNumber: 1,
                      phoneCode: 1,
                      mergedPhoneNumber: 1,
                    },
                  },
                ],
                as: "contactDetails",
              },
            },
            {
              $addFields: {
                replyMessage: {
                  $arrayElemAt: ["$replyMessage", 0],
                },
                contactDetails: {
                  $arrayElemAt: ["$contactDetails", 0],
                },
              },
            },
          ]);

          chat.forEach(async (chatData: any) => {
            chatData.isSilent = isSilent;
            io.to(chatData.receiverId.toString()).emit(
              "RECEIVE_CHAT_MESSAGE",
              chatData
            );
          });
        } else {
          chat = await Chats.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(chat._id),
              },
            },
            {
              $lookup: {
                from: "chats",
                foreignField: "_id",
                localField: "replyMessageId",
                as: "replyMessage",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      foreignField: "_id",
                      localField: "senderId",
                      as: "senderDetails",
                    },
                  },
                  {
                    $lookup: {
                      from: "users",
                      foreignField: "_id",
                      localField: "receiverId",
                      as: "receiverDetails",
                    },
                  },
                  {
                    $addFields: {
                      senderDetails: { $arrayElemAt: ["$senderDetails", 0] },
                      receiverDetails: {
                        $arrayElemAt: ["$receiverDetails", 0],
                      },
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "contactId",
                pipeline: [
                  // { $match: { $expr: { $eq: ["$_id", "$$contactId"] } } },
                  {
                    $project: {
                      name: 1,
                      email: 1,
                      phoneNumber: 1,
                      phoneCode: 1,
                      mergedPhoneNumber: 1,
                    },
                  },
                ],
                as: "contactDetails",
              },
            },
            {
              $addFields: {
                replyMessage: {
                  $arrayElemAt: ["$replyMessage", 0],
                },
                contactDetails: {
                  $arrayElemAt: ["$contactDetails", 0],
                },
              },
            },
          ]);
          chat = chat[0];
          chat.isSilent = isSilent;
          io.to(userId).emit("RECEIVE_CHAT_MESSAGE", chat);
        }
        io.to(socket.handshake.auth.decoded.userId).emit(
          "RECEIVE_OWN_MESSAGE",
          chat
        );
      }
    } catch (error: any) {
      console.log(error, "maulik150");
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "SEND_MESSAGE",
      });
    }
  }

  public static async editMessage(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }

      const { chatId, message, messageType, attachedMessage } = data;

      const chat: any = await Chats.findOne({ _id: chatId });

      if (chat) {
        chat.message = message;
        chat.messageType = messageType;
        if (chat.attachedMessage && attachedMessage) {
          chat.attachedMessage = attachedMessage;
        }
        await chat.save();
      }

      io.to(chat.receiverId.toString()).emit("RECEIVE_EDITED_MESSAGE", chat);
      io.to(socket.handshake.auth.decoded.userId).emit(
        "RECEIVE_OWN_EDITED_MESSAGE",
        chat
      );
    } catch (error: any) {
      console.log("fff");
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "SEND_EDITED_MESSAGE",
      });
    }
  }

  public static async deleteMessage(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }

      const { chatId, deleteType } = data;

      const chat: any = await Chats.findOne({ _id: chatId });

      if (chat) {
        if (!chat.deletedFor) {
          chat.deletedFor = [];
        }
        if (deleteType == deleteTypeEnum.SENDER) {
          chat.deletedFor.push(
            new mongoose.Types.ObjectId(socket.handshake.auth.decoded.userId)
          );
        } else {
          chat.deletedAt = new Date();
        }
        await chat.save();
      }

      io.to(chat.receiverId.toString()).emit("DELETED_MESSAGE", {
        chatId,
        deleteType,
      });
      io.to(socket.handshake.auth.decoded.userId).emit("DELETE_OWN_MESSAGE", {
        chatId,
      });
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "DELETE_MESSAGE",
      });
    }
  }

  public static async readMessage(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }

      const { userId } = data;

      await Chats.updateMany(
        {
          senderId: userId,
          receiverId: socket.handshake.auth.decoded.userId,
        },
        { readStatus: readStatusEnum.READED }
      );

      io.to(socket.handshake.auth.decoded.userId).emit("READED_MESSAGE", {
        status: true,
      });
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "READ_MESSAGE",
      });
    }
  }

  public static async chatHistoryList(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }
      const { search, page, perPage } = data;

      const deleteQuery: any = {
        deletedAt: null,
        $or: [
          { deletedFor: { $exists: false } },
          {
            deletedFor: {
              $exists: true,
              $ne: new mongoose.Types.ObjectId(
                socket.handshake.auth.decoded.userId
              ),
            },
          },
        ],
      };
      const chats = await Chats.aggregate([
        {
          $match: deleteQuery,
        },
        {
          $match: {
            $or: [
              {
                senderId: new mongoose.Types.ObjectId(
                  socket.handshake.auth.decoded.userId
                ),
              }, // Find conversations where you are the sender
              {
                receiverId: new mongoose.Types.ObjectId(
                  socket.handshake.auth.decoded.userId
                ),
              }, // Or the receiver
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "contactId",
            pipeline: [
              // { $match: { $expr: { $eq: ["$_id", "$$contactId"] } } },
              {
                $project: {
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                  phoneCode: 1,
                  mergedPhoneNumber: 1,
                },
              },
            ],
            as: "contactDetails",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: {
              conversationWith: {
                $cond: [
                  {
                    $eq: [
                      "$senderId",
                      new mongoose.Types.ObjectId(
                        socket.handshake.auth.decoded.userId
                      ),
                    ],
                  }, // If you're the sender, the conversation is with the receiver
                  "$receiverId",
                  "$senderId",
                ],
              },
            },
            messageId: { $first: "$_id" },
            lastMessage: { $first: "$message" },
            lastMessageType: { $first: "$messageType" },
            local_id: { $first: "$local_id" },
            lastMessageDate: { $first: "$createdAt" },
            lastSenderId: { $first: "$senderId" },
            lastReceiverId: { $first: "$receiverId" },
            lastMessageUpdateAt: { $first: "$updatedAt" },
            lastMessageReadStatus: { $first: "$readStatus" },
            contactDetails: { $first: "$contactDetails" },
          },
        },
        {
          $addFields: {
            opponentUserId: {
              $cond: {
                if: {
                  $ne: [
                    "$lastSenderId",
                    new mongoose.Types.ObjectId(
                      socket.handshake.auth.decoded.userId
                    ),
                  ],
                },
                then: "$lastSenderId",
                else: "$lastReceiverId",
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "opponentUserId",
            as: "opponentDetails",
            let: { parentUserId: "$opponentUserId" },
            pipeline: [
              {
                $lookup: {
                  from: "user_specific_settings",
                  foreignField: "userwiseSetting.userId",
                  localField: "_id",
                  as: "userSpecific",
                  pipeline: [
                    {
                      $addFields: {
                        userSpecific: {
                          $filter: {
                            input: "$userwiseSetting",
                            as: "setting",
                            cond: {
                              $and: [
                                { $eq: ["$$setting.userId", "$$parentUserId"] },
                                {
                                  $eq: [
                                    "$$setting.chatSettings.archiveChats",
                                    true,
                                  ],
                                },
                              ],
                            },
                          },
                        },
                      },
                    },
                    {
                      $addFields: {
                        isLength: {
                          $cond: {
                            if: { $gt: [{ $size: "$userSpecific" }, 0] },
                            then: true,
                            else: false,
                          },
                        },
                      },
                    },
                    {
                      $project: {
                        isLength: 1,
                      },
                    },
                  ],
                },
              },
              {
                $lookup: {
                  from: "user_specific_settings",
                  foreignField: "userwiseSetting.userId",
                  localField: "_id",
                  as: "userSpecificforMute",
                  pipeline: [
                    {
                      $addFields: {
                        userSpecific: {
                          $filter: {
                            input: "$userwiseSetting",
                            as: "setting",
                            cond: {
                              $and: [
                                { $eq: ["$$setting.userId", "$$parentUserId"] },
                                { $eq: ["$$setting.chatSettings.muted", true] },
                              ],
                            },
                          },
                        },
                      },
                    },
                    {
                      $addFields: {
                        isLength: {
                          $cond: {
                            if: { $gt: [{ $size: "$userSpecific" }, 0] },
                            then: true,
                            else: false,
                          },
                        },
                      },
                    },
                    {
                      $project: {
                        isLength: 1,
                      },
                    },
                  ],
                },
              },
              {
                $lookup: {
                  from: "user_specific_settings",
                  foreignField: "userwiseSetting.userId",
                  localField: "_id",
                  as: "userSpecificForPin",
                  pipeline: [
                    {
                      $addFields: {
                        userSpecific: {
                          $filter: {
                            input: "$userwiseSetting",
                            as: "setting",
                            cond: {
                              $and: [
                                { $eq: ["$$setting.userId", "$$parentUserId"] },
                                {
                                  $eq: ["$$setting.chatSettings.pinned", true],
                                },
                              ],
                            },
                          },
                        },
                      },
                    },
                    {
                      $addFields: {
                        isLength: {
                          $cond: {
                            if: { $gt: [{ $size: "$userSpecific" }, 0] },
                            then: true,
                            else: false,
                          },
                        },
                      },
                    },
                    {
                      $project: {
                        isLength: 1,
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  userSpecific: { $arrayElemAt: ["$userSpecific", 0] },
                  userSpecificforMute: {
                    $arrayElemAt: ["$userSpecificforMute", 0],
                  },
                  userSpecificForPin: {
                    $arrayElemAt: ["$userSpecificForPin", 0],
                  },
                },
              },
              {
                $addFields: {
                  isArchive: {
                    $cond: {
                      if: { $eq: ["$userSpecific.isLength", true] },
                      then: true,
                      else: false,
                    },
                  },
                  isMuted: {
                    $cond: {
                      if: { $eq: ["$userSpecificforMute.isLength", true] },
                      then: true,
                      else: false,
                    },
                  },
                  isPinned: {
                    $cond: {
                      if: { $eq: ["$userSpecificForPin.isLength", true] },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  email: 1,
                  username: 1,
                  name: 1,
                  bio: 1,
                  dateOfBirth: 1,
                  gender: 1,
                  image: 1,
                  phoneCode: 1,
                  phoneNumber: 1,
                  online: 1,
                  // lastSeen: 1,
                  isArchive: 1,
                  isMuted: 1,
                  isPinned: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            opponentDetails: { $arrayElemAt: ["$opponentDetails", 0] },
          },
        },
        {
          $sort: { lastMessageDate: -1 },
        },
        {
          $sort: { "opponentDetails.isPinned": -1 },
        },
        {
          $project: {
            _id: 1,
            lastMessage: {
              senderId: "$lastSenderId",
              receiverId: "$lastReceiverId",
              message: "$lastMessage",
              messageType: "$lastMessageType",
              readStatus: "$lastMessageReadStatus",
              _id: "$messageId",
              createdAt: "$lastMessageDate",
              updatedAt: "$lastMessageUpdateAt",
              contactDetails: "$contactDetails",
            },
            opponentDetails: 1,
          },
        },
        {
          $match: {
            "lastMessage.receiverId": { $exists: true, $ne: null },
          },
        },
      ]);

      io.to(socket.handshake.auth.decoded.userId).emit(
        "RECEIVE_CHAT_HISTORY",
        chats
      );
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "CHATS_HISTORY_LIST",
      });
    }
  }

  public static async chatList(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }
      const { userId } = data;
      const deleteQuery: any = {
        deletedAt: null,
        $or: [
          { deletedFor: { $exists: false } },
          {
            deletedFor: {
              $exists: true,
              $ne: new mongoose.Types.ObjectId(
                socket.handshake.auth.decoded.userId
              ),
            },
          },
        ],
      };
      const chatQuery: any = {
        $or: [
          {
            senderId: new mongoose.Types.ObjectId(
              socket.handshake.auth.decoded.userId
            ),
            receiverId: new mongoose.Types.ObjectId(userId),
          },
          {
            senderId: new mongoose.Types.ObjectId(userId),
            receiverId: new mongoose.Types.ObjectId(
              socket.handshake.auth.decoded.userId
            ),
          },
        ],
      };
      console.log("test=>", chatQuery);
      const chats = await Chats.aggregate([
        {
          $match: deleteQuery,
        },
        {
          $match: chatQuery,
        },
        {
          $lookup: {
            from: "chats",
            foreignField: "_id",
            localField: "replyMessageId",
            as: "replyMessage",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  foreignField: "_id",
                  localField: "senderId",
                  as: "senderDetails",
                },
              },
              {
                $lookup: {
                  from: "users",
                  foreignField: "_id",
                  localField: "receiverId",
                  as: "receiverDetails",
                },
              },
              {
                $addFields: {
                  senderDetails: { $arrayElemAt: ["$senderDetails", 0] },
                  receiverDetails: { $arrayElemAt: ["$receiverDetails", 0] },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "chat_pinneds",
            foreignField: "chatId",
            localField: "_id",
            as: "chatPinned",
            pipeline: [
              {
                $match: {
                  deletedAt: null,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "contactId",
            pipeline: [
              // { $match: { $expr: { $eq: ["$_id", "$$contactId"] } } },
              {
                $project: {
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                  phoneCode: 1,
                  mergedPhoneNumber: 1,
                },
              },
            ],
            as: "contactDetails",
          },
        },
        {
          $addFields: {
            replyMessage: {
              $arrayElemAt: ["$replyMessage", 0],
            },
            contactDetails: {
              $arrayElemAt: ["$contactDetails", 0],
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
      const isValidUser = await lastSeenSettingVerify(
        socket.handshake.auth.decoded.userId,
        userId
      );
      const filter: any = {
        online: 1,
      };
      if (isValidUser) {
        filter.lastSeen = 1;
      }

      const userStatus = await Users.findOne({ _id: userId }).select(filter);

      io.to(socket.handshake.auth.decoded.userId).emit("CHAT_LIST", {
        chats,
        userStatus,
      });
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "CHATS_LIST",
      });
    }
  }

  public static async listStickers(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }

      const stickers: any = Stickers.find({ deletedAt: null }).sort({
        createdAt: -1,
      });

      io.to(socket.handshake.auth.decoded.userId).emit(
        "LIST_STICKER",
        stickers
      );
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "GET_STICKERS",
      });
    }
  }

  public static async deleteChatMessages(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }
      const { userId, isClear } = data;

      const deleteMessage = await Chats.updateMany(
        {
          $or: [
            {
              senderId: new mongoose.Types.ObjectId(
                socket.handshake.auth.decoded.userId
              ),
              receiverId: new mongoose.Types.ObjectId(userId),
            },
            {
              senderId: new mongoose.Types.ObjectId(userId),
              receiverId: new mongoose.Types.ObjectId(
                socket.handshake.auth.decoded.userId
              ),
            },
          ],
        },
        {
          $push: {
            deletedFor: new mongoose.Types.ObjectId(
              socket.handshake.auth.decoded.userId
            ),
          },
        }
      );

      let chat: any = "";
      if (isClear) {
        chat = await Chats.create({
          message: "Your chat has been cleared",
          messageType: messageTypeEnum.CONSTANT_TEXT,
          senderId: socket.handshake.auth.decoded.userId,
          receiverId: userId,
        });
      }

      io.to(socket.handshake.auth.decoded.userId).emit(
        "DELETE_CHAT_MESSAGES_ACK",
        {
          status: true,
          message: "Successfully removed chats",
          userId: userId,
          chat,
        }
      );
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "DELETE_SECRECT_CHAT_MESSAGE",
      });
    }
  }

  public static async addOrRemoveReaction(socket: any, data: any, io: any) {
    try {
      const { chatId, reactionMessage, reactionMessageId } = data;

      const findChat: any = await Chats.findOne({ _id: chatId });
      if (!findChat) {
        throw Error("Chat not found");
      }

      if (reactionMessageId || reactionMessageId != null) {
        findChat.reactions = findChat.reactions.filter((reaction: any) => {
          return reaction._id.toString() != reactionMessageId;
        });
      } else {
        let reactionFinded = false;
        findChat.reactions.map((reaction: any) => {
          if (
            reaction.userId.toString() == socket.handshake.auth.decoded.userId
          ) {
            reaction.reactionMessage = reactionMessage;
            reactionFinded = true;
          }
        });
        if (!reactionFinded) {
          findChat.reactions.push({
            userId: socket.handshake.auth.decoded.userId,
            reactionMessage: reactionMessage,
          });
        }
      }

      const chats = await Chats.findByIdAndUpdate(
        { _id: chatId },
        { $set: { reactions: findChat.reactions } },
        { new: true }
      );
      io.to(socket.handshake.auth.decoded.userId).emit(
        "RECEIVE_OWN_ADDED_OR_REMOVED_REACTION",
        chats
      );
      io.to(findChat.receiverId.toString()).emit(
        "ADDED_OR_REMOVED_REACTION",
        chats
      );
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "DELETE_SECRECT_CHAT_MESSAGE",
      });
    }
  }

  public static async addOrRemovePinMessage(socket: any, data: any, io: any) {
    try {
      if (Object.keys(data).indexOf("errorMessage") != -1) {
        throw new Error(data.errorMessage);
      }

      const { chatId, deleted, removingTime } = data;

      const findChat: any = await Chats.findOne({ _id: chatId });
      if (!findChat) {
        throw new Error("chat not found");
      }

      const pinned: any = await ChatPinned.findOne({
        userId: socket.handshake.auth.decoded.userId,
        chatId: chatId,
        deletedAt: null,
      });

      if (pinned && deleted) {
        pinned.deletedAt = new Date();
        pinned.save();
        if (pinned.scheduleName) {
          schedule.cancelJob(pinned.scheduleName);
        }
      }

      if (pinned && removingTime && pinned.removingTime != removingTime) {
        pinned.removingTime = removingTime;

        if (pinned.scheduleName) {
          schedule.cancelJob(pinned.scheduleName);
        }

        const manageScheduleJob = async () => {
          await ChatPinned.updateOne(
            { _id: pinned._id },
            { $set: { deletedAt: new Date() } }
          );
        };
        let date: any = new Date();
        if (removingTime == removingTimeEnum["24_HOURS"]) {
          const oneDaysAgo = new Date();
          date = oneDaysAgo.setDate(oneDaysAgo.getDate() + 1);
        }

        if (removingTime == removingTimeEnum["7_DAYS"]) {
          const oneDaysAgo = new Date();
          date = oneDaysAgo.setDate(oneDaysAgo.getDate() + 7);
        }

        if (removingTime == removingTimeEnum["30_DAYS"]) {
          const oneDaysAgo = new Date();
          date = oneDaysAgo.setDate(oneDaysAgo.getDate() + 30);
        }

        const scheduleJob = schedule.scheduleJob(date, manageScheduleJob);
        if(scheduleJob)
          pinned.scheduleName = scheduleJob.name;

        await pinned.save();
      }

      if (!pinned) {
        const chatPinned = await ChatPinned.create({
          chatId: chatId,
          userId: socket.handshake.auth.decoded.userId,
          removingTime: removingTime ?? removingTimeEnum.NONE,
        });

        if (removingTime && removingTime != removingTimeEnum.NONE) {
          const manageScheduleJob = async () => {
            await ChatPinned.updateOne(
              { _id: chatPinned._id },
              { $set: { deletedAt: new Date() } }
            );
          };
          let date: any = new Date();
          if (removingTime == removingTimeEnum["24_HOURS"]) {
            const oneDaysAgo = new Date();
            date = oneDaysAgo.setDate(oneDaysAgo.getDate() + 1);
          }

          if (removingTime == removingTimeEnum["7_DAYS"]) {
            const oneDaysAgo = new Date();
            date = oneDaysAgo.setDate(oneDaysAgo.getDate() + 7);
          }

          if (removingTime == removingTimeEnum["30_DAYS"]) {
            const oneDaysAgo = new Date();
            date = oneDaysAgo.setDate(oneDaysAgo.getDate() + 30);
          }

          const scheduleJob = schedule.scheduleJob(date, manageScheduleJob);

          await ChatPinned.updateOne(
            { _id: chatPinned._id },
            { $set: { scheduleName: scheduleJob.name ?? "" } }
          );
        }
      }

      io.to(socket.handshake.auth.decoded.userId).emit(
        "RECEIVE_OWN_PIN_STATUS",
        { status: true, chatId: chatId, deleted: deleted }
      );
    } catch (error: any) {
      io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
        message: error.message,
        event: "ADD_OR_REMOVE_PIN_MESSAGE",
      });
    }
  }
}
