import { CronJob } from "cron";
import { CronEnums } from "../../utils/types";
import { removeDisappearedMessage } from "../commands/removeDisappearedMessages";
import { sendScheduledMessage } from "../commands/sendScheduleMessage";
export class cron {
  public static async setup(): Promise<void> {
      console.log(`DAC cron start---------`);

      new CronJob(
          CronEnums.EVERY_MINUTE,
          removeDisappearedMessage,
          undefined,
          undefined,
          undefined,
          undefined,
          true,
      ).start();

      new CronJob(
        CronEnums.EVERY_MINUTE,
        sendScheduledMessage,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      ).start();
  
  }
}
