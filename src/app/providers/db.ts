import { connect } from "mongoose"
import { env } from "../../env"
import { logger } from "./logger";
import mongoose from "mongoose";

export const connection = () => {
    connect(env.app.database_url).then(() => {
        logger.info("Database connected !");

        const db = mongoose.connection;

        db.on('error', (error) => {
            logger.error(`MongoDB connection error: ${error.message}`);
        });

        db.once('open', () => {
            logger.info('Connected to MongoDB');
        });

        // This middleware intercepts all queries
        mongoose.set('debug', true)

    }).catch((error: any) => {
        console.log("err=>",error)
        logger.error("Database Connection Error", error);
    })
}
