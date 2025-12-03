import Redis from "ioredis";

console.log("=== DEBUG FROM redis.js ===");
console.log("process.env.REDIS_URL exists? ", "REDIS_URL" in process.env);
console.log("process.env.REDIS_URL value: ", process.env.REDIS_URL);

const redis = new Redis(process.env.REDIS_URL || "MISSING_ENV");

redis.on("connect", () => console.log("Redis Connected ✔"));
redis.on("error", (err) => console.log("Redis Error ❌", err));

/**
 * BullMQ requires raw connection details instead of an existing ioredis instance.
 * Also, maxRetriesPerRequest MUST be null for BullMQ.
 */
export const bullmqConnection = {
  maxRetriesPerRequest: null,

  // Parse connection from REDIS_URL
  // Example URL: redis://default:password@host:port
  ...(() => {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: Number(url.port),
        username: url.username,
        password: url.password
      };
    } catch (e) {
      console.error("Failed parsing REDIS_URL for BullMQ:", e);
      return {};
    }
  })()
};

export default redis;
