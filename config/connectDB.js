const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.LIVE_URL);
        console.log("MongoDb Connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


module.exports = connectdb;             