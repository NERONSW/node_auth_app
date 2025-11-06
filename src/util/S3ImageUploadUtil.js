import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
});

export const uploadImageToBucket = async (buffer, key, mimetype) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });

  await s3.send(command);

  // Generate the S3 URL
  const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { Location: url };
};

// aws-sdk v2 verion

// import AWS from "aws-sdk";

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
// });

// export const uploadImageToBucket = async (blob, key) => {
//   const uploadedImage = await s3
//     .upload({
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: key,
//       Body: blob,
//       ContentType: "image/png",
//     })
//     .promise();

//   return uploadedImage;
// };

// utils/s3.js
