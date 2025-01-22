import { Router } from "express";
import userAuthController from "../../../../../controllers/api/Website/Users/Auth";
import {
  RequestParamsValidator,
  RequestValidator,
} from "../../../../../middleware/RequestValidator";
import { UserLoginRequest } from "../../../../../requests/Website/Users/LoginRequest";
import { UserRegisterRequest } from "../../../../../requests/Website/Users/RegisterRequest";
import {
  ResendOtpOrCallRequest,
  VerifyOTPRequest,
} from "../../../../../requests/Website/Users/VerifyOTPRequest";
import { VerifyUsernameRequest } from "../../../../../requests/Website/Users/VerifyUsernameRequest";
import { SetupProfileRequest } from "../../../../../requests/Website/Users/SetupProfileRequest";
import { verifyToken } from "../../../../../middleware/Auth";
import { ResetPasswordRequest } from "../../../../../requests/Website/Users/ResetPasswordRequest";
import { UpdateProfileRequest } from "../../../../../requests/Website/Users/UpdateProfileRequest";
import { AddContactsRequest } from "../../../../../requests/Website/Users/AddContactsRequest";
import { UpdateLanguagesRequest } from "../../../../../requests/Website/Users/UpdateLanguagesRequest";
import { SetNotificationTokenRequest } from "../../../../../requests/Website/Users/SetNotificationTokenRequest";
import { SetChatSettingsRequest } from "../../../../../requests/Website/Users/SetChatSettingRequest";
import { SetUsersSettingRequest } from "../../../../../requests/Website/Users/SetUsersSettingRequest";
import { IdQueryParamRequest } from "../../../../../requests/IdQueryParamRequest";
import { Verify2FARequest } from "../../../../../requests/Website/Users/Verify2FARequest";
import {
  Set2FAMode,
  VerifyPinRequest,
} from "../../../../../requests/Website/Users/VerifyPinRequest";
import { VerifyUpdatedEmailOrPhoneOTPRequest } from "../../../../../requests/Website/Users/VerifyUpdatedEmailOrPhoneOtpRequest";
import {
  UpdateEmailOrPhoneRequest,
  UpdateUsersLocation,
  UpdateUsersLocationSettings,
} from "../../../../../requests/Website/Users/UpdateEmailOrPhoneRequest";

const router = Router();

router.post(
  "/login",
  RequestValidator(UserLoginRequest),
  userAuthController.login
);

router.post(
  "/register",
  RequestValidator(UserRegisterRequest),
  userAuthController.register
);

router.post(
  "/verify-otp",
  RequestValidator(VerifyOTPRequest),
  userAuthController.verifyOTP
);

router.post(
  "/resend-otp",
  RequestValidator(ResendOtpOrCallRequest),
  userAuthController.resendOtpOrCall
);

router.post(
  "/verify-username",
  RequestValidator(VerifyUsernameRequest),
  userAuthController.verifyUsername
);

router.post(
  "/setup-profile",
  RequestValidator(SetupProfileRequest),
  userAuthController.setupProfile
);

router.post(
  "/forgot-password",
  RequestValidator(UserRegisterRequest),
  userAuthController.forgotPassword
);

router.post(
  "/reset-password",
  RequestValidator(ResetPasswordRequest),
  userAuthController.resetPassword
);
router.get("/logout", verifyToken, userAuthController.logout);

router.get("/get-profile", verifyToken, userAuthController.getProfile);

router.put(
  "/update-profile",
  verifyToken,
  RequestValidator(UpdateProfileRequest),
  userAuthController.updateProfile
);

router.put(
  "/add-contacts",
  verifyToken,
  RequestValidator(AddContactsRequest),
  userAuthController.addContacts
);

router.get("/get-contacts", verifyToken, userAuthController.getContacts);

router.put(
  "/update-languages",
  verifyToken,
  RequestValidator(UpdateLanguagesRequest),
  userAuthController.updateLanguages
);

router.get("/get-all-languages", userAuthController.getAllLanguages);

router.get(
  "/get-user-languages",
  verifyToken,
  userAuthController.getUserLanguage
);

router.post(
  "/set-notificationToken",
  verifyToken,
  RequestValidator(SetNotificationTokenRequest),
  userAuthController.setNotificationToken
);

router.put(
  "/set-chat-setting",
  verifyToken,
  RequestValidator(SetChatSettingsRequest),
  userAuthController.setChatSettings
);

router.get("/chat-setting", verifyToken, userAuthController.getChatSettings);

router.get("/regenerate-2FA", verifyToken, userAuthController.reGenerate2FACde);

router.put(
  "/verify-2fa",
  verifyToken,
  RequestValidator(Verify2FARequest),
  userAuthController.enable2FA
);

router.put(
  "/verify-pin",
  verifyToken,
  RequestValidator(VerifyPinRequest),
  userAuthController.enablePin
);

router.put(
  "/set-2fa-mode",
  verifyToken,
  RequestValidator(Set2FAMode),
  userAuthController.setTwoFAMode
);

router.put(
  "/update-users-location",
  verifyToken,
  RequestValidator(UpdateUsersLocation),
  userAuthController.updateUsersLocation
);

router.post(
  "/get-users-location",
  verifyToken,
  RequestValidator(UpdateUsersLocation),
  userAuthController.getUsersLocation
);

router.put(
  "/update-users-location-setting",
  verifyToken,
  RequestValidator(UpdateUsersLocationSettings),
  userAuthController.updateUsersLocationSettings
);

router.get(
  "/get-users-location-setting",
  verifyToken,
  userAuthController.getUsersLocationSettings
);

router.get(
  "/get-users-location-profile/:id",
  verifyToken,
  RequestParamsValidator(IdQueryParamRequest),
  userAuthController.getUsersLocationProfile
);

router.put(
  "/set-userwise-chat-setting",
  verifyToken,
  RequestValidator(SetUsersSettingRequest),
  userAuthController.setOtherUserSettings
);

router.get(
  "/get-userwise-chat-setting/:id",
  verifyToken,
  RequestParamsValidator(IdQueryParamRequest),
  userAuthController.getOtherUsersSettings
);

router.post(
  "/update-email-or-phone",
  verifyToken,
  RequestValidator(UpdateEmailOrPhoneRequest),
  userAuthController.updateEmailorPhone
);

router.post(
  "/verify-updated-email-or-phone-otp",
  verifyToken,
  RequestValidator(VerifyUpdatedEmailOrPhoneOTPRequest),
  userAuthController.verifyUpdatedEmailOrPhoneOTP
);

export default router;
