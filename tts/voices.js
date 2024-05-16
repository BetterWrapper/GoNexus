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
	return langName;
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
function getVoicesJson(apiName, isQvm = false, filename) {
	return new Promise((res, rej) => {
		function genJson(json) {
			const table = {};
			for (const voiceInfo of json.voices) {
				const vid = voiceInfo.id || voiceInfo.vid;
				const flag = voiceInfo.flag || voiceInfo.country;
				const langPre =  getLangPre(voiceInfo.lang || voiceInfo.language);
				const lang = json.languages && json.languages[langPre] ? json.languages[langPre] : voiceInfo.lang || voiceInfo.language;
				voices[vid] = voiceInfo;
				const stuffExists = [
					fs.existsSync(`./ui/img/${flag}.png`) && langPre,
					fs.existsSync(`./ui/img/voiceflag_${langPre}.png`)
				]
				const stuff = stuffExists[1] ? `${langPre}.${lang}` : "More";
				if (stuffExists[0]) {
					table[stuff] = table[stuff] || [];
					table[stuff].unshift({
						id: vid,
						desc: voiceInfo.desc || voiceInfo.name,
						sex: voiceInfo.gender,
						demo: "",
						vendor: voiceInfo.source || json.apiName || apiName,
						lang: langPre,
						country: flag,
						plus: false
					})
				}
			}
			const json2 = {};
			Object.keys(table).sort().map((i) => {
				json2[i == "More" ? "default" : i.split(".")[0]] = {
					desc: json.languages && json.languages[i.split(".")[0]] ? json.languages[i.split(".")[0]] : i.split(".")[1] || i,
					options: table[i]
				}
			});
			res(json2);
		}
		function loadLocalVoices(filepath, param, array) {
			const json2 = JSON.parse(fs.readFileSync(filepath));
			const voices = !param ? json2 : json2[param];
			const json = {
				voices: [],
				vids: {}
			};
			for (const i of array) {
				json[i] = json2[i];
			}
			for (const i in voices) {
				const info = voices[i];
				info.id = i;
				json.voices.unshift(info);
			}
			genJson(json);
		}
		if (isQvm) loadLocalVoices(`./tts/${filename}.json`, 'voices', [ 
			'languages'
		]);
		else if (apiName.startsWith("local_")) loadLocalVoices(`./tts/${apiName.split("_")[1]}/voices.json`);
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
		} case "/api/getTTSVoices4QVM": {
			getVoicesJson("", true, "qvmvoices").then(i => {
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(i));
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
