import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import type {
    RegisterInput,
    loginInput,
} from "../validators/authValidator.js";

export const registerUser = async (data: RegisterInput) => {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
    });

    const token = generateToken({
        id: user._id.toString(),
        role: user.role,
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export const loginUser = async (data: loginInput) => {
    const { email, password } = data;

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken({
        id: user._id.toString(),
        role: user.role,
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};