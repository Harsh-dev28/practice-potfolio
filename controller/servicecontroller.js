const service = require('../models/service');

class servicecontroller {

    static createService = async (req, res) => {
        try {
            const { title, description, icon } = req.body;

            if (!title || !description || !icon) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            const Service = await service.create({
                title,
                description,
                icon
            });

            return res.status(201).json({
                success: true,
                message: 'Service created successfully',
                service: Service,
                Service
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    static getAllservice = async (req, res) => {
        try {
            const Service = await service.find();

            return res.status(200).json({
                success: true,
                services: Service,
                Service
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    static updateservice = async (req, res) => {
        try {
            const Service = await service.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if (!Service) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Service updated successfully",
                service: Service,
                Service
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }

    }

    static deleteService = async (req, res) => {
        try {
            const Service = await service.findByIdAndDelete(req.params.id);

            if (!Service) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Service deleted successfully'
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

}

module.exports = servicecontroller;
