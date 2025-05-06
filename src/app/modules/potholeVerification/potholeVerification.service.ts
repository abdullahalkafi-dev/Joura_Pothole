import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { PotholeReport } from "../potholeReport/potholeReport.model";
import { User } from "../user/user.model";
import { TPotholeVerification } from "./potholeVerification.interface";
import { PotholeVerification } from "./potholeVerification.model";

const createPotholeVerification = async (
  payload: Partial<TPotholeVerification>
) => {
  const { userId, potholeId } = payload;
  const [user, pothole] = await Promise.all([
    User.findById(userId),
    PotholeReport.findById(potholeId),
  ]);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (!pothole) {
    throw new AppError(StatusCodes.NOT_FOUND, "Pothole not found");
  }

  const verification = await PotholeVerification.create(payload);
  if (verification) {
    console.log(verification);
    console.log(verification.userId);
    await PotholeReport.findByIdAndUpdate(potholeId, {
      $push: {
        verifiedBy: verification.userId,
      },
    });
   
  }
  return verification;
};

export const PotholeVerificationServices = {
  createPotholeVerification,
};
