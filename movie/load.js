const movie = require("./main");
const base = Buffer.alloc(1, 0);
const http = require("http");
const loadPost = require("../misc/post_body");
const fUtil = require("../misc/file");
const formidable = require("formidable");
let userId = null;
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const fs = require("fs");
const parse = require("./parse");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			switch (url.pathname) {
				default: {
					const match = req.url.match(/\/movies\/([^/]+)$/);
					if (!match) return;
					const id = match[1].substr(0, match[1].lastIndexOf("."));
					const ext = match[1].substr(match[1].lastIndexOf(".") + 1);
					switch (ext) {
						case "xml": {
							res.setHeader("Content-Type", "text/xml");
							movie.loadXml(id).then((v) => res.end(v)).catch(e => {
								console.log(e);
								res.end("Not Found");
							});
							break;
						} case "zip": {
							res.setHeader("Content-Type", "application/zip");
							movie.loadZip({
								movieId: id,
							}, {
								movieOwnerId: userId
							}, true).then(v => res.end(v)).catch(e => {
								console.log(e);
								res.end("Not Found");
							});
							break;
						} case "mp4": {
							if (fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", id.substr(2)))) {
								res.setHeader("Content-Type", "video/mp4");
								res.end(fs.readFileSync(fUtil.getFileIndex("movie-", ".mp4", id.substr(2))));
							} else res.end("Not Found");
						}
					}
					break;
				}
			}
			break;
		}

		case "POST": {
			switch (url.pathname) {
				case "/ajax/previewText2Video": {
					new formidable.IncomingForm().parse(req, async (e, f, files) => { 
						/* if i am correct, the opening and closing stuff is pretty much for characters, so we need to find a way to fit the correct emotions into the characters 
						and also lipsync the text to the characters. */
						if (e) return res.end(JSON.stringify({error: e}));
						console.log(f);// writes the preview xml
						const charIdsXml = {
							"1": "AVATOR134",
							"2": "AVATOR135"
						};
						const charIds = [];
						let movieXml = `<film copyable="0" duration="7.5" published="0" pshare="0" isWide="1">
						<meta>
						  <title><![CDATA[]]></title>
						  <tag><![CDATA[]]></tag>
						  <hiddenTag><![CDATA[]]></hiddenTag>
						  <desc><![CDATA[]]></desc>
						  <mver><![CDATA[4]]></mver>
						  <studio>d7446f28669693f5b7a35d41831e43c3662c48bf</studio>
						  <thumbnail index="0"/>
						  <palette>
							<color value="333333"/>
							<color value="999999"/>
							<color value="fbfbfb"/>
							<color value="669999"/>
							<color value="55bbaa"/>
							<color value="7fbb11"/>
							<color value="15709b"/>
							<color value="9a5d1"/>
							<color value="6ab8d6"/>
							<color value="da2021"/>
							<color value="fecd31"/>
							<color value="28c6c1"/>
							<color value="37444f"/>
						  </palette>
						</meta>`;
						const counts = {
							chars: 0,
							scripts: 0
						}
						for (const data in f) {
							if (data.includes(`script`)) {
								if (data.includes(`script[${counts.chars}][cid]`) && counts.chars < 2) { // pushes char ids to the charIds table for later usage.
									charIds.push(f[`script[${counts.chars}][cid]`]);
									counts.chars++
								}
							}
						}
						console.log(charIds, counts);
						res.end(JSON.stringify({
							error: "the golite movie preview system is in beta right now. please check back later."
						}))
					});
					break;
				} case "/api/sendUserInfo": {
					function sendUserInfo() {
						return new Promise(async resolve => {
							const [data] = await loadPost(req, res)
							userId = data.userId;
							resolve();
						});
					}
					sendUserInfo().then(() => res.end());
					break;
				} case "/goapi/getMovie/": {
					res.setHeader("Content-Type", "application/zip");
					loadPost(req, res).then(async ([data]) => {
						try {
							if (url.query.movieId != "templatePreview") {
								const b = await movie.loadZip(url.query, data);
								res.end(Buffer.concat([base, b]));
							} else res.end(Buffer.concat([base, await parse.packMovie(fs.readFileSync("./previews/template.xml"))]));
						} catch (e) {
							console.log(e);
							res.end(1 + e);
						}
					});
					break;
				} case "/api/videoExport/completed": {
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						const frames = f.frames;
						const base = path.join(__dirname, "../frames");
						const preview = path.join(__dirname, "../previews");
						if (!fs.existsSync(base)) fs.mkdirSync(base);
						if (!fs.existsSync(preview)) fs.mkdirSync(preview);
						fs.readdirSync(base).forEach(file => fs.unlinkSync(path.join(base, file)));
						fs.readdirSync(preview).forEach(file => fs.unlinkSync(path.join(preview, file)));
						for (const i in frames) {
							const frameData = Buffer.from(frames[i], "base64");
							fs.writeFileSync(path.join(base, i + ".png"), frameData);
						}
						if (!f.isPreview) (ffmpeg().input(base + "/%d.png").on("end", () => {
							if (fs.existsSync(path.join(base, "output.mp4"))) {
								fs.writeFileSync(fUtil.getFileIndex("movie-", ".mp4", f.id.substr(2)), fs.readFileSync(path.join(base, "output.mp4")));
								res.end(JSON.stringify({
									videoUrl: `/frames/output.mp4`
								}));
							}
						})).videoCodec("libx264").outputOptions("-framerate", "23.97").outputOptions("-r", "23.97").output(path.join(base, "output.mp4")).size("640x360").run();
						else (ffmpeg().input(base + "/%d.png").on("end", () => {
							if (fs.existsSync(path.join(base, "output.mp4"))) {
								fs.writeFileSync(path.join(preview, f.id + ".mp4"), fs.readFileSync(path.join(base, "output.mp4")));
								res.end(JSON.stringify({
									videoUrl: `/previews/${f.id}.mp4`
								}));
							}
						})).videoCodec("libx264").outputOptions("-framerate", "23.97").outputOptions("-r", "23.97").output(path.join(base, "output.mp4")).run();
					});
					break;
				} case "/api/check4ExportedMovieExistance": {
					loadPost(req, res).then(([data]) => {
						res.end(JSON.stringify({
							exists: fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", data.id.substr(2)))
						}))
					})
					break;
				} case "/api/savePreviewXml": {
					req.on('end', () => res.end());
					movie.previewer.push(req, url.query.videoId);
					break;
				} case "/api/checkXml4Audio": {
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						const id = f.videoId;
						switch (f.isPreview) {
							case '0': {
								res.end(JSON.stringify({xmlDoesContainAudio: movie.checkXml4Audio(id)}));
								break;
							} case '1': {
								const buffer = fs.readFileSync(`./previews/${id}.xml`);
								const filmXml = ( // creates a proper xml for the movie parser to read
								buffer.slice(buffer.indexOf("<filmxml>") + 9, buffer.indexOf("</filmxml>")).toString("utf8")
								).split("%3C").join("<").split("%22").join('"').split("%20").join(" ").split("%3E").join(">").split("%3D").join("=")
								.split("%21").join("!").split("%5B").join("[").split("%5D").join("]").split("%0A").join("");
								res.end(JSON.stringify({xmlDoesContainAudio: parse.check4XmlAudio(filmXml)}));
								break;
							}
						}
					});
					break;
				}
			}
			break;
		} default: return;
	}
};
