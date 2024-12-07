const formidable = require("formidable");
const mp3Duration = require("mp3-duration");
const asset = require("./main");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const http = require("http");
const fs = require("fs");
const session = require("../misc/session");
function stream2Buffer(stream) {
	return new Promise((res, rej) => {
		try {
			const buffers = [];
			stream.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
		} catch (e) {
			rej(e);
		}
	})
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.pathname != "/ajax/saveUserProp") return;
	new formidable.IncomingForm().parse(req, async (e, f, files) => {
		try {
			const currentSession = session.get(req);
			if (req.headers.referer.includes("?movieId=ft-")) {
				return res.end(JSON.stringify({
					suc: false,
					msg: `Because you are using a video that has been imported from FlashThemes, you cannot import assets to this video at the moment as this video is right now using the FlashThemes servers to get all of the assets provided in this video. Please save your video as a normal one in order to get some LVM features back.`
				}));
			} else if (!f.subtype) {
				return res.end(JSON.stringify({
					suc: false,
					msg: `Missing one or more fields`
				}));
			} else if (e) {
				res.end(JSON.stringify({
					suc: false, 
					msg: e.toString()
				}));
			} else if (!files.file) {
				res.end(JSON.stringify({
					suc: false,
					msg: "Please choose a file to upload"
				}));
			} else if (currentSession.data.current_uid) {
				const type = f.subtype == "soundeffect" || f.subtype == "voiceover" || f.subtype == "bgmusic" ? "sound" : f.subtype;
				const {
					path, 
					filepath, 
					originalFilename, 
					name: fiieName
				} = files.file;
				const name = originalFilename || fiieName;
				const filePath = filepath || path;
				const ext = name.substr(name.lastIndexOf(".") + 1);
				let buffer;
				if (type == "sound" && ext != "mp3") {
					const stream = ffmpeg(
						fs.createReadStream(filePath)
					).inputFormat(ext).toFormat("mp3").audioBitrate(4.4e4).on('error', (error) => {
						return res.end(JSON.stringify({
							suc: false,
							msg: `Encoding Error: ${error.message}`
						}));
					}).pipe();
					buffer = await stream2Buffer(stream);
				} else buffer = fs.readFileSync(filePath);
				const info = {
					suc: true,
					asset_type: type,
					filename: name,
				};
				const meta = {
					type,
					subtype: type != "sound" ? 0 : f.subtype,
					title: name,
					published: 0,
					tags: "",
					ext: type == "sound" ? "mp3" : ext
				};
				switch (type) {
					case "prop": {
						meta.ptype = "placeable";
						break;
					} case "sound": {
						await new Promise(resolve => {
							mp3Duration(buffer, (e, d) => {
								if (e) return res.end(JSON.stringify({
									suc: false, 
									msg: e || "Unable to retreive an MP3 stream"
								}));
								meta.duration = d * 1e3;
								meta.downloadtype = "progressive";
								resolve();
							});
						});
						break;
					}
				}
				info.id = asset.save(buffer, meta, {
					userId: currentSession.data.current_uid
				});
				if (type != "sound") info.thumbnail = `/goapi/getAsset/${info.id}`;
				info.asset_data = meta;
				res.end(JSON.stringify(info));
			} else {
				res.end(JSON.stringify({
					suc: false, 
					msg: "Please login in order to import an asset"
				}));
			}
		} catch (e) {
			console.log(e);
			res.end(JSON.stringify({
				suc: false, 
				msg: e.toString()
			}));
		}
	});
	return true;
};
