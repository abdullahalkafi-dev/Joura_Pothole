import { Model, Types } from "mongoose";

export type TPotholeReport = {
  issue: "Pothole" | "Manhole" | "Road Crack" | "Water Leakage";
  severityLevel: "Mild" | "Moderate" | "Severe";
  location: {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  description: string;
  user: Types.ObjectId; 
  status: "open" | "in progress" | "resolved" | "rejected";
  images?: string[];
  videos?: string[];
  verifiedBy?: [Types.ObjectId]; 
  createdAt: Date;
  updatedAt: Date;
};










export interface PotholeReportModel extends Model<TPotholeReport> {
  isExistReportById(id: string): Promise<TPotholeReport | null>;
  findReportsNearLocation(
    coordinates: [number, number],
    maxDistance?: number
  ): Promise<TPotholeReport[]>;
  checkReportEligibility(
    latitude: number,
    longitude: number,
    issue: string,
    maxDistance?: number
  ): Promise<{
    isEligible: boolean;
    existingReport?: TPotholeReport;
    daysSinceLastReport?: number;
  }>;
}

export namespace TReturnPotholeReport {
  export type Meta = {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };

  export type getAllReports = {
    result: TPotholeReport[];
    meta?: Meta;
  };

  export type getSingleReport = TPotholeReport;
  export type createReport = TPotholeReport;
  export type updateReport = TPotholeReport;
  export type updateReportStatus = TPotholeReport;
  export type deleteReport = TPotholeReport;
}