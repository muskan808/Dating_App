import { Router } from "express";
import staticController from "../../../../../controllers/api/Website/Users/Static";

const router = Router();

router.get("/chat-backgrounds", staticController.listChatBackgrounds);

router.get("/get-all-phone-codes", staticController.getAllCountries);

export default router;
