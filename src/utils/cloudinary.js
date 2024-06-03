import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: CLOUDINARY_API_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadCloudinary=async (localFilePath)=>{
   try {
      if(!localFilePath) return null
     const response= await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
      })
      console.log("file has been uploaded",response.url)
      return response
   } catch (error) {
      fs.unlinkSync(localFilePath) // remove the locally saved temporary file as upload operation got failed
      return null
   }
}
export {uploadCloudinary}
