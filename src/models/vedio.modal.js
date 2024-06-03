import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const vedioSchema= new mongoose.Schema({
    videoFile:{
        type:String,
        required:true,
    },
    thumbnail:{ 
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

vedioSchema.plugin(mongooseAggregatePaginate)

export const Vedio=mongoose.model("Vedio",vedioSchema)

