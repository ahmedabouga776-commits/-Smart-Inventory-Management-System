const redis = require("redis");
const amqp = require("amqplib");

let redisClient = null;
let rabbitChannel = null;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || "redis://redis:6379";
  try {
    redisClient = redis.createClient({ url: redisUrl });
    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    await redisClient.connect();
    console.log(`Connected to Redis at ${redisUrl}`);
  } catch (e) {
    console.error(`Failed to connect to Redis at ${redisUrl}, caching disabled.`, e.message);
    redisClient = null;
  }
};

const getRedisClient = () => redisClient;

const initRabbit = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
  try {
    const conn = await amqp.connect(rabbitUrl);
    rabbitChannel = await conn.createChannel();
    await rabbitChannel.assertQueue("low-stock-queue", { durable: true });
    console.log(`Connected to RabbitMQ at ${rabbitUrl}`);
  } catch (e) {
    console.error(`Failed to connect to RabbitMQ at ${rabbitUrl}, events disabled.`, e.message);
    rabbitChannel = null;
  }
};

const publishEvent = async (queue, event) => {
  if (rabbitChannel) {
    try {
      rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(event)), { persistent: true });
      console.log(`Event published to queue "${queue}":`, event);
    } catch (e) {
      console.error(`Failed to publish event to queue "${queue}"`, e.message);
    }
  } else {
    console.log(`RabbitMQ channel not active. Logged event for "${queue}":`, event);
  }
};

module.exports = { initRedis, getRedisClient, initRabbit, publishEvent };
