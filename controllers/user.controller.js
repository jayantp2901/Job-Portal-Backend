import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Register
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use", success: false });
    }

    let profilePhoto = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudUpload = await cloudinary.uploader.upload(fileUri.content);
      profilePhoto = cloudUpload.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: { profilePhoto }
    });

    res.status(201).json({ message: "User registered successfully", success: true });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials", success: false });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials", success: false });

    if (user.role !== role) {
      return res.status(400).json({ message: "Role mismatch", success: false });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "1d" });

    res.status(200)
      .cookie("token", token, { httpOnly: true, maxAge: 86400000, sameSite: "strict" })
      .json({
        message: `Welcome, ${user.fullname}`,
        success: true,
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profile: user.profile,
        }
      });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Logout
export const logout = (req, res) => {
  res.status(200)
    .cookie("token", "", { maxAge: 0 })
    .json({ message: "Logged out", success: true });
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills, linkedin, portfolio, leetcode } = req.body;
    const userId = req.id;

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    if (!user.profile) user.profile = {};

    const skillsArray = skills
      ? Array.isArray(skills)
        ? skills
        : skills.split(',').map(s => s.trim())
      : user.profile.skills;

    let resumeUrl = user.profile.resume || "";
    let resumeOriginalName = user.profile.resumeOriginalName || "";

    if (req.file) {
      const fileUri = getDataUri(req.file);
      const uploaded = await cloudinary.uploader.upload(fileUri.content);
      resumeUrl = uploaded.secure_url;
      resumeOriginalName = req.file.originalname;
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.profile.bio = bio || user.profile.bio;
    user.profile.skills = skillsArray;
    user.profile.resume = resumeUrl;
    user.profile.resumeOriginalName = resumeOriginalName;
    user.profile.linkedin = linkedin || user.profile.linkedin;
    user.profile.portfolio = portfolio || user.profile.portfolio;
    user.profile.leetcode = leetcode || user.profile.leetcode;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        
      },
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Add Work Experience, Projects, Achievements
export const addUserData = async (req, res) => {
  try {
    const { workExperience, projects, achievements } = req.body;
    const userId = req.id;

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    if (!user.profile) user.profile = {};

    // Replace entire arrays instead of pushing
    if (workExperience) user.profile.workExperience = workExperience;
    if (projects) user.profile.projects = projects;
    if (achievements) user.profile.achievements = achievements;

    await user.save();

    res.status(200).json({
      message: "Profile sections updated",
      success: true,
      user: {
        _id: user._id,
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error("Add User Data Error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};