const hero = require('../models/hero');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { getCache, setCache, clearCache } = require('../utils/cache');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

class herocontroller {

    static createhero = async (req, res) => {
        try {
            const {
                subtitle,
                name,
                description,
                resumelink,
                resumeLink,
                github,
                linkedin,
                instagram,
                frontendtitle,
                frontendTitle,
                backenedtitle,
                backendTitle
            } = req.body;

            const finalFrontendTitle = frontendtitle || frontendTitle;
            const finalBackendTitle = backenedtitle || backendTitle;
            const finalResumeLink = resumelink || resumeLink;

            if (!subtitle || !name || !description || !finalResumeLink || !github || !linkedin || !instagram || !finalFrontendTitle || !finalBackendTitle) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            const imageFile = req.files?.profileimage || req.files?.image;
            const bodyImage = req.body.profileimage || req.body.image;

            if (!imageFile && !bodyImage) {
                return res.status(400).json({
                    success: false,
                    message: "Profile image is required"
                });
            }

            let profileImageUrl = bodyImage || '';
            let publicId = '';

            if (imageFile) {
                const uploadimage = await cloudinary.uploader.upload(
                    imageFile.tempFilePath,
                    {
                        folder: 'portfolio_hero',
                        resource_type: "image"
                    }
                );

                if (fs.existsSync(imageFile.tempFilePath)) {
                    fs.unlinkSync(imageFile.tempFilePath);
                }
                profileImageUrl = uploadimage.secure_url;
                publicId = uploadimage.public_id;
            }

            const createhero = await hero.create({
                subtitle,
                name,
                description,
                resumelink: finalResumeLink,
                github,
                linkedin,
                instagram,
                frontendtitle: finalFrontendTitle,
                backenedtitle: finalBackendTitle,
                profileimage: profileImageUrl,
                public_id: publicId,
            });

            clearCache('hero');

            return res.status(201).json({
                success: true,
                message: "Hero section created successfully",
                hero: createhero,
                gethero: createhero
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static getAllhero = async (req, res) => {
        try {
            const cachedHero = getCache('hero');
            if (cachedHero) {
                return res.status(200).json({
                    success: true,
                    hero: cachedHero,
                    gethero: cachedHero
                });
            }

            const gethero = await hero.findOne().lean();

            if (!gethero) {
                return res.status(404).json({
                    success: false,
                    message: "Hero not found"
                });
            }

            setCache('hero', gethero);

            return res.status(200).json({
                success: true,
                hero: gethero,
                gethero
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static getsinglehero = async (req, res) => {
        try {
            const { id } = req.params;

            const singlehero = await hero.findById(id);

            if (!singlehero) {
                return res.status(404).json({
                    success: false,
                    message: "Hero not found"
                });
            }

            return res.status(200).json({
                success: true,
                hero: singlehero
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static updatehero = async (req, res) => {
        try {
            const {
                subtitle,
                name,
                description,
                resumelink,
                resumeLink,
                github,
                linkedin,
                instagram,
                frontendtitle,
                frontendTitle,
                backenedtitle,
                backendTitle
            } = req.body;

            const { id } = req.params;

            const checkhero = await hero.findById(id);

            if (!checkhero) {
                return res.status(404).json({
                    success: false,
                    message: "Hero not found"
                });
            }

            const newimagefile = req.files?.image || req.files?.profileimage;

            if (newimagefile) {
                if (checkhero.public_id) {
                    await cloudinary.uploader.destroy(checkhero.public_id);
                }

                const uploadnewimage = await cloudinary.uploader.upload(
                    newimagefile.tempFilePath,
                    {
                        folder: 'portfolio_hero',
                        resource_type: 'image'
                    }
                );

                if (fs.existsSync(newimagefile.tempFilePath)) {
                    fs.unlinkSync(newimagefile.tempFilePath);
                }

                checkhero.profileimage = uploadnewimage.secure_url;
                checkhero.public_id = uploadnewimage.public_id;
            } else if (req.body.profileimage || req.body.image) {
                checkhero.profileimage = req.body.profileimage || req.body.image;
            }

            if (subtitle) checkhero.subtitle = subtitle;
            if (name) checkhero.name = name;
            if (description) checkhero.description = description;
            if (resumelink || resumeLink) checkhero.resumelink = resumelink || resumeLink;
            if (github) checkhero.github = github;
            if (linkedin) checkhero.linkedin = linkedin;
            if (instagram) checkhero.instagram = instagram;
            if (frontendtitle || frontendTitle) checkhero.frontendtitle = frontendtitle || frontendTitle;
            if (backenedtitle || backendTitle) checkhero.backenedtitle = backenedtitle || backendTitle;

            await checkhero.save();
            clearCache('hero');

            return res.status(200).json({
                success: true,
                message: "Hero updated successfully",
                hero: checkhero,
                gethero: checkhero
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static deletehero = async (req, res) => {
        try {
            const { id } = req.params;

            const heroexist = await hero.findById(id);

            if (!heroexist) {
                return res.status(404).json({
                    success: false,
                    message: "Hero not found"
                });
            }

            if (heroexist.public_id) {
                await cloudinary.uploader.destroy(heroexist.public_id);
            }
            await heroexist.deleteOne();
            clearCache('hero');

            return res.json({
                success: true,
                message: "Hero deleted successfully"
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
}

module.exports = herocontroller;