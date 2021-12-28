const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.listen(PORT, ()=> console.log(`Server started on port: ${PORT}`));
app.use(express.json());

mongoose.connect(process.env.MDB_CONNECT, (err)=> {
    if(err) return console.error(err);
    console.log("Connected to MDB");
});

// setup routes

app.use("/auth", require("./routers/userRouter"));