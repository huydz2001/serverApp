// taskRoutes.js
import express from 'express';
import FamilyModel from '../model/Family.js';
import TaskModel from '../model/Task.js';
import sendNoti from '../fcm_helper.js'

const taskRouter = express.Router();

// Route tạo task mới
taskRouter.post('/create', async (req, res) => {
    try {
        const { title, detail, timeStart, timeEnd, members, status, createBy, familyId } = req.body;
        console.log("****",members)
        // Kiểm tra xem gia đình có tồn tại hay không
        const family = await FamilyModel.findById(familyId);
        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại' });
        }
        // Tạo task mới
        const newTask = new TaskModel({
            title,
            detail,
            timeStart,
            timeEnd,
            members,
            status,
            createBy,
        });

        // Thêm task vào mảng tasks của gia đình
        family.tasks.push(newTask);
        members.forEach(member => {
            if (member.fcm && member._id != createBy._id) {
                console.log("123","Send to +"+member.fcm)
                const notificationTitle = 'Bạn có một công việc mới';
                const notificationBody = `Bạn có công việc mới được tạo bởi ${createBy.userName} trong gia đình ${family.name}`;
                sendNoti(member.fcm, notificationTitle, notificationBody);
            }
        });
        await family.save();
        res.status(201).json({ message: 'Tạo task thành công', data: newTask });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Route lấy danh sách task trong gia đình
taskRouter.get('/familyTasks/:familyId', async (req, res) => {
    try {
        const { familyId } = req.params;

        // Kiểm tra xem gia đình có tồn tại hay không
        const family = await FamilyModel.findById(familyId);
        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại' });
        }

        // Lấy danh sách task trong gia đình
        const familyTasks = family.tasks;
        res.status(200).json({ data: familyTasks });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Route xoá task
taskRouter.delete('/:taskId/delete', async (req, res) => {
    try {
        const { taskId } = req.params;

        // Tìm và xoá task trong mảng tasks của gia đình
        const family = await FamilyModel.findOneAndUpdate(
            { 'tasks._id': taskId },
            { $pull: { tasks: { _id: taskId } } },
            { new: true }
        );

        if (!family) {
            return res.status(404).json({ message: 'Task không tồn tại' });
        }

        res.status(200).json({ message: 'Xoá task thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Route sửa task
taskRouter.post('/:taskId/update', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, detail, timeStart, timeEnd, members, status, createBy } = req.body;
            console.log(title)
        // Tìm thông tin task trong mảng tasks của gia đình
        const family = await FamilyModel.findOne({ 'tasks._id': taskId });

        if (!family) {
            return res.status(404).json({ message: 'Task không tồn tại' });
        }

        // Lấy danh sách thành viên trước khi cập nhật
        const oldMembers = family.tasks.find(task => task._id == taskId).members.map(member => member._id.toString());

        // Tạo một bản sao của danh sách thành viên để so sánh sau cùng
        const oldMembersCopy = [...oldMembers];

        // Cập nhật thông tin task trong mảng tasks của gia đình
        await FamilyModel.findOneAndUpdate(
            { 'tasks._id': taskId },
            {
                $set: {
                    'tasks.$.title': title,
                    'tasks.$.detail': detail,
                    'tasks.$.timeStart': timeStart,
                    'tasks.$.timeEnd': timeEnd,
                    'tasks.$.members': members,
                    'tasks.$.status': status,
                    'tasks.$.createBy': createBy,
                },
            },
            { new: true }
        );

        // Lấy danh sách thành viên sau khi cập nhật
        const newMembers = members.map(member => member._id.toString());

        // Lọc ra những thành viên mới được thêm vào task
        const addedMembers = newMembers.filter(member => !oldMembersCopy.includes(member));

        // Gửi thông báo cho những thành viên mới được thêm vào task
        addedMembers.forEach(memberId => {
            const newMember = members.find(member => member._id.toString() === memberId);

            if (newMember.fcm) {
                const notificationTitle = 'Thông báo cập nhật task';
                const notificationBody = `Bạn đã được thêm vào task mới trong gia đình ${family.name}`;
                sendNoti(newMember.fcm, notificationTitle, notificationBody);
            }
        });
        console.log({
            'title': title,
            'detail': detail,
            'timeStart': timeStart,
            'timeEnd': timeEnd,
            'members': members,
            'status': status,
            'createBy': createBy,
        })
        res.status(200).json({ message: 'Cập nhật task thành công', data: 
            {
                'title': title,
                'detail': detail,
                'timeStart': timeStart,
                'timeEnd': timeEnd,
                'members': members,
                'status': status,
                'createBy': createBy,
            }
    });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});



export default taskRouter;
