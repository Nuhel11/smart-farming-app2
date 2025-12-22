import express from "express";
import pool from "../db.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// ------------------------------------------------------------
// Middleware: allow only admins
// ------------------------------------------------------------
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required." });
  }
  next();
};

// All admin routes are protected + admin-only
router.use(protect, adminOnly);

// ============================================================
// USERS (Admin)
// GET /api/admin/users
// PATCH /api/admin/users/:id
// DELETE /api/admin/users/:id
// ============================================================

router.get("/users", async (req, res) => {
  try {
    // ✅ FIX: your DB column is "created_" not "created_at"
    // ✅ We alias it as created_at so the frontend does not need changes
    const [rows] = await pool.execute(
      `SELECT user_id, username, email, role, created_as
       FROM Users
       ORDER BY user_id DESC`
    );

    res.json({ users: rows });
  } catch (error) {
    console.error("Admin GET users error:", error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
});

router.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE Users
       SET username = COALESCE(?, username),
           email = COALESCE(?, email),
           role = COALESCE(?, role)
       WHERE user_id = ?`,
      [username ?? null, email ?? null, role ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User updated." });
  } catch (error) {
    console.error("Admin PATCH user error:", error);
    res.status(500).json({ message: "Server error while updating user." });
  }
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(`DELETE FROM Users WHERE user_id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ message: "User deleted." });
  } catch (error) {
    console.error("Admin DELETE user error:", error);
    res.status(500).json({ message: "Server error while deleting user." });
  }
});

// ============================================================
// CROPS (Admin)
// GET /api/admin/crops
// PUT /api/admin/crops/:id
// DELETE /api/admin/crops/:id
// ============================================================

router.get("/crops", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT crop_id, crop_name, optimal_N, optimal_P, optimal_K
       FROM Crop_Master
       ORDER BY crop_id DESC`
    );
    res.json({ crops: rows });
  } catch (error) {
    console.error("Admin GET crops error:", error);
    res.status(500).json({ message: "Server error while fetching crops." });
  }
});

router.put("/crops/:id", async (req, res) => {
  const { id } = req.params;
  const { crop_name, optimal_N, optimal_P, optimal_K } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE Crop_Master
       SET crop_name = COALESCE(?, crop_name),
           optimal_N = COALESCE(?, optimal_N),
           optimal_P = COALESCE(?, optimal_P),
           optimal_K = COALESCE(?, optimal_K)
       WHERE crop_id = ?`,
      [crop_name ?? null, optimal_N ?? null, optimal_P ?? null, optimal_K ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Crop not found." });
    }

    res.json({ message: "Crop updated." });
  } catch (error) {
    console.error("Admin PUT crop error:", error);
    res.status(500).json({ message: "Server error while updating crop." });
  }
});

router.delete("/crops/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(`DELETE FROM Crop_Master WHERE crop_id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Crop not found." });
    }
    res.json({ message: "Crop deleted." });
  } catch (error) {
    console.error("Admin DELETE crop error:", error);
    res.status(500).json({ message: "Server error while deleting crop." });
  }
});

// ============================================================
// PRODUCTS (Admin)
// GET /api/admin/products
// POST /api/admin/products
// PUT /api/admin/products/:id
// DELETE /api/admin/products/:id
// ============================================================

router.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT product_id, name, category, price, stock, description, created_at
       FROM Products
       ORDER BY product_id DESC`
    );
    res.json({ products: rows });
  } catch (error) {
    console.error("Admin GET products error:", error);
    res.status(500).json({ message: "Server error while fetching products." });
  }
});

router.post("/products", async (req, res) => {
  const { name, category, price, stock, description } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: "Name and category are required." });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO Products (name, category, price, stock, description)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, price ?? 0, stock ?? 0, description ?? null]
    );

    res.status(201).json({ message: "Product created.", productId: result.insertId });
  } catch (error) {
    console.error("Admin POST product error:", error);
    res.status(500).json({ message: "Server error while creating product." });
  }
});

router.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, description } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE Products
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           price = COALESCE(?, price),
           stock = COALESCE(?, stock),
           description = COALESCE(?, description)
       WHERE product_id = ?`,
      [name ?? null, category ?? null, price ?? null, stock ?? null, description ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product updated." });
  } catch (error) {
    console.error("Admin PUT product error:", error);
    res.status(500).json({ message: "Server error while updating product." });
  }
});

router.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(`DELETE FROM Products WHERE product_id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Admin DELETE product error:", error);
    res.status(500).json({ message: "Server error while deleting product." });
  }
});

export default router;
