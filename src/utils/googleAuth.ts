import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";

export const generateSecret = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  return secret;
};

export const generateQRCode = async (
  secret: string,
  user: string,
  appName: string
) => {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret,
    label: `${appName}:${user}`,
    issuer: appName,
    encoding: "base32",
  });

  return await qrcode.toDataURL(otpauthUrl); // Generates a QR code in base64
};

export const verifyToken = (secret: string, token: string) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 1, // This allows a small time window for token validation
  });
};
