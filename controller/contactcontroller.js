const contact = require('../models/contact');
const admin = require('../models/admin');
const { sendNewMessageNotification } = require('../utils/sendEmail');

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

            // Fetch registered admin email to send notification
            try {
                let adminEmail = process.env.ADMIN_EMAIL;
                const registeredAdmin = await admin.findOne().sort({ createdAt: 1 });
                if (registeredAdmin && registeredAdmin.email) {
                    adminEmail = registeredAdmin.email;
                }

                if (adminEmail) {
                    // Send notification asynchronously without blocking response
                    sendNewMessageNotification({
                        toEmail: adminEmail,
                        contact: result
                    }).catch(mailErr => {
                        console.error('[ContactController] Background email notification error:', mailErr);
                    });
                }
            } catch (notifyErr) {
                console.error('[ContactController] Failed to initiate admin email notification:', notifyErr);
            }

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

    static deletecontact = async (req, res) => {
        try {
            const { id } = req.params;
            const targetContact = await contact.findById(id);

            if (!targetContact) {
                return res.status(404).json({
                    success: false,
                    message: "Contact message not found"
                });
            }

            await targetContact.deleteOne();

            return res.status(200).json({
                success: true,
                message: "Message deleted successfully"
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