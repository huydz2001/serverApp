import jwt from "jsonwebtoken";
import * as dotEnv from "dotenv";

dotEnv.config()
export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.role = user.role
        next()
    });

};
export const checkAdmin = (role, res) => {
    console.log(role)
    if (role !== 'admin') {
        res.status(403).send({
            mess: "Ko co quyen"
        })
        return false
    }
    return true
}
