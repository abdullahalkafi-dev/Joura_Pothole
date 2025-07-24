import { Schema, model } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { PotholeReportModel, TPotholeReport } from "./potholeReport.interface";

const potholeReportSchema = new Schema<TPotholeReport, PotholeReportModel>(
  {
    issue: {
      type: String,
      enum: {
        values: ["Pothole", "Manhole", "Road Crack", "Water Leakage"],
        message: "{VALUE} is not a valid issue type",
      },
      required: [true, "Issue type is required"],
    },
    severityLevel: {
      type: String,
      enum: {
        values: ["Mild", "Moderate", "Severe"],
        message: "{VALUE} is not a valid severity level",
      },

      required: [true, "Severity level is required"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        minlength: [5, "Address must be at least 5 characters long"],
        maxlength: [200, "Address can't be more than 200 characters"],
      },
      coordinates: {
        type: [Number],
        required: [true, "Coordinates are required"],
        validate: {
          validator: function (v: number[]) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 && // longitude
              v[1] >= -90 &&
              v[1] <= 90
            ); // latitude
          },
          message:
            "Coordinates must be [longitude, latitude] with valid ranges",
        },
      },
    },
    description: {
      type: String,
      trim: true,

    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["open", "in progress", "resolved", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "open",
    },
    verifiedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    images: {
      type: [String],
    },
    videos: {
      type: [String],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes
potholeReportSchema.index({
  "location.coordinates": "2dsphere",
  issue: 1,
  createdAt: -1,
});
potholeReportSchema.index({ status: 1 });
potholeReportSchema.index({ user: 1 });

// // Add virtuals
// potholeReportSchema.virtual("reportAge").get(function (this: TPotholeReport) {
//   const now = new Date();
//   const diffInMs = now.getTime() - this.createdAt.getTime();
//   const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
//   return diffInHours < 24
//     ? `${diffInHours} hours`
//     : `${Math.floor(diffInHours / 24)} days`;
// });

// Add static methods
potholeReportSchema.statics.isExistReportById = async function (id: string) {
  return this.findById(id);
};

potholeReportSchema.statics.findReportsNearLocation = async function (
  coordinates: [number, number],
  maxDistance = 1000
) {
  return this.find({
    "location.coordinates": {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistance,
      },
    },

    status: { $nin: ["resolved", "rejected"] },
  });
};

potholeReportSchema.statics.checkReportEligibility = async function (
  longitude: number,
  latitude: number,
  issue: string,
  maxDistance = 10
) {
  const existingReport = await this.findOne({
    issue,
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  }).sort({ createdAt: -1 });

  //     No existing report → eligible to report
  if (!existingReport) {
    return {
      isEligible: true,
    };
  }

  const daysSinceLastReport = Math.floor(
    (new Date().getTime() - existingReport.createdAt.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  //         Existing report is older than 30 days → eligible
  if (daysSinceLastReport > 30) {
    return {
      isEligible: true,
      existingReport,
      daysSinceLastReport,
    };
  }

  // Recent existing report → not eligible
  return {
    isEligible: false,
    existingReport,
    daysSinceLastReport,
  };
};

potholeReportSchema.plugin(mongooseLeanVirtuals);

export const PotholeReport = model<TPotholeReport, PotholeReportModel>(
  "PotholeReport",
  potholeReportSchema
);
