const admin = require('../models/admin');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class admincontroller {

    static registeradmin = async (req, res) => {

        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            const adminexist = await admin.findOne({ email });

            if (adminexist) {
                return res.status(400).json({
                    success: false,
                    message: "Admin already exist"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await admin.create({
                name,
                email,
                password: hashedPassword
            });

            return res.status(201).json({
                success: true,
                message: "Admin Created successfully",
                admin: {
                    _id: result._id,
                    name: result.name,
                    email: result.email
                }
            });
        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static login = async (req, res) => {

        try {
            const { email, password } = req.body;

            const adminexist = await admin.findOne({ email });

            if (!adminexist) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            const checkpassword = await bcrypt.compare(
                password,
                adminexist.password
            );

            if (!checkpassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password is incorrect"
                });
            }

            const token = jwt.sign(
                { id: adminexist._id },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                success: true,
                message: "Logged in Successfully",
                token,
                admin: {
                    _id: adminexist._id,
                    name: adminexist.name,
                    email: adminexist.email
                }
            });

        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    static logout = async (req, res) => {

        try {
            res.clearCookie("token");

            return res.status(200).json({
                success: true,
                message: "Logout Successfully done"
            });
        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static getProfile = async (req, res) => {
        try {
            const adminData = await admin
                .findById(req.admin._id)
                .select("-password");

            if (!adminData) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            return res.status(200).json({
                success: true,
                admin: adminData
            });

        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    static updateprofile = async (req, res) => {    

        try {
            const { name, email } = req.body;

            const adminexist = await admin.findById(req.admin._id);

            if (!adminexist) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            adminexist.name = name || adminexist.name;
            adminexist.email = email || adminexist.email;

            await adminexist.save();

            return res.status(200).json({
                success: true,
                message: "Admin updated successfully",
                admin: {
                    _id: adminexist._id,
                    name: adminexist.name,
                    email: adminexist.email
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    static changepassword = async (req, res) => {

        try {
            const { oldpassword, newpassword, confirmpassword } = req.body;

            const adminexist = await admin.findById(
                req.admin._id
            ).select("+password");

            if (!adminexist) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            const ispasswordvalid = await bcrypt.compare(
                oldpassword,
                adminexist.password
            );

            if (!ispasswordvalid) {
                return res.status(400).json({
                    success: false,
                    message: "Password is incorrect"
                });
            }

            if (newpassword !== confirmpassword) {
                return res.status(400).json({
                    success: false,
                    message: "New passwords don't match"
                });
            }

            adminexist.password = await bcrypt.hash(
                newpassword,
                10
            );

            await adminexist.save();

            return res.status(200).json({
                success: true,
                message: "Password updated successfully"
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

}

module.exports = admincontroller;
