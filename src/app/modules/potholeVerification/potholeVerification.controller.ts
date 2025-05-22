import { Request, Response, NextFunction } from "express";
import { PotholeVerificationServices } from "./potholeVerification.service";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const createPotholeVerification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await PotholeVerificationServices.createPotholeVerification(
      payload
    );

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Pothole verification created successfully",
      data: result,
    });
  }
);
const getVerificationByPotholeId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await PotholeVerificationServices.getVerificationByPotholeId(
      id
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Pothole verification retrieved successfully",
      data: result,
    });
  }
);

export const PotholeVerificationController = {
  createPotholeVerification,
  getVerificationByPotholeId,
};
