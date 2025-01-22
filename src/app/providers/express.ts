import express, { Application, Request } from "express";
import "express-async-errors";
import compression from "compression";
import apiRouter from "../http/routes/api/api";
import { env } from "../../env";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import cors from "cors";
import nocache from "nocache";
import multer from "multer";
import {
  ExceptionHandler,
  NotFoundHandler,
} from "../http/middleware/ExceptionHandler";

export class Express {
  app: Application;

  constructor() {
    this.app = express();
  }

  initializeApp = () => {
    const port = process.env.APP_PORT;
    console.log();
    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"],
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // this.app.use(multer().any())

    this.app.use(express.static(env.app.root_dir + "/public"));
    this.app.use(
      env.app.user_uploaded_content_path,
      express.static(env.app.root_dir + "/storage/uploads/")
    );

    this.app.use(compression());
    this.app.disable("x-powered-by");

    // this.app.use(apiRouter);

    // error handler
    this.app.set("port", port);
  };

  configureViews = () => {
    this.app.set("view engine", "hbs");
    this.app.set("views", env.app.root_dir + "/views/");
    this.app.use(nocache());
    // if (!env.app.api_only) {
    //   this.app.use("/", webRouter);
    // }
    this.app.use(`/${env.app.api_prefix}`, apiRouter);
    // this.app.use("/queues", serverAdapter.getRouter());
  };

  configureLocale = (middleware: any, i18next: any) => {
    this.app.use(middleware.handle(i18next));
  };

  configureRateLimiter = async () => {
    if (env.app.api_rate_limit > 0) {
      this.app.use(
        rateLimit({
          // Rate limiter configuration
          skip: (request: Request) => {
            const urlArray = request.originalUrl.split("/");
            if (
              urlArray.length > 2 &&
              urlArray[1] === "queues" &&
              urlArray[2] === "api"
            ) {
              return true;
            }
            return false;
          },
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: env.app.api_rate_limit, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
          standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
          legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        })
      );
    }
  };

  configureExceptionHandler = () => {
    this.app.use(NotFoundHandler);
    this.app.use(ExceptionHandler);
  };
}
