import { SQSClient } from "@aws-sdk/client-sqs";
import { Consumer } from "sqs-consumer";
import { env } from "../../env";

export const consumer = async (
  queueUrl: string,
  handleFunction: (data: any) => void
) => {
  console.log("queueUrl", queueUrl);
  const app = Consumer.create({
    queueUrl,
    handleMessage: async (message) => {
      // do some work with `message`
      console.log(`received message ${JSON.stringify(message)}`);
      const jsonMessage = JSON.parse(message.Body ?? "");
      await handleFunction(jsonMessage);
    },
    batchSize: 5,
    sqs: new SQSClient({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKey,
        secretAccessKey: env.aws.secretAccessKey,
      },
    }),
  });

  app.on("error", (err) => {
    console.error(err.message);
  });

  app.on("processing_error", (err) => {
    console.error(err.message);
  });

  app.start();
};
