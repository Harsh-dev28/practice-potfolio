const certificate = require('../models/certificate');
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { getCache, setCache, clearCache } = require('../utils/cache');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

class certificatecontroller {

    static createcertificate = async (req, res) => {
        try {
            const { title, organization, issueDate, description } = req.body;

            if (!title || !organization) {
                return res.status(400).json({
                    success: false,
                    message: "Title and issuing organization are required"
                });
            }

            let imageUrl = "";
            let publicId = "";

            if (req.files && req.files.image) {
                const file = req.files.image;
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: "certificates"
                });
                imageUrl = result.secure_url;
                publicId = result.public_id;

                if (fs.existsSync(file.tempFilePath)) {
                    fs.unlinkSync(file.tempFilePath);
                }
            }

            const newCertificate = await certificate.create({
                title,
                organization,
                issueDate: issueDate || "",
                description: description || "",
                image: imageUrl,
                public_id: publicId
            });

            clearCache('certificate');
            clearCache('homepage_all');

            return res.status(201).json({
                success: true,
                message: "Certificate added successfully",
                certificate: newCertificate,
                certificates: newCertificate
            });

        } catch (error) {
            console.error("Create Certificate Error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    };

    static getAllcertificate = async (req, res) => {
        try {
            const cachedCertificates = getCache('certificate');
            if (cachedCertificates) {
                return res.status(200).json({
                    success: true,
                    certificates: cachedCertificates,
                    certificate: cachedCertificates
                });
            }

            const certificates = await certificate.find().sort({ createdAt: -1 }).lean();
            setCache('certificate', certificates);

            return res.status(200).json({
                success: true,
                certificates,
                certificate: certificates
            });

        } catch (error) {
            console.error("Get All Certificates Error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    };

    static getsinglecertificate = async (req, res) => {
        try {
            const { id } = req.params;
            const singleCertificate = await certificate.findById(id);

            if (!singleCertificate) {
                return res.status(404).json({
                    success: false,
                    message: "Certificate not found"
                });
            }

            return res.status(200).json({
                success: true,
                certificate: singleCertificate,
                certificates: singleCertificate
            });

        } catch (error) {
            console.error("Get Single Certificate Error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    };

    static updatecertificate = async (req, res) => {
        try {
            const { id } = req.params;
            const { title, organization, issueDate, description } = req.body;

            const targetCertificate = await certificate.findById(id);

            if (!targetCertificate) {
                return res.status(404).json({
                    success: false,
                    message: "Certificate not found"
                });
            }

            if (req.files && req.files.image) {
                if (targetCertificate.public_id) {
                    await cloudinary.uploader.destroy(targetCertificate.public_id);
                }

                const imagefile = req.files.image;
                const uploadresult = await cloudinary.uploader.upload(
                    imagefile.tempFilePath,
                    {
                        folder: "certificates"
                    }
                );

                if (fs.existsSync(imagefile.tempFilePath)) {
                    fs.unlinkSync(imagefile.tempFilePath);
                }

                targetCertificate.image = uploadresult.secure_url;
                targetCertificate.public_id = uploadresult.public_id;
            }

            targetCertificate.title = title || targetCertificate.title;
            targetCertificate.organization = organization || targetCertificate.organization;
            targetCertificate.issueDate = issueDate !== undefined ? issueDate : targetCertificate.issueDate;
            targetCertificate.description = description !== undefined ? description : targetCertificate.description;

            await targetCertificate.save();
            clearCache('certificate');
            clearCache('homepage_all');

            return res.status(200).json({
                success: true,
                message: "Certificate updated successfully",
                certificate: targetCertificate,
                certificates: targetCertificate
            });

        } catch (error) {
            console.error("Update Certificate Error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    };

    static deletecertificate = async (req, res) => {
        try {
            const { id } = req.params;
            const targetCertificate = await certificate.findById(id);

            if (!targetCertificate) {
                return res.status(404).json({
                    success: false,
                    message: "Certificate not found"
                });
            }

            if (targetCertificate.public_id) {
                await cloudinary.uploader.destroy(targetCertificate.public_id);
            }

            await targetCertificate.deleteOne();
            clearCache('certificate');
            clearCache('homepage_all');

            return res.status(200).json({
                success: true,
                message: "Certificate deleted successfully"
            });

        } catch (error) {
            console.error("Delete Certificate Error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    };
}

module.exports = certificatecontroller;