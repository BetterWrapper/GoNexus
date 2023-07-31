const https = require("https");
const fs = require("fs");

module.exports = (req, res, url) => {
    const pathnames = [
        "/qvm_files",
        "/lvm_files"
    ]
    for (const pathname of pathnames) {
        if (req.method != "GET") return;
        if (url.pathname.startsWith(pathname)) res.end(fs.readFileSync(`.${url.pathname}`));
        else return;
        return true;
    }
}