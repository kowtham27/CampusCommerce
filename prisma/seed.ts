import { PrismaClient, Condition, OrderStatus, OfferStatus, NotificationType, ReportReason } from "@prisma/client";
import bcrypt from "bcryptjs";
import { resolveProductImage, avatarForIndex } from "../src/lib/productImages";

const prisma = new PrismaClient();

const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? "university.edu";
const DEMO_PASSWORD = "CampusDemo123!";

const CATEGORIES = [
  { name: "Books", slug: "books", icon: "BookOpen" },
  { name: "Electronics", slug: "electronics", icon: "Laptop" },
  { name: "Hostel", slug: "hostel", icon: "Home" },
  { name: "Fashion", slug: "fashion", icon: "Shirt" },
  { name: "Gaming", slug: "gaming", icon: "Gamepad2" },
  { name: "Sports", slug: "sports", icon: "Dumbbell" },
  { name: "Academic", slug: "academic", icon: "GraduationCap" },
  { name: "Accessories", slug: "accessories", icon: "Watch" },
  { name: "Others", slug: "others", icon: "Package" },
];

const LOCATIONS = [
  { name: "Hostel Block A", type: "Hostel" },
  { name: "Hostel Block B", type: "Hostel" },
  { name: "Hostel Block C", type: "Hostel" },
  { name: "Main Academic Block", type: "Academic" },
  { name: "Engineering Block", type: "Academic" },
  { name: "Central Library", type: "Library" },
  { name: "Cafeteria", type: "Cafeteria" },
  { name: "Sports Complex", type: "Other" },
];

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Krishna", "Ishaan",
  "Rohan", "Kabir", "Ananya", "Diya", "Priya", "Ira", "Anika", "Myra", "Sara",
  "Kavya", "Aisha", "Meera", "Rahul", "Rajat", "Nikhil", "Karan", "Yash",
  "Sanya", "Riya", "Tanvi", "Neha", "Pooja",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Kumar", "Singh", "Reddy", "Iyer", "Nair", "Rao",
  "Mehta", "Joshi", "Kapoor", "Malhotra", "Chatterjee", "Bose", "Pillai",
  "Agarwal", "Bhat", "Menon", "Desai", "Chauhan", "Saxena", "Trivedi", "Pandey",
  "Yadav", "Ghosh", "Dutta", "Nayar", "Rana", "Sinha",
];
const DEPARTMENTS = ["CSE", "ECE", "Mechanical", "Civil", "IT", "EEE"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

type ProductSeed = {
  title: string;
  categorySlug: string;
  description: string;
  originalPrice: number;
  price: number;
  condition: Condition;
  brand?: string;
  ageMonths: number;
  tags?: string[];
  isRentable?: boolean;
  rentDaily?: number;
  rentWeekly?: number;
  rentMonthly?: number;
  rentDeposit?: number;
  isExchangeable?: boolean;
  exchangeWants?: string[];
};

const PRODUCTS: ProductSeed[] = [
  { title: "Engineering Mathematics — Vol 1", categorySlug: "books", description: "Covers calculus, linear algebra and differential equations. Minor highlighting in first 2 chapters, otherwise clean.", originalPrice: 550, price: 350, condition: "GOOD", ageMonths: 10, tags: ["engineering mathematics", "math", "semester 1"], isExchangeable: true, exchangeWants: ["Engineering Drawing kit", "Scientific calculator"] },
  { title: "Data Structures & Algorithms in C++", categorySlug: "books", description: "Standard DSA textbook used in the 3rd semester CSE curriculum. No markings.", originalPrice: 650, price: 450, condition: "LIKE_NEW", ageMonths: 6, tags: ["dsa", "cse", "algorithms"] },
  { title: "Digital Electronics Fundamentals", categorySlug: "books", description: "Covers combinational and sequential logic. Good for ECE 2nd year.", originalPrice: 480, price: 300, condition: "GOOD", ageMonths: 14 },
  { title: "Engineering Thermodynamics", categorySlug: "books", description: "Mechanical engineering core text, some solved examples annotated in pencil.", originalPrice: 520, price: 380, condition: "GOOD", ageMonths: 12 },
  { title: "Organic Chemistry Essentials", categorySlug: "books", description: "First-year chemistry text, barely used.", originalPrice: 420, price: 320, condition: "LIKE_NEW", ageMonths: 8 },
  { title: "Database Management Systems", categorySlug: "books", description: "Covers SQL, normalization, transactions. Used for one semester.", originalPrice: 560, price: 400, condition: "GOOD", ageMonths: 9, isExchangeable: true, exchangeWants: ["Computer Networks textbook"] },
  { title: "Computer Networks — 5th Edition", categorySlug: "books", description: "Clean copy, no highlighting.", originalPrice: 600, price: 420, condition: "LIKE_NEW", ageMonths: 5 },
  { title: "Object-Oriented Programming with Java", categorySlug: "books", description: "Well-maintained, comes with a few handwritten notes.", originalPrice: 500, price: 340, condition: "GOOD", ageMonths: 11 },

  { title: "MacBook Air M2", categorySlug: "electronics", description: "13-inch, 8GB/256GB, Midnight color. Battery health 91%. Selling as I'm upgrading.", originalPrice: 99900, price: 52000, condition: "LIKE_NEW", brand: "Apple", ageMonths: 14, tags: ["laptop", "macbook", "apple"] },
  { title: "Casio FX-991ES Plus", categorySlug: "electronics", description: "Scientific calculator, all functions working perfectly.", originalPrice: 1200, price: 650, condition: "LIKE_NEW", brand: "Casio", ageMonths: 7, tags: ["calculator", "scientific calculator"], isExchangeable: true, exchangeWants: ["Engineering Mathematics book"] },
  { title: "Logitech Gaming Mouse G102", categorySlug: "electronics", description: "RGB gaming mouse, works flawlessly, includes original box.", originalPrice: 1400, price: 900, condition: "GOOD", brand: "Logitech", ageMonths: 10, tags: ["mouse", "gaming"] },
  { title: "USB-C Multiport Hub", categorySlug: "electronics", description: "7-in-1 hub with HDMI, USB 3.0, SD card reader.", originalPrice: 1500, price: 700, condition: "GOOD", ageMonths: 9 },
  { title: "Adjustable Laptop Stand", categorySlug: "electronics", description: "Aluminium stand, foldable, barely used.", originalPrice: 900, price: 550, condition: "LIKE_NEW", ageMonths: 4 },
  { title: "Mechanical Keyboard — Blue Switches", categorySlug: "electronics", description: "Tactile blue switches, RGB backlight, great condition.", originalPrice: 3200, price: 1800, condition: "GOOD", ageMonths: 13 },
  { title: "Bluetooth Over-Ear Headphones", categorySlug: "electronics", description: "30hr battery life, minor scuff on the headband.", originalPrice: 2500, price: 1200, condition: "FAIR", ageMonths: 20 },
  { title: "Canon EOS 1500D DSLR", categorySlug: "electronics", description: "Great for fest photography and projects. Available to rent with lens kit.", originalPrice: 38000, price: 22000, condition: "GOOD", brand: "Canon", ageMonths: 18, isRentable: true, rentDaily: 500, rentWeekly: 2000, rentMonthly: 5000, rentDeposit: 3000, tags: ["camera", "dslr", "photography"] },
  { title: "Portable SSD 512GB", categorySlug: "electronics", description: "USB-C, transfer speeds up to 1050MB/s.", originalPrice: 4200, price: 2800, condition: "LIKE_NEW", brand: "SanDisk", ageMonths: 6 },
  { title: "Scientific Calculator — Casio FX-82", categorySlug: "electronics", description: "Basic scientific calculator, ideal for first-years.", originalPrice: 700, price: 400, condition: "GOOD", brand: "Casio", ageMonths: 16 },
  { title: "Wireless Earbuds", categorySlug: "electronics", description: "Noise isolation, charging case included, minor battery wear.", originalPrice: 2200, price: 1100, condition: "FAIR", ageMonths: 22 },
  { title: "27-inch Monitor", categorySlug: "electronics", description: "1080p, great for dual-monitor setups. Available for rent during project season.", originalPrice: 9500, price: 6000, condition: "GOOD", ageMonths: 15, isRentable: true, rentDaily: 150, rentWeekly: 700, rentMonthly: 1800, rentDeposit: 1500 },

  { title: "Study Chair — Ergonomic", categorySlug: "hostel", description: "Comfortable padded chair, no wobble.", originalPrice: 2200, price: 700, condition: "GOOD", ageMonths: 24 },
  { title: "LED Study Table Lamp", categorySlug: "hostel", description: "Adjustable brightness, USB rechargeable.", originalPrice: 700, price: 350, condition: "GOOD", ageMonths: 12 },
  { title: "Bucket & Mug Set", categorySlug: "hostel", description: "Unused, bought extra by mistake.", originalPrice: 250, price: 150, condition: "BRAND_NEW", ageMonths: 1 },
  { title: "Electric Iron Box", categorySlug: "hostel", description: "Works well, auto shut-off feature intact.", originalPrice: 900, price: 500, condition: "GOOD", ageMonths: 18 },
  { title: "Single Bedsheet & Pillow Set", categorySlug: "hostel", description: "Washed and ready, cotton fabric.", originalPrice: 700, price: 450, condition: "LIKE_NEW", ageMonths: 5 },
  { title: "Mini Fridge — 45L", categorySlug: "hostel", description: "Perfect for a hostel room. Available to rent per semester.", originalPrice: 6500, price: 4200, condition: "GOOD", ageMonths: 20, isRentable: true, rentDaily: 100, rentWeekly: 500, rentMonthly: 1500, rentDeposit: 2000 },
  { title: "Study Table — Foldable", categorySlug: "hostel", description: "Space-saving foldable table, sturdy build.", originalPrice: 1800, price: 1100, condition: "GOOD", ageMonths: 16 },
  { title: "Clothes Drying Stand", categorySlug: "hostel", description: "Steel stand, foldable, rust-free.", originalPrice: 900, price: 500, condition: "LIKE_NEW", ageMonths: 7 },

  { title: "Denim Jacket — Size M", categorySlug: "fashion", description: "Barely worn, no stains or tears.", originalPrice: 1800, price: 600, condition: "LIKE_NEW", ageMonths: 6 },
  { title: "Formal Shirt Set (3 pcs)", categorySlug: "fashion", description: "Ideal for placements and interviews.", originalPrice: 1500, price: 500, condition: "GOOD", ageMonths: 9 },
  { title: "Running Sneakers — Size 9", categorySlug: "fashion", description: "Lightly used, great grip still intact.", originalPrice: 2800, price: 1200, condition: "GOOD", ageMonths: 11 },
  { title: "Casual Backpack", categorySlug: "fashion", description: "Water-resistant, laptop compartment.", originalPrice: 1600, price: 900, condition: "GOOD", ageMonths: 10 },
  { title: "Hoodie — Size L", categorySlug: "fashion", description: "Warm and comfortable, washed once.", originalPrice: 1400, price: 650, condition: "LIKE_NEW", ageMonths: 4 },

  { title: "PS4 Wireless Controller", categorySlug: "gaming", description: "Both analog sticks in perfect condition.", originalPrice: 4500, price: 1500, condition: "GOOD", ageMonths: 14 },
  { title: "Gaming Headset with Mic", categorySlug: "gaming", description: "7.1 surround sound, comfortable ear cups.", originalPrice: 2200, price: 1100, condition: "GOOD", ageMonths: 12 },
  { title: "Wooden Chess Set", categorySlug: "gaming", description: "Complete set, one pawn slightly chipped.", originalPrice: 500, price: 250, condition: "FAIR", ageMonths: 30 },
  { title: "Catan Board Game", categorySlug: "gaming", description: "All pieces included, played a handful of times.", originalPrice: 2200, price: 1200, condition: "LIKE_NEW", ageMonths: 8 },
  { title: "Nintendo Switch Lite", categorySlug: "gaming", description: "Comes with 2 game cartridges. Available to rent for a week.", originalPrice: 19000, price: 13500, condition: "GOOD", ageMonths: 16, isRentable: true, rentDaily: 300, rentWeekly: 1500, rentMonthly: 4500, rentDeposit: 3000 },

  { title: "Badminton Racket Pair", categorySlug: "sports", description: "Yonex rackets with 2 shuttles, cover included.", originalPrice: 2400, price: 1000, condition: "GOOD", brand: "Yonex", ageMonths: 10 },
  { title: "Cricket Kit — Full Set", categorySlug: "sports", description: "Bat, pads, gloves and helmet. Great for hostel tournaments.", originalPrice: 4500, price: 2200, condition: "GOOD", ageMonths: 18, isRentable: true, rentDaily: 100, rentWeekly: 450 },
  { title: "Yoga Mat — 6mm", categorySlug: "sports", description: "Non-slip, lightly used.", originalPrice: 700, price: 300, condition: "GOOD", ageMonths: 9 },
  { title: "Football — Size 5", categorySlug: "sports", description: "Good bounce, used for hostel matches.", originalPrice: 900, price: 450, condition: "GOOD", ageMonths: 12 },
  { title: "Adjustable Dumbbell Set", categorySlug: "sports", description: "5-15kg adjustable, minor rust on the bar.", originalPrice: 3500, price: 1800, condition: "FAIR", ageMonths: 22 },

  { title: "Engineering Drawing Kit", categorySlug: "academic", description: "Complete kit with drafter, scales and compass. Barely used.", originalPrice: 900, price: 450, condition: "LIKE_NEW", ageMonths: 6, isExchangeable: true, exchangeWants: ["Scientific calculator", "Engineering Mathematics book"] },
  { title: "Lab Coat — Size L", categorySlug: "academic", description: "Washed, no stains, used for one semester of labs.", originalPrice: 500, price: 300, condition: "GOOD", ageMonths: 8 },
  { title: "Drafter / Mini Drafter", categorySlug: "academic", description: "Smooth mechanism, ideal for engineering drawing.", originalPrice: 1100, price: 550, condition: "GOOD", ageMonths: 10 },
  { title: "Graph Notebooks (Pack of 5)", categorySlug: "academic", description: "3 unused, 2 partially used.", originalPrice: 250, price: 120, condition: "FAIR", ageMonths: 5 },

  { title: "Analog Wrist Watch", categorySlug: "accessories", description: "Leather strap, minor wear on the buckle.", originalPrice: 2200, price: 800, condition: "GOOD", ageMonths: 14 },
  { title: "Polarized Sunglasses", categorySlug: "accessories", description: "UV protected, comes with case.", originalPrice: 1200, price: 450, condition: "LIKE_NEW", ageMonths: 6 },
  { title: "Leather Wallet", categorySlug: "accessories", description: "Genuine leather, gently used.", originalPrice: 900, price: 350, condition: "GOOD", ageMonths: 9 },
  { title: "Baseball Cap", categorySlug: "accessories", description: "Adjustable strap, worn a handful of times.", originalPrice: 500, price: 200, condition: "GOOD", ageMonths: 7 },

  { title: "Acoustic Guitar", categorySlug: "others", description: "Great for beginners, comes with a spare string set. Available to rent for events.", originalPrice: 6500, price: 3500, condition: "GOOD", ageMonths: 20, isRentable: true, rentDaily: 200, rentWeekly: 900, rentMonthly: 2800, rentDeposit: 2000 },
  { title: "Single-Speed Bicycle", categorySlug: "others", description: "Great for getting around campus quickly. Rentable by the week.", originalPrice: 7000, price: 2500, condition: "FAIR", ageMonths: 30, isRentable: true, rentDaily: 60, rentWeekly: 300, rentMonthly: 900, rentDeposit: 1000 },
  { title: "Compact Printer", categorySlug: "others", description: "Wireless, works well, low on ink.", originalPrice: 5500, price: 2200, condition: "FAIR", ageMonths: 24 },
  { title: "Wooden Desk Organizer", categorySlug: "others", description: "Handmade, holds stationery and books neatly.", originalPrice: 400, price: 200, condition: "GOOD", ageMonths: 11 },
];

async function main() {
  console.log("Seeding Campus Commerce...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const categories = await Promise.all(
    CATEGORIES.map((c) =>
      prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
    )
  );
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const locations = await Promise.all(
    LOCATIONS.map((l) =>
      prisma.campusLocation.upsert({
        where: { name: l.name },
        update: {},
        create: l,
      })
    )
  );

  await prisma.user.upsert({
    where: { email: `admin@${ALLOWED_EMAIL_DOMAIN}` },
    update: {},
    create: {
      fullName: "Campus Admin",
      email: `admin@${ALLOWED_EMAIL_DOMAIN}`,
      passwordHash,
      role: "ADMIN",
      department: "Administration",
      year: "Staff",
      emailVerified: true,
      onboarded: true,
      trustScore: 100,
      responseRate: 100,
    },
  });

  const demoStudent = await prisma.user.upsert({
    where: { email: `student@${ALLOWED_EMAIL_DOMAIN}` },
    update: {},
    create: {
      fullName: "Alex Kumar",
      email: `student@${ALLOWED_EMAIL_DOMAIN}`,
      passwordHash,
      department: "CSE",
      year: "3rd Year",
      hostelBlock: "Hostel Block A",
      phone: "9876543210",
      emailVerified: true,
      onboarded: true,
      interests: ["Books", "Electronics"],
      trustScore: 88,
      responseRate: 92,
    },
  });

  const otherUsers = [];
  for (let i = 0; i < 28; i++) {
    const fullName = `${pick(FIRST_NAMES, i)} ${pick(LAST_NAMES, i + 3)}`;
    const email = `${fullName.toLowerCase().replace(/\s+/g, ".")}${i}@${ALLOWED_EMAIL_DOMAIN}`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        fullName,
        email,
        passwordHash,
        department: pick(DEPARTMENTS, i),
        year: pick(YEARS, i),
        hostelBlock: pick(LOCATIONS, i).name,
        emailVerified: true,
        onboarded: true,
        interests: [pick(CATEGORIES, i).name, pick(CATEGORIES, i + 2).name],
        trustScore: 55 + ((i * 7) % 40),
        responseRate: 40 + ((i * 11) % 60),
        avatarUrl: avatarForIndex(i),
      },
    });
    otherUsers.push(user);
  }

  const allUsers = [demoStudent, ...otherUsers];

  const createdProducts = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const seller = pick(allUsers, i);
    const category = categoryBySlug[p.categorySlug];
    const location = pick(locations, i);
    const product = await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        categoryId: category.id,
        sellerId: seller.id,
        condition: p.condition,
        originalPrice: p.originalPrice,
        price: p.price,
        isSellable: true,
        isRentable: !!p.isRentable,
        rentDaily: p.rentDaily,
        rentWeekly: p.rentWeekly,
        rentMonthly: p.rentMonthly,
        rentDeposit: p.rentDeposit,
        isExchangeable: !!p.isExchangeable,
        exchangeWants: p.exchangeWants ?? [],
        tags: p.tags ?? [],
        brand: p.brand,
        ageMonths: p.ageMonths,
        locationId: location.id,
        viewCount: (i * 13) % 240,
        distanceMeters: 80 + ((i * 47) % 900),
        images: {
          create: [0, 1].map((n) => ({
            url: resolveProductImage(p.title, p.categorySlug),
            position: n,
          })),
        },
      },
    });
    createdProducts.push(product);
  }

  // Wishlist entries
  for (let i = 0; i < 25; i++) {
    const user = pick(allUsers, i);
    const product = pick(createdProducts, i * 3 + 1);
    if (product.sellerId === user.id) continue;
    await prisma.wishlist.upsert({
      where: { userId_productId: { userId: user.id, productId: product.id } },
      update: {},
      create: { userId: user.id, productId: product.id },
    });
  }

  // Orders
  const orderStatuses: OrderStatus[] = ["PENDING", "ACCEPTED", "READY_FOR_PICKUP", "COMPLETED", "COMPLETED", "CANCELLED"];
  for (let i = 0; i < 15; i++) {
    const product = pick(createdProducts, i * 5 + 2);
    const buyer = pick(allUsers, i * 2 + 1);
    if (buyer.id === product.sellerId) continue;
    await prisma.order.create({
      data: {
        code: `CC${1000 + i}`,
        productId: product.id,
        buyerId: buyer.id,
        sellerId: product.sellerId,
        price: product.price,
        status: pick(orderStatuses, i),
      },
    });
  }

  // Offers
  const offerStatuses: OfferStatus[] = ["PENDING", "ACCEPTED", "REJECTED", "COUNTERED"];
  for (let i = 0; i < 10; i++) {
    const product = pick(createdProducts, i * 4 + 3);
    const buyer = pick(allUsers, i * 3 + 2);
    if (buyer.id === product.sellerId) continue;
    await prisma.offer.create({
      data: {
        productId: product.id,
        buyerId: buyer.id,
        sellerId: product.sellerId,
        amount: Math.round(product.price * 0.85),
        message: "I can pick it up today if that works for you.",
        status: pick(offerStatuses, i),
      },
    });
  }

  // Reviews
  for (let i = 0; i < 20; i++) {
    const author = pick(allUsers, i * 2);
    const subject = pick(allUsers, i * 2 + 5);
    if (author.id === subject.id) continue;
    const rating = 3 + ((i * 3) % 3);
    await prisma.review.create({
      data: {
        authorId: author.id,
        subjectId: subject.id,
        overallRating: rating,
        conditionRating: rating,
        communicationRating: Math.min(5, rating + 1),
        transactionRating: rating,
        comment: [
          "Smooth transaction, item as described!",
          "Great seller, quick to respond.",
          "Product was in the condition promised.",
          "Would definitely buy from again.",
          "Easy pickup at the library, no issues.",
        ][i % 5],
      },
    });
  }

  // Notifications for the demo student
  const notifTemplates: { type: NotificationType; title: string; body: string }[] = [
    { type: "OFFER_ACCEPTED", title: "Your offer was accepted", body: "The seller accepted your offer on Engineering Mathematics." },
    { type: "OFFER_RECEIVED", title: "New offer received", body: "Someone made an offer on your MacBook Air listing." },
    { type: "LISTING_VIEWS", title: "Your listing is popular", body: "Your listing received 10 new views today." },
    { type: "EXCHANGE_ACCEPTED", title: "Exchange request accepted", body: "Your exchange request for the calculator was accepted." },
    { type: "NEW_MESSAGE", title: "New message", body: "You have a new message about DSA Book." },
    { type: "RENTAL_APPROVED", title: "Rental approved", body: "Your rental request for the DSLR camera was approved." },
    { type: "ORDER_UPDATE", title: "Order ready for pickup", body: "Order #CC1002 is ready for pickup at the library." },
    { type: "REVIEW_RECEIVED", title: "You received a new review", body: "Someone left you a 5-star review." },
    { type: "SYSTEM", title: "Welcome to Campus Commerce", body: "Complete your profile to get better recommendations." },
    { type: "OFFER_COUNTERED", title: "Offer countered", body: "The seller countered your offer with a new price." },
  ];
  for (let i = 0; i < notifTemplates.length; i++) {
    const t = notifTemplates[i];
    await prisma.notification.create({
      data: {
        userId: demoStudent.id,
        type: t.type,
        title: t.title,
        body: t.body,
        read: i % 3 === 0,
      },
    });
  }

  // A couple of sample reports for the admin demo
  for (let i = 0; i < 3; i++) {
    const product = pick(createdProducts, i * 9 + 4);
    const reporter = pick(allUsers, i * 6 + 1);
    await prisma.report.create({
      data: {
        productId: product.id,
        reportedById: reporter.id,
        reason: (["SUSPICIOUS_SELLER", "WRONG_DESCRIPTION", "FAKE_PRODUCT"] as ReportReason[])[i],
        details: "Flagged for review by a student.",
      },
    });
  }

  console.log(`Seeded: ${allUsers.length} users, ${createdProducts.length} products, ${categories.length} categories.`);
  console.log(`Demo student: student@${ALLOWED_EMAIL_DOMAIN} / ${DEMO_PASSWORD}`);
  console.log(`Demo admin:   admin@${ALLOWED_EMAIL_DOMAIN} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
