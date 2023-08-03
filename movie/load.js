const movie = require("./main");
const base = Buffer.alloc(1, 0);
const http = require("http");
const loadPost = require("../misc/post_body");
const fUtil = require("../misc/file");
const formidable = require("formidable");
const voices = require("../tts/info").voices;
let userId = null;
const path = require("path");
const tts = require("../tts/main");
const asset = require("../asset/main");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const fs = require("fs");
const parse = require("./parse");
const mp3Duration = require("mp3-duration");
const templateAssets = [];
function getMp3Duration(buffer) {
	return new Promise((res, rej) => {
		mp3Duration(buffer, (e, d) => {
			var dur = d * 1e3;
			if (e || !dur) rej(e || "Unable to retreive file duration");
			else res(dur);
		});
	})
}
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
				case "/ajax/saveText2Video": { // save a qvm video (requires a user to be logged in)
					loadPost(req, res).then(([data]) => {
						console.log(data, templateAssets);
						if (!data.userId) return res.end(JSON.stringify({
							error: "You need to be logged in to your account in order to save your video."
						}));
						let movieXml = fs.readFileSync(`./previews/template.xml`, 'utf8');
						movieXml = movieXml.replace(`<film isWide="1">`, `<film copyable="0" published="0" pshare="0" isWide="1">`);
						movieXml = movieXml.replace(`<title><![CDATA[]]></title>`, `<title><![CDATA[${data.title}]]></title>`);
						movieXml = movieXml.replace(`<desc><![CDATA[]]></desc>`, `<desc><![CDATA[${data.desc}]]></desc>`);
						const mId = `m-${fUtil.getNextFileId("movie-", ".xml")}`;
						const mIdParts = {
							prefix: mId.substr(0, mId.lastIndexOf("-")),
							suffix: mId.substr(mId.lastIndexOf("-") + 1)
						};
						let thumb;
						if (data.thumbnail) { // if there was a thumbnail in the video

						} else switch (data.enc_tid){ // generate a thumbnail from the enc_tid param.
							case "0nZrWjgxqytA": {
								thumb = fs.readFileSync(`./qvm_files/bg03.jpg`);
								break;
							} default: {
								return res.end(JSON.stringify({
									error: "A thumbnail does not exist for this id. because of that, your video could not be saved. if you think that this is a bug, please contact lunabril#7273 on discord and let him know about this bug."
								}));
							}
						}
						const thumbpath = fUtil.getFileIndex("thumb-", ".png", mIdParts.suffix);
						const filepath = fUtil.getFileIndex("movie-", ".xml", mIdParts.suffix);
						fs.writeFileSync(thumbpath, thumb);
						fs.writeFileSync(filepath, movieXml);
						const user = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`))
						const json = user.users.find(i => i.id == data.userId);
						let metaCount;
						for (const meta of templateAssets) {
							metaCount = meta.orderNum;
							metaCount++
							json.assets.unshift(meta);
							for (let i = 0; i < metaCount; i++) {
								const index = templateAssets.findIndex(d => d.orderNum == i);
								templateAssets.splice(index, 1);
							}
						}
						fs.writeFileSync(`${asset.folder}/users.json`, JSON.stringify(user, null, "\t"));
						console.log(templateAssets);
						res.end(JSON.stringify({
							url: `/player?movieId=${mId}`
						}));
					});
					break;
				} case "/ajax/previewText2Video": { // loads qvm preview
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						// setup all of the functions for the xml generator
						console.log(f);
						if (!f["script[1][char_num]"]) return res.end(JSON.stringify({
							error: "Your video has to contain 2 characters talking to one another. please fix all of the errors you made and preview this video again."
						}));
						let movieXml = '', sceneXml = '', soundXml = `<sound id="SOUND0" index="0" track="0" vol="1" tts="0"><sfile>common.Sunshine.mp3</sfile><start>1</start>
						<stop>1440</stop><fadein duration="0" vol="0"/><fadeout duration="0" vol="0"/></sound>`, lipsyncXml = '';
						const charIds = [];
						const counts = {
							chars: 0,
							scenes: 2,
							sounds: 1
						};
						const avatarIds = {
							"1": "AVATOR266",
							"2": "AVATOR267"
						};
						for (const data in f) {
							if (data.includes(`characters[${counts.chars}][`)) {
								charIds.push(data.split(`characters[${counts.chars}][`)[1].split("]")[0]);
								counts.chars++
							}
							if (data.includes("script[") && data.includes("][char_num]")) {
								counts.scripts = data.split("script[")[1].split("][char_num]")[0];
								counts.scripts++
							}
						}
						console.log(charIds, counts);
						// and finally, generate the xml
						switch (f.enc_tid) {
							case "0nZrWjgxqytA": {
								movieXml += `<film isWide="1">
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
								</meta>
								<scene id="SCENE0" adelay="60" lock="N" index="0" color="16777215" guid="DB14CCE3-AB5B-321E-2198-2F6162DBF21D" combgId="custom.cbg_office_pentry">
								  <durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
								  <bg id="cbg_office_pentry_BG102" index="0">
									<file>custom.office_pentry_bg.swf</file>
								  </bg>
								  <char id="${avatarIds[f[`characters[0][${charIds[0]}]`]]}" index="3" raceCode="1">
									<action face="-1" motionface="1">ugc.${charIds[0]}.stand2.xml</action>
									<x>200.1</x>
									<y>237.4933025</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <char id="${avatarIds[f[`characters[1][${charIds[1]}]`]]}" index="4" raceCode="1">
									<action face="1,1" motionface="1">ugc.${charIds[1]}.walk.xml</action>
									<x>638.3756752,422.0256752</x>
									<y>244.7933025,238.975</y>
									<xscale>1,1</xscale>
									<yscale>1,1</yscale>
									<rotation>0,0</rotation>
									<assetMotion ver="2"/>
								  </char>
								  <prop id="cbg_office_pentry_PROP72" index="2" attached="Y">
									<file>custom.office_pentry_water_dispenser.swf</file>
									<x>445</x>
									<y>245</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<face>1</face>
									<rotation>0</rotation>
								  </prop>
								  <prop id="cbg_office_pentry_PROP71" index="1" attached="Y">
									<file>custom.office_pentry_coffee.swf</file>
									<x>120</x>
									<y>190</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<face>1</face>
									<rotation>0</rotation>
								  </prop>
								  <effectAsset id="EFFECT0" themecode="common" index="6">
									<effect x="0" y="0" w="550" h="310" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
									<x>47</x>
									<y>24</y>
									<width>550</width>
									<height>354</height>
									<speech>0</speech>
								  </effectAsset>
								  <effectAsset id="EFFECT1" themecode="common" index="5">
									<effect x="0" y="0" w="550" h="354" rotate="0" id="fadeInEx" type="FADING" isIn="true" isOut="false"/>
									<x>322</x>
									<y>179</y>
									<width>550</width>
									<height>354</height>
									<speech>0</speech>
								  </effectAsset>
								  <aTranList>
									<aTran id="0" target="${
										avatarIds[f[`characters[1][${charIds[1]}]`]]
									}" type="MotionPath" atype="Character" direction="2" section="6" timing="3" duration="24" delay="0">null</aTran>
								  </aTranList>
								</scene>
								<scene id="SCENE1" adelay="60" lock="N" index="1" color="16777215" guid="312C5B42-02B3-FAA4-C8D8-239EB712D4D6">
								  <durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
								  <bg id="cbg_office_pentry_BG102" index="0">
									<file>custom.office_pentry_bg.swf</file>
								  </bg>
								  <char id="${avatarIds[f[`characters[0][${charIds[0]}]`]]}" index="3" raceCode="1">
									<action face="-1" motionface="1">ugc.${charIds[0]}.stand2.xml</action>
									<x>200.1</x>
									<y>237.4933025</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <char id="${avatarIds[f[`characters[1][${charIds[1]}]`]]}" index="4" raceCode="1">
									<action face="1" motionface="-1">ugc.${charIds[1]}.stand2.xml</action>
									<x>422.0256752</x>
									<y>238.975</y>
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
								const texts = {};
								for (var i = 0; i < counts.scripts; i++) try {
									if (f[`script[${i}][text]`]) {
										texts[i] = f[`script[${i}][text]`];
										const buffer = await tts(f[`script[${i}][voice]`], f[`script[${i}][text]`]);
										const dur = await getMp3Duration(buffer);
										const title = `[${voices[f[`script[${i}][voice]`]].desc}] ${f[`script[${i}][text]`]}`;
										templateAssets.unshift(asset.save(buffer, {
											orderNum: i,
											type: "sound",
											subtype: "tts",
											title,
											published: 0,
											tags: "",
											duration: dur,
											downloadtype: "progressive",
											ext: "mp3"
										}, {
											isTemplate: true
										}));
										const meta = templateAssets.find(s => s.orderNum == i);
										switch (f[`script[${i}][char_num]`]) {
											case "1": {
												sceneXml += `<scene id="SCENE${counts.scenes}" adelay="${
													(Math.round(texts[i].length) * 24) + (texts[i].length * 24) + 96
												}" lock="N" index="${
													counts.scenes
												}" color="16777215" guid="D13D4A19-8247-704D-7D92-54C7E96875B9">
												<durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
												<bg id="cbg_office_pentry_BG102" index="0">
												  <file>custom.office_pentry_bg.swf</file>
												</bg>
												<char id="${avatarIds[f[`characters[0][${charIds[0]}]`]]}" index="3" raceCode="1">
												  <action face="-1" motionface="1">ugc.${charIds[0]}.stand2.xml</action>
												  ${f[`script[${i}][facial][${f[`characters[0][${charIds[0]}]`]}]`] != "default" ? `<head id="PROP3" raceCode="1"><file>ugc.${
													charIds[0]}.head.head_${f[`script[${i}][facial][${f[`characters[0][${charIds[0]}]`]}]`]}.xml</file></head>` : ''}
												  <x>200.1</x>
												  <y>237.4933025</y>
												  <xscale>1</xscale>
												  <yscale>1</yscale>
												  <rotation>0</rotation>
												</char>
												<char id="${avatarIds[f[`characters[1][${charIds[1]}]`]]}" index="4" raceCode="1">
												  <action face="1" motionface="1">ugc.${charIds[1]}.stand2.xml</action>
												  <x>422.0256752</x>
												  <y>238.975</y>
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
												  <effect x="0" y="0" w="167.483871" h="94.4" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
												  <x>124.7580645</x>
												  <y>102.2006452</y>
												  <width>167.483871</width>
												  <height>107.7987097</height>
												  <speech>0</speech>
												</effectAsset>
											  </scene>`;
											  break;
											} case "2": {
												sceneXml += `<scene id="SCENE${counts.scenes}" adelay="${
													(Math.round(texts[i].length) * 24) + (texts[i].length * 24) + 96
												}" lock="N" index="${
													counts.scenes
												}" color="16777215" guid="65B686F6-7257-FBA7-2397-2B22E0F82023">
												<durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
												<bg id="cbg_office_pentry_BG102" index="0">
												  <file>custom.office_pentry_bg.swf</file>
												</bg>
												<char id="${avatarIds[f[`characters[0][${charIds[0]}]`]]}" index="3" raceCode="1">
												  <action face="-1" motionface="1">ugc.${charIds[0]}.stand2.xml</action>
												  <x>200.1</x>
												  <y>237.4933025</y>
												  <xscale>1</xscale>
												  <yscale>1</yscale>
												  <rotation>0</rotation>
												</char>
												<char id="${avatarIds[f[`characters[1][${charIds[1]}]`]]}" index="4" raceCode="1">
												  <action face="1" motionface="1">ugc.${charIds[1]}.stand2.xml</action>
												  ${f[`script[${i}][facial][${f[`characters[1][${charIds[1]}]`]}]`] != "default" ? `<head id="PROP3" raceCode="1"><file>ugc.${
													charIds[1]}.head.head_${f[`script[${i}][facial][${f[`characters[1][${charIds[1]}]`]}]`]}.xml</file></head>` : ''}
												  <x>422.0256752</x>
												  <y>238.975</y>
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
												  <effect x="0" y="0" w="167.483871" h="94.4" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
												  <x>337.7080645</x>
												  <y>104.4506452</y>
												  <width>167.483871</width>
												  <height>107.7987097</height>
												  <speech>0</speech>
												</effectAsset></scene>`;
												break;
											}
										}
										soundXml += `<sound id="SOUND${counts.sounds}" index="${counts.sounds}" track="0" vol="1" tts="1"><sfile>ugc.${meta.id}</sfile><start>${
											(Math.round(texts[i].length) * 24) + 96
										}</start><stop>${
											(Math.round(texts[i].length) * 24) + (texts[i].length * 24) + 96
										}</stop><fadein duration="0" vol="0"/><fadeout duration="0" vol="0"/><ttsdata><type><![CDATA[tts]]></type><text><![CDATA[${
											f[`script[${i}][text]`]
										}]]></text><voice><![CDATA[${f[`script[${i}][voice]`]}]]></voice></ttsdata></sound>`;
										lipsyncXml += `<linkage>SOUND${counts.sounds},~~~${avatarIds[f[`script[${i}][char_num]`]]},SCENE${counts.scenes}~~~</linkage>`;
									} else { // mic recording
									}
									counts.scenes++
									counts.sounds++
								} catch (e) {
									console.log(e);
									return res.end(JSON.stringify({
										error: e
									}));
								}
								movieXml += `${sceneXml}<scene id="SCENE${counts.scenes + 1}" adelay="60" lock="N" index="${
									counts.scenes + 1
								}" color="16777215" guid="0D194FFF-1C84-FB94-B753-C981425ABF9D">
								<durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
								<bg id="cbg_office_pentry_BG102" index="0">
								  <file>custom.office_pentry_bg.swf</file>
								</bg>
								<char id="${avatarIds[f[`characters[0][${charIds[0]}]`]]}" index="3" raceCode="1">
								  <action face="-1" motionface="1">ugc.${charIds[0]}.stand2.xml</action>
								  <x>200.1</x>
								  <y>237.4933025</y>
								  <xscale>1</xscale>
								  <yscale>1</yscale>
								  <rotation>0</rotation>
								</char>
								<char id="${avatarIds[f[`characters[1][${charIds[1]}]`]]}" index="4" raceCode="1">
								  <action face="-1,-1" motionface="-1">ugc.${charIds[1]}.walk.xml</action>
								  <x>422.0256752,635.5756752</x>
								  <y>238.975,244.975</y>
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
								<effectAsset id="EFFECT0" themecode="common" index="6">
								  <effect x="0" y="0" w="550" h="310" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
								  <x>47</x>
								  <y>24</y>
								  <width>550</width>
								  <height>354</height>
								  <speech>0</speech>
								</effectAsset>
								<effectAsset id="EFFECT6" themecode="common" index="5">
								  <effect x="0" y="0" w="550" h="354" rotate="0" id="fadeOutEx" type="FADING" isIn="false" isOut="true"/>
								  <x>322</x>
								  <y>179</y>
								  <width>550</width>
								  <height>354</height>
								  <speech>0</speech>
								</effectAsset>
								<aTranList>
								  <aTran id="1" target="AVATOR267" type="MotionPath" atype="Character" direction="2" section="6" timing="3" duration="24" delay="0">null</aTran>
								</aTranList>
							  </scene>${soundXml}${lipsyncXml}</film>`;
							  break;
							} default: {
								return res.end(JSON.stringify({
									error: "The scene that you picked in step 1 does not exist on our database. please go back to step 1 and pick a different scene."
								}));
							}
						}
						console.log(counts);
						if (!fs.existsSync(`./previews`)) fs.mkdirSync(`./previews`);
						fs.writeFileSync(`./previews/template.xml`, movieXml);
						res.end(JSON.stringify({
							script: f,
							player_object: {
								movieId: "templatePreview",
								apiserver: "/",
								storePath: process.env.STORE_URL + "/<store>",
								ut: 23,
								autostart: 1,
								isWide: 1,
								clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
							}
						}))
					});
					break;
				} case "/api/sendUserInfo": { // sends the user info firebase provides to the server
					function sendUserInfo() {
						return new Promise(async resolve => {
							const [data] = await loadPost(req, res)
							userId = data.userId;
							resolve();
						});
					}
					sendUserInfo().then(() => res.end());
					break;
				} case "/goapi/getMovie/": { // loads a movie using the parse.js file
					res.setHeader("Content-Type", "application/zip");
					loadPost(req, res).then(async ([data]) => {
						try {
							if (url.query.movieId != "templatePreview") {
								const b = await movie.loadZip(url.query, data);
								res.end(Buffer.concat([base, b]));
							} else res.end(Buffer.concat([base, await parse.packMovie(fs.readFileSync("./previews/template.xml"), false, false, false, templateAssets)]));
						} catch (e) {
							console.log(e);
							res.end(1 + e);
						}
					});
					break;
				} case "/api/videoExport/completed": { // converts the video frames into an actual video.
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
				} case "/api/check4ExportedMovieExistance": { // checks for an existing exported video.
					loadPost(req, res).then(([data]) => {
						res.end(JSON.stringify({
							exists: fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", data.id.substr(2)))
						}))
					})
					break;
				} case "/api/savePreviewXml": { // sends the preview xml to the server
					req.on('end', () => res.end());
					movie.previewer.push(req, url.query.videoId);
					break;
				} case "/api/checkXml4Audio": { // checks for any audio included in the movie xml.
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
				} default: return;
			}
			break;
		} default: return;
	}
};