const mongoose = require('mongoose');
const about = require('../models/about');
const { getCache, setCache, clearCache } = require('../utils/cache');

const parseList = (val) => {
    if (!val) return [];
    if (typeof val === 'string') {
        return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (Array.isArray(val)) {
        return val
            .flatMap(item => (typeof item === 'string' ? item.split(',') : item))
            .map(s => (typeof s === 'string' ? s.trim() : s))
            .filter(Boolean);
    }
    return [];
};

class aboutcontroller {

    static createabout = async (req, res) => {
        try {
            let { title, description, skills, achievements } = req.body;

            const parsedSkills = parseList(skills);
            const parsedAchievements = parseList(achievements);

            // Upsert check: if About document already exists, update it instead of creating duplicates
            let existingAbout = await about.findOne();
            if (existingAbout) {
                if (title !== undefined && title !== '') existingAbout.title = title;
                if (description !== undefined && description !== '') existingAbout.description = description;
                if (skills !== undefined) existingAbout.skills = parsedSkills;
                if (achievements !== undefined) existingAbout.achievements = parsedAchievements;

                await existingAbout.save();
                clearCache('about');

                return res.status(200).json({
                    success: true,
                    message: "About updated successfully",
                    about: existingAbout,
                    aboutexist: existingAbout
                });
            }

            const About = await about.create({
                title: title || 'About Me',
                description: description || '',
                skills: parsedSkills,
                achievements: parsedAchievements
            });

            clearCache('about');

            return res.status(201).json({
                success: true,
                message: "About created successfully",
                about: About,
                aboutexist: About
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
            const cachedAbout = getCache('about');
            if (cachedAbout) {
                return res.status(200).json({
                    success: true,
                    about: cachedAbout,
                    aboutexist: cachedAbout
                });
            }

            const aboutexist = await about.findOne().lean();

            if (!aboutexist) {
                return res.status(404).json({
                    success: false,
                    message: "About not found"
                });
            }

            setCache('about', aboutexist);

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

            let aboutexist = null;

            if (id && mongoose.Types.ObjectId.isValid(id)) {
                aboutexist = await about.findById(id);
            }

            // Fallback: If not found by ID or ID was invalid/missing, find the single About doc
            if (!aboutexist) {
                aboutexist = await about.findOne();
            }

            // Upsert: If no document exists in DB at all, create one
            if (!aboutexist) {
                aboutexist = await about.create({
                    title: title || 'About Me',
                    description: description || '',
                    skills: parseList(skills),
                    achievements: parseList(achievements)
                });
                clearCache('about');
                return res.status(201).json({
                    success: true,
                    message: "About created successfully",
                    about: aboutexist,
                    aboutexist: aboutexist
                });
            }

            if (title !== undefined && title !== '') aboutexist.title = title;
            if (description !== undefined && description !== '') aboutexist.description = description;
            if (skills !== undefined) aboutexist.skills = parseList(skills);
            if (achievements !== undefined) aboutexist.achievements = parseList(achievements);

            await aboutexist.save();
            clearCache('about');

            return res.status(200).json({
                success: true,
                message: "About updated successfully",
                about: aboutexist,
                aboutexist
            });

        } catch (error) {
            console.log("Error updating about:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static deleteabout = async (req, res) => {
        try {
            const { id } = req.params;
            let abouthai = null;
            if (id && mongoose.Types.ObjectId.isValid(id)) {
                abouthai = await about.findById(id);
            } else {
                abouthai = await about.findOne();
            }

            if (!abouthai) {
                return res.status(404).json({
                    success: false,
                    message: 'About not found'
                });
            }

            await about.findByIdAndDelete(abouthai._id);
            clearCache('about');

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