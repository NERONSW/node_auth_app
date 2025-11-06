import Article from "../models/article.js";
import ImageData from "../models/imageData.js";
import { uploadImageToBucket } from "../util/S3ImageUploadUtil.js";

// Create a new article
export const createArticle = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      const error = new Error("Title and content are required");
      error.statusCode = 400;
      throw error;
    }

    let imageUrl = null;

    //If an image is uploaded, send it to S3
    if (req.file) {
      const key = `${Date.now()}_${req.file.originalname}`;
      const uploadedImage = await uploadImageToBucket(
        req.file.buffer,
        key,
        req.file.mimetype
      );
      imageUrl = uploadedImage.Location; // S3 URL
    }

    // Create Article with optional image URL
    const article = new Article({
      title,
      content,
      image_url: imageUrl,
    });
    const savedArticle = await article.save();

    res.status(201).json({
      message: "Article saved successfully",
      data: savedArticle,
    });
  } catch (error) {
    next(error);
  }
};

// Get all articles
export const getAllArticles = async (req, res, next) => {
  try {
    // check if paginate=true
    const paginate = req.query.paginate === "true";

    //If true, use this part
    if (paginate) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [articles, total] = await Promise.all([
        Article.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
        Article.countDocuments().exec(),
      ]);

      return res.status(200).json({
        message: "Articles retrived successfully",
        data: articles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      });
    } else {
      //Else use this
      const articles = await Article.find().sort({ createdAt: -1 }).exec();
      return res.status(200).json({
        message: "Articles retrived successfully",
        data: articles,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get single article by ID
export const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id).exec();

    if (!article) {
      const error = new Error("Article not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Article retrived successfully",
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

// Update an article by ID
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title && !content) {
      const error = new Error(
        "At least one of title or content must be provided"
      );
      error.statusCode = 400;
      throw error;
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedArticle) {
      const error = new Error("Article not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Article updated successfully",
      data: updatedArticle,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an article by ID
export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedArticle = await Article.findByIdAndDelete(id).exec();

    if (!deletedArticle) {
      const error = new Error("Article not found");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json({ message: "Article deleted successfully", data: deletedArticle });
  } catch (error) {
    next(error);
  }
};

export const uploadImages = async (req, res, next) => {
  try {
    // Validate uploaded files
    if (!req.files || req.files.length === 0) {
      const error = new Error("No images provided");
      error.statusCode = 400;
      throw error;
    }

    // Limit to 5 images
    if (req.files.length > 5) {
      const error = new Error("You can only upload up to 5 images at once");
      error.statusCode = 400;
      throw error;
    }

    // Upload images to S3
    const uploadPromises = req.files.map((file) => {
      const key = `${Date.now()}_${file.originalname}`;
      return uploadImageToBucket(file.buffer, key, file.mimetype);
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Extract URLs from S3 responses
    const imageUrls = uploadedImages.map((img) => img.Location);

    // Save each image URL to MongoDB
    const imageDocs = await Promise.all(
      imageUrls.map((url) =>
        new ImageData({
          image_url: url,
        }).save()
      )
    );

    res.status(201).json({
      message: "Images uploaded and saved successfully",
      data: imageDocs, // send saved MongoDB records back
    });
  } catch (error) {
    next(error);
  }
};

export const getImageSet = async (req, res, next) => {
  try {
    const articles = await ImageData.find().sort({ createdAt: -1 }).exec();
    return res.status(200).json({
      message: "Images retrived successfully",
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};
