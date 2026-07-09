const amqp = require("amqplib");
const { Supplier } = require("../models/supplierModel");
const { PurchaseOrder } = require("../models/purchaseOrderModel");

let rabbitChannel = null;

const initRabbit = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
  try {
    const conn = await amqp.connect(rabbitUrl);
    rabbitChannel = await conn.createChannel();

    await rabbitChannel.assertQueue("low-stock-queue", { durable: true });
    await rabbitChannel.assertQueue("procurement-queue", { durable: true });

    console.log(`Connected to RabbitMQ at ${rabbitUrl}`);

    // Consume low stock alerts from product service
    rabbitChannel.consume("low-stock-queue", async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log("Supplier Service received low-stock event:", content);
          await handleLowStockEvent(content);
          rabbitChannel.ack(msg);
        } catch (error) {
          console.error("Failed to process low stock event", error.message);
          rabbitChannel.nack(msg, false, false); // Discard on error
        }
      }
    });

  } catch (e) {
    console.error(`Failed to connect to RabbitMQ at ${rabbitUrl}, events disabled.`, e.message);
    rabbitChannel = null;
  }
};

const handleLowStockEvent = async (event) => {
  const { productId, name, price } = event;

  // Prevent duplicates
  const existingPO = await PurchaseOrder.findOne({ productId, status: "Pending" });
  if (existingPO) {
    console.log(`Purchase order already pending for product ${name} (${productId}). Skipping auto-creation.`);
    return;
  }

  // Find supplier (general matching)
  let supplier = await Supplier.findOne({ suppliedCategory: "Electronics" });
  if (!supplier) {
    supplier = await Supplier.findOne();
  }

  if (!supplier) {
    console.warn("No suppliers registered in DB. Cannot create Purchase Order.");
    return;
  }

  const poQty = 50; // standard reorder quantity
  const po = await PurchaseOrder.create({
    productId,
    productName: name,
    quantity: poQty,
    unitPrice: price,
    supplierId: supplier._id,
    supplierName: supplier.name,
    status: "Pending"
  });

  console.log(`Auto-created Purchase Order for product "${name}" with Supplier "${supplier.name}"`);

  // Publish notification
  await publishEvent("procurement-queue", {
    purchaseOrderId: po._id,
    productId,
    productName: name,
    quantity: poQty,
    supplierName: supplier.name,
    status: "Pending",
    timestamp: new Date()
  });
};

const publishEvent = async (queue, event) => {
  if (rabbitChannel) {
    try {
      rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(event)), { persistent: true });
      console.log(`Event published to queue "${queue}":`, event);
    } catch (e) {
      console.error(`Failed to publish event to queue "${queue}"`, e.message);
    }
  }
};

module.exports = { initRabbit, publishEvent };
