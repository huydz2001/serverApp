import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
export const generateToken = ({id, role}) => {
    return jwt.sign({id, role}, process.env.JWT_KEY, {expiresIn: '99999999999999999999999999h'});
};
