const fs = require("fs");
module.exports = (req, res, url) => {
    if (req.method != "POST" || !url.pathname.startsWith("/api/getting_started")) return;
    const json = JSON.parse(fs.readFileSync("./gonexus_intro.json"));
    res.end(JSON.stringify(json[url.pathname.split("/")[3]] || {}))
}