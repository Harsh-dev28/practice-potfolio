const express = require('express')
const router = express.Router()
const auth = require("../middleware/auth");
const adminController = require('../controller/admincontroller');
const aboutcontroller = require('../controller/aboutcontroller');
const contactcontroller = require('../controller/contactcontroller');
const herocontroller = require('../controller/herocontroller');
const projectcontroller = require('../controller/projectcontroller');
const servicecontroller = require('../controller/servicecontroller');
const skillcontroller = require('../controller/SkillController');
const certificatecontroller = require('../controller/certificatecontroller');
const heroModel = require('../models/hero');
const aboutModel = require('../models/about');
const serviceModel = require('../models/service');
const projectModel = require('../models/project');
const certificateModel = require('../models/certificate');
const { getCache, setCache } = require('../utils/cache');

// Health Check Ping Endpoint for Render Keep-Alive Monitoring
router.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Consolidated Homepage Endpoint (Eliminates Frontend HTTP Waterfall / N+1 RTTs)
router.get("/homepage", async (req, res) => {
    try {
        const cachedData = getCache("homepage_all");
        if (cachedData) {
            return res.status(200).json({
                success: true,
                data: cachedData
            });
        }

        const [hero, about, services, projects, certificates] = await Promise.all([
            heroModel.findOne().lean(),
            aboutModel.findOne().lean(),
            serviceModel.find().lean(),
            projectModel.find().sort({ createdAt: -1 }).lean(),
            certificateModel.find().sort({ createdAt: -1 }).lean()
        ]);

        const responsePayload = {
            hero,
            about,
            services,
            projects,
            certificates
        };

        setCache("homepage_all", responsePayload);

        return res.status(200).json({
            success: true,
            data: responsePayload
        });
    } catch (error) {
        console.error("Error fetching homepage batch data:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Admin API
router.post("/registeradmin", adminController.registeradmin);
router.post("/login", adminController.login);
router.get("/logout", adminController.logout);
router.get("/getprofile", auth, adminController.getProfile);
router.put("/updateprofile", auth, adminController.updateprofile);
router.put("/changepassword", auth, adminController.changepassword);


// About API
router.post("/createabout", aboutcontroller.createabout);
router.get("/getAllabout", aboutcontroller.getAllabout);
router.put("/updateabout/:id", aboutcontroller.updateabout);
router.delete("/deleteabout/:id", aboutcontroller.deleteabout);

// Contact API
router.post("/createcontact", contactcontroller.createcontact);
router.get("/getAllcontact", contactcontroller.getAllcontact);
router.delete("/deletecontact/:id", contactcontroller.deletecontact);

//  Hero API
router.post("/createhero", herocontroller.createhero);
router.get("/getAllhero", herocontroller.getAllhero);
router.get("/getsinglehero/:id", herocontroller.getsinglehero);
router.put("/updatehero/:id", herocontroller.updatehero);
router.delete("/deletehero/:id", herocontroller.deletehero);


// Project API
router.post("/createproject", projectcontroller.createproject);
router.get("/getAllproject", projectcontroller.getAllproject);
router.get("/getsingleproject/:id", projectcontroller.getsingleproject);
router.put("/updateproject/:id", projectcontroller.updateproject);
router.delete("/deleteproject/:id", projectcontroller.deleteproject);


// Service API
router.post("/createService", servicecontroller.createService);
router.get("/getAllservice", servicecontroller.getAllservice);
router.put("/updateservice/:id", servicecontroller.updateservice);
router.delete("/deleteService/:id", servicecontroller.deleteService);


// Skill  API
router.post("/createskill", skillcontroller.createskill);
router.get("/getAllskill", skillcontroller.getAllskill);
router.put("/updateskill/:id", skillcontroller.updateskill);
router.delete("/deleteskill/:id", skillcontroller.deleteskill);

// Certificate API
router.post("/createcertificate", certificatecontroller.createcertificate);
router.get("/getAllcertificate", certificatecontroller.getAllcertificate);
router.get("/getsinglecertificate/:id", certificatecontroller.getsinglecertificate);
router.put("/updatecertificate/:id", certificatecontroller.updatecertificate);
router.delete("/deletecertificate/:id", certificatecontroller.deletecertificate);









module.exports = router