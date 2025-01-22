import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import websiteController from "../controllers/website.controller";
import { SocketRequestValidator } from "../middleware/SocketRequestValidator";
import { sendMessageRequest } from "../requests/sendMessage.request";
import { editMessageRequest } from "../requests/editMessage.request";
import { deleteMessageRequest } from "../requests/deleteMessage.request";
import { chatHistoryListRequest } from "../requests/chatHistoryList.request";
import { listSingleUserChatRequest } from "../requests/listSingleUserChat.request";
import { readMessageRequest } from "../requests/readMessage.request";
import { addOrRemoveReactionRequest } from "../requests/addOrRemoveReaction.request";
import { addOrRemovePinRequest } from "../requests/addOrRemovePin.request";

export const websiteEventHandler = async (
  en: string,
  payload: any,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: any
) => {
  try {
    console.log("fdfd=.",en)
    switch (en) {
      case "SEND_MESSAGE":
        payload = await SocketRequestValidator(payload, sendMessageRequest);
        websiteController.sendMessage(socket, payload, io);
        break;
      case "SEND_EDITED_MESSAGE":
        payload = await SocketRequestValidator(payload, editMessageRequest);
        websiteController.editMessage(socket, payload, io);
        break;
      case "DELETE_MESSAGE":
        payload = await SocketRequestValidator(payload, deleteMessageRequest);
        websiteController.deleteMessage(socket, payload, io);
        break;
      case "CHATS_HISTORY_LIST":
        payload = await SocketRequestValidator(payload, chatHistoryListRequest);
        websiteController.chatHistoryList(socket, payload, io);
        break;
      case "CHATS_LIST":
        payload = await SocketRequestValidator(
          payload,
          listSingleUserChatRequest
        );
        websiteController.chatList(socket, payload, io);
        break;
      case "GET_STICKERS":
        websiteController.listStickers(socket, payload, io);
        break;
      case "READ_MESSAGE":
        payload = await SocketRequestValidator(payload, readMessageRequest);
        websiteController.readMessage(socket, payload, io);
        break;
      case "DELETE_CHAT_MESSAGES":
        payload = await SocketRequestValidator(payload, listSingleUserChatRequest);
        websiteController.deleteChatMessages(socket, payload, io);
        break;
      case "ADD_OR_REMOVE_REACTION":
        payload = await SocketRequestValidator(payload, addOrRemoveReactionRequest);
        websiteController.addOrRemoveReaction(socket, payload, io);
        break;
      case "ADD_OR_REMOVE_PIN":
        payload = await SocketRequestValidator(payload, addOrRemovePinRequest);
        websiteController.addOrRemovePinMessage(socket, payload, io);
        break;
      default:
        break;
    }
  } catch (error: any) {
    io.to(socket.handshake.auth.decoded.userId).emit("ERROR_RECEIVER", {
      status: false,
      message: error.message,
    });
  }
};
