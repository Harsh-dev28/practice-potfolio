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
    origin: "http://localhost:5173", // client url 
    credentials: true,            // to allow cookies 
}));


app.use('/api', web)


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});