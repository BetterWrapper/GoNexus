const fs = require("fs");
const asset = require("../../asset/main");

module.exports = (req, res, url) => {
    if (req.method != "GET") return;
    const pathname = url.pathname.split("//").join("/");
    const match = pathname.match(/\/static\/tommy\/2010\/store\/sound\/([^/]+)$/);
    if (!match) return;
    const aId = match[1];
    try {
		const b = asset.load(aId);
		res.statusCode = 200;
		res.end(b);
	} catch (e) {
		res.statusCode = 404;
		console.log(e);
		res.end("Not found");
    }
}