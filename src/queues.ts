import { env } from "./env";
import { consumer } from "./libs/sqs/consumer";


const queues:any = [
];

const consumeQueues = async () => {
  console.log("consumeQueues calll");

  for (const queue of queues) {
    const queueUrl = `https://sqs.${env.aws.region}.amazonaws.com/${env.aws.sqsAccountId}/${env.aws.sqsEnv}-${queue.url}`;
    console.log("queueUrl", queueUrl);
    consumer(queueUrl, queue.handleMessage);
  }
};

consumeQueues();
