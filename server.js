const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

var data = require("./data.json");
var meta = require("./meta.json");

const app = express();
app.use(cors());
let audioList = [];

port = process.env.PORT || 8000;

// Get a list of reciters
app.get("/reciters", (req, res) => {
    let reciters = [];
    res.setHeader("Content-Type", "application/json");
    data["data"].filter((item) => {
        reciters.push({
            ar_name: item["ar_name"],
            en_name: item["en_name"],
            identifier: item["identifier"],
            en_riwaya: item["en_riwaya"],
            ar_riwaya: item["ar_riwaya"],
        });
    });
    res.end(JSON.stringify(reciters, null, 3));
});

//Get a list of available surah resitation of a specifique reciter
app.get("/audiolist/:identifier", (req, res) => {
    empty();
    let reciter = data["data"].filter(
        (item) => item["identifier"] === req.params.identifier
    );
    let server = reciter[0]["server"];
    let id = reciter[0]["identifier"];
    if (reciter[0]["hassubfolder"] === "true") {
        id = id + "/" + reciter[0]["subfolder"][0];
    }
    validating(server, id);
    res.setHeader("Content-Type", "application/json");
    setTimeout(() => {
        res.end(JSON.stringify(audioList.sort(compareIndex), null, 3));
    }, 1000);
});

// Get All Quran surah infos
app.get("/surahs", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(meta["data"]["surahs"]["references"], null, 3));
});

// Get a single surah infos
app.get("/surah/:number", (req, res) => {
    let surahNumber = req.params.number;
    res.setHeader("Content-Type", "application/json");
    if (surahNumber >= 1 && surahNumber <= 114) {
        res.end(
            JSON.stringify(
                meta["data"]["surahs"]["references"][surahNumber - 1],
                null,
                3
            )
        );
    } else {
        res.end(JSON.stringify({ error: "Surah number invalid !" }, null, 3));
    }
});

// Home Path
app.get("/", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(
        JSON.stringify(
            {
                Server: "Quran-Server",
                "git-repo": "https://github.com/DarifElmehdi/quran-server",
                author: "Darif Elmehdi",
            },
            null,
            3
        )
    );
});
app.listen(port, () => {
    console.log(`Server up and running on : ${port}`);
});

//Get quran page
app.get("/quran/:page", (req, res) => {
    let pageNumber = req.params.page;
    if (pageNumber >= 1 && pageNumber <= 604) {
        const file = `./quran-images/${pageNumber}.png`;
        var img = fs.readFileSync(file);
        res.writeHead(200, { "Content-Type": "image/png" });
        res.end(img, "binary");
    } else {
        res.end(JSON.stringify({ error: "Page number invalid !" }, null, 3));
    }
});

// validate a single url
const isValidAudioUrl = (urlToCheck) => {
    return fetch(urlToCheck, { method: "HEAD", mode: "no-cors" })
        .then(
            (res) =>
                res.ok && res.headers.get("content-type").startsWith("audio")
        )
        .catch((err) => console.log(err.message));
};

// Validating url function
const validating = (server, identifier) => {
    for (let i = 1; i <= 114; i++) {
        let str = i + ".mp3";
        let fileName = str.padStart(7, "0");
        let url = `http://${server}/${identifier}/${fileName}`;
        isValidAudioUrl(url).then((result) => {
            if (result == true) {
                audioList.push({
                    index: i,
                    url:
                        "https://http-to-https.herokuapp.com/" +
                        encodeURIComponent(url),
                    ar_name:
                        meta["data"]["surahs"]["references"][i - 1]["name"],
                    en_name:
                        meta["data"]["surahs"]["references"][i - 1][
                            "englishName"
                        ],
                    en_tr_name:
                        meta["data"]["surahs"]["references"][i - 1][
                            "englishNameTranslation"
                        ],
                    en_type:
                        meta["data"]["surahs"]["references"][i - 1][
                            "revelationType"
                        ],
                    ar_type:
                        meta["data"]["surahs"]["references"][i - 1][
                            "ar_revelationType"
                        ],
                });
            }
        });
    }
};

function compareIndex(a, b) {
    return a.index - b.index;
}

async function empty() {
    audioList.length = 0;
}
