import { StatusCodes } from "http-status-codes";
import { QueryBuilder } from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import PotholeReportCacheManage from "./potholeReport.cacheManage";
import {
  TReturnPotholeReport,
  TPotholeReport,
} from "./potholeReport.interface";
import { PotholeReport } from "./potholeReport.model";
import { User } from "../user/user.model";

const createPotholeReport = async (
  reportData: TPotholeReport
): Promise<TReturnPotholeReport.createReport> => {
  console.log(reportData, "reportData");
  const user = reportData.user;
  const isExistingUser = await User.isExistUserById(user.toString());
  if (!isExistingUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const { isEligible, existingReport, daysSinceLastReport } =
    await PotholeReport.checkReportEligibility(
      reportData.location.coordinates[0],
      reportData.location.coordinates[1],
      reportData.issue
    );
  console.log(
    isEligible,
    existingReport,
    daysSinceLastReport,
    "isEligible, existingReport, daysSinceLastReport"
  );

  if (!isEligible && existingReport) {
    const daysLeft = 30 - daysSinceLastReport!;
    throw new AppError(
      StatusCodes.CONFLICT,
      `A similar report exists (${daysSinceLastReport} days old). Wait ${daysLeft} more days.`
    );
  }

  const newReport = await PotholeReport.create(reportData);
  await PotholeReportCacheManage.updateReportCache(newReport._id.toString());
  return newReport;
};

const getAllReports = async (
  query: Record<string, unknown>,
  user: any
): Promise<TReturnPotholeReport.getAllReports> => {

  const cached = await PotholeReportCacheManage.getCacheListWithQuery(query);
  if (cached) return cached;

  let baseQuery = PotholeReport.find();
  
  // Filter out resolved and rejected reports for regular users
  if (user.role === "USER") {
    baseQuery = baseQuery.where({ status: { $nin: ["resolved", "rejected"] } });
  }

  const reportQuery = new QueryBuilder(baseQuery, query)
    .search(["description", "location.address"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reportQuery.modelQuery;
  const meta = await reportQuery.countTotal();

  await PotholeReportCacheManage.setCacheListWithQuery(query, { result, meta });
  return { result, meta };
};

const getReportById = async (
  id: string
): Promise<
  TReturnPotholeReport.getSingleReport & { potholeVerification: any }
> => {
  // console.log(id, "id");
  const report = await PotholeReport.findById(id).populate("user").lean();
  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, "Report not found");
  }
  const userId = report.user._id.toString();

  const potholeVerification = await PotholeReport.find({
    user: userId,
    potholeId: id,
  })
    .select("userId")
    .lean();
  return { ...report, potholeVerification };
};

const updateReport = async (
  id: string,
  updateData: Partial<TPotholeReport>
): Promise<TReturnPotholeReport.updateReport> => {
  const report = await PotholeReport.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, "Report not found");
  }

  await PotholeReportCacheManage.updateReportCache(id);
  return report;
};

const updateReportStatus = async (
  id: string,
  status: "open" | "in progress" | "resolved" | "rejected"
): Promise<TReturnPotholeReport.updateReportStatus> => {
  const report = await PotholeReport.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, "Report not found");
  }

  await PotholeReportCacheManage.updateReportCache(id);
  return report;
};

const getNearbyReports = async (
  longitude: number,
  latitude: number,
  maxDistance: number = 1000
): Promise<TPotholeReport[]> => {
  return PotholeReport.findReportsNearLocation(
    [longitude, latitude],
    maxDistance
  );
};

const getMyReports = async (
  userId: string,
  query: Record<string, unknown>
): Promise<TReturnPotholeReport.getAllReports> => {
  const attachedQuery = {
    ...query,
    user: userId,
  };

  const reportQuery = new QueryBuilder(
    PotholeReport.find({ user: userId }),
    query
  )
    .search(["description", "location.address"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reportQuery.modelQuery;
  const meta = await reportQuery.countTotal();

  return { result, meta };
};
const getStats = async () => {
  const totalReports = await PotholeReport.countDocuments();
  const totalResolved = await PotholeReport.countDocuments({
    status: "resolved",
  });
  const totalInProgress = await PotholeReport.countDocuments({
    status: "in progress",
  });
  const totalRejected = await PotholeReport.countDocuments({
    status: "rejected",
  });
  const analyticsData = [
    {
      name: "totalReports",
      value: totalReports,
    },
    {
      name: "open",
      value: totalReports - (totalResolved + totalInProgress + totalRejected),
    },
    {
      name: "resolved",
      value: totalResolved,
    },
    {
      name: "inProgress",
      value: totalInProgress,
    },
    {
      name: "rejected",
      value: totalRejected,
    },
  ];

  return analyticsData;
};

export const PotholeReportServices = {
  createPotholeReport,
  getAllReports,
  getReportById,
  updateReport,
  updateReportStatus,
  getNearbyReports,
  getMyReports,
  getStats,
};
