const contact = require('../models/contact');

class Contactcontroller {

    static createcontact = async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;
            if (!name || !email || !subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            const result = new contact({
                name,
                email,
                subject,
                message,
            });
            await result.save();
            return res.status(201).json({
                success: true,
                message: "Message sent successfully",
                contact: result
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static getAllcontact = async (req, res) => {
        try {
            const contacts = await contact.find().sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                contacts
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

module.exports = Contactcontroller;