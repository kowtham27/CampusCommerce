/**
 * Curated, real, topically-relevant photos (Unsplash CDN) used in place of
 * random placeholder images — for seeded demo listings and as a fallback for
 * new listings when real photo upload (Supabase Storage) isn't configured.
 */

export const PRODUCT_IMAGES: Record<string, string> = {
  // Books
  "book-engineering-math": "https://images.unsplash.com/photo-1660606422342-2ce59709bb14?w=640&h=480&fit=crop&q=80",
  "book-cs-dsa": "https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?w=640&h=480&fit=crop&q=80",
  "book-digital-electronics": "https://images.unsplash.com/photo-1553408226-42ecf81a214c?w=640&h=480&fit=crop&q=80",
  "book-thermodynamics": "https://images.unsplash.com/photo-1499447155021-4907f71b9ef5?w=640&h=480&fit=crop&q=80",
  "book-chemistry": "https://images.unsplash.com/photo-1759317700289-2f4be8f9b1db?w=640&h=480&fit=crop&q=80",
  "book-database-sql": "https://images.unsplash.com/photo-1499447155021-4907f71b9ef5?w=640&h=480&fit=crop&q=80",
  "book-networking": "https://images.unsplash.com/photo-1562408590-e32931084e23?w=640&h=480&fit=crop&q=80",
  "book-java": "https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?w=640&h=480&fit=crop&q=80",

  // Electronics
  "laptop": "https://images.unsplash.com/photo-1553587810-8345685e9c29?w=640&h=480&fit=crop&q=80",
  "calculator": "https://images.unsplash.com/photo-1757256137041-0aab889db199?w=640&h=480&fit=crop&q=80",
  "gaming-mouse": "https://images.unsplash.com/photo-1616296425622-4560a2ad83de?w=640&h=480&fit=crop&q=80",
  "usb-hub": "https://images.unsplash.com/photo-1750268375449-81b7edb348bf?w=640&h=480&fit=crop&q=80",
  "laptop-stand": "https://images.unsplash.com/photo-1652198144911-4f204ccf35e6?w=640&h=480&fit=crop&q=80",
  "mechanical-keyboard": "https://images.unsplash.com/photo-1548347663-f4f0925846e0?w=640&h=480&fit=crop&q=80",
  "headphones": "https://images.unsplash.com/photo-1737291937135-3a0fcb5e0c44?w=640&h=480&fit=crop&q=80",
  "dslr-camera": "https://images.unsplash.com/photo-1571689936008-083b32a9dcca?w=640&h=480&fit=crop&q=80",
  "portable-ssd": "https://images.unsplash.com/photo-1756142752397-9d2ace3ba0d1?w=640&h=480&fit=crop&q=80",
  "wireless-earbuds": "https://images.unsplash.com/photo-1572569979132-b4f10c9ec185?w=640&h=480&fit=crop&q=80",
  "monitor": "https://images.unsplash.com/photo-1601467075935-7e5c5c607074?w=640&h=480&fit=crop&q=80",

  // Hostel / dorm
  "study-chair": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=640&h=480&fit=crop&q=80",
  "desk-lamp": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=640&h=480&fit=crop&q=80",
  "bucket-mug": "https://images.unsplash.com/photo-1610725079793-6c7dfd7f2150?w=640&h=480&fit=crop&q=80",
  "iron": "https://images.unsplash.com/photo-1622979138084-c03ae28968ed?w=640&h=480&fit=crop&q=80",
  "bedsheet-pillow": "https://images.unsplash.com/photo-1601276174812-63280a55656e?w=640&h=480&fit=crop&q=80",
  "mini-fridge": "https://images.unsplash.com/photo-1540961403310-79825242906e?w=640&h=480&fit=crop&q=80",
  "study-table": "https://images.unsplash.com/photo-1769794371055-54436b54577e?w=640&h=480&fit=crop&q=80",
  "drying-rack": "https://images.unsplash.com/photo-1760727772969-cb5cd59c6f30?w=640&h=480&fit=crop&q=80",

  // Fashion
  "denim-jacket": "https://images.unsplash.com/photo-1675442141177-b99b70652416?w=640&h=480&fit=crop&q=80",
  "dress-shirt": "https://images.unsplash.com/photo-1603252110971-b8a57087be18?w=640&h=480&fit=crop&q=80",
  "sneakers": "https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?w=640&h=480&fit=crop&q=80",
  "backpack": "https://images.unsplash.com/photo-1505308144658-03c69861061a?w=640&h=480&fit=crop&q=80",
  "hoodie": "https://images.unsplash.com/photo-1656812205572-98e8e26ed8e2?w=640&h=480&fit=crop&q=80",

  // Gaming
  "ps4-controller": "https://images.unsplash.com/photo-1567027757540-7b572280fa22?w=640&h=480&fit=crop&q=80",
  "gaming-headset": "https://images.unsplash.com/photo-1560419398-c36ab8c174b0?w=640&h=480&fit=crop&q=80",
  "chess-set": "https://images.unsplash.com/photo-1529699263800-6030cf843dc1?w=640&h=480&fit=crop&q=80",
  "board-game": "https://images.unsplash.com/photo-1769288361254-abb4783a6070?w=640&h=480&fit=crop&q=80",
  "nintendo-switch": "https://images.unsplash.com/photo-1585857188849-f44983e4a509?w=640&h=480&fit=crop&q=80",

  // Sports
  "badminton-racket": "https://images.unsplash.com/photo-1564227050211-b6061acd4158?w=640&h=480&fit=crop&q=80",
  "cricket-bat": "https://images.unsplash.com/photo-1542185091-dee192e9df7a?w=640&h=480&fit=crop&q=80",
  "yoga-mat": "https://images.unsplash.com/photo-1671041191053-15dd8a7187c8?w=640&h=480&fit=crop&q=80",
  "football": "https://images.unsplash.com/photo-1726070740577-94d83143684b?w=640&h=480&fit=crop&q=80",
  "dumbbells": "https://images.unsplash.com/photo-1603077492340-e6e62b2a688b?w=640&h=480&fit=crop&q=80",

  // Academic
  "drafting-kit": "https://images.unsplash.com/photo-1764948620396-45f5b5fdd73e?w=640&h=480&fit=crop&q=80",
  "lab-coat": "https://images.unsplash.com/photo-1655252205460-4cddd84586bc?w=640&h=480&fit=crop&q=80",
  "mini-drafter": "https://images.unsplash.com/photo-1764948620396-45f5b5fdd73e?w=640&h=480&fit=crop&q=80",
  "graph-notebook": "https://images.unsplash.com/photo-1520970014086-2208d157c9e2?w=640&h=480&fit=crop&q=80",

  // Accessories
  "wrist-watch": "https://images.unsplash.com/photo-1543428390-8bc1a79ff735?w=640&h=480&fit=crop&q=80",
  "sunglasses": "https://images.unsplash.com/photo-1657472545027-1b62e720f41c?w=640&h=480&fit=crop&q=80",
  "wallet": "https://images.unsplash.com/photo-1579014134953-1580d7f123f3?w=640&h=480&fit=crop&q=80",
  "baseball-cap": "https://images.unsplash.com/photo-1691256676359-20e5c6d4bc92?w=640&h=480&fit=crop&q=80",

  // Others
  "guitar": "https://images.unsplash.com/photo-1589471861110-1144cd568519?w=640&h=480&fit=crop&q=80",
  "bicycle": "https://images.unsplash.com/photo-1689085383708-8d62ccea8035?w=640&h=480&fit=crop&q=80",
  "printer": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=640&h=480&fit=crop&q=80",
  "desk-organizer": "https://images.unsplash.com/photo-1496128959656-addf33ffc2d5?w=640&h=480&fit=crop&q=80",
};

