const movie = require("./main");
const base = Buffer.alloc(1, 0);
const http = require("http");
const loadPost = require("../misc/post_body");
const fUtil = require("../misc/file");
const formidable = require("formidable");
const ttsInfo = require("../tts/info");
let userId = null;
const path = require("path");
const tts = require("../tts/main");
const asset = require("../asset/main");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const fs = require("fs");
const parse = require("./parse");
const mp3Duration = require("mp3-duration");
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
						try {
							/* if i am correct, the opening and closing stuff is pretty much for characters, so we need to find a way to fit the correct 
							emotions into the characters and also lipsync the text to the characters. */
							if (e) return res.end(JSON.stringify({error: e}));
							console.log(f);// writes the preview xml
							// 0j9k0au9jjgp will be used for templates.
							const charIdsXML = {
								"1": "AVATOR134",
								"2": "AVATOR135"
							};
							const bgIds = {
								"0nZrWjgxqytA": [
									"custom.cbg_office_pentry",
									"cbg_office_pentry_BG102",
									"custom.office_pentry_bg.swf"
								],
								"0l87L_vwbfMM": [
									"custom.cbg_sittingroom",
									"cbg_sittingroom_BG260",
									"custom.sitting_room_bg.swf"
								]
							}
							const flashvars = new URLSearchParams({
								movieId: "templatePreview",
								movieOwnerId: "0j9k0au9jjgp",
							    movieLid: "0",
							    ut: "23",
							    numContact: "",
							    apiserver: "/",
							    playcount: 1,
							    ctc: "go",
							    tlang: "en_US",
							    autostart: "1",
							    appCode: "go",
							    is_slideshow: "0",
							    originalId: "0Y7-ebJ36Ip4",
							    is_emessage: "0",
							    storePath: process.env.STORE_URL + "/<store>",
							    clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
							    animationPath: process.env.SWF_URL + "/",
							    isEmbed: "0",
							    refuser: null,
							    utm_source: null,
							    uid: null,
							    isTemplate: "1",
							    showButtons: "1",
							    chain_mids: "",
							    averageRating: 5,
							    ratingCount: "1",
							    fb_app_url: "/",
							    ad: 1,
							    endStyle: 0,
							    isWide: "1",
							    pwm: 1,
							    initcb: "flashPlayerLoaded",
							    showshare: false
							}).toString();
							let soundXml = `<sound id="SOUND0" index="0" track="0" vol="1" tts="0">
							<sfile>common.Sunshine.mp3</sfile>
							<start>1</start>
							<stop>1440</stop>
							<fadein duration="0" vol="0"/>
							<fadeout duration="0" vol="0"/>
						    </sound>`;
							let movieXml = `<film copyable="0" published="0" pshare="0" isWide="1">
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
						    const charIds = [];
						    const counts = {
							    chars: 0,
							    scripts: 0,
								currentXMLMovieScenes: 4,
								currentXMLMovieSounds: 2
						    }
						    for (const data in f) { // characters
								if (!data.includes(`script[1]`)) return res.end(JSON.stringify({
									error: "Your video must have 2 characters talking to one another. please fix any errors you made and preview your video again."
								}));
							    if (data.includes(`characters[${counts.chars}][`) && counts.chars < 2) {
								    charIds.push(data.split(`characters[${counts.chars}][`)[1].split("]")[0]);
								    counts.chars++
							    }
							}
							let sceneXml = `<scene id="SCENE0" adelay="60" lock="N" index="0" color="16777215" guid="E74BC5F9-ABF7-1E20-43DE-E7D6C961146C" combgId="${bgIds[f.enc_tid][0]}">
							<durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
							<bg id="${bgIds[f.enc_tid][1]}" index="0">
							  <file>${bgIds[f.enc_tid][2]}</file>
							</bg>
							<char id="AVATOR134" index="3" raceCode="1">
							  <action face="-1" motionface="1">ugc.${charIds[0]}.stand2.xml</action>
							  <x>230.8333333</x>
							  <y>241.05</y>
							  <xscale>1</xscale>
							  <yscale>1</yscale>
							  <rotation>0</rotation>
							</char>
							<char id="AVATOR135" index="4" raceCode="1">
							  <action face="1,1" motionface="1">ugc.${charIds[1]}.walk.xml</action>
							  <x>661.05,427.9376291</x>
							  <y>240.7,238.95</y>
							  <xscale>1,1</xscale>
							  <yscale>1,1</yscale>
							  <rotation>0,0</rotation>
							  <assetMotion ver="2"/>
							</char>
							<prop id="cbg_office_pentry_PROP71" index="1" attached="Y">
							  <file>custom.office_pentry_coffee.swf</file>
							  <x>120</x>
							  <y>190</y>
							  <xscale>1</xscale>
							  <yscale>1</yscale>
							  <face>1</face>
							  <rotation>0</rotation>
							</prop>
							<prop id="cbg_office_pentry_PROP72" index="2" attached="Y">
							  <file>custom.office_pentry_water_dispenser.swf</file>
							  <x>445</x>
							  <y>245</y>
							  <xscale>1</xscale>
							  <yscale>1</yscale>
							  <face>1</face>
							  <rotation>0</rotation>
							</prop>
							<effectAsset id="EFFECT1" themecode="common" index="5">
							  <effect x="0" y="0" w="550" h="310" rotate="0" id="fadeInEx" type="FADING" isIn="true" isOut="false"/>
							  <x>47</x>
							  <y>24</y>
							  <width>550</width>
							  <height>354</height>
							  <speech>0</speech>
							</effectAsset>
							<effectAsset id="EFFECT0" themecode="common" index="6">
							  <effect x="0" y="0" w="550" h="310" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
							  <x>47</x>
							  <y>24</y>
							  <width>550</width>
							  <height>354</height>
							  <speech>0</speech>
							</effectAsset>
							<aTranList>
							  <aTran id="0" target="AVATOR135" type="MotionPath" atype="Character" direction="2" section="6" timing="3" duration="24" delay="0">null</aTran>
							</aTranList>
						  </scene>
						  <scene id="SCENE3" adelay="60" lock="N" index="1" color="16777215" guid="00B05EB3-659F-8443-CB11-9C8DCF276579">
							<durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
							<bg id="${bgIds[f.enc_tid][1]}" index="0">
							  <file>${bgIds[f.enc_tid][2]}</file>
							</bg>
							<char id="AVATOR134" index="3" raceCode="1">
							  <action face="-1" motionface="1">ugc.${charIds[0]}.stand2.xml</action>
							  <x>230.8333333</x>
							  <y>241.05</y>
							  <xscale>1</xscale>
							  <yscale>1</yscale>
							  <rotation>0</rotation>
							</char>
							<char id="AVATOR135" index="4" raceCode="1">
							  <action face="1" motionface="1">ugc.${charIds[1]}.stand2.xml</action>
							  <x>427.9376291</x>
							  <y>238.95</y>
							  <xscale>1</xscale>
							  <yscale>1</yscale>
							  <rotation>0</rotation>
							</char>
							<prop id="cbg_office_pentry_PROP71" index="1" attached="Y">
							  <file>custom.office_pentry_coffee.swf</file>
							  <x>120</x>
							  <y>190</y>
							  <xscale>1</xscale>
							  <yscale>1</yscale>
							  <face>1</face>
							  <rotation>0</rotation>
							</prop>
							<prop id="cbg_office_pentry_PROP72" index="2" attached="Y">
							  <file>custom.office_pentry_water_dispenser.swf</file>
							  <x>445</x>
							  <y>245</y>
							  <xscale>1</xscale>
							  <yscale>1</yscale>
							  <face>1</face>
							  <rotation>0</rotation>
							</prop>
							<effectAsset id="EFFECT0" themecode="common" index="5">
							  <effect x="0" y="0" w="550" h="310" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
							  <x>47</x>
							  <y>24</y>
							  <width>550</width>
							  <height>354</height>
							  <speech>0</speech>
							</effectAsset>
						    </scene>`;
						    for (var i = 0; i < 30; i++) { // scripts
								if (f[`script[${i}][text]`]) {
									const buffer = await tts(f[`script[${i}][voice]`], f[`script[${i}][text]`]);
									const title = `[${ttsInfo.voices[f[`script[${i}][voice]`]].desc}] ${f[`script[${i}][text]`]}`;
									function getAssetId() {
										return new Promise(resolve => {
											mp3Duration(buffer, (e, d) => {
												var dur = d * 1e3;
												if (e || !dur) return res.end(JSON.stringify({
													error: e || "Unable to retrieve MP3 stream."
												}));
												resolve(asset.save(buffer, {
													type: "sound",
													subtype: "tts",
													title,
													published: 0,
													tags: "",
													duration: dur,
													downloadtype: "progressive",
													ext: "mp3"
												}, {
													userId: "0j9k0au9jjgp",
													isTemplate: true
												}));
											});
										});
									}
									const assetId = await getAssetId();
									sceneXml += `<scene id="SCENE${counts.currentXMLMovieScenes}" adelay="60" lock="N" index="2" color="16777215" guid="40D8714F-274B-7750-3F6C-12AB71F88763">
										<durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
										<bg id="cbg_office_pentry_BG102" index="0">
										  <file>custom.office_pentry_bg.swf</file>
										</bg>
										<char id="AVATOR134" index="3" raceCode="1">
										  <action face="-1" motionface="1">ugc.c-0.stand2.xml</action>
										  <x>230.8333333</x>
										  <y>241.05</y>
										  <xscale>1</xscale>
										  <yscale>1</yscale>
										  <rotation>0</rotation>
										</char>
										<char id="AVATOR135" index="4" raceCode="1">
										  <action face="1" motionface="1">ugc.c-0.stand2.xml</action>
										  <x>427.9376291</x>
										  <y>238.95</y>
										  <xscale>1</xscale>
										  <yscale>1</yscale>
										  <rotation>0</rotation>
										</char>
										<prop id="cbg_office_pentry_PROP71" index="1" attached="Y">
										  <file>custom.office_pentry_coffee.swf</file>
										  <x>120</x>
										  <y>190</y>
										  <xscale>1</xscale>
										  <yscale>1</yscale>
										  <face>1</face>
										  <rotation>0</rotation>
										</prop>
										<prop id="cbg_office_pentry_PROP72" index="2" attached="Y">
										  <file>custom.office_pentry_water_dispenser.swf</file>
										  <x>445</x>
										  <y>245</y>
										  <xscale>1</xscale>
										  <yscale>1</yscale>
										  <face>1</face>
										  <rotation>0</rotation>
										</prop>
										<effectAsset id="EFFECT0" themecode="common" index="5">
										  <effect x="0" y="0" w="200" h="113" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
										  <x>141</x>
										  <y>95.1363636</y>
										  <width>200</width>
										  <height>128.7272727</height>
										  <speech>0</speech>
										</effectAsset>
									  </scene>`;
									soundXml += `<sound id="SOUND${counts.currentXMLMovieSounds}" index="0" track="0" vol="1" tts="1">
									    <sfile>ugc.${assetId}</sfile>
									    <start>121</start>
									    <stop>174</stop>
									    <fadein duration="0" vol="0"/>
									    <fadeout duration="0" vol="0"/>
									    <ttsdata>
										  <type><![CDATA[tts]]></type>
										  <text><![CDATA[${f[`script[${i}][text]`]}]]></text>
										  <voice><![CDATA[${f[`script[${i}][voice]`]}]]></voice>
									    </ttsdata>
									  </sound>
									  <linkage>SOUND${counts.currentXMLMovieSounds},~~~${charIdsXML[f[`script[${i}][char_num]`]]},SCENE${counts.currentXMLMovieScenes}~~~</linkage>`;
									console.log(sceneXml, soundXml);
								}
						    }
						    res.end(JSON.stringify({
							    error: "the golite movie preview system is in beta right now. please check back later."
						    }))
						} catch (e) {
							console.log(e);
							res.end(JSON.stringify({
							    error: "The server failed to generate your video preview. please try again later."
						    }))
						}
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
