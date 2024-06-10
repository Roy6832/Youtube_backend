import dotenv from 'dotenv'
import connectDB from './db/index.js'
import {app} from './app.js'

dotenv.config({path:'.env'})

// const app=express()

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`server is running at port: ${process.env.PORT}`)
    })
})
.catch(err=>{
    console.log("MongoDb connection failed !! ",err)
})

// (async()=>{
//    try {
//     mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//     app.on("error",(error)=>{
//         console.log("Errr: ",error)
//         throw error
//     })
//     app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on Port ${process.env.PORT}`)
//     })
//    } catch (error) {
//      console.log("error",error)
//    }
// })()