export const ALLOWED_EMAIL_DOMAIN =
  process.env.ALLOWED_EMAIL_DOMAIN ?? "university.edu";

export const APP_NAME = "Campus Commerce";

export const CATEGORIES = [
  { name: "Books", slug: "books", icon: "BookOpen" },
  { name: "Electronics", slug: "electronics", icon: "Laptop" },
  { name: "Hostel", slug: "hostel", icon: "Home" },
  { name: "Fashion", slug: "fashion", icon: "Shirt" },
  { name: "Gaming", slug: "gaming", icon: "Gamepad2" },
  { name: "Sports", slug: "sports", icon: "Dumbbell" },
  { name: "Academic", slug: "academic", icon: "GraduationCap" },
  { name: "Accessories", slug: "accessories", icon: "Watch" },
  { name: "Others", slug: "others", icon: "Package" },
] as const;

export const CAMPUS_LOCATIONS = [
  { name: "Hostel Block A", type: "Hostel" },
  { name: "Hostel Block B", type: "Hostel" },
  { name: "Hostel Block C", type: "Hostel" },
  { name: "Main Academic Block", type: "Academic" },
  { name: "Engineering Block", type: "Academic" },
  { name: "Central Library", type: "Library" },
  { name: "Cafeteria", type: "Cafeteria" },
  { name: "Sports Complex", type: "Other" },
] as const;

export const CONDITION_LABELS: Record<string, string> = {
  BRAND_NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  USED: "Used",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  READY_FOR_PICKUP: "Ready for Pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const REPORT_REASON_LABELS: Record<string, string> = {
  FAKE_PRODUCT: "Fake product",
  SCAM: "Scam",
  WRONG_DESCRIPTION: "Wrong description",
  INAPPROPRIATE_CONTENT: "Inappropriate content",
  SUSPICIOUS_SELLER: "Suspicious seller",
  OTHER: "Other",
};

export const DEMO_STUDENT_EMAIL = `student@${ALLOWED_EMAIL_DOMAIN}`;
export const DEMO_ADMIN_EMAIL = `admin@${ALLOWED_EMAIL_DOMAIN}`;
export const DEMO_PASSWORD = "CampusDemo123!";
