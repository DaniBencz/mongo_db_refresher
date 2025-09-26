// ================================
// INTERVIEW-STYLE CHALLENGES
// ================================

// Challenge 1: Find users who have never placed an order
db.users.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders"
    }
  },
  { $match: { orders: { $size: 0 } } },
  { $project: { name: 1, email: 1, city: 1 } }
]);

// Challenge 2: Most popular product by quantity sold
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      totalQuantity: { $sum: "$items.quantity" },
      totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $project: {
      productName: "$product.name",
      category: "$product.category",
      totalQuantity: 1,
      totalRevenue: 1,
      _id: 0
    }
  },
  { $sort: { totalQuantity: -1 } },
  { $limit: 1 }
]);

// Challenge 3: Average order value by city
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$shippingAddress.city",
      avgOrderValue: { $avg: "$total" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $project: {
      city: "$_id",
      avgOrderValue: { $round: ["$avgOrderValue", 2] },
      orderCount: 1,
      _id: 0
    }
  },
  { $sort: { avgOrderValue: -1 } }
]);
