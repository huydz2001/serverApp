import mongoose from 'mongoose';
import UserModel, { userSchema } from './User.js';
import  { taskSchema } from './Task.js';
const { Schema } = mongoose;

const familySchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, default: null },
    members: [{ type: userSchema}], // Sử dụng kiểu ObjectId và tham chiếu đến UserModel
    createBy: { type:userSchema},
    tasks:[{type:taskSchema}]
});

const FamilyModel = mongoose.model('TM.Family', familySchema);
export default FamilyModel;