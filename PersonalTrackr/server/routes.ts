import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertOrderSchema, insertOrderItemSchema, insertProductSchema, 
         insertPaymentMethodSchema, insertUserSchema, insertTableSchema,
         OrderStatus, UserRole } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(roles: UserRole[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // WebSocket clients for real-time updates
  const wsClients = new Set<WebSocket>();

  function broadcastUpdate(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Tables API
  app.get("/api/tables", requireAuth, async (req, res) => {
    try {
      const tables = await storage.getAllTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.post("/api/tables", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(validatedData);
      broadcastUpdate('table_created', table);
      res.status(201).json(table);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid table data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create table" });
      }
    }
  });

  app.put("/api/tables/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const table = await storage.updateTable(id, updates);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      broadcastUpdate('table_updated', table);
      res.json(table);
    } catch (error) {
      res.status(500).json({ message: "Failed to update table" });
    }
  });

  // Products API
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getActiveProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/all", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all products" });
    }
  });

  app.post("/api/products", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.put("/api/products/:id", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const product = await storage.updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Orders API
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      let orders;
      
      if (status) {
        orders = await storage.getOrdersByStatus(status as OrderStatus);
      } else {
        orders = await storage.getAllOrders();
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/today", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getTodayOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's orders" });
    }
  });

  app.post("/api/orders", requireAuth, requireRole([UserRole.ATENDENTE, UserRole.ADMIN]), async (req, res) => {
    try {
      const orderData = {
        ...req.body,
        attendantId: req.user.id,
      };
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      
      const orderWithDetails = await storage.getOrder(order.id);
      broadcastUpdate('order_created', orderWithDetails);
      res.status(201).json(orderWithDetails);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  app.put("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const order = await storage.updateOrder(id, updates);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const orderWithDetails = await storage.getOrder(id);
      broadcastUpdate('order_updated', orderWithDetails);
      res.json(orderWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Order Items API
  app.post("/api/orders/:orderId/items", requireAuth, requireRole([UserRole.ATENDENTE, UserRole.ADMIN]), async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const itemData = {
        ...req.body,
        orderId,
      };
      const validatedData = insertOrderItemSchema.parse(itemData);
      const item = await storage.createOrderItem(validatedData);
      
      const orderWithDetails = await storage.getOrder(orderId);
      broadcastUpdate('order_updated', orderWithDetails);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add order item" });
      }
    }
  });

  app.delete("/api/orders/:orderId/items/:itemId", requireAuth, requireRole([UserRole.ATENDENTE, UserRole.ADMIN]), async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const itemId = parseInt(req.params.itemId);
      const success = await storage.deleteOrderItem(itemId);
      
      if (!success) {
        return res.status(404).json({ message: "Order item not found" });
      }
      
      const orderWithDetails = await storage.getOrder(orderId);
      broadcastUpdate('order_updated', orderWithDetails);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order item" });
    }
  });

  // Payment Methods API
  app.get("/api/payment-methods", requireAuth, async (req, res) => {
    try {
      const methods = await storage.getActivePaymentMethods();
      res.json(methods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.get("/api/payment-methods/all", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const methods = await storage.getAllPaymentMethods();
      res.json(methods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all payment methods" });
    }
  });

  app.post("/api/payment-methods", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertPaymentMethodSchema.parse(req.body);
      const method = await storage.createPaymentMethod(validatedData);
      res.status(201).json(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment method data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create payment method" });
      }
    }
  });

  // Users API (Admin only)
  app.get("/api/users", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  // Statistics API
  app.get("/api/stats/today", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getTodayStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    wsClients.add(ws);
    
    ws.on('close', () => {
      wsClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });

  return httpServer;
}
