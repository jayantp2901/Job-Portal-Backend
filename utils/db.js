import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongourl = process.env.MONGO_URI
        await mongoose.connect(mongourl)
        console.log('mongodb connected successfully');
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;