import express, { Router } from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "./user.constant";

const router = express.Router();

// User routes
router.post(
  "/",
  validateRequest(UserValidation.createUser),
  UserController.createUser
);
router.get("/",auth(USER_ROLES.ADMIN), UserController.getAllUsers);

router.get("/getme",auth(), UserController.getMe);
router.get("/:id", UserController.getUserById);
router.patch(
  "/",
  auth(),
  fileUploadHandler,
  validateRequest(UserValidation.updateUser),
  UserController.updateUserByToken
);
router.patch(
  "/:id/status",
  validateRequest(UserValidation.updateUserActivationStatus),
  UserController.updateUserActivationStatus
);
router.patch(
  "/:id/role",
  validateRequest(UserValidation.updateUserRole),
  UserController.updateUserRole
);
router.patch(
  "/:id",
  auth(),
  fileUploadHandler,
  validateRequest(UserValidation.updateUser),
  UserController.updateUser
);
router.delete(
  "/delete",
  auth(),
  UserController.changeUserStatus
);



export const UserRoutes: Router = router;
