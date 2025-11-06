import express from "express";
import {
  signUp,
  logout,
  login,
  getAuthenticatedUser,
} from "../controllers/userController.js";
import { requiresAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requiresAuth, getAuthenticatedUser);

router.post("/signup", signUp);

router.post("/login", login);

router.post("/logout", logout);

export default router;
