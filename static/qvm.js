const https = require("https");
const fs = require("fs");

module.exports = (req, res, url) => {
    if (req.method != "GET" || !url.pathname.startsWith("/qvm_files")) return;
    res.end(fs.readFileSync(`.${url.pathname}`));
    return true;
}