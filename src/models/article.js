import mongoose from "mongoose";

//Schema
const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      required: false,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

//Model
const Article = mongoose.model("Article", articleSchema);

export default Article;
