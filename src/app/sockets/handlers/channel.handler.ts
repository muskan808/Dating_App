import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import channelController from "../controllers/channel.controller";

export const channelEventHandler = async (
  en: string,
  payload: any,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: any
) => {
  try {
    console.log("fdfd=.", en);
    switch (en) {
      case "JOIN_CHANNEL":
        channelController.joinChannelRoom(socket, payload, io);
        break;
      case "SEND_CHANNEL_MESSAGE":
        channelController.sendMessage(socket, payload, io);
        break;
      case "SEND_EDITED_MESSAGE_CHANNEL":
        channelController.editMessage(socket, payload, io);
        break;
      case "DELETE_MESSAGE_CHANNEL":
        channelController.deleteMessage(socket, payload, io);
        break;
      case "ADD_OR_REMOVE_REACTION_CHANNEL":
        channelController.addOrRemoveReaction(socket, payload, io);
        break;
      case "ADD_OR_REMOVE_COMMENT":
        channelController.addOrRemoveComment(socket, payload, io);
        break;
      case "ADD_OR_REMOVE_COMMENT_REACTION":
        channelController.addOrRemoveCommentReaction(socket, payload, io);
        break;
      case "LEAVE_CHANNEL":
        channelController.leaveChannelRoom(socket, payload, io);
        break;
      case "READ_CHANNEL_MESSAGES":
        channelController.readMessages(socket, payload, io);
        break;
      case "ADD_OR_REMOVE_PIN_CHANNEL":
        channelController.addOrRemovePinMessage(socket, payload, io);
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
