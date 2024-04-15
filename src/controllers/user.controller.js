import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation of the details 
    // check if user already exists : username or email
    //check for images and avatar and upload on cloudinary if present
    // create user object
    // create entry in db
    // remove password and refresh token field
    // check for user creation
    // return response
    
    const { fullName, email, password, username } = req.body;
    console.log("email:", email)
    

    if ([fullName,email.password,username].some((field)=>field?.trim()===""))
    {
        throw new ApiError(400,"All fields are necessary")
    }
    
    const existingUser=User.findOne({
        $or:[{ username } , { email }]
    })

    if (existingUser)
    {
        throw new ApiError(409, "Email/Username already exists");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar image Required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPathLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Avatar image Required");
    }

    const user=await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser)
    {
        throw new ApiError(500, "Something went wrong wrong while registering the user");
    }
    
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Successfully Registered"))
});

export { registerUser };
