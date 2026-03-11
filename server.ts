import express from 'express';
import { createServer as createViteServer } from 'vite';
import db, { initDb } from './src/database.js';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB
  initDb();

  // --- API Routes ---

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM Users WHERE Username = ? AND PasswordHash = ?').get(username, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.Id, username: user.Username, role: user.Role } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  // Products
  app.get('/api/products', (req, res) => {
    const products = db.prepare(`
      SELECT p.*, c.Name as CategoryName 
      FROM Products p 
      LEFT JOIN Categories c ON p.CategoryId = c.Id
    `).all();
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const { Name, CategoryId, Price, StockQuantity, ImageUrl } = req.body;
    const info = db.prepare('INSERT INTO Products (Name, CategoryId, Price, StockQuantity, ImageUrl) VALUES (?, ?, ?, ?, ?)').run(Name, CategoryId, Price, StockQuantity, ImageUrl);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { Name, CategoryId, Price, StockQuantity, ImageUrl } = req.body;
    db.prepare('UPDATE Products SET Name = ?, CategoryId = ?, Price = ?, StockQuantity = ?, ImageUrl = ? WHERE Id = ?').run(Name, CategoryId, Price, StockQuantity, ImageUrl, id);
    res.json({ success: true });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM Products WHERE Id = ?').run(id);
    res.json({ success: true });
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM Categories').all();
    res.json(categories);
  });

  // Customers
  app.get('/api/customers', (req, res) => {
    const customers = db.prepare('SELECT * FROM Customers').all();
    res.json(customers);
  });

  app.post('/api/customers', (req, res) => {
    const { Name, Email, Phone, Address } = req.body;
    const info = db.prepare('INSERT INTO Customers (Name, Email, Phone, Address) VALUES (?, ?, ?, ?)').run(Name, Email, Phone, Address);
    res.json({ id: info.lastInsertRowid });
  });

  // Orders
  app.get('/api/orders', (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, c.Name as CustomerName 
      FROM Orders o 
      LEFT JOIN Customers c ON o.CustomerId = c.Id
      ORDER BY o.CreatedAt DESC
    `).all();
    res.json(orders);
  });

  app.post('/api/orders', (req, res) => {
    const { CustomerId, TotalAmount, Status, Items } = req.body;
    
    const transaction = db.transaction(() => {
      const info = db.prepare('INSERT INTO Orders (CustomerId, TotalAmount, Status) VALUES (?, ?, ?)').run(CustomerId, TotalAmount, Status);
      const orderId = info.lastInsertRowid;

      const insertDetail = db.prepare('INSERT INTO OrderDetails (OrderId, ProductId, Quantity, UnitPrice) VALUES (?, ?, ?, ?)');
      const updateStock = db.prepare('UPDATE Products SET StockQuantity = StockQuantity - ? WHERE Id = ?');
      const insertInventory = db.prepare('INSERT INTO InventoryTransactions (ProductId, Type, Quantity, Notes) VALUES (?, ?, ?, ?)');

      for (const item of Items) {
        insertDetail.run(orderId, item.ProductId, item.Quantity, item.UnitPrice);
        updateStock.run(item.Quantity, item.ProductId);
        insertInventory.run(item.ProductId, 'OUT', item.Quantity, `Order #${orderId}`);
      }

      return orderId;
    });

    try {
      const orderId = transaction();
      res.json({ id: orderId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', (req, res) => {
    const totalRevenue = db.prepare('SELECT SUM(TotalAmount) as total FROM Orders WHERE Status = ?').get('Completed') as any;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM Orders').get() as any;
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM Customers').get() as any;
    const lowStockProducts = db.prepare('SELECT COUNT(*) as count FROM Products WHERE StockQuantity < 10').get() as any;

    res.json({
      totalRevenue: totalRevenue.total || 0,
      totalOrders: totalOrders.count,
      totalCustomers: totalCustomers.count,
      lowStockProducts: lowStockProducts.count
    });
  });

  app.get('/api/dashboard/sales-chart', (req, res) => {
    // Mocking daily sales for the chart
    const sales = [
      { name: 'Mon', sales: 4000 },
      { name: 'Tue', sales: 3000 },
      { name: 'Wed', sales: 2000 },
      { name: 'Thu', sales: 2780 },
      { name: 'Fri', sales: 1890 },
      { name: 'Sat', sales: 2390 },
      { name: 'Sun', sales: 3490 },
    ];
    res.json(sales);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
