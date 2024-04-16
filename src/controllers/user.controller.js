import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
//import jwt from "jsonwebtoken";
//import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try { 
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    return { refreshToken, accessToken };
  }
  catch (error) {
    throw new ApiError(500, "Something Went Wrong in generating Access and Refresh Tokens");
    
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }


  //console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
    }
    
    
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get user credentials from frontend
  //check based on username/email
  // verify the password from db
  // generate access token
  // generate refresh token
  // send tokens as cookie
  // return res
  
  const {username , email, password } = req.body;

  if (!username && !email)
  {
    throw new ApiError(400, "UserName or Email is required")
  }
  
  const user = User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user)
  {
    throw new ApiError(404, " User does not Exist");
  }
  
  const passwordValid = await user.isPasswordCorrect(password);

  if (!passwordValid)
  {
    throw new ApiError(401, " Invalid Credentials");
  }
  const {refreshToken, accessToken}=await generateAccessAndRefreshTokens(user._id)  

  const loggedUser = await User.findById(user._id).select("-password  -refreshToken")
  
  const options = {
    httpOnly: true,
    secure:true
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200,
        {
        user:accessToken, refreshToken, loggedUser
      })
  )
});

const logoutUser = asyncHandler(async (req, res) => {
  
  await User.findByIdAndUpdate(req.user._id,
    {
      $set: {
      refreshToken:undefined
    }
    })
   const options = {
     httpOnly: true,
     secure: true,
  };
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, "User Successfully Logged Out"))
  
})

export {
  registerUser,
  loginUser,
  logoutUser
};