import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";

dotenv.config();
const mongodb_url = process.env.MONGO_DB_URL;
const session_secret = process.env.SESSION_SECRET;

//Express app creation
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Allowing CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow cookies/sessions
  })
);

//Session store
app.use(
  session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 5 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: mongodb_url,
    }),
  })
);

//Expose the routes
app.use("/api/users", userRoutes);
app.use("/api/article", articleRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error("Endpoint not found");
  error.statusCode = 404;
  next(error);
});

// General error handler
app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "An unknown error occurred";

  res.status(statusCode).json({ error: message });
});

// Basic route
app.get("/", (req, res) => {
  res.send("Backend running successfully!");
});

export default app;
