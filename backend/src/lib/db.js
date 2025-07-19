import mongoose from "mongoose";


export const connectDB = async()=>{
    try{
        const con = await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected")
    }catch (error){
        console.log(`Database Connection Failed error : ${error}`)
    
    }
}