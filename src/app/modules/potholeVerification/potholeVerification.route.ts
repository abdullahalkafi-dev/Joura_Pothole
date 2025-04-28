import { Router } from "express";

const router = Router();

import { PotholeVerificationController } from "./potholeVerification.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PotholeVerificationValidation } from "./potholeVerification.validation";

router.post(
  "/create-pothole-verification",
  validateRequest(
    PotholeVerificationValidation.createPotholeVerificationValidation
  ),
  PotholeVerificationController.createPotholeVerification
);

export const PotholeVerificationRoutes:Router = router;