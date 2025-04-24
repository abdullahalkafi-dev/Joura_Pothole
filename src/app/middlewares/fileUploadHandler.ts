import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import AppError from "../errors/AppError";
import sharp from "sharp";
import AWS from "aws-sdk";

//configure aws s3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "your-bucket-name";
// Reusable function to upload an image to S3 after converting to WebP and compressing it
const uploadImageToS3 = async (file: Express.Multer.File): Promise<string> => {
  try {
    // Convert the image to WebP format with sharp
    const webpBuffer = await sharp(file.path).webp({ quality: 70 }).toBuffer();

    // S3 upload parameters
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: `images/${file.filename.replace(/\.tmp$/, ".webp")}`, // Store in the 'images' folder with a new .webp extension
      Body: webpBuffer,
      ContentType: "image/webp",
    };
    console.log("Uploading to S3 with params:", s3Params); // Log S3 parameters

    // Upload to S3
    const s3Response = await s3.upload(s3Params).promise();

    console.log("S3 Response:", s3Response); // Log the full response for success
   fs.unlinkSync(file.path);
    // Return the S3 URL
    return s3Response.Location;
  } catch (error: any) {
    console.error("Error during S3 upload:", error); // Log the error details
    throw new AppError(
      500,
      `Image processing and upload to S3 failed: ${error.message}`
    );
  }
};
// const uploadDocToS3 = async (file: Express.Multer.File): Promise<string> => {
//   try {
  

//     // S3 upload parameters
//     const s3Params = {
//       Bucket: BUCKET_NAME,
//       Key: `${file.filename.replace(/\.tmp$/, ".webp")}`, // Store in the 'images' folder with a new .webp extension
//       Body: webpBuffer,
//       ContentType: "image/webp",
//     };
//     console.log("Uploading to S3 with params:", s3Params); // Log S3 parameters

//     // Upload to S3
//     const s3Response = await s3.upload(s3Params).promise();

//     console.log("S3 Response:", s3Response); // Log the full response for success

//     // Return the S3 URL
//     return s3Response.Location;
//   } catch (error: any) {
//     console.error("Error during S3 upload:", error); // Log the error details
//     throw new AppError(
//       500,
//       `Image processing and upload to S3 failed: ${error.message}`
//     );
//   }
// };

const fileUploadHandler = (req: Request, res: Response, next: NextFunction) => {
  // Create upload folder
  const baseUploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  // Folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  // Create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      console.log(file.fieldname);
      switch (file.fieldname) {
        case "image":
          uploadDir = path.join(baseUploadDir, "images");
          break;
        case "media":
          uploadDir = path.join(baseUploadDir, "medias");
          break;
        case "doc":
        case "docs":
          uploadDir = path.join(baseUploadDir, "docs");
          break;
        default:
          throw new AppError(StatusCodes.BAD_REQUEST, "File is not supported");
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      let fileExt: string;
      if (file.fieldname === "doc" || file.fieldname === "docs") {
        fileExt = ".pdf";
      } else if (file.fieldname === "image") {
        fileExt = ".tmp"; // will be converted to .webp later
      } else {
        // For media, retain the original extension
        fileExt = path.extname(file.originalname);
      }
      const date = new Date();
      const formattedDate = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`;
      const randomCode = () => {
        const chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
        let result = "";
        for (let i = 0; i < 5; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      const originalNameWithoutExt =
        path.parse(file.originalname).name + "-" + randomCode();
      const fileName =
        req?.user?.id &&
        req.url === "/update-profile" &&
        file.fieldname == "image"
          ? req.user.id + originalNameWithoutExt
          : originalNameWithoutExt.toLowerCase().split(" ").join("-") +
            "-" +
            formattedDate;

      cb(null, fileName + fileExt);
    },
  });

  // File filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (file.fieldname === "image") {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/heif" ||
        file.mimetype === "image/heic" ||
        file.mimetype === "image/tiff" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/avif"
      ) {
        cb(null, true);
      } else {
        console.log(file.fieldname);
        console.log(file.mimetype);
        cb(
          new AppError(
            StatusCodes.BAD_REQUEST,
            "Only .jpeg, .png, .jpg, .heif, .heic, .tiff, .webp, .avif files supported"
          )
        );
      }
    } else if (file.fieldname === "media") {
      if (file.mimetype === "video/mp4" || file.mimetype === "audio/mpeg") {
        cb(null, true);
      } else {
        cb(
          new AppError(
            StatusCodes.BAD_REQUEST,
            "Only .mp4, .mp3, file supported"
          )
        );
      }
    } else if (file.fieldname === "doc" || file.fieldname === "docs") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new AppError(StatusCodes.BAD_REQUEST, "Only pdf supported"));
      }
    } else {
      throw new AppError(StatusCodes.BAD_REQUEST, "This file is not supported");
    }
  };

  // Return multer middleware
  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
  }).fields([
    { name: "image", maxCount: 10 },
    { name: "media", maxCount: 10 },
    { name: "doc", maxCount: 10 },
  ]);
  // Execute the multer middleware
  upload(req, res, async (err: any) => {
    if (err) {
      return next(err);
    }


    if(req.files && "doc" in req.files) {

    }

    if (req.files && "image" in req.files) {
      const imageFiles = (
        req.files as { [fieldname: string]: Express.Multer.File[] }
      )["image"];
      try {
        for (const file of imageFiles) {
          console.log(file);
          const s3ImageUrl = await uploadImageToS3(file);

          console.log("Image uploaded to S3:", s3ImageUrl);

          file.path = s3ImageUrl; // Set the path to the S3 URL
        }
      } catch (error) {
        return next(
          new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Image processing failed"
          )
        );
      }
    }

    next();
  });
};

export default fileUploadHandler;
