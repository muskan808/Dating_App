import { Producer } from "sqs-producer";
import { SQSClient } from "@aws-sdk/client-sqs";
import { env } from "../../env";

// create simple producer
export const producer = (url: string) => {
  const queueUrl = `https://sqs.${env.aws.region}.amazonaws.com/${env.aws.sqsAccountId}/${env.aws.sqsEnv}-${url}`;
  console.log("producer callll");

  return Producer.create({
    queueUrl: queueUrl,
    sqs: new SQSClient({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKey,
        secretAccessKey: env.aws.secretAccessKey,
      },
    }),
  });
};
