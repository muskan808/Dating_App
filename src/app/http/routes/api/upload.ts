import { Router } from "express";
import { UploadSingleFile } from "../../middleware/Storage";
import { UPLOAD_TYPES } from "../../../../utils/types";
import { UploadController } from "../../controllers/api/Upload/UploadController";
const router = Router();

router.post(
    "/",
    UploadSingleFile(UPLOAD_TYPES.ALLOWED_IMAGE_VIDEO_MUSIC_DOCUMENT, 'Image'),
    UploadController.uploadData
);

export default router;