export const AVATAR_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1758598305480-176fb2ee4d5c?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1745441888183-c217893cfe48?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1759346617240-b45ed956868e?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1758598497192-15ffa411c3de?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1678689022876-60cbc1681737?w=200&h=200&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544961585-de6f13aa4fa0?w=200&h=200&fit=crop&q=80",
];

// Exact title -> image key, for the fixed demo catalog in prisma/seed.ts
export const SEED_TITLE_KEYS: Record<string, string> = {
  "Engineering Mathematics — Vol 1": "book-engineering-math",
  "Data Structures & Algorithms in C++": "book-cs-dsa",
  "Digital Electronics Fundamentals": "book-digital-electronics",
  "Engineering Thermodynamics": "book-thermodynamics",
  "Organic Chemistry Essentials": "book-chemistry",
  "Database Management Systems": "book-database-sql",
  "Computer Networks — 5th Edition": "book-networking",
  "Object-Oriented Programming with Java": "book-java",

  "MacBook Air M2": "laptop",
  "Casio FX-991ES Plus": "calculator",
  "Logitech Gaming Mouse G102": "gaming-mouse",
  "USB-C Multiport Hub": "usb-hub",
  "Adjustable Laptop Stand": "laptop-stand",
  "Mechanical Keyboard — Blue Switches": "mechanical-keyboard",
  "Bluetooth Over-Ear Headphones": "headphones",
  "Canon EOS 1500D DSLR": "dslr-camera",
  "Portable SSD 512GB": "portable-ssd",
  "Scientific Calculator — Casio FX-82": "calculator",
  "Wireless Earbuds": "wireless-earbuds",
  "27-inch Monitor": "monitor",

  "Study Chair — Ergonomic": "study-chair",
  "LED Study Table Lamp": "desk-lamp",
  "Bucket & Mug Set": "bucket-mug",
  "Electric Iron Box": "iron",
  "Single Bedsheet & Pillow Set": "bedsheet-pillow",
  "Mini Fridge — 45L": "mini-fridge",
  "Study Table — Foldable": "study-table",
  "Clothes Drying Stand": "drying-rack",

  "Denim Jacket — Size M": "denim-jacket",
  "Formal Shirt Set (3 pcs)": "dress-shirt",
  "Running Sneakers — Size 9": "sneakers",
  "Casual Backpack": "backpack",
  "Hoodie — Size L": "hoodie",

  "PS4 Wireless Controller": "ps4-controller",
  "Gaming Headset with Mic": "gaming-headset",
  "Wooden Chess Set": "chess-set",
  "Catan Board Game": "board-game",
  "Nintendo Switch Lite": "nintendo-switch",

  "Badminton Racket Pair": "badminton-racket",
  "Cricket Kit — Full Set": "cricket-bat",
  "Yoga Mat — 6mm": "yoga-mat",
  "Football — Size 5": "football",
  "Adjustable Dumbbell Set": "dumbbells",

  "Engineering Drawing Kit": "drafting-kit",
  "Lab Coat — Size L": "lab-coat",
  "Drafter / Mini Drafter": "mini-drafter",
  "Graph Notebooks (Pack of 5)": "graph-notebook",

  "Analog Wrist Watch": "wrist-watch",
  "Polarized Sunglasses": "sunglasses",
  "Leather Wallet": "wallet",
  "Baseball Cap": "baseball-cap",

  "Acoustic Guitar": "guitar",
  "Single-Speed Bicycle": "bicycle",
  "Compact Printer": "printer",
  "Wooden Desk Organizer": "desk-organizer",
};

