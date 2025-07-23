import { Request, Response, NextFunction } from "express";
import { PotholeReportServices } from "./potholeReport.service";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import AppError from "../../errors/AppError";

const createPotholeReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reportData = JSON.parse(req?.body?.data);

    let images;
    let videos;
    console.log(req.files, "req.files");
    if (req.files && "image" in req.files && req.files.image[0]) {
      images = req.files.image.map((file: Express.Multer.File) => file.path);
      reportData.images = images;
    }
    if (req.files && "media" in req.files && req.files.media[0]) {
      videos = req.files.media.map((file: Express.Multer.File) => file.path);
      reportData.videos = videos;
    }

    let temp0 = reportData.location.coordinates[0];

    reportData.location.coordinates[0] = reportData.location.coordinates[1];
    reportData.location.coordinates[1] = temp0;

    const result = await PotholeReportServices.createPotholeReport(reportData);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Pothole report created successfully",
      data: result,
    });
  }
);

const getAllReports = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await PotholeReportServices.getAllReports(req.query, user);
   
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reports retrieved successfully",
      meta: result.meta,
      data: result.result,
    });
  }
);

const getReportById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await PotholeReportServices.getReportById(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Report retrieved successfully",
      data: result,
    });
  }
);

const updateReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const reportData = JSON.parse(req?.body?.data);

    let images;
    let videos;
    console.log(req.files, "req.files");
    if (req.files && "image" in req.files && req.files.image[0]) {
      images = req.files.image.map((file: Express.Multer.File) => file.path);
      reportData.images.push(...images);
    }
    if (req.files && "media" in req.files && req.files.media[0]) {
      videos = req.files.media.map((file: Express.Multer.File) => file.path);
      reportData.videos.push(...videos);
    }
    if (reportData.location && reportData.location.coordinates) {
      let temp0 = reportData.location.coordinates[0];

      reportData.location.coordinates[0] = reportData.location.coordinates[1];
      reportData.location.coordinates[1] = temp0;
    }

    const result = await PotholeReportServices.updateReport(id, reportData);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Report updated successfully",
      data: result,
    });
  }
);

const updateReportStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await PotholeReportServices.updateReportStatus(id, status);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Report status updated successfully",
      data: result,
    });
  }
);

const getNearbyReports = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { longitude, latitude, maxDistance } = req.query;
    if (!longitude || !latitude || !maxDistance) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "latitude, longitude and maxDistance are required"
      );
    }
    console.log(req.query);

    const result = await PotholeReportServices.getNearbyReports(
      Number(longitude),
      Number(latitude),
      maxDistance ? Number(maxDistance) : undefined
    );

    const countTotal= result.length;
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Nearby reports retrieved successfully",
      data: {
        countTotal,
        result,
      },
    });
  }
);

const getMyReports = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.user);
    const userId = req.user?.id;
    console.log(userId, "userId");
    const result = await PotholeReportServices.getMyReports(userId, req.query);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Your reports retrieved successfully",
      meta: result.meta,
      data: result.result,
    });
  }
);

const getStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PotholeReportServices.getStats();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reports stats retrieved successfully",
      data: result,
    });
  }
);
const deletePotholeReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await PotholeReportServices.deletePotholeReport(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Report deleted successfully",
    });
  }
);
const bulkDeletePotholeReports = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid request data");
    }

    await PotholeReportServices.bulkDeletePotholeReports(ids);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reports deleted successfully",
    });
  }
);
const bulkUpdateReportStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || !status) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid request data");
    }

    await PotholeReportServices.bulkUpdateReportStatus(ids, status);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reports status updated successfully",
    });
  }
);

export const PotholeReportController = {
  createPotholeReport,
  getAllReports,
  getReportById,
  updateReport,
  updateReportStatus,
  getNearbyReports,
  getMyReports,
  getStats,
  deletePotholeReport,
  bulkDeletePotholeReports,
  bulkUpdateReportStatus,
};
