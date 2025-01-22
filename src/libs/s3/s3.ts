import AWS from "aws-sdk";
import { env } from "../../env";

export class S3 {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }

  public static async getSignedUrl(
    key: string,
    ContentType: string
  ): Promise<any> {
    AWS.config.update({
      accessKeyId: env.aws.accessKey,
      secretAccessKey: env.aws.secretAccessKey,
    });

    const s3 = new AWS.S3({
      signatureVersion: "v4",
      region: env.aws.region,
    });

    const url = await s3.getSignedUrl("putObject", {
      Bucket: env.aws.bucket,
      Key: key,
      Expires: Number(1000),
      ContentType: ContentType,
      ACL: "public-read",
    });

    return {
      key: ` https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`,
      url: url,
    };
  }

  public static async S3deleteObject(key:string) {

    var s3 = new AWS.S3();
    var params = { Bucket: env.aws.bucket, Key: key };

    s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);  // error
      else console.log();                 // deleted
    });

  }
}
