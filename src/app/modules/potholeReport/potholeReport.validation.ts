import { z } from "zod";

const createReportValidation = z.object({
  data: z.object({
    issue: z.enum(["Pothole", "Manhole", "Road Crack", "Water Leakage"], {
      required_error: "Issue type is required",
    }),
    severityLevel: z.enum(["Mild", "Moderate", "Severe"], {
      required_error: "Severity level is required",
    }),
    location: z.object({
      address: z
        .string()
        .min(5, "Address must be at least 5 characters long")
        .max(200, "Address can't be more than 200 characters"),
      coordinates: z
        .array(z.number())
        .length(
          2,
          "Coordinates must be [longitude, latitude] with valid ranges"
        ),
    }),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(3000, "Description can't be more than 1000 characters").optional(),
    user: z.string().nonempty("User ID is required"),
  }),
});

const updateReportValidation = z.object({
  data: z.object({
    issue: z
      .enum(["Pothole", "Manhole", "Road Crack", "Water Leakage"], {
        required_error: "Issue type is required",
      })
      .optional(),
    severityLevel: z
      .enum(["Mild", "Moderate", "Severe"], {
        required_error: "Severity level is required",
      })
      .optional(),
    location: z
      .object({
        address: z
          .string()
          .min(5, "Address must be at least 5 characters long")
          .max(200, "Address can't be more than 200 characters"),
        coordinates: z
          .array(z.number())
          .length(
            2,
            "Coordinates must be [longitude, latitude] with valid ranges"
          ),
      })
      .optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(3000, "Description can't be more than 1000 characters"),
    status: z
      .enum(["open", "in progress", "resolved", "rejected"], {
        required_error: "Status is required",
      })
      .optional(),
  }),
});

const updateReportStatusValidation = z.object({
  body: z.object({
    status: z.enum(["open", "in progress", "resolved", "rejected"], {
      required_error: "Status is required",
    }),
  }),
});

export const PotholeReportValidation = {
  createReportValidation,
  updateReportValidation,
  updateReportStatusValidation
};