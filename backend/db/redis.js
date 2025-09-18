// db/redis.js
// Lazy Redis client helper — doesn't throw on import.
// Use connectRedis() to attempt connection and getRedisClient() to retrieve the client.

const { createClient } = require("redis");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let client = null;

function createClientInstance() {
  if (client) return client;
  client = createClient({ url: REDIS_URL });

  client.on("error", (err) => {
    // keep logging but do not throw from event handler
    console.error("Redis Client Error", err);
  });

  client.on("connect", () => {
    console.log("Redis client connecting...");
  });

  client.on("ready", () => {
    console.log("Redis client ready");
  });

  return client;
}

/**
 * Attempt to connect the Redis client.
 * Returns the connected client or throws if connection fails.
 */
async function connectRedis() {
  const c = createClientInstance();

  // If already open/connected, return
  if (c.isOpen) return c;

  try {
    await c.connect();
    return c;
  } catch (err) {
    // bubble up so caller can decide what to do
    throw err;
  }
}

function getRedisClient() {
  return createClientInstance();
}

module.exports = {
  getRedisClient,
  connectRedis,
};
