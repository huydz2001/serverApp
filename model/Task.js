    import mongoose from 'mongoose';
    import { userSchema } from './User.js';
    const { Schema } = mongoose;

 export  const taskSchema = new Schema({
        title: { type: String, required: true },
        detail: { type: String },
        timeStart: { type: Date, required: true },
        timeEnd: { type: Date, required: true },
        members: [{ type: userSchema }],
        status: { type: String,require:true },
        createBy: { type: userSchema },
    },{timestamps:true});

    const TaskModel = mongoose.model('TM.Task', taskSchema);
    export default TaskModel;
