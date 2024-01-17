import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();
export const connectDb = () => {
    mongoose.connect(process.env.URL_MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((res => {
        console.log("Ket noi mongodb thanh cong")
    })).catch(err => {
        console.log("Loi ket noi mongodb")
    });
}
