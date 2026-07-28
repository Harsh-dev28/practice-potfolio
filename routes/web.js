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









module.exports = router