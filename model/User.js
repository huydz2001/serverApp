import mongoose from 'mongoose';
const { Schema } = mongoose;

export const userSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String },
    password: { type: String,require:true },
    img:{type:String},
    fcm:{type:String}
},{ timestamps: true });

const UserModel = mongoose.model('TM.User', userSchema);
export default UserModel;
