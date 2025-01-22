import { Request, Response } from "express";
import { Channels } from "../../../../models/channel.model";
import { ChannelUsers } from "../../../../models/channelUsers.model";
import mongoose from "mongoose";
import {
  ChannelMessages,
  messageTypeEnum,
} from "../../../../models/channelMessages.model";
import { pagination } from "../../../../../../utils/utils";
import { Users } from "../../../../models/users.model";
import { ChannelEarnings } from "../../../../models/channelEarnings.model";
import UserSavedPostsModel from "../../../../models/savedPost.model";
import { ChannelSpecificSettings } from "../../../../models/channelSpecificSettings.model";

export default class channelController {
  public static async list(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { countryId, name } = req.body.validatedQueryData;
      const { page, perPage } = req.body.pagination;

      let channelList = await ChannelUsers.aggregate([
        {
          $match: {
            deletedAt: null,
            ...(countryId
              ? { countryId: new mongoose.Types.ObjectId(countryId) }
              : {}),
            userId: { $ne: new mongoose.Types.ObjectId(user) },
          },
        },
        {
          $lookup: {
            from: "channels",
            foreignField: "_id",
            localField: "channelId",
            as: "channel",
            pipeline: [
              {
                $match: {
                  deletedAt: null,
                },
              },
              {
                $lookup: {
                  from: "channel_users",
                  foreignField: "channelId",
                  localField: "_id",
                  as: "channelUser",
                  pipeline: [
                    {
                      $group: {
                        _id: null,
                        followersCount: { $sum: 1 },
                      },
                    },
                    {
                      $project: {
                        _id: 0,
                        followersCount: 1,
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  channelUser: { $arrayElemAt: ["$channelUser", 0] },
                },
              },
              {
                $match: {
                  name: { $regex: new RegExp(name, "i") }, // Case-insensitive search
                },
              },
            ],
          },
        },
        {
          $addFields: {
            channel: { $arrayElemAt: ["$channel", 0] },
            isFollow: false,
          },
        },
        {
          $match: {
            channel: { $ne: null }, // Ensure channel exists
          },
        },
        {
          $group: {
            _id: "$channelId",
            firstDocument: { $first: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            channelId: "$_id",
            createdAt: "$firstDocument.createdAt",
            deletedAt: "$firstDocument.deletedAt",
            // isOwner: 1,
            updatedAt: "$firstDocument.updatedAt",
            channel: "$firstDocument.channel",
            isFollow: "$firstDocument.isFollow",
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: perPage * (page - 1) },
              { $limit: perPage },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);

      const totalCount =
        channelList[0].totalCount && channelList[0].totalCount.length
          ? channelList[0].totalCount[0].count
          : 0;
      channelList = channelList[0].paginatedResults;

      res.status(200).json({
        status: true,
        data: channelList,
        pagination: pagination(totalCount, perPage, page),
        message: req.t("crud.list", { model: "channel" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async channelList(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { isOwner, country } = req.body.validatedQueryData;
      const { page, perPage } = req.body.pagination;

      let channelList = await ChannelUsers.aggregate([
        {
          $match: {
            deletedAt: null,
            isOwner: isOwner,
            userId: new mongoose.Types.ObjectId(user),
          },
        },
        {
          $lookup: {
            from: "channels",
            foreignField: "_id",
            localField: "channelId",
            as: "channel",
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
            from: "channel_messages",
            foreignField: "channelId",
            localField: "channelId",
            as: "channelMessage",
            pipeline: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $limit: 1,
              },
              {
                $lookup: {
                  from: "channel_message_status",
                  foreignField: "messageId",
                  localField: "_id",
                  as: "messageStatus",
                  pipeline: [
                    {
                      $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          $addFields: {
            channel: { $arrayElemAt: ["$channel", 0] },
            channelMessage: { $arrayElemAt: ["$channelMessage", 0] },
          },
        },
        {
          $match: {
            channel: { $exists: true },
          },
        },
        {
          $project: {
            _id: 0,
            channelId: 1,
            createdAt: 1,
            deletedAt: 1,
            isOwner: 1,
            updatedAt: 1,
            channel: 1,
            channelMessage: 1,
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: perPage * (page - 1) },
              { $limit: perPage },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);
      const totalCount =
        channelList[0].totalCount && channelList[0].totalCount.length
          ? channelList[0].totalCount[0].count
          : 0;
      channelList = channelList[0].paginatedResults;

      res.status(200).json({
        status: true,
        data: channelList,
        pagination: pagination(totalCount, perPage, page),
        message: req.t("crud.list", { model: "Channel" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async add(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { name, description, icon } = req.body.validatedData;

      const findChannel = await Channels.findOne({ name: name });

      const { countryId } = (await Users.findOne({ _id: user })) || {};

      if (findChannel) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.already_exists", { model: "Channel" }),
        });
      }

      const channel: any = await Channels.create({
        name,
        description,
        icon,
        countryId,
      });

      const createChannelUser = await ChannelUsers.create({
        channelId: channel?._id,
        userId: user,
        isOwner: true,
        countryId,
      });

      res.status(200).json({
        status: true,
        data: {
          name,
          description,
          icon,
          channelId: channel?._id,
          isOwner: true,
        },
        message: req.t("crud.list", { model: "channel" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { name, description, icon, channelId } = req.body.validatedData;

      const existingChannel = await Channels.findOne({
        name: name.trim(),
        _id: { $ne: channelId },
      });

      if (existingChannel) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.already_exists", { model: "Channel" }),
        });
      }

      const channel: any = await Channels.updateOne(
        {
          _id: channelId,
        },
        {
          $set: {
            name: name.trim(),
            description,
            icon,
          },
        }
      );

      res.status(200).json({
        status: true,
        data: {
          name,
          description,
          icon,
        },
        message: req.t("crud.list", { model: "channel" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async messageList(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { channelId } = req.body.validatedQueryData;
      const { page, perPage } = req.body.pagination;

      let messageList = await ChannelMessages.aggregate([
        {
          $match: {
            channelId: new mongoose.Types.ObjectId(channelId),
            deletedAt: null,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "channel_messages",
            foreignField: "_id",
            localField: "replyMessageId",
            as: "replyMessage",
            pipeline: [
              {
                $match: {
                  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$replyMessage",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "channel_message_statuses",
            foreignField: "messageId",
            localField: "_id",
            as: "messageStatus",
            pipeline: [
              {
                $match: {
                  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                },
              },
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "channel_message_reactions",
            foreignField: "messageId",
            localField: "_id",
            as: "messageReactions",
            pipeline: [
              {
                $match: {
                  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                },
              },
            ],
          },
        },
        // {
        //   $lookup: {
        //     from: "channel_message_reactions",
        //     foreignField: "messageId",
        //     localField: "_id",
        //     as: "latestMessageReactions",
        //     pipeline: [
        //       {
        //         $sort: { createdAt: -1 },
        //       },
        //       {
        //         $limit: 5,
        //       },
        //     ],
        //   },
        // },
        {
          $lookup: {
            from: "channel_message_comments",
            foreignField: "messageId",
            localField: "_id",
            as: "messageComments",
            pipeline: [
              {
                $match: {
                  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                },
              },
              {
                $lookup: {
                  from: "users",
                  foreignField: "_id",
                  localField: "userId",
                  as: "userDetails",
                  pipeline: [
                    {
                      $project: {
                        username: 1, // Include only the `status` field
                        name: 1,
                        image: 1,
                      },
                    },
                  ],
                },
              },
              {
                $unwind: {
                  path: "$userDetails",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: perPage * (page - 1) },
              { $limit: perPage },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);

      const totalCount =
        messageList[0].totalCount && messageList[0].totalCount.length
          ? messageList[0].totalCount[0].count
          : 0;
      messageList = messageList[0].paginatedResults;

      res.status(200).json({
        status: true,
        data: messageList,
        pagination: pagination(totalCount, perPage, page),
        message: req.t("crud.list", { model: "messages" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async followUnFollow(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { channelId, follow } = req.body.validatedData;

      let newChannelId;
      if (follow) {
        newChannelId = await ChannelUsers.updateOne(
          { channelId: channelId, userId: user },
          {
            $set: {
              channelId: channelId,
              userId: user,
              isOwner: false,
              deletedAt: null,
            },
          },
          { upsert: true, new: true }
        );
      } else {
        await ChannelUsers.updateOne(
          { channelId: channelId, userId: user },
          { $set: { deletedAt: new Date() } },
          { upsert: true, new: true }
        );
      }

      res.status(200).json({
        status: true,
        data: newChannelId,
        message: req.t("crud.updated", { model: "follow list" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async followersList(req: Request, res: Response) {
    try {
      const { id } = req.body.validatedParamsData;
      const { user } = req.body.auth;

      const channelUsers: any = await ChannelUsers.aggregate([
        {
          $match: {
            deletedAt: null,
            channelId: new mongoose.Types.ObjectId(id),
            // userId: { $ne: new mongoose.Types.ObjectId(user) },
            // isOwner: false,
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "userId",
            as: "userDetails",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  username: 1,
                  name: 1,
                  bio: 1,
                  gender: 1,
                  image: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            userDetails: { $arrayElemAt: ["$userDetails", 0] },
          },
        },
        {
          $project: {
            _id: 0,
            channelId: 1,
            followedDate: "$createdAt",
            userDetails: 1,
            isOwner: 1,
          },
        },
      ]);

      res.status(200).json({
        status: true,
        data: channelUsers,
        message: req.t("crud.list", { model: "channel followers" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getFollowerDetails(req: Request, res: Response) {
    try {
      const { id } = req.body.validatedParamsData;

      const user: any = await Users.findOne(
        { _id: id },
        {
          _id: 1,
          username: 1,
          name: 1,
          bio: 1,
          gender: 1,
          image: 1,
        }
      );

      res.status(200).json({
        status: true,
        data: user,
        message: req.t("crud.details", { model: "follower" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async removeFollowers(req: Request, res: Response) {
    try {
      const { channelId, userId } = req.body.validatedData;

      const removeFollower = await ChannelUsers.updateOne(
        { channelId, userId },
        { $set: { deletedAt: new Date() } }
      );

      res.status(200).json({
        status: true,
        data: removeFollower,
        message: req.t("crud.removed", { model: "follower" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async deleteChannel(req: Request, res: Response) {
    try {
      const { id } = req.body.validatedParamsData;

      const findChannel: any = await Channels.findOne({ _id: id });

      if (!findChannel) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.not_found", { model: "Channel" }),
        });
      }

      await Channels.updateOne(
        { _id: id },
        { $set: { deletedAt: new Date() } }
      );

      res.status(200).json({
        status: true,
        message: req.t("crud.deleted", { model: "Channel" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getEarnings(req: Request, res: Response) {
    try {
      const { id } = req.body.validatedParamsData;

      const earnings: any = await ChannelEarnings.aggregate([
        {
          $match: {
            channelId: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "userId",
            as: "userDetails",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  bio: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            userDetails: { $arrayElemAt: ["$userDetails", 0] },
          },
        },
      ]);

      res.status(200).json({
        status: true,
        data: earnings,
        message: req.t("crud.list", { model: "Earnings" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async details(req: Request, res: Response) {
    try {
      const { id } = req.body.validatedParamsData;

      let channel: any = await Channels.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "channel_users",
            foreignField: "channelId",
            localField: "_id",
            as: "channel_users",
            pipeline: [
              {
                $match: { deletedAt: null },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "channel_earnings",
            foreignField: "channelId",
            localField: "_id",
            as: "earnings",
          },
        },
        {
          $lookup: {
            from: "channel_messages",
            foreignField: "channelId",
            localField: "_id",
            as: "mediaMessages",
            pipeline: [
              {
                $match: {
                  messageType: {
                    $in: [
                      messageTypeEnum.IMAGE,
                      messageTypeEnum.VIDEO,
                      messageTypeEnum.MIXED,
                    ],
                  },
                },
              },
            ],
          },
        },
      ]);

      channel = channel[0] ?? {};

      res.status(200).json({
        status: true,
        data: channel,
        message: req.t("crud.details", { model: "Channel" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async savePost(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { messageId } = req.body.validatedData;

      await UserSavedPostsModel.findOneAndUpdate(
        { userId: user }, // Match user
        {
          $addToSet: { saved: { $each: messageId } }, // Add unique items to the 'saved' array
        },
        { upsert: true, new: true } // Create document if it doesn't exist, return the updated document
      );

      console.log(messageId, "maulik772");

      return res.status(200).json({
        status: true,
        message: req.t("crud.updated", { model: "Channel saved post" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async removePost(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { messageId } = req.body.validatedData;

      await UserSavedPostsModel.updateOne(
        { userId: user },
        { $pull: { saved: { $in: messageId } } }
      );
      return res.status(200).json({
        status: true,
        message: req.t("crud.deleted", { model: "Channel saved post" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getPost(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;

      const userSavedPosts = await UserSavedPostsModel.findOne({
        userId: user,
      }).select("saved");

      console.log(userSavedPosts, "maulik865");

      const { page, perPage } = req.body.pagination;

      let messageList = await ChannelMessages.aggregate([
        {
          $match: {
            _id: {
              $in: userSavedPosts?.saved,
            },
            deletedAt: null,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "channel_messages",
            foreignField: "_id",
            localField: "replyMessageId",
            as: "replyMessage",
            pipeline: [
              {
                $match: {
                  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$replyMessage",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "channel_message_statuses",
            foreignField: "messageId",
            localField: "_id",
            as: "messageStatus",
            pipeline: [
              {
                $match: {
                  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                },
              },
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "channel_message_reactions",
            foreignField: "messageId",
            localField: "_id",
            as: "messageReactions",
            pipeline: [
              {
                $match: {
                  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                },
              },
            ],
          },
        },
        // {
        //   $lookup: {
        //     from: "channel_message_reactions",
        //     foreignField: "messageId",
        //     localField: "_id",
        //     as: "latestMessageReactions",
        //     pipeline: [
        //       {
        //         $sort: { createdAt: -1 },
        //       },
        //       {
        //         $limit: 5,
        //       },
        //     ],
        //   },
        // },
        {
          $lookup: {
            from: "channel_message_comments",
            foreignField: "messageId",
            localField: "_id",
            as: "messageComments",
            pipeline: [
              {
                $match: {
                  $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                },
              },
              {
                $lookup: {
                  from: "users",
                  foreignField: "_id",
                  localField: "userId",
                  as: "userDetails",
                  pipeline: [
                    {
                      $project: {
                        username: 1, // Include only the `status` field
                        name: 1,
                        image: 1,
                      },
                    },
                  ],
                },
              },
              {
                $unwind: {
                  path: "$userDetails",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
        {
          $facet: {
            paginatedResults: [
              { $skip: perPage * (page - 1) },
              { $limit: perPage },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);

      const totalCount =
        messageList[0].totalCount && messageList[0].totalCount.length
          ? messageList[0].totalCount[0].count
          : 0;
      messageList = messageList[0].paginatedResults;

      res.status(200).json({
        status: true,
        data: messageList,
        pagination: pagination(totalCount, perPage, page),
        message: req.t("crud.list", { model: "Channel saved post" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async setOtherChannelSettings(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { notificationsSettings, languageSettings, channelId } =
        req.body.validatedData;

      const findSetting: any = await ChannelSpecificSettings.findOne({
        userId: user,
      });

      if (!findSetting.channelwiseSetting) {
        findSetting.channelwiseSetting = [];
      }

      let updatedChannelSetting = findSetting?.channelwiseSetting?.some(
        (e: any) => e?.channelId?.toString() == channelId
      );
      if (updatedChannelSetting) {
        findSetting.channelwiseSetting.map((userSetting: any) => {
          if (userSetting.channelId.toString() == channelId) {
            updatedChannelSetting = true;
            userSetting.notificationsSettings = notificationsSettings;
            userSetting.languageSettings = languageSettings;
          }
        });
      } else {
        findSetting.channelwiseSetting.push({
          channelId,
          languageSettings,
          notificationsSettings,
        });
      }

      console.log(findSetting, "maulik1066");

      await findSetting.save();

      res.status(200).json({
        status: true,
        data: req.body.validatedData,
        message: req.t("crud.list", { model: "chat setting" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getOtherChannelSettings(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { id } = req.body.validatedParamsData;

      const findSetting: any = await ChannelSpecificSettings.findOne(
        { userId: user, "userwiseSetting.userId": id },
        { userwiseSetting: 1 }
      );

      let findUserSetting = {};
      if (findSetting) {
        findSetting.userwiseSetting.forEach((setting: any) => {
          if (setting.userId.toString() == id) {
            findUserSetting = setting;
          }
        });
      }

      res.status(200).json({
        status: true,
        data: findUserSetting,
        message: req.t("crud.list", { model: "chat setting" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async setChatSettings(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { notificationsSettings, languageSettings } =
        req.body.validatedData;

      const findSetting: any = await ChannelSpecificSettings.findOneAndUpdate(
        { userId: user },
        {
          $set: {
            userId: user,
            generalSettings: {
              notificationsSettings,
              languageSettings,
            },
          },
        },
        { new: true, upsert: true }
      );

      res.status(200).json({
        status: true,
        data: findSetting,
        message: req.t("crud.updated", { model: "chat setting" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getChatSettings(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const findUserSettings: any = await ChannelSpecificSettings.findOne(
        { userId: user },
        {
          generalSettings: 1,
        }
      );

      res.status(200).json({
        status: true,
        data: findUserSettings?.generalSettings ?? {},
        message: req.t("crud.list", { model: "chat setting" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}
