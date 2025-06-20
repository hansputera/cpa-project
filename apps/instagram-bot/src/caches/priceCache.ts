import { Redis } from "ioredis";
import { configEnv } from "../config/config.js";

export const redisClient = new Redis(configEnv.REDIS_URI);
