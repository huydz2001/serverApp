// Route đăng nhập
import express from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../model/User.js';
import TaskModel from '../model/Task.js'
import FamilyModel from '../model/Family.js'

const userRouter = express.Router();
userRouter.post('/register', async (req, res) => {
    try {
        const { userName, email, password ,img} = req.body;
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Người dùng đã tồn tại' });
        }

        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        // Tạo người dùng mới
        const newUser = new UserModel({
            userName,
            email,
            password: hashedPassword,
            img
        });
        // Lưu người dùng vào cơ sở dữ liệu
        await newUser.save();
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});
userRouter.post('/login', async (req, res) => {
    try {
        const { email, password,fcm } = req.body;

        // Kiểm tra xem người dùng có tồn tại hay không
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // So sánh mật khẩu
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Mật khẩu không chính xác' });
        }
        user.fcm = fcm
        await user.save()
        // Trả về thông tin cần thiết (ví dụ: userName, email)
        res.status(200).json({data:{id:user._id, userName: user.userName, email: user.email,image:user.img,fcm}});
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Route cập nhật thông tin cá nhân
// Trong routes/User.js
// Trong userRoutes.js
userRouter.patch('/update/:idUser', async (req, res) => {
    try {
        const { idUser } = req.params;
        const { userName, img } = req.body;
        console.log(img)

        // Kiểm tra xem người dùng có tồn tại hay không
        const user = await UserModel.findById(idUser);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Cập nhật thông tin cá nhân
        user.userName = userName || user.userName;
        user.img = img || user.img; // Cập nhật ảnh người dùng

        // Lưu thông tin mới của người dùng
        await user.save();

        // Cập nhật thông tin người dùng trong các tasks
        await TaskModel.updateMany(
            { 'members._id': user._id },
            { $set: { 'members.$.userName': user.userName, 'members.$.img': user.img } }
        );

        // Cập nhật thông tin người dùng trong các gia đình
        await FamilyModel.updateMany(
            { 'members._id': user._id },
            { $set: { 'members.$.userName': user.userName, 'members.$.img': user.img } }
        );

        await FamilyModel.updateMany(
            { 'tasks.members._id': user._id },
            { $set: { 'tasks.$[task].members.$[member].userName': user.userName, 'tasks.$[task].members.$[member].img': user.img } },
            { arrayFilters: [{'task.members._id': user._id}, {'member._id': user._id}] }
        );

        // Trả về thông tin cần thiết (ví dụ: userName, email, img)
        res.status(200).json({data:{id:user._id, userName: user.userName, email: user.email,image:user.img}});
    } catch (error) {
        console.log('Lỗi server', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


userRouter.get('/allUsers', async (req, res) => {
    try {
        const allUsers = await UserModel.find();
        res.status(200).json({ data: allUsers });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

userRouter.get('/familyUsers/:callerUserId', async (req, res) => {
    try {
        const { callerUserId } = req.params;

        // Tìm gia đình mà người dùng có ID đang thực hiện cuộc gọi thuộc về
        const userFamily = await FamilyModel.findOne({ 'members._id': callerUserId });

        if (!userFamily) {
            return res.status(404).json({ message: 'Không tìm thấy gia đình cho người dùng này' });
        }

        // Lấy danh sách người dùng trong gia đình (trừ người dùng có ID đang thực hiện cuộc gọi)
        const familyUsers = userFamily.members.filter(member => member._id.toString() !== callerUserId);

        res.status(200).json({ data: familyUsers });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

userRouter.patch('/changePassword/:idUser', async (req, res) => {
    try {
        const { idUser } = req.params;
        const { oldPassword, newPassword } = req.body;

        // Kiểm tra xem người dùng có tồn tại hay không
        const user = await UserModel.findById(idUser);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        // Kiểm tra mật khẩu cũ
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        // Bạn có thể kiểm tra mật khẩu cũ trong trường hợp này, nhưng không trả về lỗi
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
        }
        // Hash và lưu mật khẩu mới vào cơ sở dữ liệu
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        // Trả về thông báo thành công
        res.status(200).json({ message: 'Mật khẩu đã được cập nhật' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});


userRouter.delete('/deleteAllUsers', async (req, res) => {
    try {
        // Xoá tất cả người dùng từ cơ sở dữ liệu
        await UserModel.deleteMany({});
        res.status(200).json({ message: 'Đã xoá tất cả người dùng' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});


userRouter.patch('/logout/:idUser', async (req, res) => {
    try {
        const { idUser } = req.params;

        // Kiểm tra xem người dùng có tồn tại hay không
        const user = await UserModel.findById(idUser);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Xoá FCM của người dùng
        user.fcm = null;
        await user.save();

        // Trả về thông báo thành công
        res.status(200).json({ message: 'FCM người dùng đã được xoá' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

export default userRouter
