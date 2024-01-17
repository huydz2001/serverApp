// Trong familyRoutes.js
import express from 'express';
import FamilyModel from '../model/Family.js';
import sendNoti from '../fcm_helper.js'
const familyRouter = express.Router();
familyRouter.delete('/deleteAll/del', async (req, res) => {
    try {
        // Sử dụng phương thức deleteMany để xoá tất cả các gia đình
        const result = await FamilyModel.deleteMany({});

        res.status(200).json({ message: 'Xoá tất cả gia đình thành công', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// Route tạo gia đình mới
// Trong familyRoutes.js
familyRouter.post('/create', async (req, res) => {
    try {
        const { name, residentId, image, createBy,newMembers } = req.body;
        const members = [createBy,...newMembers];
        const newFamily = new FamilyModel({
            name,
            residentId,
            image,
            members,
            createBy
        });
        newMembers.forEach(member => {
            console.log(member.fcm)
            if (member.fcm) {
                const notificationTitle = 'Bạn được thêm vào một gia đình mới';
                const notificationBody = `Bạn được thêm vào gia đình ${name} được tạo bởi ${createBy.userName}`;
                sendNoti(member.fcm, notificationTitle, notificationBody);
            }
        });
        await newFamily.save();
        res.status(201).json({ message: 'Tạo gia đình thành công', data: newFamily });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Lỗi server' });
    }
});


// Route lấy thông tin gia đình
familyRouter.get('/:familyId', async (req, res) => {
    try {
        const { familyId } = req.params;
        console.log(familyId)
        const family = await FamilyModel.findById(familyId);
        console.log(family)
        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại' });
        }
        res.status(200).json({ data: family });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server23' });
    }
});
familyRouter.post('/addMembers/add/:familyId', async (req, res) => {
    try {
        const { familyId } = req.params;
        const { members } = req.body;
        console.log(members)
        const family = await FamilyModel.findById(familyId);

        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại' });
        }

        // Lưu danh sách thành viên trước khi thêm mới
        const oldMembers = family.members.map(member => member._id.toString());

        // Thêm thành viên mới vào danh sách thành viên
        family.members = [...members];
        await family.save();

        // Lọc ra những thành viên mới được thêm vào gia đình
        const addedMembers = family.members.filter(member => !oldMembers.includes(member._id.toString()));
        console.log("add bng")
        console.log(addedMembers)
        // Gửi thông báo cho những thành viên mới được thêm vào gia đình
        addedMembers.forEach(newMember => {
            if (newMember.fcm) {
                console.log("gui tb")
                const notificationTitle = 'Thông báo thêm thành viên';
                const notificationBody = `Bạn đã được thêm vào gia đình ${family.name}`;
                sendNoti(newMember.fcm, notificationTitle, notificationBody);
            }
        });

        res.status(200).json({ message: 'Thêm thành viên vào gia đình thành công', data: family });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});



familyRouter.delete('/:familyId/removeMember/:memberId', async (req, res) => {
    try {
        const { familyId, memberId } = req.params;

        const family = await FamilyModel.findById(familyId);

        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại' });
        }

        // Xoá người khỏi danh sách thành viên
        family.members = family.members.filter(member => member._id.toString() !== memberId);
        await family.save();
        res.status(200).json({ message: 'Xoá người khỏi gia đình thành công', data: family });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});


familyRouter.delete('/delete/:familyId', async (req, res) => {
    try {
        const { familyId } = req.params;

        const family = await FamilyModel.findOneAndDelete({_id:familyId});

        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại' });
        }
        res.status(200).json({ message: 'Xoá gia đình thành công', data: family });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Lỗi server2' });
    }
});


familyRouter.patch('/updateImage/:familyId', async (req, res) => {
    try {
        const { familyId } = req.params;
        const { image } = req.body;

        const family = await FamilyModel.findByIdAndUpdate(
            familyId,
            { $set: { image } },
            { new: true }
        );

        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại' });
        }

        res.status(200).json({ message: 'Cập nhật ảnh gia đình thành công', data: family });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// Route lấy danh sách gia đình theo userId
familyRouter.get('/getUserFamilies/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Tìm các gia đình mà người dùng có ID nằm trong đó
        const userFamilies = await FamilyModel.find({
            'members': { 
                "$elemMatch":{ "_id": userId }
            }
        });
        res.status(200).json({ data: userFamilies });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});






// Route lấy tất cả gia đình
familyRouter.get('/get/getAll', async (req, res) => {
    try {
        const allFamilies = await FamilyModel.find();
        res.status(200).json({ data: allFamilies });
    } catch (error) {
        console.log("loi"+error)
        res.status(200).json({ data: "loi"+error});
    }
});


familyRouter.post('/sendNotificationToFamily/:familyId', async (req, res) => {
    const { familyId } = req.params;
    const { message ,name,familyName} = req.body;
    try {
        const family = await FamilyModel.findById(familyId);
        if (!family) {
            return res.status(404).json({ error: 'Không tìm thấy gia đình' });
        }
        // Lặp qua tất cả các thành viên trong gia đình và gửi thông báo
        family.members.forEach(member => {
            if (member.fcm) {
                console.log(member.fcm)
                const notificationTitle = 'Tin nhắn từ gia đình'+familyName;
                const notificationBody = `${name}: ${message}`;
                sendNoti(member.fcm, notificationTitle, notificationBody);
            }
        });

        res.status(200).json({ success: true, message: 'Đã gửi thông báo đến tất cả các thành viên trong gia đình' });
    } catch (error) {
        console.error("Lỗi: ", {...error});
        res.status(500).json({ error: 'Đã xảy ra lỗi khi gửi thông báo' });
    }
});

familyRouter.patch('/updateName/:familyId', async (req, res) => {
    try {
        const { familyId } = req.params;
        const { name } = req.body;

        const family = await FamilyModel.findByIdAndUpdate(
            familyId,
            { $set: { name } },
            { new: true }
        );

        if (!family) {
            return res.status(404).json({ message: 'Gia đình không tồn tại' });
        }

        res.status(200).json({ message: 'Cập nhật tên gia đình thành công', data: family });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});
export default familyRouter;
