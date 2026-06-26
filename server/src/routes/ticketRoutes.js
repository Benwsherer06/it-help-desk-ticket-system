import express from "express";
import { v4 as uuidv4 } from "uuid";
import { readDb, writeDb } from "../db/fileDb.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const allowedCategories = ["Hardware", "Software", "Network", "Account", "Other"];
const allowedPriorities = ["Low", "Medium", "High"];

router.get("/my", requireAuth, async (req, res) => {
  const db = await readDb();

  const tickets = db.tickets
    .filter((ticket) => ticket.createdBy === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({
    tickets
  });
});

router.post("/", requireAuth, async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category || !priority) {
    return res.status(400).json({
      message: "Title, description, category and priority are required."
    });
  }

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      message: "Invalid ticket category."
    });
  }

  if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Invalid ticket priority."
    });
  }

  const db = await readDb();

  const newTicket = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    category,
    priority,
    status: "Open",
    createdBy: req.user.id,
    createdByName: req.user.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.tickets.push(newTicket);
  await writeDb(db);

  return res.status(201).json({
    message: "Ticket created successfully.",
    ticket: newTicket
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const db = await readDb();
  const ticket = db.tickets.find((savedTicket) => savedTicket.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found."
    });
  }

  if (ticket.createdBy !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      message: "You do not have permission to view this ticket."
    });
  }

  return res.json({
    ticket
  });
});

export default router;