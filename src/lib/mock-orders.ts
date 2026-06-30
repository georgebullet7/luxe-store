// Mock order + customer data for the dashboard/admin demos.
// In production these come from Prisma (Order, OrderItem, User, Payment).

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface MockOrderItem {
  name: string;
  variantName?: string;
  image: string;
  quantity: number;
  unitPrice: number; // cents
}

export interface MockOrder {
  id: string;
  orderNumber: string;
  date: string; // ISO
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  items: MockOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber?: string;
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&q=80`;

export const mockOrders: MockOrder[] = [
  {
    id: "o_1029",
    orderNumber: "LX-1029",
    date: "2026-06-21T14:30:00Z",
    status: "DELIVERED",
    customerName: "George A.",
    customerEmail: "george@example.com",
    items: [
      {
        name: "Aurora Wireless Headphones",
        variantName: "Midnight Black",
        image: img("photo-1505740420928-5e560c06d30e"),
        quantity: 1,
        unitPrice: 24900,
      },
    ],
    subtotal: 24900,
    shipping: 0,
    tax: 1992,
    total: 26892,
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "o_1031",
    orderNumber: "LX-1031",
    date: "2026-06-25T09:12:00Z",
    status: "SHIPPED",
    customerName: "George A.",
    customerEmail: "george@example.com",
    items: [
      {
        name: "Vertex Smartwatch",
        image: img("photo-1523275335684-37898b6baf30"),
        quantity: 1,
        unitPrice: 39900,
      },
      {
        name: "Pulse Pro Earbuds",
        variantName: "Graphite",
        image: img("photo-1590658268037-6bf12165a8df"),
        quantity: 1,
        unitPrice: 14900,
      },
    ],
    subtotal: 54800,
    shipping: 0,
    tax: 4384,
    total: 59184,
    trackingNumber: "1Z999AA10987654321",
  },
  {
    id: "o_1033",
    orderNumber: "LX-1033",
    date: "2026-06-29T17:45:00Z",
    status: "PROCESSING",
    customerName: "Maya K.",
    customerEmail: "maya@example.com",
    items: [
      {
        name: "Stride Runner 2",
        variantName: "US 9",
        image: img("photo-1542291026-7eec264c27ff"),
        quantity: 2,
        unitPrice: 12900,
      },
    ],
    subtotal: 25800,
    shipping: 800,
    tax: 2064,
    total: 28664,
  },
  {
    id: "o_1034",
    orderNumber: "LX-1034",
    date: "2026-06-30T08:05:00Z",
    status: "PENDING",
    customerName: "Sami R.",
    customerEmail: "sami@example.com",
    items: [
      {
        name: "Carry Everyday Backpack",
        image: img("photo-1553062407-98eeb64c6a62"),
        quantity: 1,
        unitPrice: 8900,
      },
    ],
    subtotal: 8900,
    shipping: 800,
    tax: 712,
    total: 10412,
  },
];

export const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PAID: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  PROCESSING:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  SHIPPED:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  DELIVERED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  REFUNDED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

// 30-day revenue series for the admin sales chart (cents).
export const salesSeries = [
  { day: "Jun 1", revenue: 184200 },
  { day: "Jun 5", revenue: 221500 },
  { day: "Jun 9", revenue: 198700 },
  { day: "Jun 13", revenue: 263400 },
  { day: "Jun 17", revenue: 241900 },
  { day: "Jun 21", revenue: 312600 },
  { day: "Jun 25", revenue: 287300 },
  { day: "Jun 29", revenue: 349100 },
];
