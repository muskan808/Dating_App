import { model, Model, Schema } from "mongoose";
import {
  lastSeenPrivacyEnum,
  messageRemoveTimerEnum,
} from "../types/users.types";
import {
  channelSpecificSettingsTypes,
  lastSeenTimerEnum,
  messagePrivacyEnum,
  usersSpecificSettingsTypes,
} from "../types/usersSpecificSettings.types";

const chatSettingSchema = new Schema({
  channelId: {
    type: Schema.Types.ObjectId,
  },
  notificationsSettings: {
    showNotification: {
      type: Boolean,
    },
    sound: {
      type: Boolean,
    },
    reactionNotifications: {
      type: Boolean,
    },
  },
  languageSettings: {
    text: {
      type: Boolean,
    },
    voice: {
      type: Boolean,
    },
    audioVideo: {
      type: Boolean,
    },
    language: {
      type: String,
    },
  },
});

const channelSpecificSettingsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
  },
  generalSettings: {
    notificationsSettings: {
      showNotification: {
        type: Boolean,
      },
      sound: {
        type: Boolean,
      },
      reactionNotifications: {
        type: Boolean,
      },
    },
    languageSettings: {
      text: {
        type: Boolean,
      },
      voice: {
        type: Boolean,
      },
      audioVideo: {
        type: Boolean,
      },
      language: {
        type: String,
      },
    },
  },
  channelwiseSetting: [chatSettingSchema],
});

const ChannelSpecificSettings = model<channelSpecificSettingsTypes>(
  "channel_specific_settings",
  channelSpecificSettingsSchema
);

export { ChannelSpecificSettings, channelSpecificSettingsTypes };