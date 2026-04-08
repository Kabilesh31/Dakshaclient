export const dummyOrders = [
  {
    _id: "ORD001",
    customerName: "Rajesh Kumar",
    createdAt: "2026-04-01",

    siteName: "Sunrise Villa Project",
    siteAddress: "12, Lake View Road, Anna Nagar, Chennai",
    location: "Chennai, Tamil Nadu",

    orderedBy: "Rajesh Kumar",

    totalAmt: 250000,
    estimatedCost: 270000,

    orderStatus: "Work in progress",

    startDate: "2026-04-01",
    targetDate: "2026-04-20",

    staffDetails: {
      name: "Suresh Kumar",
      type: "Site Engineer",
      mobile: "9876543210",
    },

    staffList: [
      { name: "Suresh Kumar", role: "Site Engineer", mobile: "9876543210" },
      { name: "Ravi", role: "Mason", mobile: "9123456780" },
      { name: "Karthik", role: "Helper", mobile: "9988776655" },
      { name: "Vijay", role: "Electrician", mobile: "9090909090" },
      { name: "Arun", role: "Painter", mobile: "9012345678" },
    ],

    supervisor: {
      name: "Mani",
      mobile: "9999999999",
    },

    orderedProducts: [
      { productCode: "CEM001", productName: "Cement", qty: 100, value: 400 },
      { productCode: "SAN001", productName: "Sand", qty: 50, value: 150 },
      { productCode: "STE001", productName: "Steel Rod", qty: 30, value: 800 },
    ],

    progress: 65,
    discount: 5000,
    tax: 2000,

    notes: "Foundation completed. Column work in progress.",
  },

  {
    _id: "ORD002",
    customerName: "Prakash R",
    createdAt: "2026-04-05",

    siteName: "Green Field Apartment",
    siteAddress: "45, Avinashi Road, Coimbatore",
    location: "Coimbatore, Tamil Nadu",

    orderedBy: "Prakash R",

    totalAmt: 180000,
    estimatedCost: 200000,

    orderStatus: "Yet to Start",

    startDate: "2026-04-05",
    targetDate: "2026-04-25",

    staffDetails: {
      name: "Arun",
      type: "Supervisor",
      mobile: "9000000001",
    },

    staffList: [
      { name: "Arun", role: "Supervisor", mobile: "9000000001" },
      { name: "Bala", role: "Mason", mobile: "9000000002" },
    ],

    supervisor: {
      name: "Murugan",
      mobile: "9111111111",
    },

    orderedProducts: [
      { productCode: "BRK001", productName: "Bricks", qty: 2000, value: 8 },
      { productCode: "CEM001", productName: "Cement", qty: 80, value: 420 },
    ],

    progress: 10,
    discount: 0,
    tax: 0,

    notes: "Project scheduled to start next week.",
  },
];