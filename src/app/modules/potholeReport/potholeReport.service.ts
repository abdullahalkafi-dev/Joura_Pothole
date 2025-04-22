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
  query: Record<string, unknown>
): Promise<TReturnPotholeReport.getAllReports> => {
  const cached = await PotholeReportCacheManage.getCacheListWithQuery(query);
  if (cached) return cached;

  const reportQuery = new QueryBuilder(PotholeReport.find(), query)
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
): Promise<TReturnPotholeReport.getSingleReport> => {
  const cachedReport = await PotholeReportCacheManage.getCacheSingleReport(id);
  if (cachedReport) return cachedReport;

  const report = await PotholeReport.findById(id);
  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, "Report not found");
  }

  await PotholeReportCacheManage.setCacheSingleReport(id, report);
  return report;
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
  const cached = await PotholeReportCacheManage.getCacheListWithQuery(
    attachedQuery
  );
  if (cached) return cached;

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

  await PotholeReportCacheManage.setCacheListWithQuery(query, { result, meta });
  return { result, meta };
};

export const PotholeReportServices = {
  createPotholeReport,
  getAllReports,
  getReportById,
  updateReport,
  updateReportStatus,
  getNearbyReports,
  getMyReports,
};
