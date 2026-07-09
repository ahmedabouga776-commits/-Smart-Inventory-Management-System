const amqp = require("amqplib");
const { Alert } = require("../models/alertModel");

let rabbitChannel = null;

const initRabbit = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
  try {
    const conn = await amqp.connect(rabbitUrl);
    rabbitChannel = await conn.createChannel();

    // Assert queues
    await rabbitChannel.assertQueue("low-stock-queue", { durable: true });
    await rabbitChannel.assertQueue("order-queue", { durable: true });
    await rabbitChannel.assertQueue("procurement-queue", { durable: true });

    console.log(`Connected to RabbitMQ at ${rabbitUrl}`);

    // Consume low-stock alerts
    rabbitChannel.consume("low-stock-queue", async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log("Notification Service received low stock event:", content);
          await Alert.create({
            type: "Low Stock",
            title: `Low Stock Alert: ${content.name}`,
            message: `Product "${content.name}" has fallen below critical threshold. Current stock: ${content.quantity}.`
          });
          rabbitChannel.ack(msg);
        } catch (error) {
          console.error("Failed to parse low-stock alert in notification-service", error.message);
          rabbitChannel.nack(msg, false, false);
        }
      }
    });

    // Consume order alerts
    rabbitChannel.consume("order-queue", async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log("Notification Service received order event:", content);
          await Alert.create({
            type: "Order Activity",
            title: `${content.type} Order Logged`,
            message: `${content.quantity} units of "${content.productName}" processed as ${content.type}. User: ${content.userId}.`
          });
          rabbitChannel.ack(msg);
        } catch (error) {
          console.error("Failed to parse order alert in notification-service", error.message);
          rabbitChannel.nack(msg, false, false);
        }
      }
    });

    // Consume procurement alerts
    rabbitChannel.consume("procurement-queue", async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log("Notification Service received procurement event:", content);
          await Alert.create({
            type: "Procurement",
            title: "Purchase Order Automatically Created",
            message: `Autopilot reordered ${content.quantity} units of "${content.productName}" from supplier "${content.supplierName}". Status: ${content.status}.`
          });
          rabbitChannel.ack(msg);
        } catch (error) {
          console.error("Failed to parse procurement alert in notification-service", error.message);
          rabbitChannel.nack(msg, false, false);
        }
      }
    });

  } catch (e) {
    console.error(`Failed to connect to RabbitMQ at ${rabbitUrl}, notification alerts disabled.`, e.message);
    rabbitChannel = null;
  }
};

module.exports = { initRabbit };
