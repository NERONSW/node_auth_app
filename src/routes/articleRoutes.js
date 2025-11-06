import express from "express";
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  uploadImages,
  getImageSet,
} from "../controllers/articleController.js";
import upload from "../middleware/fileUploadMiddleware.js";
import { requiresAuth } from "../middleware/auth.js";

const router = express.Router();

//route for uploading up to 5 images
router.post("/upload-images", upload.array("images", 5), uploadImages);

//getting the images for the carousel
router.get("/images", getImageSet);

router.post("/", requiresAuth, upload.single("image"), createArticle);

router.get("/", requiresAuth, getAllArticles);

router.get("/:id", requiresAuth, getArticleById);

router.put("/:id", requiresAuth, updateArticle);

router.delete("/:id", requiresAuth, deleteArticle);

export default router;
