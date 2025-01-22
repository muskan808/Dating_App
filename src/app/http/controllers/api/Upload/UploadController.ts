import { Request, Response } from "express";
import { UploadedFile } from "../../../../../utils/types";

export class UploadController {
    public static async uploadData(req: Request, res: Response) {
        const file = req.file as UploadedFile
        console.log("file=>",file);

        return res.send({
            status: true,
            data: file,
            message: 'Image uploaded'
        })
    }
}