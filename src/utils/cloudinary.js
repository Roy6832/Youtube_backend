import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// Configuration
// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_ClOUD_NAME, 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//     api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
// });

cloudinary.config({ 
   cloud_name: "diiw8bnpf", 
   api_key: "316624688672322", 
   api_secret:"fTjYif0TfS-7WLEo1pQYOSWbEkI"  // Click 'View Credentials' below to copy your API secret
});

const uploadCloudinary=async (localFilePath)=>{
   try {
      if(!localFilePath) return null
     const response= await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
      })
      console.log("file has been uploaded",response)
      return response
   } catch (error) {
      fs.unlinkSync(localFilePath) // remove the locally saved temporary file as upload operation got failed
      return null
   }
}
export {uploadCloudinary}
