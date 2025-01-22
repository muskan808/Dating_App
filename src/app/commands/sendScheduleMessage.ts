import { logger } from "../providers/logger";
import { sendScheduleNotification } from "../services/NotificationServices";
import { Chats } from "../sockets/models/chat.model";
import { scheduleMessageStatus } from "../sockets/types/chat.types";

export const sendScheduledMessage = async () => {
  try {
    let scheduleQuery = {
      deletedAt: null,
      scheduleStatus: scheduleMessageStatus.SCHEDULE,
      scheduleDate: {
        $lte: new Date(),
      },
    };

    let chats = await Chats.aggregate([
      {
        $match: scheduleQuery,
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "senderId",
          as: "senderDetails",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          senderDetails: { $arrayElemAt: ["$senderDetails", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          message: 1,
          messageType: 1,
          attachedMessage: 1,
          senderDetails: 1,
          receiverId: 1,
        },
      },                      
    ]);

    if (chats.length) {
      let scheduleChatId: any = [];
      chats.forEach(function (chat: any) {
        scheduleChatId.push(chat._id);
      });

      await Chats.updateMany(
        {
          scheduleStatus: scheduleMessageStatus.SCHEDULE,
          _id: { $in: scheduleChatId },
        },
        {
          $set: {
            scheduleStatus: scheduleMessageStatus.SENT,
            createdAt: new Date(),
          },
        }
      );

      for (let i = 0; i < chats.length; i++) {
        let chat = chats[i];
        if (chat.senderDetails._id) {
          await sendScheduleNotification(
            chat.receiverId,
            chat.message,
            "schedule",
            chat.messgeType,
            chat.attachedMessage,
            chat.senderDetails ? chat.senderDetails.name : ""
          );
        }
      }
    }

    logger.info("Successfully sended schedule messages");
  } catch (error: any) {
    logger.info("send schedule message error:" + error.message);
  }
};
