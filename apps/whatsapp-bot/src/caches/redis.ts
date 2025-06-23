import { Redis } from "ioredis";
import { configEnv } from "../config/config.js";

export const redisUri = new Redis(configEnv.REDIS_URI);
