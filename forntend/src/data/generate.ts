import type {
  Category,
  Dataset,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Product,
  Review,
  User,
  UserRole,
  UserStatus,
} from "./types";

/** Deterministic PRNG so the demo dataset is identical on server and client. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260809);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const FIRST = [
  "Ali", "Ahmed", "Sara", "Hassan", "Ayesha", "Bilal", "Fatima", "Usman", "Zainab", "Hamza",
  "Maryam", "Omar", "Hira", "Saad", "Noor", "Imran", "Rabia", "Faisal", "Amna", "Tariq",
  "Sana", "Kamran", "Iqra", "Danish", "Mehwish", "Adeel", "Laiba", "Shahid", "Kiran", "Waqas",
];
const LAST = [
  "Butt", "Khan", "Ahmed", "Malik", "Sheikh", "Raza", "Iqbal", "Hussain", "Farooq", "Siddiqui",
  "Chaudhry", "Qureshi", "Javed", "Nawaz", "Rashid", "Aslam",
];

const CATEGORY_SEED: Array<{ name: string; description: string }> = [
  { name: "Electronics", description: "Phones, laptops, audio gear and everyday tech accessories." },
  { name: "Clothing", description: "Men's and women's apparel across all seasons." },
  { name: "Home & Kitchen", description: "Cookware, small appliances and home essentials." },
  { name: "Books", description: "Fiction, non-fiction, academic titles and stationery." },
  { name: "Sports & Outdoors", description: "Fitness equipment, sportswear and outdoor gear." },
  { name: "Beauty & Personal Care", description: "Skincare, haircare and grooming products." },
  { name: "Toys & Games", description: "Board games, puzzles and toys for all ages." },
  { name: "Footwear", description: "Sneakers, formal shoes, sandals and boots." },
  { name: "Furniture", description: "Chairs, desks, storage and living room furniture." },
  { name: "Groceries", description: "Pantry staples, beverages and packaged food." },
];

const PRODUCT_WORDS: Record<string, string[]> = {
  Electronics: ["Wireless Mouse", "Mechanical Keyboard", "Bluetooth Speaker", "Noise Cancelling Headphones", "USB-C Hub", "1080p Webcam", "Power Bank", "Smart Watch", "Gaming Headset", "LED Monitor"],
  Clothing: ["Cotton T-Shirt", "Denim Jacket", "Linen Shirt", "Hoodie", "Chino Trousers", "Summer Dress", "Wool Sweater", "Track Suit", "Kurta", "Rain Coat"],
  "Home & Kitchen": ["Non-stick Pan", "Electric Kettle", "Knife Set", "Blender", "Air Fryer", "Dinner Set", "Storage Jars", "Coffee Maker", "Vacuum Cleaner", "Laundry Basket"],
  Books: ["Data Structures Guide", "Modern SQL Handbook", "Mystery Novel", "Poetry Collection", "Business Strategy", "History Atlas", "Cookbook", "Sketch Notebook", "Exam Prep Set", "Children's Storybook"],
  "Sports & Outdoors": ["Yoga Mat", "Dumbbell Set", "Cricket Bat", "Football", "Skipping Rope", "Camping Tent", "Water Bottle", "Resistance Bands", "Cycling Helmet", "Badminton Racket"],
  "Beauty & Personal Care": ["Face Serum", "Shampoo", "Sunscreen SPF 50", "Hair Dryer", "Beard Trimmer", "Lip Balm Set", "Body Lotion", "Perfume", "Face Wash", "Nail Care Kit"],
  "Toys & Games": ["Building Blocks", "Puzzle 1000pc", "Remote Car", "Chess Set", "Ludo Board", "Plush Bear", "Science Kit", "Card Game", "Kite Set", "Toy Train"],
  Footwear: ["Running Shoes", "Leather Loafers", "Canvas Sneakers", "Sports Sandals", "Hiking Boots", "Slip-on Flats", "Formal Oxfords", "Flip Flops", "High Tops", "Work Boots"],
  Furniture: ["Office Chair", "Study Desk", "Bookshelf", "Coffee Table", "Bean Bag", "Shoe Rack", "Bed Side Table", "Wardrobe", "Dining Chair", "TV Console"],
  Groceries: ["Basmati Rice 5kg", "Olive Oil 1L", "Green Tea Pack", "Honey Jar", "Mixed Nuts", "Pasta Pack", "Coffee Beans", "Dark Chocolate", "Breakfast Cereal", "Spice Box"],
};

const ROLES: UserRole[] = ["User", "User", "User", "User", "Manager", "Admin"];
const STATUSES: UserStatus[] = ["Active", "Active", "Active", "Inactive"];
const ORDER_STATUSES: OrderStatus[] = ["Completed", "Completed", "Processing", "Pending", "Cancelled"];
const METHODS: PaymentMethod[] = ["Credit Card", "Debit Card", "Cash on Delivery", "Bank Transfer", "EasyPaisa"];
const COMMENTS = [
  "Great product, exactly as described.",
  "Very good quality for the price.",
  "Arrived quickly and well packed.",
  "Decent, but could be better.",
  "Works perfectly, would buy again.",
  "Not what I expected, average at best.",
  "Excellent value, highly recommended.",
  "Solid build quality and finish.",
];

function iso(daysAgo: number) {
  const base = Date.UTC(2026, 7, 9);
  return new Date(base - daysAgo * 86400000).toISOString().slice(0, 10);
}

function buildUsers(): User[] {
  const seen = new Set<string>();
  const users: User[] = [];
  for (let i = 1; i <= 100; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    let email = `${first}.${last}`.toLowerCase().replace(/\s/g, "");
    while (seen.has(email)) email = `${email}${i}`;
    seen.add(email);
    users.push({
      id: i,
      name: `${first} ${last}`,
      email: `${email}@email.com`,
      phone: `03${int(0, 4)}${int(1000000, 9999999)}`,
      role: i === 1 ? "Admin" : pick(ROLES),
      status: pick(STATUSES),
      createdAt: iso(int(30, 720)),
    });
  }
  return users;
}

function buildCategories(): Category[] {
  return CATEGORY_SEED.map((c, i) => ({ id: i + 1, ...c }));
}

function buildProducts(categories: Category[]): Product[] {
  const products: Product[] = [];
  for (let i = 1; i <= 200; i++) {
    const category = categories[(i - 1) % categories.length]!;
    const words = PRODUCT_WORDS[category.name]!;
    const base = words[(Math.floor((i - 1) / categories.length)) % words.length]!;
    const variantIndex = Math.floor((i - 1) / (categories.length * words.length));
    products.push({
      id: i,
      name: variantIndex > 0 ? `${base} (Gen ${variantIndex + 1})` : base,
      categoryId: category.id,
      price: Number((int(8, 900) + rand()).toFixed(2)),
      stock: rand() < 0.12 ? 0 : int(1, 240),
      description: `${base} from our ${category.name.toLowerCase()} range. ${category.description}`,
    });
  }
  return products;
}

function buildOrders(users: User[], products: Product[]): Order[] {
  const orders: Order[] = [];
  for (let i = 0; i < 500; i++) {
    const itemCount = int(1, 4);
    const items: OrderItem[] = [];
    const used = new Set<number>();
    for (let j = 0; j < itemCount; j++) {
      const product = pick(products);
      if (used.has(product.id)) continue;
      used.add(product.id);
      items.push({ productId: product.id, quantity: int(1, 5), unitPrice: product.price });
    }
    orders.push({
      id: 101 + i,
      userId: pick(users).id,
      date: iso(int(0, 364)),
      status: pick(ORDER_STATUSES),
      paymentMethod: pick(METHODS),
      items,
    });
  }
  return orders.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
}

function buildPayments(orders: Order[]): Payment[] {
  return orders.map((order, index) => {
    const amount = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    let status: PaymentStatus = "Paid";
    if (order.status === "Pending") status = "Pending";
    else if (order.status === "Cancelled") status = rand() < 0.5 ? "Refunded" : "Failed";
    else if (order.status === "Processing") status = rand() < 0.35 ? "Pending" : "Paid";
    return {
      id: index + 1,
      orderId: order.id,
      amount: Number(amount.toFixed(2)),
      method: order.paymentMethod,
      status,
      date: order.date,
    };
  });
}

function buildReviews(users: User[], products: Product[]): Review[] {
  const reviews: Review[] = [];
  for (let i = 1; i <= 300; i++) {
    reviews.push({
      id: i,
      productId: pick(products).id,
      userId: pick(users).id,
      rating: int(1, 5),
      comment: pick(COMMENTS),
      date: iso(int(0, 300)),
    });
  }
  return reviews;
}

export function createDataset(): Dataset {
  const users = buildUsers();
  const categories = buildCategories();
  const products = buildProducts(categories);
  const orders = buildOrders(users, products);
  const payments = buildPayments(orders);
  const reviews = buildReviews(users, products);
  return { users, categories, products, orders, payments, reviews };
}

export const initialDataset: Dataset = createDataset();
