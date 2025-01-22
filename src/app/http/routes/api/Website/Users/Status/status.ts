import { Router } from "express";
import statusController from "../../../../../controllers/api/Website/Users/Status";
import { SetChatSettingsRequest } from "../../../../../requests/Website/Users/SetChatSettingRequest";
import { verifyToken } from "../../../../../middleware/Auth";
import { RequestValidator } from "../../../../../middleware/RequestValidator";
import { AddStatusRequest } from "../../../../../requests/Website/Users/AddStatusRequest";

const router = Router();

router.post(
  "/add-status",
  verifyToken,
  RequestValidator(AddStatusRequest),
  statusController.addStatus
);
router.get(
  "/get-status-other-user",
  verifyToken,
  statusController.listStatusOtherUsers
);

router.get("/get-status-own", verifyToken, statusController.listStatusOwn);

export default router;
