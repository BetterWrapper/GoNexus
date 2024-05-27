const https = require("https");
const fs = require("fs");

module.exports = (req, res, url) => {
    if (req.method != "GET" || !url.pathname.startsWith("/qvm_files") && !url.pathname.startsWith("/lvm_files")) return;
    const mimeTypes = {
        js: {
            name: "text",
            value: "javascript"
        },
        css: {
            name: "text",
            value: "css"
        }
    }
    const mimeType = mimeTypes[url.pathname.substr(url.pathname.lastIndexOf(".") + 1)];
    if (mimeType) res.setHeader("Content-Type", `${mimeType.name}/${mimeType.value}`);
    res.end(fs.readFileSync(`.${url.pathname}`));
    return true;
}