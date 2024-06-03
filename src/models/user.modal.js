import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

const userSchema= new mongoose.Schema({
    username:{
       type:String,
       required:true,
       unique:true,
       lowercase:true,
       trim:true,
       index:true
    },
    email:{
       type:String,
       required:true,
       unique:true,
       lowercase:true,
       trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
     },
     avatar:{
        type:String,
        required:true
     },
     coverImage:{
        type:String,
        required:true
     },
     watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Vedio"
         }
     ],
     password:{
        type:String,
        required:[true,"Password is required"],
     },
     refreshToken:{
        type:String
     }

},{timestamps:true})

userSchema.pre("save",async function (next){
   if(!this.isModified("password")) return next()
   this.password=await bcrypt.hash(this.password,10)
   next()
})

userSchema.methods.isPasswordCorrec = async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.genrateAccessToken = async function (){
  return await jwt.sign({
      _id:this._id,
      username:this.username,
      email:this.email,
      fullname:this.fullname
   },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
)
}

userSchema.methods.genrateRefreshToken = async function (){
  return await jwt.sign({
      _id:this._id,
   },
   process.env.REFRESH_TOKEN_SECRET,
  { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
)
}

export const User=mongoose.model("User",userSchema)
