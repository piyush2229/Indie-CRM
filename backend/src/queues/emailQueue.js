import { Queue } from "bullmq";
import { bullmqConnection } from "../config/redis.js";

export const emailQueue = new Queue("emailQueue", {
  connection: bullmqConnection
});
