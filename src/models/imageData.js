import mongoose from "mongoose";

//Schema
const imageDataSchema = new mongoose.Schema(
  {
    image_url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

//Model
const ImageData = mongoose.model("ImageData", imageDataSchema);

export default ImageData;
