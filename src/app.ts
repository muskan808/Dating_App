import { logger } from "./app/providers/logger";
// import serverAdapter from "./app/providers/queues";
import { Locale } from "./app/providers/locale";
import { cron } from "./app/providers/cron";
import { Server } from "./app/providers/server";
import { Express } from "./app/providers/express";
import { connection } from "./app/providers/db";
import cors from "cors";
import { ioConnection } from "./app/providers/io";
import { initializeMail } from "./libs/mail/mail";
import { initializeFirebaseAdmin } from "./app/providers/firebase-admin-setup";
import { env } from "./env";

const express = new Express();
const locale = new Locale();
const { middleware, i18next } = locale.initializeLocales();

Promise.all([
  express.initializeApp(),
  // express.configureRateLimiter(),
  express.configureLocale(middleware, i18next),
  express.configureViews(),
  express.configureExceptionHandler(),
]).then(() => {
  const app = express.app;
  app.use(
    cors({
      origin: "*",
    })
  );
  const httpServer = new Server(app);
  httpServer.start();
  ioConnection(httpServer.server);
  connection();
  if (env.node === 'development' || env.node === 'production') {
    cron.setup();
  }
  initializeMail();
  initializeFirebaseAdmin();
});

process.on("uncaughtException", (err) => {
  logger.error(err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  logger.debug("SIGTERM signal received: closing HTTP server");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error(err);
  process.exit(1);
});
