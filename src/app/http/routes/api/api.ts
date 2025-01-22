import { Request, Router, Response } from "express";
import { PingController } from "../../controllers/api/PingController";
import uploadRoutes from "./upload";
import websiteRoutes from "./Website/index";
//ROUTES IMPORT

const router = Router();

router.get("/", PingController.pong);

router.use("/upload", uploadRoutes);

router.use("/web", websiteRoutes);

router.use(function (req: Request, res: Response) {
  res.status(404).send({
    status: false,
    message: "Not found",
  });
});

export default router;
