import { Request, Response } from "express";
import { ChatBackgrounds } from "../../../../models/chatBackgrounds.model";
import PhoneCode from "../../../../models/phoneCodes.model";

export default class staticController {
  public static async listChatBackgrounds(req: Request, res: Response) {
    try {
      const chatBackgrounds: any = await ChatBackgrounds.find({
        deletedAt: null,
      });

      res.status(200).json({
        status: true,
        data: chatBackgrounds,
        message: req.t("crud.list", { model: "chat backgrounds" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  public static async getAllCountries(req: Request, res: Response) {
    try {
      const getAllPhoneCodes: any = await PhoneCode.find();

      res.status(200).json({
        status: true,
        data: getAllPhoneCodes,
        message: req.t("crud.list", { model: "chat backgrounds" }),
      });
    } catch (error: any) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}
