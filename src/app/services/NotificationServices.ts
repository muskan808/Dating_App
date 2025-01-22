import { Device } from "../http/models/device.model";
import { sendNotification } from "../providers/firebase-admin-setup";

export const sendChatNotification = async (
  userId: string,
  message: any,
  route: string,
  parameter: string,
  parameterValue: string,
  messageFrom: string
) => {
  try {
    const token: any = await Device.findOne(
      {
        userId: userId,
        $and: [
          { notificationToken: { $exists: true, $ne: null } },
          { notificationToken: { $ne: "" } },
        ],
      },
      { notificationToken: 1 }
    ).sort({ _id: -1 });

    const data = await sendNotification(
      [token?.notificationToken],
      message,
      {
        route: route,
        type: "CHAT",
        queryParameter: parameter,
        queryParameterValue: parameterValue,
      },
      "You have a new message from the " + messageFrom
    );
    console.log(data, "maulik27");
    return true;
  } catch (error: any) {
    return error;
  }
};

export const sendScheduleNotification = async (
  userId: string,
  message: any,
  route: string,
  parameter: string,
  parameterValue: string,
  messageFrom: string
) => {
  try {
    const token: any = await Device.findOne(
      {
        userId: userId,
        $and: [
          { notificationToken: { $exists: true, $ne: null } },
          { notificationToken: { $ne: "" } },
        ],
      },
      { notificationToken: 1 }
    ).sort({ _id: -1 });

    await sendNotification(
      [token?.notificationToken],
      message,
      {
        route: route,
        type: "CHAT",
        queryParameter: parameter,
        queryParameterValue: parameterValue,
      },
      "You have a new message from the " + messageFrom
    );
    return true;
  } catch (error: any) {
    return error;
  }
};
