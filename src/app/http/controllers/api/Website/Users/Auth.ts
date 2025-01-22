import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Users } from "../../../../models/users.model";
import {
  lastSeenPrivacyEnum,
  registrationTypeEnum,
  securityMode,
} from "../../../../types/users.types";
import {
  extractNumbers,
  generateOTP,
  suggestAlternatives,
} from "../../../../../../utils/utils";
import { env } from "../../../../../../env";
import { Otp } from "../../../../models/otp.model";
import {
  deleteDevice,
  generateDevice,
  generateOtpToken,
} from "../../../../../services/DeviceServices";
import { UserResponse } from "../../../../responses/UserResponse";
import { contactInfoTypeEnum, otpTypeEnum } from "../../../../types/otp.types";
import fs from "fs";
import path from "path";
import { sendOtpMailToUsers } from "../../../../../mails/SendOtpMail";
import { requestCall, verifyCall } from "../../../../../../utils/callAuth";
import Languages from "../../../../models/languages.model";
import { Device } from "../../../../models/device.model";
import { UserSpecificSettings } from "../../../../models/usersSpecificSettings.model";
import { chatHistoryListRequest } from "../../../../../sockets/requests/chatHistoryList.request";
import {
  lastSeenTimerEnum,
  messagePrivacyEnum,
  messageRemoveTimerEnum,
} from "../../../../types/usersSpecificSettings.types";
import {
  generateSecret,
  generateQRCode,
  verifyToken,
} from "../../../../../../utils/googleAuth";
import { ChannelUsers } from "../../../../models/channelUsers.model";
import { ChannelSpecificSettings } from "../../../../models/channelSpecificSettings.model";

