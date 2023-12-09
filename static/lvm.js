const https = require("https");

module.exports = function(req, res, url) {
    if (req.method != "GET" || url.pathname != "/api/serveCustomLVM") return;
    https.get(url.query.y, r => {
        const buffers = [];
        r.on("data", b => buffers.push(b)).on("end", () => {
            res.end(Buffer.concat(buffers));
            return true;
        });
    });
}