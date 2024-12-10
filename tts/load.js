const loadPost = require("../misc/post_body");
const mp3Duration = require("mp3-duration");
const asset = require("../asset/main");
const tts = require("./main");
const http = require("http");
const https = require("https");
const oldvoices = require("./oldvoices");
const parse = require("../movie/parse");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.pathname) {
		case "/api/retreiveMp3DurationFromURL": {
			https.get(url.query.url, r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => {
					mp3Duration(Buffer.concat(buffers), (e, d) => {
						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({
							e,
							d,
							lvmDur: d * 1e3
						}));
					});
				})
			})
			break;
		} case "/goapi/rebuildTTS/": {
			loadPost(req, res).then(data => { 
				/**
				 * I am pretty sure that this api path works the same way as both the /goapi/getAsset/ and /goapi/getAssetEx/ paths. 
				 * This path will only retrieve tts buffers from the movie parser and not local files.
				 * From the Coding Mastery Of Joseph.
				*/
				res.end(parse.retrieveTTSBuffer(data.assetId));
			});
			break;
		} case "/goapi/convertTextToSoundAsset/": {
			loadPost(req, res).then(async data => {
				if (data.movieId && data.movieId.startsWith("ft-")) {
					res.end(1 + `<error><code>ERR_ASSET_404</code><message>Because you are using a video that has been imported from FlashThemes, you cannot generate TTS voices to this video at the moment as this video is right now using the FlashThemes servers to get all of the assets provided in this video. Please save your video as a normal one in order to get some LVM features back.</message><text></text></error>`);
				} else try {
					const buffer = await tts.genVoice(data);
					const voice = data.v == "2010" ? oldvoices[data.voice.toLowerCase()] : tts.getVoiceInfo(data.voice);
					const info = {
						type: "sound",
						subtype: "tts",
						published: 0,
						title: `[${voice.name}] ${data.text}`,
						tags: "",
						downloadtype: "progressive",
						ext: data.v == "2010" ? 'swf' : "mp3"
					}
					if (!data.v || data.v != "2010") mp3Duration(buffer, (e, d) => {
						const dur = info.duration = d * 1e3;
						if (e || !dur) return res.end(1 + `<error><code>ERR_ASSET_404</code><message>${
							e || "Unable to retrieve MP3 stream."
						}</message><text></text></error>`);
						const id = asset.save(buffer, info, data);
						const assetXml = `<asset><id>${id}</id><enc_asset_id>${
							id
						}</enc_asset_id><type>sound</type><signature></signature><subtype>tts</subtype><title>${
							info.title
						}</title><published>0</published><tags></tags><duration>${dur}</duration><downloadtype>progressive</downloadtype><file>${
							id
						}</file></asset>`;
						if (!data.v) res.end(`0<response>${assetXml}</response>`);
						else res.end('0' + assetXml);
					});
					else {
						// i honestly have no idea what to do for the 2010 lvm anymore.
						res.end("1");
					}
				} catch (e) {
					console.log(e);
					res.end(1 + `<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
				}
			});
			break;
		} default: return;
	}
	return true;
};
