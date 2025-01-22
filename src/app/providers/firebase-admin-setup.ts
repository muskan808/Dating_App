import * as admin from "firebase-admin";
import serviceAccount from "../../storage/data/serviceAccountKey.json";

export const initializeFirebaseAdmin = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

export const sendNotification = async (
  registrationToken: any,
  messageData: string,
  payloadOptions: any,
  title?: any,
  image?: any
) => {
  console.log(messageData, "maulik11");
  return new Promise(async (resolve, reject) => {
    try {
      // const sendMessage = await admin.messaging().send(messageData)
      console.log("test=>", payloadOptions);
      const message: any = {
        android: {
          priority: "high",
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: title ?? "Chat bucket",
                body: messageData,
              },
              contentAvailable: true,
            },
          },
        },
        notification: {
          title: title ?? "Chat bucket",
          body: messageData,
        },
        data: {
          title: title ?? "Chat bucket",
          text: messageData,
          body: JSON.stringify({
            webData: {
              route: payloadOptions.route,
              type: payloadOptions.type,
              queryParameter: payloadOptions.queryParameter ?? "",
              queryParameterValue: payloadOptions.queryParameterValue ?? "",
            },
            appData: {
              action: payloadOptions.route,
              type: payloadOptions.type,
              subAction: payloadOptions.queryParameter ?? "",
              id: payloadOptions.queryParameterValue ?? "",
            },
          }),
          image: image ?? "",
        },
        tokens: registrationToken,
        webpush: {
          notification: {
            click_action: "/",
            image: image ?? "",
          },
        },
      };

      // const data = admin.messaging().send(message)
      const data = await admin.messaging().sendEachForMulticast(message);
      console.log("data=>", data);
      console.log("test=>", data.responses);
      resolve(true);
    } catch (error: any) {
      console.log("error=>", error);
      reject(error);
    }
  });
};
