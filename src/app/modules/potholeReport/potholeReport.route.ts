import express, { Router } from "express";
import { PotholeReportController } from "./potholeReport.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../user/user.constant";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import validateRequest from "../../middlewares/validateRequest";
import { PotholeReportValidation } from "./potholeReport.validation";

const router = express.Router();

router.post(
  "/",
  auth(),
  fileUploadHandler,
  validateRequest(PotholeReportValidation.createReportValidation),
  PotholeReportController.createPotholeReport
);

router.get("/", auth(), PotholeReportController.getAllReports);

// router.get("/stats", PotholeReportController.getStats);
router.patch(
  "/bulk-update-status",
  auth(USER_ROLES.ADMIN),
  PotholeReportController.bulkUpdateReportStatus
);

router.patch(
  "/:id",
  auth(USER_ROLES.ADMIN),
  fileUploadHandler,
  validateRequest(PotholeReportValidation.updateReportValidation),
  PotholeReportController.updateReport
);


router.patch(
  "/:id/status",
  auth(USER_ROLES.ADMIN),
  validateRequest(PotholeReportValidation.updateReportStatusValidation),
  PotholeReportController.updateReportStatus
);

router.get("/nearby", PotholeReportController.getNearbyReports);

router.get("/my-reports", auth(), PotholeReportController.getMyReports);
router.get("/stats", PotholeReportController.getStats);
router.get("/:id", PotholeReportController.getReportById);
router.delete(
  "/bulk-delete",
  auth(USER_ROLES.ADMIN),
  PotholeReportController.bulkDeletePotholeReports
);
router.delete(
  "/:id",
  auth(USER_ROLES.ADMIN),
  PotholeReportController.deletePotholeReport
);
export const PotholeReportRoutes: Router = router;
