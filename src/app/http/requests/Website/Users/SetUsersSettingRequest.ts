import { object, string, mixed, array, boolean } from "yup";
import {
  lastSeenPrivacyEnum,
  messageRemoveTimerEnum,
} from "../../../types/users.types";
import { lastSeenTimerEnum } from "../../../types/usersSpecificSettings.types";

export const SetUsersSettingRequest = object({
  userId: string().required(),
  chatSettings: object({
    opacity: string().required(),
    background: string().required(),
    saveToGallery: boolean().required(),
    archiveChats: boolean().required(),
    muted: boolean().optional(),
    pinned: boolean().optional(),
  }),
  privacySettings: object({
    lastSeeen: object({
      lastSeenType: mixed<lastSeenPrivacyEnum>().oneOf(
        Object.values(lastSeenPrivacyEnum)
      ),
      exceptContacts: array().optional(),
    }),
    messageRemoveTimer: mixed<messageRemoveTimerEnum>().oneOf(
      Object.values(messageRemoveTimerEnum)
    ),
    readReceipts: boolean().required(),
    appLock: boolean().required(),
    chatLock: boolean().required(),
  }),
  languageSettings: object({
    text: boolean().required(),
    voice: boolean().required(),
    audioVideo: boolean().required(),
    language: string().optional(),
  }),
  notificationSettings: object({
    isMute: boolean().required(),
    muteTime: string().optional(),
  }),
});

export const ChannelSetUsersSettingRequest = object({
  channelId: string().required(),
  notificationsSettings: object({
    showNotification: boolean().required(),
    sound: boolean().required(),
    reactionNotifications: boolean().required(),
  }),
  languageSettings: object({
    text: boolean().required(),
    voice: boolean().required(),
    audioVideo: boolean().required(),
    language: string().optional(),
  }),
});
