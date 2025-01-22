import { NextFunction, Request, Response } from "express";
import multer from "multer";
import multers3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { UPLOAD_TYPES } from "../../../utils/types";
import { STORAGE_PATH, validFileTypes } from "../../../utils/utils";
import { env } from "../../../env";
const s3 = new S3Client({
  endpoint: env.aws.endpoint,
  credentials: {
    accessKeyId: env.aws.accessKey,
    secretAccessKey: env.aws.secretAccessKey,
  },
  region: env.aws.region,
});
export const UploadSingleFile =
  (type: UPLOAD_TYPES, name: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("---------------->", req.file, req.files);
    configuredMulter(type).single(name)(req, res, (error) => {
      if (error) {
        console.log("err", error);
        return res.send({
          status: false,
          message:
            error?.message || "Something went wrong while uploading asset",
        });
      }

      next();
    });
  };

/**
 * a configured multer instance
 * @param type
 * @returns
 */
const configuredMulter = (type: UPLOAD_TYPES) => {
  return multer({
    storage: storageManager,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: function (req, file, cb) {
      const availableTypes = validFileTypes(type);

      if (!availableTypes.includes(file.mimetype)) {
        //if the file type does not match the allowed types, then return false
        cb(
          new Error(
            `Invalid file type.Please upload any of these types : ${availableTypes.concat()}`
          )
        );
      }
      if (file.size > 1024 * 1024 * 5) {
        cb(new Error("File size exceeds the limit of 5MB"));
      }
      cb(null, true);
    },
  });
};
const storageManager = multers3({
  s3: s3,
  acl: "public-read",
  bucket: env.aws.bucket,
  contentType: multers3.AUTO_CONTENT_TYPE,

  metadata: function (req, file, cb) {
    const { originalname } = file;
    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
    cb(null, { fieldName: file.fieldname, extension: fileExtension?.slice(1) });
  },
  key: function (req, file, cb) {
    const { originalname } = file;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
    cb(null, `${uniqueSuffix}${fileExtension}`);
  },
});
