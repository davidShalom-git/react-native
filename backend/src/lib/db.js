import mongoose from "mongoose";


export const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGODB_URI).then(()=> {
            console.log("Connected to MongoDB")
        }).catch((error)=> {
            console.log(error);
        })   
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1); // Exit process with failure
    }
}