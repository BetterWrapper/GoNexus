const loadPost = require("../misc/post_body");
const mp3Duration = require("mp3-duration");
const voices = require("./info").voices;
const asset = require("../asset/main");
const tts = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/convertTextToSoundAsset/") return;
	loadPost(req, res).then(async ([data]) => {
		try {
			const buffer = await tts.genVoice(data.voice, data.text);
			mp3Duration(buffer, (e, d) => {
				var dur = d * 1e3;
				if (e || !dur) return res.end(1 + `<error><code>ERR_ASSET_404</code><message>${
					e || "Unable to retrieve MP3 stream."
				}</message><text></text></error>`);
				const title = `[${voices[data.voice].desc}] ${data.text}`;
				const id = asset.save(buffer, {
					type: "sound",
					subtype: "tts",
					title,
					published: 0,
					tags: "",
					duration: dur,
					downloadtype: "progressive",
					ext: "mp3"
				}, data);
				res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${
					title
				}</title><published>0</published><tags></tags><duration>${dur}</duration><downloadtype>progressive</downloadtype><file>${
					id
				}</file></asset></response>`);
			});
		} catch (e) {
			console.log(e);
			res.end(1 + `<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
		}
	});
	return true;
};
