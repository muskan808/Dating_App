import Router from "express";
import userRoutes from "./Users/index";
import channelRoutes from "./Channel/Channel";
import { verifyToken } from "../../../middleware/Auth";

const router = Router();

router.use("/users", userRoutes);

router.use("/channel", verifyToken, channelRoutes);

export default router;