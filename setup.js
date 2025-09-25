// MongoDB Aggregation Pipeline Tutorial
// Run these commands in mongosh

// 1. DATABASE SETUP
use ecommerce

// 2. CREATE COLLECTIONS & INSERT DATA

// Users collection
db.users.insertMany([
  { _id: 1, name: "Alice Johnson", email: "alice@example.com", age: 28, city: "New York", registeredAt: new Date("2023-01-15") },
  { _id: 2, name: "Bob Smith", email: "bob@example.com", age: 35, city: "Los Angeles", registeredAt: new Date("2023-02-20") },
  { _id: 3, name: "Carol Davis", email: "carol@example.com", age: 42, city: "Chicago", registeredAt: new Date("2023-01-10") },
  { _id: 4, name: "David Wilson", email: "david@example.com", age: 29, city: "New York", registeredAt: new Date("2023-03-05") },
  { _id: 5, name: "Eve Brown", email: "eve@example.com", age: 31, city: "Seattle", registeredAt: new Date("2023-02-28") }
])

// Products collection
db.products.insertMany([
  { _id: 101, name: "Laptop Pro", category: "Electronics", price: 1299, brand: "TechCorp", inStock: 25 },
  { _id: 102, name: "Wireless Mouse", category: "Electronics", price: 29, brand: "TechCorp", inStock: 100 },
  { _id: 103, name: "Office Chair", category: "Furniture", price: 199, brand: "ComfortSeating", inStock: 15 },
  { _id: 104, name: "Coffee Maker", category: "Appliances", price: 89, brand: "BrewMaster", inStock: 30 },
  { _id: 105, name: "Desk Lamp", category: "Furniture", price: 45, brand: "LightCo", inStock: 50 }
])

// Orders collection
db.orders.insertMany([
  { 
    _id: 1001, 
    userId: 1, 
    orderDate: new Date("2023-06-15"), 
    status: "completed",
    items: [
      { productId: 101, quantity: 1, price: 1299 },
      { productId: 102, quantity: 2, price: 29 }
    ],
    total: 1357,
    shippingAddress: { city: "New York", state: "NY" }
  },
  { 
    _id: 1002, 
    userId: 2, 
    orderDate: new Date("2023-06-20"), 
    status: "completed",
    items: [
      { productId: 103, quantity: 1, price: 199 },
      { productId: 105, quantity: 1, price: 45 }
    ],
    total: 244,
    shippingAddress: { city: "Los Angeles", state: "CA" }
  },
  { 
    _id: 1003, 
    userId: 1, 
    orderDate: new Date("2023-07-01"), 
    status: "pending",
    items: [
      { productId: 104, quantity: 1, price: 89 }
    ],
    total: 89,
    shippingAddress: { city: "New York", state: "NY" }
  },
  { 
    _id: 1004, 
    userId: 3, 
    orderDate: new Date("2023-07-10"), 
    status: "completed",
    items: [
      { productId: 101, quantity: 1, price: 1299 },
      { productId: 102, quantity: 1, price: 29 },
      { productId: 105, quantity: 2, price: 45 }
    ],
    total: 1418,
    shippingAddress: { city: "Chicago", state: "IL" }
  },
  { 
    _id: 1005, 
    userId: 4, 
    orderDate: new Date("2023-07-15"), 
    status: "cancelled",
    items: [
      { productId: 103, quantity: 2, price: 199 }
    ],
    total: 398,
    shippingAddress: { city: "New York", state: "NY" }
  }
])