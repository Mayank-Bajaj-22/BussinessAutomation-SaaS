import RedisStore, { RedisReply } from "rate-limit-redis"
import { redisConnection } from "../../config/redis.js"

export const createRedisStore = () => {
    return new RedisStore({
        sendCommand: async (
            command: string,
            ...args: string[]
        ) : Promise<RedisReply> => {
            return redisConnection.call(
                command,
                ...args,
            ) as Promise<RedisReply>;
        },
    });
};