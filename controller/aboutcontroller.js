const about = require('../models/about');

class aboutcontroller {

    static createabout = async (req, res) => {
        try {
            let { title, description, skills, achievements } = req.body;

            if (skills) {
                if (typeof skills === 'string') {
                    skills = skills.split(',').map(s => s.trim()).filter(Boolean);
                } else if (Array.isArray(skills)) {
                    if (skills.length === 1 && typeof skills[0] === 'string' && skills[0].includes(',')) {
                        skills = skills[0].split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
            }

            if (achievements) {
                if (typeof achievements === 'string') {
                    achievements = achievements.split(',').map(s => s.trim()).filter(Boolean);
                } else if (Array.isArray(achievements)) {
                    if (achievements.length === 1 && typeof achievements[0] === 'string' && achievements[0].includes(',')) {
                        achievements = achievements[0].split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
            }

            const About = await about.create({
                title,
                description,
                skills: skills || [],
                achievements: achievements || []
            });

            return res.status(201).json({
                success: true,
                message: "About created successfully",
                about: About
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static getAllabout = async (req, res) => {
        try {
            const aboutexist = await about.findOne();

            if (!aboutexist) {
                return res.status(404).json({
                    success: false,
                    message: "About not found"
                });
            }

            return res.status(200).json({
                success: true,
                about: aboutexist,
                aboutexist
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static updateabout = async (req, res) => {
        try {
            const { id } = req.params;
            let { title, description, skills, achievements } = req.body;

            const aboutexist = await about.findById(id);

            if (!aboutexist) {
                return res.status(404).json({
                    success: false,
                    message: "About not found"
                });
            }

            if (skills) {
                if (typeof skills === 'string') {
                    skills = skills.split(',').map(s => s.trim()).filter(Boolean);
                } else if (Array.isArray(skills)) {
                    if (skills.length === 1 && typeof skills[0] === 'string' && skills[0].includes(',')) {
                        skills = skills[0].split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
            }

            if (achievements) {
                if (typeof achievements === 'string') {
                    achievements = achievements.split(',').map(s => s.trim()).filter(Boolean);
                } else if (Array.isArray(achievements)) {
                    if (achievements.length === 1 && typeof achievements[0] === 'string' && achievements[0].includes(',')) {
                        achievements = achievements[0].split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
            }

            aboutexist.title = title || aboutexist.title;
            aboutexist.description = description || aboutexist.description;
            if (skills) aboutexist.skills = skills;
            if (achievements) aboutexist.achievements = achievements;

            await aboutexist.save();

            return res.status(200).json({
                success: true,
                message: "About updated successfully",
                about: aboutexist,
                aboutexist
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static deleteabout = async (req, res) => {
        try {
            const { id } = req.params;
            const abouthai = await about.findById(id);

            if (!abouthai) {
                return res.status(404).json({
                    success: false,
                    message: 'About not found'
                });
            }

            await about.findByIdAndDelete(id);

            return res.status(200).json({
                success: true,
                message: "About deleted successfully"
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

module.exports = aboutcontroller;