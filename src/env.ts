import * as dotenv from "dotenv";
import { getOsEnv, normalizePort, toBool, toNumber } from "./libs/env";
dotenv.config();

export const env = {
  node: getOsEnv("APP_ENV"),
  app: {
    name: getOsEnv("APP_NAME"),
    host: getOsEnv("APP_URL"),
    admin_host: getOsEnv("ADMIN_APP_URL"),
    exhibitor_host: getOsEnv("EXHIBITOR_APP_URL"),
    debug:
      getOsEnv("APP_ENV") !== "production"
        ? toBool(getOsEnv("APP_DEBUG"))
        : false,
    port: normalizePort(process.env.PORT || getOsEnv("APP_PORT")),
    api_only: toBool(getOsEnv("API_ONLY")),
    api_prefix: getOsEnv("API_PREFIX"),
    pagination_limit: toNumber(getOsEnv("PAGINATION_LIMIT")),
    api_rate_limit: toNumber(getOsEnv("API_RATE_LIMIT")),
    root_dir: getOsEnv("APP_ENV") === "production" ? "dist" : "src",
    user_uploaded_content_path: getOsEnv("USER_UPLOADED_CONTENT_PATH"),
    database_url: getOsEnv("DATABASE_URL"),
  },
  auth: {
    secret: getOsEnv("JWT_SECRET"),
    expiresIn: getOsEnv("JWT_EXPIRES_IN"),
    forgotPasswordExpiredIn: getOsEnv("JWT_FORGOT_PASSWORD_EXPIRES_IN"),
    deviceExpireIn: getOsEnv("DEVICE_EXPIRY_HRS"),
    otp_expireIN: getOsEnv("OTP_EXPIRES_IN_SEC"),
  },
  call_auth: {
    call_auth_base_url: getOsEnv("CALL_AUTH_BASE_URL"),
    call_auth_secret_key: getOsEnv("CALL_AUTH_SECRET_KEY"),
  },
  redis: {
    url:
      getOsEnv("REDIS_USERNAME") || getOsEnv("REDIS_PASSWORD")
        ? `redis://${getOsEnv("REDIS_USERNAME")}:${getOsEnv(
            "REDIS_PASSWORD"
          )}@${getOsEnv("REDIS_HOST")}:${getOsEnv("REDIS_PORT")}`
        : `redis://${getOsEnv("REDIS_HOST")}:${getOsEnv("REDIS_PORT")}`,
    host: getOsEnv("REDIS_HOST"),
    port: getOsEnv("REDIS_PORT"),
    password: getOsEnv("REDIS_PASSWORD"),
    username: getOsEnv("REDIS_USERNAME"),
  },
  aws: {
    accessKey: getOsEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getOsEnv("AWS_SECRET_ACCESS_KEY"),
    bucket: getOsEnv("AWS_BUCKET"),
    region: getOsEnv("AWS_DEFAULT_REGION"),
    sqsEnv: getOsEnv("AWS_SQS_ENV"),
    sqsAccountId: getOsEnv("AWS_SQS_ACCOUNT_ID"),
    endpoint: getOsEnv("DIGITAL_OCEAN_CDN_ENDPOINT"),
  },
  mail: {
    host: getOsEnv("MAIL_HOST"),
    port: toNumber(getOsEnv("MAIL_PORT")),
    username: getOsEnv("MAIL_USERNAME"),
    password: getOsEnv("MAIL_PASSWORD"),
    enc: getOsEnv("MAIL_ENCRYPTION"),
    from_address: getOsEnv("MAIL_FROM_ADDRESS"),
    name: getOsEnv("MAIL_FROM_NAME"),
    service: getOsEnv("MAIL_SERIVCE"),
  },
  oauth: {
    google: {
      clientId: getOsEnv("GOOGLE_CLIENT_ID"),
    },
    apple: {
      clientId: getOsEnv("APPLE_CLIENT_ID"),
    },
  },
  cors: {
    urls: getOsEnv("CORS_AVAILABLE_LINKS").split(","),
  },
};
