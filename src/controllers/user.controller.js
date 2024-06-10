import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.modal.js"
import { uploadCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from 'jsonwebtoken'

const genrateAccessAndRefreshTokens=async(userId)=>{
    try {
    const user= await User.findById(userId)
    const accessToken=await user.genrateAccessToken()
    const refreshToken=await  user.genrateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Somethings went wrong while generating refresh and access token")   
    }
}

const RefreshAccessToken=asyncHandler(async(req,res)=>{
    const refreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!refreshToken) throw new ApiError(401,"unauthorized request")
   try {
     const decodeRefreshToken= jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user=await User.findById(decodeRefreshToken._id)
     if (!user) {
         throw new ApiError(401, "Invalid refresh token")
     }
     if(user?.refreshToken !== refreshToken) throw new ApiError(401,"Refresh token is expired or used")
     const {accessToken,refreshToken:newRefreshToken}=genrateAccessAndRefreshTokens(user._id)
     const options={
         httpOnly:true,
         secure:true
     }
     return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(new ApiResponse(200,{
         accessToken,newRefreshToken
      },"Access token refreshed"))
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
   }

})

const requestUser=asyncHandler(async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const {email,username,password,fullName}=req.body
    // console.log(req.body)
    // console.log(req.files)

    if([fullName,email,password,username].some(x => x?.trim === "")) throw new ApiError(400, "All fields are required")

    const isExits= await User.findOne({
        $or:[{email},{username}]
    })

    if(isExits) throw new ApiError(409, "Username or email is already exits")
    // console.log("avatarLocalPath",req.files)
    const avatarLocalPath= req.files?.avatar[0]?.path
    // console.log(avatarLocalPath)
    // console.log('coverImageLocalPath', req.files)
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    // console.log(coverImageLocalPath)
    if(!avatarLocalPath) throw new ApiError(400, "Avatar field is required")
    // console.log('files',req.files)

    const avatar= await uploadCloudinary(avatarLocalPath)
    const cover= await uploadCloudinary(coverImageLocalPath)

    if(!avatar) throw new ApiError(400, "Avatar12 field is required")

    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:cover?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
     const createdUser= await User.findById(user._id).select("-password -refreshToken")
     if(!createdUser) throw new ApiError(500, "Something went wrong while registering the user")
    
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
})

const loginUser=asyncHandler(async (req,res)=>{
   // get data from req.body
   // username or email
   // find the user
   // commaparision
   // access or refresh token
   // send it in form of cookies

   const {username,email,password}=req.body
   if(!username && !email)  throw new ApiError(400,"Username or Password is required")  
   const user= await User.findOne({
      $or:[{email},{username}]
   })
   if(!user) throw new ApiError(400, "User does not exits")

    const isCorrect= await user.isPasswordCorrect(password)

    if(!isCorrect) throw new ApiError(401,"Password is incorrect")
      
    const {accessToken,refreshToken}=  await genrateAccessAndRefreshTokens(user._id)
    const loggedIn= await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(200,{
           accessToken,refreshToken,user:loggedIn
        }, "User loggedin successfully"), 
     )
})

const logout=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
const options={
    httpOnly:true,
    secure:true
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(
   new ApiResponse(200,{},"User Logout successfully")
)
})

const changePassword=asyncHandler(async(req,res)=>{
    const {password,newPassword}=req.body
    if(!newPassword && !password) throw new ApiError(401,"Please adds Password")
        const user= await User.findById(req.user._id)
        const isPasswordMatch= await user.isPasswordCorrect(password)
        if (!isPasswordMatch) {
            throw new ApiError(400, "Invalid password")
        }
        user.password = newPassword
       await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password has been changed Sucessfully"))
    
})

const getCurentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,'Current user fetched successfully'))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!fullName && !email)  throw new ApiError(400,"All fields are required")
        const user = User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName,
                    email: email
                }
            },
            {new: true}
    
        ).select("-password -refreshToken")

        return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateAvatar=asyncHandler(async(req,res)=>{
    const avatarLocal=req.file?.path
    if(!avatarLocal) throw new ApiError(401,"Missing avatar file")
    
    const avatar=await uploadCloudinary(avatarLocal)
    if(!avatar.url) throw new ApiError(401,"there is some error to upload file on cloudinary.")
    const user=await User.findByIdAndUpdate(req.user?._id,{
         $set:{
            avatar:avatar.url
         }
       },
        {new:true}).select("-password -refreshToken")

        return res
        .status(200)
        .json(new ApiResponse(200,"Avatar has been changed successfully"))
    
})

const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverLocalPath=req.file?.path
    if(!coverLocalPath) throw new ApiError(401,"Missing avatar file")
    
    const coverImage=await uploadCloudinary(coverLocalPath)
    if(!coverImage.url) throw new ApiError(401,"there is some error to upload file on cloudinary.")
    const user=await User.findByIdAndUpdate(req.user?._id,{
         $set:{
            coverImage:coverImage.url
         }
       },
        {new:true}).select("-password -refreshToken")

        return res
        .status(200)
        .json(new ApiResponse(200,"coverImage has been changed successfully"))
    
})

export {requestUser,loginUser,logout,RefreshAccessToken,changePassword,getCurentUser,updateAvatar,updateCoverImage,updateAccountDetails}