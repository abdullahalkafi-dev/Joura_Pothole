import { StatusCodes } from "http-status-codes";
import { QueryBuilder } from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import UserCacheManage from "./user.cacheManage";
import { TReturnUser, TUser } from "./user.interface";
import { User } from "./user.model";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import { AuthService } from "../auth/auth.service";

const createUser = async (user: TUser): Promise<Partial<TUser>> => {
  // Check if the user already exists
  const existingUser = await User.findOne({ email: user.email });
  if (existingUser) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User with this email already exists"
    );
  }
  const newUser = await User.create(user);
  if (!newUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User creation failed");
  }
  //send mail
  const otp = generateOTP();
  console.log(otp, "otp");
  const value = {
    otp,
    email: newUser.email,
    name: newUser.firstName!,
    theme: "theme-blue" as
      | "theme-green"
      | "theme-red"
      | "theme-purple"
      | "theme-orange"
      | "theme-blue",
    expiresIn: 30,
  };
  await AuthService.resendOtp(user.email);

  await UserCacheManage.updateUserCache(newUser._id.toString());
  return newUser;
};
const getAllUsers = async (
  query: Record<string, unknown>
): Promise<TReturnUser.getAllUser> => {
  const cached = await UserCacheManage.getCacheListWithQuery(query);
  if (cached) return cached;

  const userQuery = new QueryBuilder(User.find(), query)
    .search(["firstName", "lastName", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await userQuery.modelQuery;
  // console.log(result);
  const meta = await userQuery.countTotal();
  await UserCacheManage.setCacheListWithQuery(query, { result, meta });
  return { result, meta };
};
const getUserById = async (
  id: string
): Promise<Partial<TReturnUser.getSingleUser>> => {
  // First, try to retrieve the user from cache.
  const cachedUser = await UserCacheManage.getCacheSingleUser(id);
  if (cachedUser) return cachedUser;
  // If not cached, query the database using lean with virtuals enabled.
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  // Cache the freshly retrieved user data.
  await UserCacheManage.setCacheSingleUser(id, user);
  return user;
};
const getMe = async (
  id: string
): Promise<Partial<TReturnUser.getSingleUser>> => {
  // console.log(id);
  if (!id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }
  // First, try to retrieve the user from cache.
  const cachedUser = await UserCacheManage.getCacheSingleUser(id);
  if (cachedUser) return cachedUser;
  // If not cached, query the database using lean with virtuals enabled.
  const user = await User.findById(id);
  // console.log(user);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  // Cache the freshly retrieved user data.
  await UserCacheManage.setCacheSingleUser(id, user);
  return user;
};
const updateUser = async (
  id: string,
  updateData: Partial<TReturnUser.updateUser>
): Promise<Partial<TReturnUser.updateUser>> => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  //remove cache
  await UserCacheManage.updateUserCache(id);

  //set new cache
  UserCacheManage.setCacheSingleUser(id, user);
  return user;
};
const updateUserByToken = async (
  id: string,
  updateData: Partial<TReturnUser.updateUser>
): Promise<Partial<TReturnUser.updateUser>> => {
  // console.log(updateData,"updateData");
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  //remove cache
  await UserCacheManage.updateUserCache(id);

  //set new cache
  UserCacheManage.setCacheSingleUser(id, user);
  return user;
};
const updateUserActivationStatus = async (
  id: string,
  status: "active" | "delete"
): Promise<TReturnUser.updateUserActivationStatus> => {
  // console.log(status);
  // console.log(id);

  const user = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true }
  );
  // console.log(user);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  //remove cache
  await UserCacheManage.updateUserCache(id);

  //set new cache
  // UserCacheManage.setCacheSingleUser(id, user);
  return user;
};
const updateUserRole = async (
  id: string,
  role: "USER" | "ADMIN"
): Promise<Partial<TReturnUser.updateUserRole>> => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true }
  );
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  //remove cache
  await UserCacheManage.updateUserCache(id);

  return user;
};

const changeUserStatus = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  let status = user.status;
  if (user.role === "ADMIN") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You can't change admin status"
    );
  }
  if (user.status === "active") {
    status = "delete";
  } else {
    status = "active";
  }
  await User.findByIdAndUpdate(userId, { status }, { new: true });
  //remove cache
  await UserCacheManage.updateUserCache(userId);
  return user;
};
export const UserServices = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserActivationStatus,
  updateUserRole,
  getMe,
  updateUserByToken,
  changeUserStatus,
};
