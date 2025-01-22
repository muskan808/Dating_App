import { object, string, mixed, boolean, array } from "yup";
import { devicesTypeEnum } from "../../../types/auth.types";
import {
  lastSeenPrivacyEnum,
  messageRemoveTimerEnum,
} from "../../../types/users.types";
import {
  lastSeenTimerEnum,
  messagePrivacyEnum,
} from "../../../types/usersSpecificSettings.types";

export const SetChatSettingsRequest = object({
  chatSettings: object({
    opacity: string().required(),
    background: string().required(),
    saveToGallery: boolean().required(),
    archiveChats: boolean().required(),
  }),
  privacySettings: object({
    lastSeeen: object({
      lastSeenType: mixed<lastSeenPrivacyEnum>().oneOf(
        Object.values(lastSeenPrivacyEnum)
      ),
      exceptContacts: array().optional(),
    }),
    messagePrivacySetting: object({
      friendsOfFriends: mixed<messagePrivacyEnum>().oneOf(
        Object.values(messagePrivacyEnum)
      ),
      others: mixed<messagePrivacyEnum>().oneOf(
        Object.values(messagePrivacyEnum)
      ),
    }),
    messageRemoveTimer: mixed<messageRemoveTimerEnum>().oneOf(
      Object.values(messageRemoveTimerEnum)
    ),
    readReceipts: boolean().required(),
    appLock: boolean().required(),
    chatLock: boolean().required(),
  }),
  userSettings: object({
    color: string().required(),
    backgroundColor: string().required(),
  }),
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

export const ChannelSetChatSettingsRequest = object({
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