// Keyword fallback, for arbitrary listing titles (e.g. real user-created listings
// when photo upload isn't available) that aren't in the fixed demo catalog above.
const KEYWORD_KEYS: [RegExp, string][] = [
  [/macbook|laptop/i, "laptop"],
  [/calculator/i, "calculator"],
  [/mouse/i, "gaming-mouse"],
  [/usb.*hub/i, "usb-hub"],
  [/laptop stand/i, "laptop-stand"],
  [/keyboard/i, "mechanical-keyboard"],
  [/headphone/i, "headphones"],
  [/dslr|camera/i, "dslr-camera"],
  [/ssd|external drive|hard drive/i, "portable-ssd"],
  [/earbud|earphone/i, "wireless-earbuds"],
  [/monitor|display/i, "monitor"],
  [/chair/i, "study-chair"],
  [/lamp/i, "desk-lamp"],
  [/bucket|mug/i, "bucket-mug"],
  [/\biron\b/i, "iron"],
  [/bedsheet|pillow/i, "bedsheet-pillow"],
  [/fridge/i, "mini-fridge"],
  [/\btable\b/i, "study-table"],
  [/drying|cloth.*stand/i, "drying-rack"],
  [/jacket/i, "denim-jacket"],
  [/\bshirt\b/i, "dress-shirt"],
  [/sneaker|shoe/i, "sneakers"],
  [/backpack|\bbag\b/i, "backpack"],
  [/hoodie/i, "hoodie"],
  [/controller/i, "ps4-controller"],
  [/gaming headset|headset/i, "gaming-headset"],
  [/chess/i, "chess-set"],
  [/board game|catan/i, "board-game"],
  [/nintendo|switch/i, "nintendo-switch"],
  [/badminton|racket/i, "badminton-racket"],
  [/cricket/i, "cricket-bat"],
  [/yoga/i, "yoga-mat"],
  [/football|soccer/i, "football"],
  [/dumbbell/i, "dumbbells"],
  [/drafting|drawing kit/i, "drafting-kit"],
  [/lab coat/i, "lab-coat"],
  [/drafter/i, "mini-drafter"],
  [/graph.*notebook|notebook/i, "graph-notebook"],
  [/watch/i, "wrist-watch"],
  [/sunglasses/i, "sunglasses"],
  [/wallet/i, "wallet"],
  [/\bcap\b/i, "baseball-cap"],
  [/guitar/i, "guitar"],
  [/bicycle|\bcycle\b/i, "bicycle"],
  [/printer/i, "printer"],
  [/organizer/i, "desk-organizer"],
  [/book|textbook/i, "book-cs-dsa"],
];

const CATEGORY_FALLBACK: Record<string, string> = {
  books: "book-cs-dsa",
  electronics: "laptop",
  hostel: "study-chair",
  fashion: "denim-jacket",
  gaming: "ps4-controller",
  sports: "badminton-racket",
  academic: "drafting-kit",
  accessories: "wrist-watch",
  others: "desk-organizer",
};

export function resolveProductImage(title: string, categorySlug?: string): string {
  const exactKey = SEED_TITLE_KEYS[title];
  if (exactKey) return PRODUCT_IMAGES[exactKey];

  for (const [pattern, key] of KEYWORD_KEYS) {
    if (pattern.test(title)) return PRODUCT_IMAGES[key];
  }

  if (categorySlug && CATEGORY_FALLBACK[categorySlug]) {
    return PRODUCT_IMAGES[CATEGORY_FALLBACK[categorySlug]];
  }

  return PRODUCT_IMAGES["desk-organizer"];
}

export function avatarForIndex(i: number): string {
  return AVATAR_IMAGES[i % AVATAR_IMAGES.length];
}
