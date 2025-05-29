import { Schema, model } from "mongoose";
import { TPotholeVerification } from "./potholeVerification.interface";

const potholeVerificationSchema = new Schema<TPotholeVerification>(
  {
    potholeId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["No", "Yes", "I don't know"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PotholeVerification = model<TPotholeVerification>(
  "PotholeVerification",
  potholeVerificationSchema
);
