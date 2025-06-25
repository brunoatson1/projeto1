import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export enum UserRole {
  ADMIN = "admin",
  ATENDENTE = "atendente", 
  COZINHA = "cozinha"
}

export enum TableStatus {
  FREE = "free",
  OCCUPIED = "occupied",
  READY = "ready"
}

export enum OrderStatus {
  NEW = "new",
  PREPARING = "preparing", 
  READY = "ready",
  DELIVERED = "delivered",
  PAID = "paid"
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().$type<UserRole>(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  seats: integer("seats").notNull(),
  status: text("status").notNull().$type<TableStatus>().default(TableStatus.FREE),
  currentOrder: integer("current_order"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull().references(() => tables.id),
  attendantId: integer("attendant_id").notNull().references(() => users.id),
  status: text("status").notNull().$type<OrderStatus>().default(OrderStatus.NEW),
  notes: text("notes"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  paymentNotes: text("payment_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTableSchema = createInsertSchema(tables).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Extended types for API responses
export type OrderWithDetails = Order & {
  table: Table;
  attendant: User;
  items: (OrderItem & { product: Product })[];
  paymentMethod?: PaymentMethod;
};

export type ProductWithCategory = Product & {
  category?: Category;
};
