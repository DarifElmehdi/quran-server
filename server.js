const express = require("express");
const app = express();
var data = require("./data.json");

port = process.env.PORT || 3000;
hostname = "localhost";
let reciters = [];
app.get("/reciters", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    data["data"].filter((item) => {
        reciters.push({
            ar_name: item["ar_name"],
            en_name: item["en_name"],
            identifier: item["identifier"],
        });
    });
    res.end(JSON.stringify(reciters, null, 3));
});
app.get("/", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data, null, 3));
});
app.listen(port, () => {
    console.log(`Server up and running on : ${port}`);
});
