import express, { Router } from "express";
import { UserRoutes } from "../app/modules/user/user.route";
import { AuthRoutes } from "../app/modules/auth/auth.route";
import { PotholeReportRoutes } from "../app/modules/potholeReport/potholeReport.route";
import { PotholeVerificationRoutes } from "../app/modules/potholeVerification/potholeVerification.route";


const router: Router = express.Router();

const apiRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/pothole",
    route: PotholeReportRoutes,
  },
  {
    path:"/pothole-verification",
    route: PotholeVerificationRoutes,
  }

];
apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
