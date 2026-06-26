import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Help desk backend is running.");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Help desk backend is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: "Something went wrong on the server."
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});