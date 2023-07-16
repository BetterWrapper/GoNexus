const env = Object.assign(process.env, require("./env"), require("./config"));

const http = require("http");
const chr = require("./character/redirect");
const pmc = require("./character/premade");
const chl = require("./character/load");
const chs = require("./character/save");
const cht = require("./character/thmb");
const mvu = require("./movie/upload");
const asu = require("./asset/upload");
const stl = require("./static/load");
const stp = require("./static/page");
const asl = require("./asset/load");
const asL = require("./asset/list");
const ast = require("./asset/thmb");
const mvl = require("./movie/load");
const mvL = require("./movie/list");
const mvm = require("./movie/meta");
const mvs = require("./movie/save");
const mvt = require("./movie/thmb");
const thL = require("./theme/list");
const thl = require("./theme/load");
const tsv = require("./tts/voices");
const tsl = require("./tts/load");
const fs = require("fs");
const url = require("url");

const functions = [mvL, pmc, asl, chl, thl, thL, chs, cht, asL, tsl, chr, ast, mvm, mvl, mvs, mvt, tsv, asu, mvu, stp, stl];

module.exports = http
	.createServer((req, res) => {
		try {
			const parsedUrl = url.parse(req.url, true);
			//pages
			switch (req.method) {
				case "GET": {
					switch (parsedUrl.pathname) {
						case "/api/convertUrlQuery2JSON": {
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(parsedUrl.query));
							break;
						} case "/": {
							res.setHeader("Content-Type", "text/html; charset=UTF-8");
							res.end(fs.readFileSync('./index.html'));
							break;
						} default: break;
					}
					break;
				} default: break;
			}
			functions.find((f) => f(req, res, parsedUrl));
		} catch (x) {
			res.statusCode = 500;
			console.log(x);
			res.end("Internal Server Error");
		}
		console.log(req.method, req.url, '-', res.statusCode);
	})
	.listen(env.PORT || env.SERVER_PORT, console.log);
