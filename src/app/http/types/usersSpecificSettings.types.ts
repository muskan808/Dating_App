import { Document } from "mongoose";

export enum messageRemoveTimerEnum {
  "24_HOURS" = "24_HOURS",
  "7_DAYS" = "7_DAYS",
  "90_DAYS" = "90_DAYS",
  OFF = "OFF",
}

export enum messagePrivacyEnum {
  MESSAGE_REQUEST = "MESSAGE_REQUEST",
  CHATS = "CHATS",
  DONT_ACCEPT_MESSAGES = "DONT_ACCEPT_MESSAGES",
}

export enum lastSeenTimerEnum {
  "24_HOURS" = "24_HOURS",
  "7_DAYS" = "7_DAYS",
  "90_DAYS" = "90_DAYS",
  OFF = "OFF",
}

export enum lastSeenPrivacyEnum {
  "EVERYONE" = "EVERYONE",
  "MY_CONTACTS" = "MY_CONTACTS",
  "MY_CONTACTS_EXCEPT" = "MY_CONTACTS_EXCEPT",
  "NOBODY" = "NOBODY",
}

interface userwiseSettingTypes extends Document {
  userId: String;
  chatSettings: {
    opacity: String;
    background: String;
    saveToGallery: Boolean;
    archiveChats: Boolean;
    muted: Boolean;
    pinned: Boolean;
  };
  privacySettings: {
    lastSeeen: {
      lastSeenType: lastSeenPrivacyEnum;
      exceptContacts: Array<any>;
    };
    messageRemoveTimer: messageRemoveTimerEnum;
    readReceipts: Boolean;
    appLock: Boolean;
    chatLock: Boolean;
  };
  languageSettings: {
    text: Boolean;
    voice: Boolean;
    audioVideo: Boolean;
    language: String;
  };
}

interface channelwiseSettingTypes extends Document {
  channelId: String;
  generalSettings: {
    notificationsSettings: {
      showNotification: Boolean;
      sound: Boolean;
      reactionNotifications: Boolean;
    };
    languageSettings: {
      text: Boolean;
      voice: Boolean;
      audioVideo: Boolean;
      language: String;
    };
  };
}

export interface usersSpecificSettingsTypes extends Document {
  id: String;
  userId: String;
  generalSettings: {
    chatSettings: {
      opacity: String;
      background: String;
      saveToGallery: Boolean;
      archiveChats: Boolean;
    };
    privacySettings: {
      lastSeeen: {
        lastSeenType: lastSeenPrivacyEnum;
        exceptContacts: Array<any>;
      };
      messagePrivacySetting: {
        friendsOfFriends: messagePrivacyEnum;
        others: messagePrivacyEnum;
      };
      messageRemoveTimer: messageRemoveTimerEnum;
      readReceipts: Boolean;
      appLock: Boolean;
      chatLock: Boolean;
    };
    userSettings: {
      color: String;
      backgroundColor: String;
    };
    notificationsSettings: {
      showNotification: Boolean;
      sound: Boolean;
      reactionNotifications: Boolean;
    };
    languageSettings: {
      text: Boolean;
      voice: Boolean;
      audioVideo: Boolean;
      language: String;
    };
  };
  userwiseSetting: [userwiseSettingTypes];
}

export interface channelSpecificSettingsTypes extends Document {
  id: String;
  userId: String;
  generalSettings: {
    notificationsSettings: {
      showNotification: Boolean;
      sound: Boolean;
      reactionNotifications: Boolean;
    };
    languageSettings: {
      text: Boolean;
      voice: Boolean;
      audioVideo: Boolean;
      language: String;
    };
  };
  userwiseSetting: [channelwiseSettingTypes];
}
