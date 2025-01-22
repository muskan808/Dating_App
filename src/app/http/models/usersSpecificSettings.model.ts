import { model, Model, Schema } from "mongoose";
import {
  lastSeenPrivacyEnum,
  messageRemoveTimerEnum,
} from "../types/users.types";
import {
  lastSeenTimerEnum,
  messagePrivacyEnum,
  usersSpecificSettingsTypes,
} from "../types/usersSpecificSettings.types";

const chatSettingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
  },
  chatSettings: {
    opacity: {
      type: String,
    },
    background: {
      type: String,
    },
    saveToGallery: {
      type: Boolean,
    },
    archiveChats: {
      type: Boolean,
    },
    muted: {
      type: Boolean,
    },
    pinned: {
      type: Boolean,
    },
  },
  privacySettings: {
    lastSeeen: {
      lastSeenType: {
        type: String,
        enum: lastSeenPrivacyEnum,
      },
    },
    messageRemoveTimer: {
      type: String,
      enum: messageRemoveTimerEnum,
    },
    readReceipts: {
      type: Boolean,
    },
    appLock: {
      type: Boolean,
    },
    chatLock: {
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
  notificationSettings: {
    isMute: {
      type: Boolean,
      default: false,
    },
    muteTime: {
      type: Boolean,
      default: null,
    },
  },
});

const userSpecificSettingsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
  },
  generalSettings: {
    chatSettings: {
      opacity: {
        type: String,
      },
      background: {
        type: String,
      },
      saveToGallery: {
        type: Boolean,
      },
      archiveChats: {
        type: Boolean,
      },
    },
    privacySettings: {
      lastSeeen: {
        lastSeenType: {
          type: String,
          enum: lastSeenPrivacyEnum,
        },
        exceptContacts: {
          type: Array,
        },
      },
      messagePrivacySetting: {
        friendsOfFriends: {
          type: String,
          eum: messagePrivacyEnum,
        },
        others: {
          type: String,
          enum: messagePrivacyEnum,
        },
      },
      messageRemoveTimer: {
        type: String,
        enum: messageRemoveTimerEnum,
      },
      readReceipts: {
        type: Boolean,
      },
      appLock: {
        type: Boolean,
      },
      chatLock: {
        type: Boolean,
      },
    },
    userSettings: {
      color: {
        type: String,
      },
      backgroundColor: {
        type: String,
      },
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
  },
  userwiseSetting: [chatSettingSchema],
});

const UserSpecificSettings = model<usersSpecificSettingsTypes>(
  "user_specific_settings",
  userSpecificSettingsSchema
);

export { UserSpecificSettings, usersSpecificSettingsTypes };
