import Router from "express";
import channelController from "../../../../controllers/api/Website/Channel/Channel";
import { paginationCleaner } from "../../../../middleware/Pagination";
import {
  RequestParamsValidator,
  RequestQueryValidator,
  RequestValidator,
} from "../../../../middleware/RequestValidator";
import { ChannelListRequest } from "../../../../requests/Website/Channels/ChannelListRequest";
import { FollowedChannelListRequest } from "../../../../requests/Website/Channels/FollowedChannelListRequest";
import { MessageListRequest } from "../../../../requests/Website/Channels/MessageListRequest";
import { ChannelAddRequest } from "../../../../requests/Website/Channels/ChannelAddRequest";
import {
  ChannelFollowRequest,
  ChannelSavePostRequest,
} from "../../../../requests/Website/Channels/ChannelFollowRequest";
import { IdQueryParamRequest } from "../../../../requests/IdQueryParamRequest";
import { RemoveFollowerRequest } from "../../../../requests/Website/Channels/RemoveFollowerRequest";
import {
  ChannelSetChatSettingsRequest,
  SetChatSettingsRequest,
} from "../../../../requests/Website/Users/SetChatSettingRequest";
import {
  ChannelSetUsersSettingRequest,
  SetUsersSettingRequest,
} from "../../../../requests/Website/Users/SetUsersSettingRequest";
const router = Router();

router.get(
  "/list",
  RequestQueryValidator(ChannelListRequest),
  paginationCleaner,
  channelController.list
);

router.get(
  "/list-followed",
  RequestQueryValidator(FollowedChannelListRequest),
  paginationCleaner,
  channelController.channelList
);

router.post("/add", RequestValidator(ChannelAddRequest), channelController.add);

router.put(
  "/update",
  RequestValidator(ChannelAddRequest),
  channelController.update
);

router.get(
  "/message-list",
  RequestQueryValidator(MessageListRequest),
  paginationCleaner,
  channelController.messageList
);

router.get(
  "/followers-list/:id",
  RequestParamsValidator(IdQueryParamRequest),
  channelController.followersList
);

router.get(
  "/follower-details/:id",
  RequestParamsValidator(IdQueryParamRequest),
  channelController.getFollowerDetails
);

router.post(
  "/remove-follower",
  RequestValidator(RemoveFollowerRequest),
  channelController.removeFollowers
);

router.post(
  "/follow-unfollow",
  RequestValidator(ChannelFollowRequest),
  channelController.followUnFollow
);

router.delete(
  "/delete/:id",
  RequestParamsValidator(IdQueryParamRequest),
  channelController.deleteChannel
);

router.get(
  "/earnings/:id",
  RequestParamsValidator(IdQueryParamRequest),
  channelController.getEarnings
);

router.get(
  "/details/:id",
  RequestParamsValidator(IdQueryParamRequest),
  channelController.details
);

router.get(
  "/channel-saved-post-get-all",
  paginationCleaner,
  channelController.getPost
);

router.put(
  "/channel-post-save",
  RequestValidator(ChannelSavePostRequest),
  channelController.savePost
);

router.put(
  "/channel-post-remove",
  RequestValidator(ChannelSavePostRequest),
  channelController.removePost
);

router.put(
  "/set-channelwise-chat-setting",
  RequestValidator(ChannelSetUsersSettingRequest),
  channelController.setOtherChannelSettings
);

router.get(
  "/get-channelwise-chat-setting/:id",
  RequestParamsValidator(IdQueryParamRequest),
  channelController.getOtherChannelSettings
);

router.put(
  "/set-chat-setting",
  RequestValidator(ChannelSetChatSettingsRequest),
  channelController.setChatSettings
);

router.get("/chat-setting", channelController.getChatSettings);

export default router;
