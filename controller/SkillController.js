const skill = require("../models/skill");

class skillcontroller {

    static createskill = async (req, res) => {
        try {
            const { name, percentage, icon } = req.body;

            if (!name || !percentage || !icon) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            const result = new skill({
                name,
                percentage,
                icon
            });

            await result.save();

            return res.status(201).json({
                success: true,
                message: "Skill created successfully",
                skill: result
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    static getAllskill = async (req, res) => {
        try {
            const skillexist = await skill.find();

            return res.status(200).json({
                success: true,
                skills: skillexist,
                skillexist
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static updateskill = async (req, res) => {
        try {
            const { name, percentage, icon } = req.body;

            const result = await skill.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    percentage,
                    icon
                },
                { new: true, returnDocument: "after" }
            );

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Skill not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Skill updated successfully",
                data: result,
                skill: result
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    };

    static deleteskill = async (req, res) => {
        try {
            const result = await skill.findByIdAndDelete(
                req.params.id
            );

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Skill not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Skill deleted successfully"
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

module.exports = skillcontroller;