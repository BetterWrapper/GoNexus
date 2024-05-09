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
	for (const lang in langs) {
		if (langs[lang] == langName) return lang;
	}
}
const tts = require("./main");
const voices = {};
const https = require("https");
const loadPost = require("../misc/post_body");
const fs = require("fs");
function getVoicesXml(apiName) {
	return new Promise((res, rej) => {
		function genXml(json) {
			const xmls = {};
			for (const voiceInfo of json.voices) {
				voices[voiceInfo.vid.split("-").join("").toLowerCase()] = voiceInfo;
				xmls[voiceInfo.lang] = xmls[voiceInfo.lang] || [];
				xmls[voiceInfo.lang].push(`<voice id="${voiceInfo.vid.split("-").join("").toLowerCase()}" desc="${
					voiceInfo.name
				}" sex="${voiceInfo.gender}" demo-url="" country="${voiceInfo.flag}" plus="N"/>`)
			}
			const xml = `${process.env.XML_HEADER}<voices>${Object.keys(xmls).sort().map((i) => {
				const v = xmls[i],
				l = getLangPre(i);
				return `<language id="${l}" desc="${i}">${v.join("")}</language>`;
			}).join("")}</voices>`
			res(xml);
		}
		if (apiName.startsWith("local_")) {
			const json = {
				voices: []
			};
			const voices = JSON.parse(fs.readFileSync(`./tts/${apiName.split("_")[1]}/voices.json`));
			for (const i in voices) {
				json.voices.unshift(voices[i]);
			}
			genXml(json);
		} else https.get(`https://lazypy.ro/tts/assets/js/voices.json`, r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => {
				try {
					genXml(JSON.parse(Buffer.concat(buffers))[apiName]);
				} catch (e) {
					rej(e);
				}
			}).on("error", rej);
		}).on("error", rej);
	});
}
function getVoicesJson(apiName) {
	return new Promise((res, rej) => {
		function genJson(json) {
			const table = {};
			for (const voiceInfo of json.voices) {
				voices[voiceInfo.vid] = voiceInfo;
				table[voiceInfo.flag.length <= 2 && getLangPre(voiceInfo.lang) && fs.existsSync(`./ui/img/${
					(getLangPre(voiceInfo.lang)).toUpperCase()
				}.png`) || fs.existsSync(`./ui/img/voiceflag_${
					getLangPre(voiceInfo.lang)
				}.png`) ? voiceInfo.lang : "More"] = table[voiceInfo.flag.length <= 2 && getLangPre(
					voiceInfo.lang
				) && fs.existsSync(`./ui/img/${(getLangPre(voiceInfo.lang)).toUpperCase()}.png`) || fs.existsSync(`./ui/img/voiceflag_${
					getLangPre(voiceInfo.lang)
				}.png`) ? voiceInfo.lang : "More"] || [];
				table[voiceInfo.flag.length <= 2 && getLangPre(voiceInfo.lang) && fs.existsSync(`./ui/img/${
					(getLangPre(voiceInfo.lang)).toUpperCase()
				}.png`) || fs.existsSync(`./ui/img/voiceflag_${getLangPre(voiceInfo.lang)}.png`) ? voiceInfo.lang : "More"].unshift({
					id: voiceInfo.vid,
					desc: voiceInfo.name,
					sex: voiceInfo.gender,
					vendor: json.apiName || apiName,
					demo: "",
					country: voiceInfo.flag.length <= 2 ? voiceInfo.flag : false,
					lang: getLangPre(voiceInfo.lang) || false,
					plus: false
				})
			}
			const json2 = {};
			Object.keys(table).sort().map((i) => {
				json2[i == "More" ? "default" : getLangPre(i)] = {
					desc: i,
					options: table[i]
				}
			});
			res(json2);
		}
		if (apiName.startsWith("local_")) {
			const json = {
				voices: []
			};
			const voices = JSON.parse(fs.readFileSync(`./tts/${apiName.split("_")[1]}/voices.json`));
			for (const i in voices) {
				json.voices.unshift(voices[i]);
			}
			genJson(json);
		}
		else https.get(`https://lazypy.ro/tts/assets/js/voices.json`, r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => {
				try {
					genJson(JSON.parse(Buffer.concat(buffers))[apiName]);
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
		case "/api/fetchTTSApis": {
			https.get(`https://lazypy.ro/tts/assets/js/voices.json`, r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => {
					try {
						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify(Object.keys(JSON.parse(Buffer.concat(buffers)))));
					} catch (e) {
						console.error(e);
					}
				}).on("error", console.error);
			}).on("error", console.error);
			break;
		} case "/api/getTextToSpeechVoices": {
			loadPost(req, res).then(data => {
				const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == data.uid);
				getVoicesJson(json.settings.api.ttstype.value.split("+").join(" ")).then(i => {
					tts.tempSaveUserVoice(data.uid, voices);
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(i));
				});
			});
			break;
		} case "/goapi/getTextToSpeechVoices/": {
			loadPost(req, res).then(data => {
				const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == data.userId);
				getVoicesXml(json.settings.api.ttstype.value.split("+").join(" ")).then(xml => {
					tts.tempSaveUserVoice(data.userId, voices);
					res.setHeader("Content-Type", "application/xml");
					res.end(xml);
				});
			});
			break;
		} default: return;
	}
	return true;
};
