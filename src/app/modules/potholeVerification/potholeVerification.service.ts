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
const getVerificationByPotholeId = async (id: string) => {
  const verification = await PotholeVerification.aggregate([
    { $match: { potholeId: id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        users: { $push: "$userId" }
      }
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        users: 1,
        _id: 0
      }
    }
  ]);

  if (!verification || verification.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "No verifications found for this pothole");
  }

  // Create a summary object with all status types
  const summary = {
    potholeId: id,
    totalVerifications: 0,
    statusCounts: {
      "Yes": 0,
      "No": 0,
      "I don't know": 0
    },
    details: verification
  };

  // Update the summary with actual counts
  verification.forEach(item => {
    summary.totalVerifications += item.count;
    // Type assertion to ensure item.status is a valid key
    summary.statusCounts[item.status as keyof typeof summary.statusCounts] = item.count;
  });

  return summary;
};


export const PotholeVerificationServices = {
  createPotholeVerification,
  getVerificationByPotholeId,
};
