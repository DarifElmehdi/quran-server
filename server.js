const express = require("express");
const app = express();
var data = require("./data.json");
var meta = require("./meta.json");
const fetch = require("node-fetch");

let audioList = [];

port = process.env.PORT || 3000;

// Get a list of reciters
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
    }, 500);
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
                audioList.push({ index: i, url: url });
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
