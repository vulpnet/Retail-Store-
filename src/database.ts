import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'store.db');
const db = new Database(dbPath);

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Username TEXT UNIQUE NOT NULL,
      PasswordHash TEXT NOT NULL,
      Role TEXT NOT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Categories (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Description TEXT
    );

    CREATE TABLE IF NOT EXISTS Products (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      CategoryId INTEGER,
      Price REAL NOT NULL,
      StockQuantity INTEGER NOT NULL DEFAULT 0,
      ImageUrl TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
    );

    CREATE TABLE IF NOT EXISTS Customers (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Email TEXT UNIQUE,
      Phone TEXT,
      Address TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Orders (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerId INTEGER,
      TotalAmount REAL NOT NULL,
      Status TEXT NOT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
    );

    CREATE TABLE IF NOT EXISTS OrderDetails (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      OrderId INTEGER,
      ProductId INTEGER,
      Quantity INTEGER NOT NULL,
      UnitPrice REAL NOT NULL,
      FOREIGN KEY (OrderId) REFERENCES Orders(Id),
      FOREIGN KEY (ProductId) REFERENCES Products(Id)
    );

    CREATE TABLE IF NOT EXISTS InventoryTransactions (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      ProductId INTEGER,
      Type TEXT NOT NULL, -- 'IN' or 'OUT'
      Quantity INTEGER NOT NULL,
      Notes TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ProductId) REFERENCES Products(Id)
    );

    CREATE TABLE IF NOT EXISTS Promotions (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      DiscountPercentage REAL NOT NULL,
      StartDate DATETIME NOT NULL,
      EndDate DATETIME NOT NULL,
      Active INTEGER NOT NULL DEFAULT 1,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default admin if not exists
  const adminExists = db.prepare('SELECT 1 FROM Users WHERE Username = ?').get('admin');
  if (!adminExists) {
    // In a real app, use bcrypt to hash passwords
    db.prepare('INSERT INTO Users (Username, PasswordHash, Role) VALUES (?, ?, ?)').run('admin', 'admin123', 'Admin');
  }

  // Insert sample categories if empty
  const catCount = db.prepare('SELECT COUNT(*) as count FROM Categories').get() as { count: number };
  if (catCount.count === 0) {
    const insertCat = db.prepare('INSERT INTO Categories (Name, Description) VALUES (?, ?)');
    insertCat.run('Electronics', 'Electronic devices and accessories');
    insertCat.run('Clothing', 'Apparel and fashion');
    insertCat.run('Home & Garden', 'Home decor and gardening tools');
  }

  // Insert sample products if empty
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM Products').get() as { count: number };
  if (prodCount.count === 0) {
    const insertProd = db.prepare('INSERT INTO Products (Name, CategoryId, Price, StockQuantity, ImageUrl) VALUES (?, ?, ?, ?, ?)');
    insertProd.run('Laptop Pro', 1, 1299.99, 50, 'https://picsum.photos/seed/laptop/400/300');
    insertProd.run('Wireless Mouse', 1, 29.99, 200, 'https://picsum.photos/seed/mouse/400/300');
    insertProd.run('Cotton T-Shirt', 2, 19.99, 500, 'https://picsum.photos/seed/tshirt/400/300');
    insertProd.run('Coffee Maker', 3, 89.99, 30, 'https://picsum.photos/seed/coffee/400/300');
  }

  // Insert sample customers if empty
  const custCount = db.prepare('SELECT COUNT(*) as count FROM Customers').get() as { count: number };
  if (custCount.count === 0) {
    const insertCust = db.prepare('INSERT INTO Customers (Name, Email, Phone, Address) VALUES (?, ?, ?, ?)');
    insertCust.run('John Doe', 'john@example.com', '555-0101', '123 Main St');
    insertCust.run('Jane Smith', 'jane@example.com', '555-0102', '456 Oak Ave');
  }

  // Insert sample promotions if empty
  const promoCount = db.prepare('SELECT COUNT(*) as count FROM Promotions').get() as { count: number };
  if (promoCount.count === 0) {
    const insertPromo = db.prepare('INSERT INTO Promotions (Name, DiscountPercentage, StartDate, EndDate, Active) VALUES (?, ?, ?, ?, ?)');
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);
    
    insertPromo.run('Summer Sale', 15.0, now.toISOString().split('T')[0], nextMonth.toISOString().split('T')[0], 1);
    insertPromo.run('Clearance', 30.0, now.toISOString().split('T')[0], nextMonth.toISOString().split('T')[0], 1);
  }
}

export default db;
