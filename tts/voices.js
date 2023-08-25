const info = require("./info");
const tts = require("./main");
const http = require("http");
const voices = info.voices,
	xmls = {};

Object.keys(voices).forEach((i) => {
	const v = voices[i],
		l = v.language;
	xmls[l] = xmls[l] || [];
	xmls[l].push(`<voice id="${i}" desc="${v.desc}" sex="${v.gender}" demo-url="" country="${v.country}" plus="N"/>`);
});
const xml = `${process.env.XML_HEADER}<voices>${Object.keys(xmls).sort().map((i) => {
	const v = xmls[i],
	l = info.languages[i];
	return `<language id="${i}" desc="${l}">${v.join("")}</language>`;
}).join("")}</voices>`;

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.pathname) {
		case "/api/getAIVoices": {
			tts.getAIVoices().then(i => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(i, null, "\t"));
			}).catch(e => {
				res.statusCode = 400;
				console.log(e);
			});
			break;
		}
		case "/goapi/getTextToSpeechVoices/": {
			res.setHeader("Content-Type", "application/xml");
			res.end(xml);
			break;
		} default: return;
	}
	return true;
};
