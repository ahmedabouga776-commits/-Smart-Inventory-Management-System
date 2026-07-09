const amqp = require("amqplib");

let rabbitChannel = null;

const initRabbit = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
  try {
    const conn = await amqp.connect(rabbitUrl);
    rabbitChannel = await conn.createChannel();
    await rabbitChannel.assertQueue("order-queue", { durable: true });
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

module.exports = { initRabbit, publishEvent };
