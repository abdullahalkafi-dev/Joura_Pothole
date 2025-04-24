import { Request, Response, NextFunction } from "express";
import { PotholeReportServices } from "./potholeReport.service";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const createPotholeReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reportData = req.body;
    reportData.user = req.user?._id;
    console.log(req.files);
    // const result = await PotholeReportServices.createPotholeReport(reportData);
    const result ="nai"

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
    const result = await PotholeReportServices.getAllReports(req.query);

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
    const updateData = req.body;

    const result = await PotholeReportServices.updateReport(id, updateData);

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

    const result = await PotholeReportServices.getNearbyReports(
      Number(longitude),
      Number(latitude),
      maxDistance ? Number(maxDistance) : undefined
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Nearby reports retrieved successfully",
      data: result,
    });
  }
);

const getMyReports = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
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

export const PotholeReportController = {
  createPotholeReport,
  getAllReports,
  getReportById,
  updateReport,
  updateReportStatus,
  getNearbyReports,
  getMyReports,
};
