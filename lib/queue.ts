import { Queue } from "bullmq";
import { redis } from "./redis";

const connection = redis as any;

export const streakQueue = new Queue("streak", { connection });
export const badgeQueue = new Queue("badge", { connection });
export const emailQueue = new Queue("email", { connection });
