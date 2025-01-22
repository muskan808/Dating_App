import Router from "express";
import authRoutes from "./Auth/auth";
import staticRoutes from "./Static/static";
import statusRoutes from "./Status/status";

const router = Router();

router.use("/auth", authRoutes);
router.use("/static", staticRoutes);
router.use("/status", statusRoutes);

export default router;
