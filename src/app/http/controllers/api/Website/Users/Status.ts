import { Request, Response } from "express";
import { Status } from "../../../../models/status.model";
import schedule from "node-schedule";
import {
  scheduleMessageStatus,
  sharePeopleEnum,
} from "../../../../../sockets/types/chat.types";
import {
  deleteOldCron,
  manageScheduleJob,
} from "../../../../../../utils/utils";

export default class statusController {
  public static async listStatusOtherUsers(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;

      const allStatus = await Status.aggregate([
        {
          $match: {
            $or: [
              { sharePeople: sharePeopleEnum.ALL },
              {
                sharePeople: sharePeopleEnum.SPECIFIC,
                specificUsersIds: { $in: [user] },
              },
            ],
            userId: { $ne: user },
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $group: {
            _id: "$userId",
            statuses: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $unwind: "$userInfo",
        },
        {
          $project: {
            userId: "$_id",
            username: "$userInfo.username",
            profile: "$userInfo.image",
            statuses: 1,
            _id: 0,
          },
        },
      ]);

      res.status(200).json({
        status: true,
        data: allStatus,
        message: "Status list",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async listStatusOwn(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const allStatus: any = await Status.find({
        userId: user,
      }).populate("userId", "username image");

      res.status(200).json({
        status: true,
        data: allStatus,
        message: "Status list",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async addStatus(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const {
        content,
        mediaUrl,
        scheduleDate,
        scheduleStatus,
        statusId,
        deleteNow,
        filter,
        sticker,
        music,
        sharePeople,
        specificUsersIds,
      } = req.body.validatedData;

      const payload: any = {
        userId: user,
        content,
        mediaUrl,
        filter,
        sticker,
        music,
        sharePeople,
        specificUsersIds,
      };

      if (scheduleDate || scheduleStatus) {
        payload.scheduleStatus = scheduleStatus;
        payload.scheduleDate = scheduleDate;
      } else {
        payload.scheduleStatus = scheduleMessageStatus.POST;
      }

      let createStatus: any;

      if (scheduleDate || statusId || scheduleStatus) {
        if (statusId) {
          deleteOldCron(
            createStatus?.scheduleName,
            createStatus?.delete24CronName
          );
          if (deleteNow === true) {
            createStatus = await Status.deleteOne({
              _id: statusId,
            });
          } else {
            createStatus = await Status.findOneAndUpdate(
              {
                _id: statusId,
              },
              { $set: payload },
              { new: true }
            );
            if (scheduleStatus === scheduleMessageStatus.POST) {
              await manageScheduleJob(createStatus);
            }
            if (scheduleStatus === scheduleMessageStatus.SCHEDULE) {
              await manageScheduleJob(createStatus, scheduleDate);
            }
          }
        } else {
          createStatus = await new Status(payload).save();
          if (scheduleStatus === scheduleMessageStatus.POST) {
            await manageScheduleJob(createStatus);
          }
          if (scheduleStatus === scheduleMessageStatus.SCHEDULE) {
            await manageScheduleJob(createStatus, scheduleDate);
          }
        }
      } else {
        createStatus = await new Status(payload).save();
      }

      res.status(200).json({
        status: true,
        data: createStatus,
        message: "Status created",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}
