const https = require("https");
const fs = require("fs");

module.exports = (req, res, url) => {
    if (req.method != "GET" || !url.pathname.startsWith("/qvm_files") && !url.pathname.startsWith("/lvm_files")) return;
    if (url.pathname.endsWith(".css")) res.setHeader("Content-Type", "text/css");
    res.end(fs.readFileSync(`.${url.pathname}`));
    return true;
}