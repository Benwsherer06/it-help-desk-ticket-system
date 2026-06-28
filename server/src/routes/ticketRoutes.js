import express from "express";
import { v4 as uuidv4 } from "uuid";
import { readDb, writeDb } from "../db/fileDb.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const allowedCategories = ["Hardware", "Software", "Network", "Account", "Other"];
const allowedPriorities = ["Low", "Medium", "High"];
const allowedStatuses = ["Open", "In Progress", "Resolved", "Closed"];

function prepareDb(db) {
  if (!db.users) {
    db.users = [];
  }

  if (!db.tickets) {
    db.tickets = [];
  }

  if (!db.comments) {
    db.comments = [];
  }

  return db;
}

function getCommentsForTicket(db, ticketId) {
  return db.comments
    .filter((comment) => comment.ticketId === ticketId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const db = prepareDb(await readDb());

  const tickets = db.tickets
    .map((ticket) => ({
      ...ticket,
      commentCount: getCommentsForTicket(db, ticket.id).length
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({
    tickets
  });
});

router.get("/my", requireAuth, async (req, res) => {
  const db = prepareDb(await readDb());

  const tickets = db.tickets
    .filter((ticket) => ticket.createdBy === req.user.id)
    .map((ticket) => ({
      ...ticket,
      commentCount: getCommentsForTicket(db, ticket.id).length
    }))
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

  const db = prepareDb(await readDb());

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
    ticket: {
      ...newTicket,
      commentCount: 0
    }
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const db = prepareDb(await readDb());
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
    ticket: {
      ...ticket,
      comments: getCommentsForTicket(db, ticket.id)
    }
  });
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "Status is required."
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid ticket status."
    });
  }

  const db = prepareDb(await readDb());
  const ticket = db.tickets.find((savedTicket) => savedTicket.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found."
    });
  }

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();

  await writeDb(db);

  return res.json({
    message: "Ticket status updated successfully.",
    ticket: {
      ...ticket,
      comments: getCommentsForTicket(db, ticket.id)
    }
  });
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  const { body } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({
      message: "Comment cannot be blank."
    });
  }

  const db = prepareDb(await readDb());
  const ticket = db.tickets.find((savedTicket) => savedTicket.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found."
    });
  }

  if (ticket.createdBy !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      message: "You do not have permission to comment on this ticket."
    });
  }

  const newComment = {
    id: uuidv4(),
    ticketId: ticket.id,
    body: body.trim(),
    createdBy: req.user.id,
    createdByName: req.user.name,
    createdByRole: req.user.role,
    createdAt: new Date().toISOString()
  };

  db.comments.push(newComment);
  ticket.updatedAt = new Date().toISOString();

  await writeDb(db);

  return res.status(201).json({
    message: "Comment added successfully.",
    comment: newComment,
    ticket: {
      ...ticket,
      comments: getCommentsForTicket(db, ticket.id)
    }
  });
});

export default router;