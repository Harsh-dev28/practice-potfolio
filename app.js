const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/connectDB")
const web = require("./routes/web")
const fileupload = require("express-fileupload");
const cookieparser = require("cookie-parser");
const cors = require("cors");



//image file upload
app.use(fileupload({
    useTempFiles: true,
}));

connectDB()
app.use(express.json())
app.use(cookieparser());
app.use(cors({
    origin: "https://harshdotportfolio.netlify.app", // client url 
    credentials: true,            // to allow cookies 
}));


// Root health check endpoint for external ping / keep-alive monitoring (e.g. UptimeRobot, cron-job.org)
app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use('/api', web)


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});