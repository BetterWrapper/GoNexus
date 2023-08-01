const info = require("./info");
const http = require("http");
const voices = info.voices,
	jsons = {},
	xmls = {};

Object.keys(voices).forEach((i) => {
	const v = voices[i],
		l = v.language;
	jsons[l] = jsons[l] || [];
	jsons[l].unshift({
		id: i,
		desc: v.desc,
		sex: v.gender,
		vendor: v.source,
		demo: "",
		country: v.country,
		lang: l,
		plus: false,
	});
	xmls[l] = xmls[l] || [];
	xmls[l].push(`<voice id="${i}" desc="${v.desc}" sex="${v.gender}" demo-url="" country="${v.country}" plus="N"/>`);
});

const xml = `${process.env.XML_HEADER}<voices>${Object.keys(xmls).sort().map((i) => {
	const v = xmls[i],
	l = info.languages[i];
	return `<language id="${i}" desc="${l}">${v.join("")}</language>`;
}).join("")}</voices>`;

const json = Object.keys(jsons).sort().map((i) => {
	const v = jsons[i],
	l = info.languages[i];
	const json = {};
	json[i] = {
		desc: l,
		options: v
	};
	return json;
});

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.pathname) {
		case "/api/getTTSVoices": {
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(json, null, "\t"));
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
