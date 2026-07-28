const jwt = require("jsonwebtoken");
const admin = require("../models/admin");

const auth = async (req, res, next) => {

    try {

        const token = req.cookies?.token;
        // console.log(res.cookies);

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Unauthorised"
            });
        }

        const decodedtoken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const admindata = await admin
            .findById(decodedtoken.id)
            .select("-password");

        if (!admindata) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            })
        }

        req.admin = admindata;

        next();

    } catch (error) {

        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = auth;