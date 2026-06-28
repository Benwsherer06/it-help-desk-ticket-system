import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { readDb, writeDb } from "../db/fileDb.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-later";
const ADMIN_CODE = process.env.ADMIN_CODE || "admin123";

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "2h"
    }
  );
}

router.post("/register", async (req, res) => {
  const { name, email, password, adminCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required."
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters."
    });
  }

  const db = await readDb();

  if (!db.users) {
    db.users = [];
  }

  if (!db.tickets) {
    db.tickets = [];
  }

  if (!db.comments) {
    db.comments = [];
  }

  const existingUser = db.users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({
      message: "An account with that email already exists."
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role = adminCode === ADMIN_CODE ? "admin" : "user";

  const newUser = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  await writeDb(db);

  const token = createToken(newUser);

  return res.status(201).json({
    message: "Account created successfully.",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    });
  }

  const db = await readDb();

  if (!db.users) {
    db.users = [];
  }

  const user = db.users.find(
    (savedUser) => savedUser.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password."
    });
  }

  const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordIsValid) {
    return res.status(401).json({
      message: "Invalid email or password."
    });
  }

  const token = createToken(user);

  return res.json({
    message: "Logged in successfully.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

router.get("/me", requireAuth, (req, res) => {
  return res.json({
    user: req.user
  });
});

export default router;