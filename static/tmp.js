const fs = require("fs");

module.exports = function(req, res, url) {
    if (req.method != "GET" || !url.pathname.startsWith("/tmp")) return;
    if (url.pathname.endsWith(".zip")) res.setHeader("Content-Type", "application/zip");
    res.end(fs.readFileSync(url.pathname.split("/tmp").join(process.env.CACHÉ_FOLDER)));
}