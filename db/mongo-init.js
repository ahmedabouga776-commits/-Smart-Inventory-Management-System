db = db.getSiblingDB("auth_db");
db.createCollection("accounts");

db = db.getSiblingDB("product_db");
db.createCollection("products");

db.products.insertMany([
	{
		name: "Notebook",
		price: 12.5,
		quantity: 25,
		imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80"
	},
	{
		name: "Wireless Mouse",
		price: 24.99,
		quantity: 15,
		imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=300&q=80"
	},
	{
		name: "Backpack",
		price: 45.0,
		quantity: 8,
		imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80"
	},
	{
		name: "Barcode Scanner",
		price: 129.0,
		quantity: 6,
		imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
	},
	{
		name: "Packing Tape",
		price: 4.5,
		quantity: 120,
		imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80"
	},
	{
		name: "Safety Gloves",
		price: 7.75,
		quantity: 60,
		imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80"
	}
]);

db = db.getSiblingDB("supplier_db");
db.createCollection("suppliers");
db.suppliers.insertMany([
  {
    name: "Global Tech Supplies",
    contactName: "John Doe",
    email: "contact@globaltech.com",
    phone: "+1-555-0198",
    rating: 5,
    suppliedCategory: "Electronics"
  }
]);

db = db.getSiblingDB("order_db");
db.createCollection("orders");
db.orders.insertMany([
  {
    productId: "dummy-id",
    productName: "Notebook",
    quantity: 10,
    price: 12.5,
    type: "Inbound",
    status: "Completed",
    userId: "system-seed",
    createdAt: new Date()
  }
]);

db = db.getSiblingDB("notification_db");
db.createCollection("alerts");
db.alerts.insertMany([
  {
    type: "Procurement",
    title: "System Initialization",
    message: "Smart Inventory System cluster successfully booted and databases seeded.",
    read: false,
    timestamp: new Date()
  }
]);
