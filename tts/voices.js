const langs = {
	"hi": "Hindi",
	"ku": "Kurdish",
	"az": "Azeri",
	"ur": "Urdu",
	"th": "Thai",
	"el": "Greek",
	"fi": "Suomi",
	"ar": "Arabic",
	"de": "German",
	"fr": "French",
	"da": "Danish",
	"en": "English",
	"es": "Spanish",
	"ca": "Catalan",
	"ru": "Russian",
	"it": "Italian",
	"tr": "Turkish",
	"zh": "Chinese",
	"ja": "Japanese",
	"ro": "Romanian",
	"no": "Norwegian",
	"va": "Valencian",
	"pt": "Portuguese",
	"eo": "Esperanto",
	"gl": "Galician",
	"sv": "Swedish",
	"ko": "Korean",
	"pl": "Polish",
	"nl": "Dutch",
	"cy": "Welsh",
	"id": "Indonesian",
	"fo": "Faroese",
	"is": "Icelandic",
	"gd": "Scottish Gaelic",
	"cs": "Czech"
}
function getLangPre(langName) {
	for (const langInfo in langs) {
		if (langs[langInfo] == langName) return langInfo;
	}
}
const tts = require("./main");
const https = require("https");
const loadPost = require("../misc/post_body");
function getXml(apiName) {
	return new Promise((res, rej) => {
		https.get(`https://lazypy.ro/tts/assets/js/voices.json`, r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => {
				try {
					const json = JSON.parse(Buffer.concat(buffers))[apiName];
					const xmls = {};
					for (const voiceInfo of json.voices) {
						xmls[getLangPre(voiceInfo.lang)].push(`<voice id="${voiceInfo.vid}" desc="${voiceInfo.name}" sex="${voiceInfo.gender}" demo-url="" country="${voiceInfo.flag}" plus="N"/>`)
					}
					const xml = `${process.env.XML_HEADER}<voices>${Object.keys(xmls).sort().map((i) => {
						const v = xmls[i],
						l = langs[i];
						return `<language id="${i}" desc="${l}">${v.join("")}</language>`;
					}).join("")}</voices>`
					console.log(xml);
					res(xml);
				} catch (e) {
					rej(e);
				}
			}).on("error", rej);
		}).on("error", rej);
	});
}

module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.pathname) {
		case "/api/getAIVoices": {
			loadPost(req, res).then(([data]) => tts.checkAIVoiceServer(data).then(q => {
				console.log(q);
				if (q == "ContainsErrors") {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify({
						en: {
							desc: "English",
							options: [
								{
									id: "Hannah",
									desc: "Hannah",
									sex: "F",
									vendor: "Topmediai",
									demo: "",
									country: "US",
									lang: "en",
									plus: false
								}
							]
						}
					}));
				} else tts.getAIVoices().then(i => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(i, null, "\t"));
				}).catch(e => {
					res.statusCode = 400;
					console.log(e);
				});
			}));
			break;
		}
		case "/goapi/getTextToSpeechVoices/": {
			getXml("Streamlabs").then(xml => {
				res.setHeader("Content-Type", "application/xml");
				res.end(xml);
			});
			break;
		} default: return;
	}
	return true;
};
