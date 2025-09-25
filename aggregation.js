/ ================================;
// AGGREGATION PIPELINE EXAMPLES
// ================================

// 1. BASIC $match and $group
// Find total sales by status
db.orders.aggregate([
  { $match: { status: { $in: ["completed", "pending"] } } },
  {
    $group: {
      _id: "$status",
      totalSales: { $sum: "$total" },
      orderCount: { $sum: 1 }
    }
  }
]);

// 2. $project - reshape documents
// Get user info with computed fields
db.users.aggregate([
  {
    $project: {
      name: 1,
      email: 1,
      ageGroup: {
        $switch: {
          branches: [
            { case: { $lt: ["$age", 30] }, then: "Young" },
            { case: { $lt: ["$age", 40] }, then: "Middle" },
          ],
          default: "Senior"
        }
      },
      accountAge: {
        $divide: [
          { $subtract: [new Date(), "$registeredAt"] },
          1000 * 60 * 60 * 24 // Convert to days
        ]
      }
    }
  }
]);

// 3. $unwind - deconstruct arrays
// Get individual order items
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  {
    $project: {
      orderId: "$_id",
      userId: 1,
      productId: "$items.productId",
      quantity: "$items.quantity",
      itemTotal: { $multiply: ["$items.quantity", "$items.price"] }
    }
  }
]);

// 4. $lookup - join collections (LEFT JOIN equivalent)
// Get orders with user details
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" }, // Convert array to object
  {
    $project: {
      _id: 1,
      total: 1,
      status: 1,
      userName: "$user.name",
      userEmail: "$user.email",
      userCity: "$user.city"
    }
  }
]);

// 5. Complex pipeline - Sales report by product category
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: "$product.category",
      totalRevenue: {
        $sum: { $multiply: ["$items.quantity", "$items.price"] }
      },
      totalUnits: { $sum: "$items.quantity" },
      avgOrderValue: {
        $avg: { $multiply: ["$items.quantity", "$items.price"] }
      },
      uniqueProducts: { $addToSet: "$product.name" }
    }
  },
  {
    $project: {
      category: "$_id",
      totalRevenue: 1,
      totalUnits: 1,
      avgOrderValue: { $round: ["$avgOrderValue", 2] },
      productCount: { $size: "$uniqueProducts" },
      _id: 0
    }
  },
  { $sort: { totalRevenue: -1 } }
]);

// 6. $facet - multiple pipelines in parallel
// Get comprehensive order analytics
db.orders.aggregate([
  {
    $facet: {
      "statusBreakdown": [
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ],
      "monthlyTrends": [
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
            orders: { $sum: 1 },
            revenue: { $sum: "$total" }
          }
        },
        { $sort: { _id: 1 } }
      ],
      "topUsers": [
        { $group: { _id: "$userId", totalSpent: { $sum: "$total" } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 3 }
      ]
    }
  }
]);

// 7. $addFields vs $project
// $addFields keeps all fields, adds new ones
db.products.aggregate([
  {
    $addFields: {
      priceCategory: {
        $cond: {
          if: { $gte: ["$price", 100] },
          then: "Premium",
          else: "Budget"
        }
      },
      stockStatus: {
        $cond: {
          if: { $gt: ["$inStock", 20] },
          then: "Well Stocked",
          else: "Low Stock"
        }
      }
    }
  }
]);

// 8. $sort and $limit with $skip (pagination)
// Get top 2 most expensive products, skip first result
db.products.aggregate([
  { $sort: { price: -1 } },
  { $skip: 1 },
  { $limit: 2 },
  { $project: { name: 1, price: 1, category: 1 } }
]);

// 9. Complex aggregation - Customer lifetime value
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$userId",
      totalSpent: { $sum: "$total" },
      orderCount: { $sum: 1 },
      firstOrder: { $min: "$orderDate" },
      lastOrder: { $max: "$orderDate" }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" },
  {
    $addFields: {
      avgOrderValue: { $divide: ["$totalSpent", "$orderCount"] },
      customerLifespanDays: {
        $divide: [
          { $subtract: ["$lastOrder", "$firstOrder"] },
          1000 * 60 * 60 * 24
        ]
      }
    }
  },
  {
    $project: {
      customerName: "$user.name",
      customerCity: "$user.city",
      totalSpent: 1,
      orderCount: 1,
      avgOrderValue: { $round: ["$avgOrderValue", 2] },
      customerLifespanDays: { $round: ["$customerLifespanDays", 0] },
      _id: 0
    }
  },
  { $sort: { totalSpent: -1 } }
]);

// 10. $bucket - group by ranges
// Group products by price ranges
db.products.aggregate([
  {
    $bucket: {
      groupBy: "$price",
      boundaries: [0, 50, 100, 500, 2000],
      default: "Other",
      output: {
        count: { $sum: 1 },
        products: { $push: "$name" },
        avgPrice: { $avg: "$price" }
      }
    }
  }
]);

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
