import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { PotholeReport } from "../potholeReport/potholeReport.model";
import { User } from "../user/user.model";
import { TPotholeVerification } from "./potholeVerification.interface";
import { PotholeVerification } from "./potholeVerification.model";
import PotholeReportCacheManage from "../potholeReport/potholeReport.cacheManage";

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
  const existingVerification = await PotholeVerification.findOne({
    userId: userId,
    potholeId: potholeId,
  });
  if (existingVerification) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Pothole already voted by this user"
    );
  } 

  const verification = await PotholeVerification.create(payload);
  if (verification) {
    console.log(verification);
    console.log(verification.userId);
 const result=   await PotholeReport.findByIdAndUpdate(potholeId, {
      $push: {
        verifiedBy: verification.userId,
      },
    });
    if(result){
      PotholeReportCacheManage.updateReportCache(result._id.toString());
    }
  }
  return verification;
};

export const PotholeVerificationServices = {
  createPotholeVerification,
};
