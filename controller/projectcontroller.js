const project = require('../models/project');
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { getCache, setCache, clearCache } = require('../utils/cache');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

class projectcontroller {

    static createproject = async (req, res) => {
        try {
            let { title, description, livelink, liveLink, githublink, githubLink, technologies } = req.body;

            const finalLiveLink = livelink || liveLink;
            const finalGithubLink = githublink || githubLink;

            if (!title || !description || !finalLiveLink || !finalGithubLink || !technologies) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            if (!req.files || !req.files.image) {
                return res.status(400).json({
                    success: false,
                    message: "Image is required"
                });
            }

            let parsedTechnologies = [];
            if (typeof technologies === 'string') {
                try {
                    const parsed = JSON.parse(technologies);
                    if (Array.isArray(parsed)) {
                        parsedTechnologies = parsed;
                    } else {
                        parsedTechnologies = technologies.split(",").map(t => t.trim()).filter(Boolean);
                    }
                } catch (e) {
                    parsedTechnologies = technologies.split(",").map(t => t.trim()).filter(Boolean);
                }
            } else if (Array.isArray(technologies)) {
                parsedTechnologies = technologies;
            }

            const file = req.files.image;
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: "projects"
            });

            if (fs.existsSync(file.tempFilePath)) {
                fs.unlinkSync(file.tempFilePath);
            }

            const newProject = await project.create({
                title,
                description,
                image: result.secure_url,
                public_id: result.public_id,
                livelink: finalLiveLink,
                githublink: finalGithubLink,
                technologies: parsedTechnologies
            });

            clearCache('project');
            clearCache('homepage_all');

            return res.status(201).json({
                success: true,
                message: "Project created successfully",
                project: newProject,
                projects: newProject
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    };

    static getAllproject = async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 0;
            const page = parseInt(req.query.page) || 1;
            const cacheKey = limit > 0 ? `project_${limit}_${page}` : 'project';

            const cachedProjects = getCache(cacheKey);
            if (cachedProjects) {
                return res.status(200).json({
                    success: true,
                    message: "Projects fetched successfully",
                    projects: cachedProjects
                });
            }

            let query = project.find().sort({ createdAt: -1 });
            if (limit > 0) {
                query = query.skip((page - 1) * limit).limit(limit);
            }

            const projects = await query.lean();
            setCache(cacheKey, projects);

            return res.status(200).json({
                success: true,
                message: "Projects fetched successfully",
                projects
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static getsingleproject = async (req, res) => {
        try {
            const { id } = req.params;
            const singleProject = await project.findById(id);

            if (!singleProject) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Project fetched successfully",
                project: singleProject,
                projects: singleProject
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static updateproject = async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                livelink,
                liveLink,
                githublink,
                githubLink,
                technologies
            } = req.body;

            const targetProject = await project.findById(id);

            if (!targetProject) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }

            if (req.files && req.files.image) {
                if (targetProject.public_id) {
                    await cloudinary.uploader.destroy(targetProject.public_id);
                }

                const imagefile = req.files.image;
                const uploadresult = await cloudinary.uploader.upload(
                    imagefile.tempFilePath,
                    {
                        folder: "projects"
                    }
                );

                if (fs.existsSync(imagefile.tempFilePath)) {
                    fs.unlinkSync(imagefile.tempFilePath);
                }

                targetProject.image = uploadresult.secure_url;
                targetProject.public_id = uploadresult.public_id;
            }

            targetProject.title = title || targetProject.title;
            targetProject.description = description || targetProject.description;
            targetProject.livelink = livelink || liveLink || targetProject.livelink;
            targetProject.githublink = githublink || githubLink || targetProject.githublink;

            if (technologies) {
                let parsedTechnologies = [];
                if (typeof technologies === 'string') {
                    try {
                        const parsed = JSON.parse(technologies);
                        if (Array.isArray(parsed)) {
                            parsedTechnologies = parsed;
                        } else {
                            parsedTechnologies = technologies.split(",").map(t => t.trim()).filter(Boolean);
                        }
                    } catch (e) {
                        parsedTechnologies = technologies.split(",").map(t => t.trim()).filter(Boolean);
                    }
                } else if (Array.isArray(technologies)) {
                    parsedTechnologies = technologies;
                }
                targetProject.technologies = parsedTechnologies;
            }

            await targetProject.save();
            clearCache('project');
            clearCache('homepage_all');

            return res.status(200).json({
                success: true,
                message: "Project updated successfully",
                project: targetProject,
                projects: targetProject
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static deleteproject = async (req, res) => {
        try {
            const { id } = req.params;
            const PROJECT = await project.findById(id);

            if (!PROJECT) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found"
                });
            }

            if (PROJECT.public_id) {
                await cloudinary.uploader.destroy(PROJECT.public_id);
            }
            await PROJECT.deleteOne();
            clearCache('project');

            return res.json({
                success: true,
                message: "Project deleted successfully"
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

module.exports = projectcontroller;