export default class userAuthController {
  public static async login(req: Request, res: Response) {
    try {
      const { username, password, deviceType } = req.body.validatedData;

      const findUser: any = await Users.findOne({ username });
      console.log(findUser);
      if (!findUser) {
        return res.status(400).json({
          status: false,
          message: req.t("user.invalid_username_or_password"),
        });
      }

      const isValid = bcrypt.compareSync(password, findUser.password);

      if (!isValid) {
        return res.status(400).json({
          status: false,
          message: req.t("user.invalid_username_or_password"),
        });
      }

      const device: any = await generateDevice(findUser._id, deviceType);

      res.status(200).json({
        status: true,
        data: {
          user: UserResponse(findUser),
          authToken: device.authToken,
        },
        message: req.t("user.logged_in"),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async register(req: Request, res: Response) {
    try {
      const {
        registrationType,
        phoneCode,
        phoneNumber,
        email,
        deviceType,
        countryId,
      } = req.body.validatedData;

      let callerId = null;

      const findUser: any = await Users.findOne({
        $or: [{ email }, { phoneNumber }],
        registrationType,
        phoneCode,
      });

      if (findUser && findUser.profileCompleted) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.already_exists", { model: "User" }),
        });
      }

      const findOtp: any = await Otp.findOne({
        registrationType,
        phoneCode,
        phoneNumber,
        email,
        otpType: otpTypeEnum.SETUP,
      });

      if (findOtp) {
        return res.status(400).json({
          status: false,
          message: req.t("Otp already sended"),
        });
      }

      let generatedOtp = generateOTP();

      if (registrationType === registrationTypeEnum.EMAIL) {
        const pathValue =
          env.app.host === "http://localhost:4000" ? "src" : "dist";
        let emailTemplate = "";
        if (env.app.host === "http://localhost:4000")
          emailTemplate = fs.readFileSync(
            path.join(
              __dirname,
              pathValue,
              "../../../../../../../views/email/otpMail.hbs"
            ),
            "utf-8"
          );
        else
          emailTemplate = fs.readFileSync(
            path.join(__dirname, "/views/email/otpMail.hbs"),
            "utf-8"
          );
        const templateData = {
          otp: generatedOtp,
        };
        const emailData: any = {
          email: email,
          data: templateData,
          subject: "Verification Code: Complete Your Action",
          emailTemplate,
        };

        await sendOtpMailToUsers(emailData);
      }

      if (
        registrationType === registrationTypeEnum.PHONENUMBER &&
        phoneCode &&
        phoneNumber
      ) {
        const callVerificationData = await requestCall({
          number: (extractNumbers(phoneCode) + phoneNumber).toString(),
          platform: deviceType.toLowerCase(),
          type: "reverse_cli",
        });
        callerId = callVerificationData.id;
      }

      const createdData = await Otp.create({
        otp: generatedOtp,
        registrationType,
        phoneCode,
        phoneNumber,
        email,
        countryId,
        otpType: otpTypeEnum.SETUP,
        callId: callerId,
      });

      res.status(200).json({
        status: true,
        data: createdData,
        message: req.t("crud.list", { model: "OTP" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async verifyOTP(req: Request, res: Response) {
    try {
      const { otp, phoneCode, phoneNumber, email, registrationType, callId } =
        req.body.validatedData;

      const query: any = {
        registrationType,
      };

      if (registrationTypeEnum.EMAIL === registrationType) {
        query.email = email;
        query.otp = otp;
      } else {
        query.phoneCode = phoneCode;
        query.phoneNumber = phoneNumber;
        query.callId = callId;
      }

      const findOTP: any = await Otp.findOne(query);

      console.log(findOTP, "maulik183");

      if (!findOTP) {
        return res.status(400).json({
          status: false,
          message: req.t("user.invalid_otp"),
        });
      }

      if (registrationTypeEnum.PHONENUMBER === registrationType) {
        const callValidation = await verifyCall({
          id: findOTP.callId,
          pin: otp,
        });
        if (callValidation.validated === false) {
          return res.status(400).json({
            status: false,
            message: req.t("user.invalid_otp"),
          });
        }
      }

      findOTP.otpVerified = true;
      findOTP.token = await generateOtpToken(findOTP._id);
      await findOTP.save();

      res.status(200).json({
        status: true,
        data: {
          verified: true,
          otpToken: findOTP.token,
        },
        message: req.t("crud.details", { model: "OTP" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async resendOtpOrCall(req: Request, res: Response) {
    try {
      const { registrationType, phoneCode, phoneNumber, email, deviceType } =
        req.body.validatedData;

      const query: any = {
        registrationType,
      };

      if (registrationType === registrationTypeEnum.EMAIL) {
        query.email = email;
      } else if (registrationType === registrationTypeEnum.PHONENUMBER) {
        query.phoneCode = phoneCode;
        query.phoneNumber = phoneNumber;
      }

      // Check if the OTP request already exists
      const existingOtp: any = await Otp.findOne(query);

      if (!existingOtp) {
        return res.status(404).json({
          status: false,
          message: req.t("Otp not found. Please register first."),
        });
      }

      if (existingOtp.otpVerified) {
        return res.status(400).json({
          status: false,
          message: req.t("OTP already verified. No need to resend."),
        });
      }

      // Generate a new OTP
      const generatedOtp = generateOTP();
      let callerId = null;

      if (registrationType === registrationTypeEnum.EMAIL) {
        // Send email with the new OTP
        const pathValue =
          env.app.host === "http://localhost:4000" ? "src" : "dist";
        let emailTemplate = "";
        if (env.app.host === "http://localhost:4000") {
          emailTemplate = fs.readFileSync(
            path.join(
              __dirname,
              pathValue,
              "../../../../../../../views/email/otpMail.hbs"
            ),
            "utf-8"
          );
        } else {
          emailTemplate = fs.readFileSync(
            path.join(__dirname, "/views/email/otpMail.hbs"),
            "utf-8"
          );
        }

        const templateData = {
          otp: generatedOtp,
        };

        const emailData: any = {
          email: email,
          data: templateData,
          subject: "Verification Code: Complete Your Action",
          emailTemplate,
        };

        await sendOtpMailToUsers(emailData);
      }

      if (
        registrationType === registrationTypeEnum.PHONENUMBER &&
        phoneCode &&
        phoneNumber
      ) {
        // Send call verification request
        const callVerificationData = await requestCall({
          number: (extractNumbers(phoneCode) + phoneNumber).toString(),
          platform: deviceType.toLowerCase(),
          type: "reverse_cli",
        });
        callerId = callVerificationData.id;
      }

      // Update OTP in the database
      existingOtp.otp = generatedOtp;
      existingOtp.callId = callerId || existingOtp.callId;
      existingOtp.otpVerified = false;
      await existingOtp.save();

      res.status(200).json({
        status: true,
        data: {
          otp: generatedOtp,
          callerId: existingOtp.callId,
        },
        message: req.t(
          "Otp resent successfully. Please verify to complete the process."
        ),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async verifyUsername(req: Request, res: Response) {
    try {
      const {
        username,
        phoneCode,
        phoneNumber,
        email,
        registrationType,
        token,
      } = req.body.validatedData;

      const otpFindQuery: any = {
        registrationType,
        token,
        otpType: otpTypeEnum.SETUP,
      };

      if (registrationType == registrationTypeEnum.EMAIL) {
        otpFindQuery.email = email;
      } else {
        otpFindQuery.phoneCode = phoneCode;
        otpFindQuery.phoneNumber = phoneNumber;
      }

      const findOtp = await Otp.findOne(otpFindQuery);

      if (!findOtp || (findOtp && !findOtp.otpVerified)) {
        return res.status(400).json({
          status: false,
          message: req.t("user.invalid_otp"),
        });
      }

      const user = await Users.findOne({ username });

      if (user) {
        return res.status(400).json({
          status: false,
          suggestList: suggestAlternatives(username),
          message: req.t("crud.already_exists", { model: "User" }),
        });
      }

      res.status(200).json({
        status: true,
        message: "valid",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async setupProfile(req: Request, res: Response) {
    try {
      const {
        email,
        username,
        password,
        name,
        bio,
        dateOfBirth,
        gender,
        image,
        phoneCode,
        phoneNumber,
        registrationType,
        token,
        deviceType,
        countryId,
      } = req.body.validatedData;

      let findOtpQuery: any = {
        registrationType,
        token,
        otpType: otpTypeEnum.SETUP,
      };

      if (registrationType == registrationTypeEnum.EMAIL) {
        findOtpQuery.email = email;
      } else {
        findOtpQuery.phoneCode = phoneCode;
        findOtpQuery.phoneNumber = phoneNumber;
      }

      const findOtp = await Otp.findOne(findOtpQuery);

      if (!findOtp || (findOtp && !findOtp.otpVerified)) {
        return res.status(400).json({
          status: false,
          message: req.t("user.invalid_otp"),
        });
      }

      const findUser = await Users.findOne({ username });

      if (findUser) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.already_exists", { model: "User" }),
        });
      }
      const { base32 } = generateSecret();

      const user: any = await Users.create({
        email,
        username,
        countryId,
        password: await bcrypt.hashSync(password),
        name,
        bio,
        dateOfBirth,
        gender,
        image,
        phoneCode,
        phoneNumber,
        mergedPhoneNumber: phoneNumber
          ? (extractNumbers(phoneCode) + phoneNumber).toString()
          : "",
        registrationType,
        profileCompleted: true,
        twofaCode: base32,
        twofaQR: await generateQRCode(base32, username, "APP"),
        locationSetting: {
          differentName: false,
          name: "",
          audio: false,
          video: false,
          group: false,
          profile: false,
          userId: false,
          mobile: false,
        },
      });

      const device: any = await generateDevice(user._id, deviceType);

      await UserSpecificSettings.create({
        userId: user._id,
        generalSettings: {
          chatSettings: {
            opacity: "1",
            background:
              "https://chatbucketcdn.lon1.digitaloceanspaces.com/1729618774185-922222782.png",
            saveToGallery: false,
            archiveChats: false,
          },
          privacySettings: {
            lastSeeen: {
              lastSeenType: lastSeenPrivacyEnum.EVERYONE,
              exceptContacts: [],
            },
            messagePrivacySetting: {
              friendsOfFriends: messagePrivacyEnum.CHATS,
              others: messagePrivacyEnum.CHATS,
            },
            messageRemoveTimer: messageRemoveTimerEnum.OFF,
            readReceipts: true,
            appLock: false,
            chatLock: false,
          },
          userSettings: {
            color: "",
          },
          notificationsSettings: {
            showNotification: true,
            sound: true,
            reactionNotifications: true,
          },
          languageSettings: {
            text: true,
            voice: true,
            audioVideo: true,
            language: "EN",
          },
        },
      });

      await ChannelSpecificSettings.create({
        userId: user._id,
        generalSettings: {
          languageSettings: {
            text: true,
            voice: true,
            audioVideo: true,
            language: "EN",
          },
          notificationsSettings: {
            reactionNotifications: true,
            showNotification: true,
            sound: true,
          },
        },
        userwiseSetting: [],
      });

      res.status(200).json({
        status: true,
        data: {
          user: UserResponse(user),
          authToken: device.authToken,
        },
        message: req.t("user.user_created"),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async logout(req: Request, res: Response) {
    try {
      const { token } = req.body.auth;

      await deleteDevice(token);

      res.status(200).json({
        status: true,
        message: req.t("user.logged_out"),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async forgotPassword(req: Request, res: Response) {
    try {
      const { registrationType, phoneCode, phoneNumber, email } =
        req.body.validatedData;

      const findUser: any = await Users.findOne({
        registrationType,
        phoneCode,
        phoneNumber,
        email,
      });

      if (!findUser) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.not_found", { model: "User details" }),
        });
      }

      const findOtp: any = await Otp.findOne({
        registrationType,
        phoneCode,
        phoneNumber,
        email,
        otpType: otpTypeEnum.FORGOT,
      });

      if (findOtp) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.already_exists", { model: "OTP" }),
        });
      }

      let generatedOtp = generateOTP();
      const otp: any = await Otp.create({
        otp: generatedOtp,
        registrationType,
        phoneCode,
        phoneNumber,
        email,
        otpType: otpTypeEnum.FORGOT,
      });

      res.status(200).json({
        status: true,
        data: generatedOtp,
        message: req.t("crud.details", { model: "OTP" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async resetPassword(req: Request, res: Response) {
    try {
      const {
        password,
        phoneCode,
        phoneNumber,
        email,
        registrationType,
        token,
      } = req.body.validatedData;

      const findOtp = await Otp.findOne({
        phoneCode,
        phoneNumber,
        email,
        registrationType,
        token,
        otpType: otpTypeEnum.FORGOT,
      });

      if (!findOtp || (findOtp && !findOtp.otpVerified)) {
        return res.status(400).json({
          status: false,
          message: req.t("user.invalid_otp"),
        });
      }

      const user = await Users.findOne({
        phoneCode,
        phoneNumber,
        email,
        registrationType,
      });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.not_found", { model: "User" }),
        });
      }

      user.password = await bcrypt.hashSync(password);
      await user.save();

      findOtp.token = "";
      await findOtp.save();

      res.status(200).json({
        status: true,
        message: "password reseted",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getProfile(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;

      const userData: any = await Users.findOne({ _id: user });

      if (!userData) {
        return res.status(404).json({
          status: false,
          message: req.t("crud.not_found", { model: "User" }),
        });
      }

      res.status(200).json({
        status: true,
        data: UserResponse(userData),
        message: req.t("crud.list", { model: "User Profile" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async updateProfile(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { image, bio, name, username } = req.body.validatedData;

      const userData: any = await Users.findOne({ _id: user });

      if (!userData) {
        return res.status(404).json({
          status: false,
          message: req.t("crud.not_found", { model: "User" }),
        });
      }

      userData.image = image;
      userData.bio = bio;
      userData.name = name;
      if (username !== userData.username) {
        const findUser = await Users.findOne({ username: userData.username });
        if (findUser) {
          return res.status(400).json({
            status: false,
            message: req.t("crud.unique_error", { model: "username" }),
          });
        }
        userData.username = username;
      }

      await userData.save();

      res.status(200).json({
        status: true,
        data: UserResponse(userData),
        message: req.t("crud.updated", { model: "User Profile" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async addContacts(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { contacts } = req.body.validatedData;
      const userData: any = await Users.findOne({ _id: user });

      if (!userData) {
        return res.status(404).json({
          status: false,
          message: req.t("crud.not_found", { model: "User" }),
        });
      }

      userData.contacts = contacts;

      await userData.save();

      res.status(200).json({
        status: true,
        // data: UserResponse(userData),
        message: req.t("Contacts stored successfully"),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getContacts(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;

      // Retrieve user data with contacts
      const userData: any = await Users.findOne({ _id: user }).select(
        "contacts phoneNumber bio"
      );
      if (!userData) {
        return res.status(404).json({
          status: false,
          message: req.t("crud.not_found", { model: "User" }),
        });
      }

      const contactNumbers = userData.contacts?.map((e: any) => e.number) || [];

      // Fetch registered contacts based on matching mergedPhoneNumber
      const registeredContacts = await Users.find({
        mergedPhoneNumber: {
          $in: contactNumbers.map((num: string) => new RegExp(num, "i")),
        },
      }).select("username phoneNumber mergedPhoneNumber bio");

      // Identify unregistered contacts by filtering out registered numbers
      const registeredNumbers = new Set(
        registeredContacts.map((c: any) => c.mergedPhoneNumber)
      );
      const unregisteredContacts = userData.contacts?.filter(
        (contact: any) => !registeredNumbers.has(contact.number)
      );

      res.status(200).json({
        status: true,
        data: {
          registered: registeredContacts,
          unregistered: unregisteredContacts,
        },
        message: "Contacts retrieved successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async updateLanguages(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { languageId } = req.body.validatedData;
      await Users.updateOne({ _id: user }, { $set: { languageId } });

      res.status(200).json({
        status: true,
        message: req.t("Languages stored successfully"),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getAllLanguages(req: Request, res: Response) {
    try {
      const languagesData: any = await Languages.find({});

      res.status(200).json({
        status: true,
        data: languagesData,
        message: req.t("Languages get successfully"),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getUserLanguage(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const languagesData: any = await Users.findOne({ _id: user })
        .populate("languageId")
        .select({ languageId: 1, _id: 0 });

      res.status(200).json({
        status: true,
        data: languagesData,
        message: "Languages get successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async setNotificationToken(req: Request, res: Response) {
    try {
      const { token } = req.body.auth;
      const { notificationToken } = req.body.validatedData;

      await Device.updateOne(
        { authToken: token },
        { $set: { notificationToken: notificationToken } }
      );

      res.status(200).json({
        status: true,
        message: req.t("crud.updated", { model: "notification token" }),
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
      const {
        chatSettings,
        privacySettings,
        userSettings,
        notificationsSettings,
        languageSettings,
      } = req.body.validatedData;

      const findSetting: any = await UserSpecificSettings.findOneAndUpdate(
        { userId: user },
        {
          $set: {
            userId: user,
            generalSettings: {
              chatSettings,
              privacySettings,
              userSettings,
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
      const findUserSettings: any = await UserSpecificSettings.findOne(
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

  public static async setOtherUserSettings(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const {
        userId,
        chatSettings,
        privacySettings,
        languageSettings,
        notificationSettings,
      } = req.body.validatedData;

      const findSetting: any = await UserSpecificSettings.findOne({
        userId: user,
      });

      if (!findSetting.userwiseSetting) {
        findSetting.userwiseSetting = [];
      }

      let updatedUserSetting = false;
      findSetting.userwiseSetting.map((userSetting: any) => {
        if (userSetting.userId.toString() == userId) {
          updatedUserSetting = true;
          userSetting.chatSettings = chatSettings;
          userSetting.privacySettings = privacySettings;
          userSetting.languageSettings = languageSettings;
          userSetting.notificationSettings = notificationSettings;
        }
      });

      if (!updatedUserSetting) {
        findSetting.userwiseSetting.push({
          userId,
          chatSettings,
          privacySettings,
          languageSettings,
          notificationSettings,
        });
      }

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

  public static async getOtherUsersSettings(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { id } = req.body.validatedParamsData;

      const findSetting: any = await UserSpecificSettings.findOne(
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

  public static async reGenerate2FACde(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { base32 } = generateSecret();
      const twofaQR = await generateQRCode(base32, user, "APP");
      await Users.updateOne(
        { _id: user },
        {
          $set: {
            twofaCode: base32,
            twofaQR: await generateQRCode(base32, user, "APP"),
          },
        }
      );

      res.status(200).json({
        status: true,
        data: {
          twofaCode: base32,
          twofaQR: twofaQR,
        },
        message: "2FA QR_Code and Code",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async enable2FA(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;

      const { secret, token } = req.body.validatedData;

      const isValid = verifyToken(secret, token);

      if (isValid) {
        await Users.updateOne(
          { _id: user },
          {
            $set: { sequrity: securityMode.TWOFA },
            $unset: { pin: true },
          }
        );
        res.status(200).json({
          status: true,
          data: {},
          message: "2FA Complete",
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "Invalid token",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async enablePin(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { newPin, oldPin } = req.body.validatedData;

      const checkPin: any = await Users.findOne({ _id: user }).select("pin");

      if (checkPin && checkPin?.pin && checkPin?.pin !== oldPin) {
        return res.status(400).json({
          status: false,
          message: "Invalid old pin",
        });
      } else {
        await Users.updateOne(
          { _id: user },
          {
            $set: {
              sequrity: securityMode.PIN,
              pin: newPin,
            },
          }
        );
        res.status(200).json({
          status: true,
          data: {},
          message: "Pin verification copmleted",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async setTwoFAMode(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { mode } = req.body.validatedData;

      await Users.updateOne(
        {
          _id: user,
        },
        {
          $set: {
            sequrity: mode,
          },
        }
      );

      res.status(200).json({
        status: true,
        data: {},
        message: "Mode updated",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async updateUsersLocation(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { longitude, latitude } = req.body.validatedData;

      const lon = parseFloat(longitude);
      const lat = parseFloat(latitude);

      if (isNaN(lon) || isNaN(lat)) {
        return res.status(400).json({
          status: false,
          message: "Invalid latitude or longitude values",
        });
      }

      // Update the user's location in GeoJSON format
      await Users.updateOne(
        { _id: user },
        {
          $set: {
            location: {
              type: "Point", // GeoJSON type
              coordinates: [lon, lat], // [longitude, latitude]
            },
          },
        }
      );

      res.status(200).json({
        status: true,
        data: {},
        message: "Location updated successfully",
      });
    } catch (error: any) {
      console.log(error, "maulik1219");
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getUsersLocation(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { longitude, latitude, km, gender } = req.body.validatedData;

      // Ensure longitude, latitude, and km are valid numbers
      const lon = parseFloat(longitude);
      const lat = parseFloat(latitude);
      const radius = parseFloat(km);

      if (isNaN(lon) || isNaN(lat)) {
        return res.status(400).json({
          status: false,
          message: "Invalid latitude or longitude values",
        });
      }

      if (isNaN(radius) || radius <= 0) {
        return res.status(400).json({
          status: false,
          message: "Invalid radius value",
        });
      }

      // Perform a geospatial query to get users within the specified radius
      const usersWithinRadius = await Users.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lon, lat] }, // Reference point (user's new location)
            distanceField: "distance", // Calculate the distance from the point
            spherical: true, // Use spherical distance calculations
            maxDistance: radius * 1000, // Convert km to meters
            query: {
              _id: { $ne: user },
              deletedAt: null,
              ...(gender && gender !== "ALL" && { gender }),
            }, // Exclude the current user and deleted users
          },
        },
        {
          $project: {
            _id: 1, // Include the _id field
            name: 1, // Include the name field
            email: 1, // Include the email field
            distance: 1, // Include the calculated distance field
            location: 1, // Include the GeoJSON location field
            gender: 1,
            locationSetting: 1,
            image: 1,
            username: 1,
            online: 1,
            bio: 1,
            phoneNumber: 1,
            phoneCode: 1,
          },
        },
      ]);

      // Respond with the updated user location and the users found within the radius
      res.status(200).json({
        status: true,
        data: usersWithinRadius,
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async updateUsersLocationSettings(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;

      await Users.updateOne(
        { _id: user },
        {
          $set: {
            locationSetting: req.body.validatedData,
          },
        }
      );

      res.status(200).json({
        status: true,
        message: "Data updated",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getUsersLocationSettings(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;

      const { locationSetting } =
        (await Users.findOne({ _id: user }).select("locationSetting")) || {};

      res.status(200).json({
        status: true,
        data: locationSetting,
        message: "Data updated",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getUsersLocationProfile(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { id } = req.body.validatedParamsData;

      const userData =
        (await Users.findOne({ _id: id }).select(
          "locationSetting username bio image gender phoneNumber phoneCode lastSeen online"
        )) || {};

      const getAllChannel = await ChannelUsers.find({
        userId: id,
        isOwner: true,
      }).populate("channelId", "name description icon");

      res.status(200).json({
        status: true,
        data: { userData, getAllChannel },
        message: "Data updated",
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async updateEmailorPhone(req: Request, res: Response) {
    try {
      const { user } = req.body.auth;
      const { contactInfoType, deviceType, phoneCode, phoneNumber, email } =
        req.body.validatedData;

      const userDetails: any = await Users.findOne({ _id: user });

      if (!userDetails) {
        return res.status(400).json({
          status: false,
          message: req.t("crud.not_found", { model: "User" }),
        });
      }

      const findOtp: any = await Otp.findOne({
        contactInfoType,
        phoneCode,
        phoneNumber,
        email,
        otpType: otpTypeEnum.SETUP,
      });

      if (findOtp) {
        return res.status(400).json({
          status: false,
          message: req.t("Otp already sended"),
        });
      }
      let callerId = null;
      let generatedOtp = generateOTP();

      if (contactInfoType === contactInfoTypeEnum.EMAIL) {
        const pathValue =
          env.app.host === "http://localhost:4000" ? "src" : "dist";
        let emailTemplate = "";
        if (env.app.host === "http://localhost:4000")
          emailTemplate = fs.readFileSync(
            path.join(
              __dirname,
              pathValue,
              "../../../../../../../views/email/otpMail.hbs"
            ),
            "utf-8"
          );
        else
          emailTemplate = fs.readFileSync(
            path.join(__dirname, "/views/email/otpMail.hbs"),
            "utf-8"
          );
        const templateData = {
          otp: generatedOtp,
        };
        const emailData: any = {
          email: email,
          data: templateData,
          subject: "Verification Code: Complete Your Action",
          emailTemplate,
        };

        await sendOtpMailToUsers(emailData);
      }

      if (
        contactInfoType === contactInfoTypeEnum.PHONENUMBER &&
        phoneCode &&
        phoneNumber
      ) {
        const callVerificationData = await requestCall({
          number: (phoneCode + phoneNumber).toString(),
          platform: deviceType.toLowerCase(),
          type: "reverse_cli",
        });
        callerId = callVerificationData.id;
      }

      const createdData = await Otp.create({
        otp: generatedOtp,
        contactInfoType,
        phoneCode,
        phoneNumber,
        email,
        otpType: otpTypeEnum.SETUP,
        callId: callerId,
      });

      res.status(200).json({
        status: true,
        data: createdData,
        message: req.t("crud.list", { model: "OTP" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async verifyUpdatedEmailOrPhoneOTP(
    req: Request,
    res: Response
  ) {
    try {
      const { otp, phoneCode, phoneNumber, email, contactInfoType, callId } =
      req.body.validatedData;
      const { user } = req.body.auth;

      const query: any = {
        contactInfoType,
        phoneCode,
        phoneNumber,
      };

      if (contactInfoTypeEnum.EMAIL === contactInfoType) {
        query.email = email;
        query.otp = otp;
      } else {
        query.callId = callId;
      }

      const findOTP: any = await Otp.findOne(query);

      if (!findOTP) {
        return res.status(400).json({
          status: false,
          message: req.t("user.invalid_otp"),
        });
      }

      if (contactInfoTypeEnum.PHONENUMBER === contactInfoType) {
        const callValidation = await verifyCall({
          id: findOTP.callId,
          pin: otp,
        });

        if (callValidation.validated === false) {
          return res.status(400).json({
            status: false,
            message: req.t("user.invalid_otp"),
          });
        }
      }

      findOTP.otpVerified = true;
      await findOTP.save();
      let userDetails: any = false;
      if (contactInfoTypeEnum.EMAIL === contactInfoType) {
        userDetails = await Users.findByIdAndUpdate(user.toString(), {
          $set: {
            email,
          },
        });
      } else if (contactInfoTypeEnum.PHONENUMBER === contactInfoType) {
        userDetails = await Users.findByIdAndUpdate(user.toString(), {
          $set: {
            phoneCode,
            phoneNumber,
            mergedPhoneNumber: (
              extractNumbers(phoneCode) + phoneNumber
            ).toString(),
          },
        });
      }

      res.status(200).json({
        status: true,
        data: userDetails,
        message: req.t("crud.details", { model: "OTP" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}
