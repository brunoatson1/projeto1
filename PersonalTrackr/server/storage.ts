import { users, tables, categories, products, paymentMethods, orders, orderItems, 
         User, InsertUser, Table, InsertTable, Category, InsertCategory, 
         Product, InsertProduct, PaymentMethod, InsertPaymentMethod,
         Order, InsertOrder, OrderItem, InsertOrderItem, OrderWithDetails,
         ProductWithCategory, UserRole, TableStatus, OrderStatus } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Tables
  getTable(id: number): Promise<Table | undefined>;
  getTableByNumber(number: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined>;
  deleteTable(id: number): Promise<boolean>;
  getAllTables(): Promise<Table[]>;
  
  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;
  
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getAllProducts(): Promise<ProductWithCategory[]>;
  getActiveProducts(): Promise<ProductWithCategory[]>;
  
  // Payment Methods
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;
  getAllPaymentMethods(): Promise<PaymentMethod[]>;
  getActivePaymentMethods(): Promise<PaymentMethod[]>;
  
  // Orders
  getOrder(id: number): Promise<OrderWithDetails | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getAllOrders(): Promise<OrderWithDetails[]>;
  getOrdersByStatus(status: OrderStatus): Promise<OrderWithDetails[]>;
  getOrdersByTable(tableId: number): Promise<OrderWithDetails[]>;
  getTodayOrders(): Promise<OrderWithDetails[]>;
  
  // Order Items
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: number, item: Partial<InsertOrderItem>): Promise<OrderItem | undefined>;
  deleteOrderItem(id: number): Promise<boolean>;
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;
  
  // Statistics
  getTodayStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    freeTables: number;
    occupiedTables: number;
    readyOrders: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tables: Map<number, Table>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private paymentMethods: Map<number, PaymentMethod>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentId: number;
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.tables = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.paymentMethods = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    this.seedData();
  }

  private getNextId(): number {
    return this.currentId++;
  }

  private seedData() {
    // Seed admin user
    const adminUser: User = {
      id: this.getNextId(),
      username: "admin",
      password: "$2b$10$hash", // This will be replaced with proper hash
      email: "admin@restaurant.com",
      name: "Administrador",
      role: UserRole.ADMIN,
      active: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
    
    // Seed tables
    for (let i = 1; i <= 20; i++) {
      const table: Table = {
        id: this.getNextId(),
        number: i,
        seats: i % 4 === 0 ? 6 : 4,
        status: TableStatus.FREE,
        currentOrder: null,
      };
      this.tables.set(table.id, table);
    }
    
    // Seed categories
    const foodCategory: Category = {
      id: this.getNextId(),
      name: "Pratos Principais",
      description: "Pratos principais do restaurante",
    };
    this.categories.set(foodCategory.id, foodCategory);
    
    const drinkCategory: Category = {
      id: this.getNextId(),
      name: "Bebidas",
      description: "Bebidas e sucos",
    };
    this.categories.set(drinkCategory.id, drinkCategory);
    
    // Seed products
    const products = [
      {
        name: "Salmão Grelhado",
        description: "Com ervas e limão",
        price: "45.00",
        categoryId: foodCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      },
      {
        name: "Pizza Margherita", 
        description: "Tradicional com manjericão",
        price: "38.00",
        categoryId: foodCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      },
      {
        name: "Hambúrguer Artesanal",
        description: "Pão brioche, carne 180g, queijo, bacon",
        price: "32.00",
        categoryId: foodCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      },
      {
        name: "Cerveja Gelada",
        description: "Long neck 350ml",
        price: "8.00",
        categoryId: drinkCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      },
    ];
    
    products.forEach(prod => {
      const product: Product = {
        id: this.getNextId(),
        ...prod,
        active: true,
      };
      this.products.set(product.id, product);
    });
    
    // Seed payment methods
    const paymentMethods = [
      { name: "Dinheiro" },
      { name: "Cartão de Crédito" },
      { name: "Cartão de Débito" },
      { name: "PIX" },
    ];
    
    paymentMethods.forEach(method => {
      const paymentMethod: PaymentMethod = {
        id: this.getNextId(),
        ...method,
        active: true,
      };
      this.paymentMethods.set(paymentMethod.id, paymentMethod);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.getNextId(),
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Table methods
  async getTable(id: number): Promise<Table | undefined> {
    return this.tables.get(id);
  }

  async getTableByNumber(number: number): Promise<Table | undefined> {
    return Array.from(this.tables.values()).find(table => table.number === number);
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const table: Table = {
      ...insertTable,
      id: this.getNextId(),
    };
    this.tables.set(table.id, table);
    return table;
  }

  async updateTable(id: number, updates: Partial<InsertTable>): Promise<Table | undefined> {
    const table = this.tables.get(id);
    if (!table) return undefined;
    
    const updatedTable = { ...table, ...updates };
    this.tables.set(id, updatedTable);
    return updatedTable;
  }

  async deleteTable(id: number): Promise<boolean> {
    return this.tables.delete(id);
  }

  async getAllTables(): Promise<Table[]> {
    return Array.from(this.tables.values()).sort((a, b) => a.number - b.number);
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      ...insertCategory,
      id: this.getNextId(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      ...insertProduct,
      id: this.getNextId(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getAllProducts(): Promise<ProductWithCategory[]> {
    return Array.from(this.products.values()).map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined,
    }));
  }

  async getActiveProducts(): Promise<ProductWithCategory[]> {
    const allProducts = await this.getAllProducts();
    return allProducts.filter(product => product.active);
  }

  // Payment method methods
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async createPaymentMethod(insertMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const method: PaymentMethod = {
      ...insertMethod,
      id: this.getNextId(),
    };
    this.paymentMethods.set(method.id, method);
    return method;
  }

  async updatePaymentMethod(id: number, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const method = this.paymentMethods.get(id);
    if (!method) return undefined;
    
    const updatedMethod = { ...method, ...updates };
    this.paymentMethods.set(id, updatedMethod);
    return updatedMethod;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }

  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values());
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(method => method.active);
  }

  // Order methods
  async getOrder(id: number): Promise<OrderWithDetails | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const table = this.tables.get(order.tableId);
    const attendant = this.users.get(order.attendantId);
    const items = await this.getOrderItems(order.id);
    const paymentMethod = order.paymentMethodId ? this.paymentMethods.get(order.paymentMethodId) : undefined;
    
    if (!table || !attendant) return undefined;
    
    return {
      ...order,
      table,
      attendant,
      items,
      paymentMethod,
    };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      ...insertOrder,
      id: this.getNextId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(order.id, order);
    
    // Update table status
    if (order.status !== OrderStatus.PAID) {
      await this.updateTable(order.tableId, { 
        status: TableStatus.OCCUPIED,
        currentOrder: order.id 
      });
    }
    
    return order;
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.orders.set(id, updatedOrder);
    
    // Update table status based on order status
    if (updates.status === OrderStatus.READY) {
      await this.updateTable(order.tableId, { status: TableStatus.READY });
    } else if (updates.status === OrderStatus.PAID) {
      await this.updateTable(order.tableId, { 
        status: TableStatus.FREE,
        currentOrder: null 
      });
    }
    
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const order = this.orders.get(id);
    if (order) {
      // Free the table
      await this.updateTable(order.tableId, { 
        status: TableStatus.FREE,
        currentOrder: null 
      });
      
      // Delete order items
      Array.from(this.orderItems.values())
        .filter(item => item.orderId === id)
        .forEach(item => this.orderItems.delete(item.id));
    }
    
    return this.orders.delete(id);
  }

  async getAllOrders(): Promise<OrderWithDetails[]> {
    const orders = await Promise.all(
      Array.from(this.orders.keys()).map(id => this.getOrder(id))
    );
    return orders.filter(order => order !== undefined) as OrderWithDetails[];
  }

  async getOrdersByStatus(status: OrderStatus): Promise<OrderWithDetails[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => order.status === status);
  }

  async getOrdersByTable(tableId: number): Promise<OrderWithDetails[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => order.tableId === tableId);
  }

  async getTodayOrders(): Promise<OrderWithDetails[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  }

  // Order item methods
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    return this.orderItems.get(id);
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const item: OrderItem = {
      ...insertItem,
      id: this.getNextId(),
    };
    this.orderItems.set(item.id, item);
    
    // Update order total
    await this.updateOrderTotal(insertItem.orderId);
    
    return item;
  }

  async updateOrderItem(id: number, updates: Partial<InsertOrderItem>): Promise<OrderItem | undefined> {
    const item = this.orderItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.orderItems.set(id, updatedItem);
    
    // Update order total
    await this.updateOrderTotal(item.orderId);
    
    return updatedItem;
  }

  async deleteOrderItem(id: number): Promise<boolean> {
    const item = this.orderItems.get(id);
    if (item) {
      const deleted = this.orderItems.delete(id);
      if (deleted) {
        await this.updateOrderTotal(item.orderId);
      }
      return deleted;
    }
    return false;
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
    
    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId)!,
    })).filter(item => item.product);
  }

  private async updateOrderTotal(orderId: number): Promise<void> {
    const items = await this.getOrderItems(orderId);
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);
    
    await this.updateOrder(orderId, { total: total.toFixed(2) });
  }

  // Statistics
  async getTodayStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    freeTables: number;
    occupiedTables: number;
    readyOrders: number;
  }> {
    const todayOrders = await this.getTodayOrders();
    const allTables = await this.getAllTables();
    
    const totalRevenue = todayOrders
      .filter(order => order.status === OrderStatus.PAID)
      .reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    const paidOrders = todayOrders.filter(order => order.status === OrderStatus.PAID);
    const averageTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    
    const freeTables = allTables.filter(table => table.status === TableStatus.FREE).length;
    const occupiedTables = allTables.filter(table => table.status === TableStatus.OCCUPIED).length;
    const readyOrders = allTables.filter(table => table.status === TableStatus.READY).length;
    
    return {
      totalOrders: todayOrders.length,
      totalRevenue,
      averageTicket,
      freeTables,
      occupiedTables,
      readyOrders,
    };
  }
}

export const storage = new MemStorage();
