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
const templateAssets = [];
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
					new formidable.IncomingForm().parse(req, async (e, data, files) => { /* Jyvee's Code
						//HOLY SHIT REWRITING THIS WITH THE RIGHT RESPONSE
						let expressions = [];
						let grrrrrr = [];
						let charorder = [];
						let texts = [];
						let mcids = [];
						let scriptscene = 0;
						let voicez = [];
						console.log(data);
						let f = data;
						console.log("test:", f);
						let has2chars = false;
						let focuschar = "";
						let isMicRecord = false;
						let charCount = 0;
						let charIds = [];
						for (const data in f) { // characters & script timings
							if (data.includes(`characters[${charCount}][`) && charCount < 2) {
								charIds.push(data.split(`characters[${charCount}][`)[1].split("]")[0]);
								charCount++
							}
							if (data.includes(`script[1]`)) has2chars = true;
							if (data.includes(`script[`)) {
								if (data.includes(`text`)) { 
									console.log(f[data]); 
									texts.push(f[data]); 
								}
								if (data.includes(`aid`)) { 
									console.log(f[data]); 
									mcids.push(f[data]); 
								}
								if (data.includes(`char_num`)) { 
									console.log(f[data]); 
									focuschar = f[data]; 
									charorder.push(f[data]); 
								}
								if (data.includes(`facial`) && data.includes("l][" + focuschar)) { 
									console.log(f[data]); 
									expressions.push(f[data]); 
								}
								if (data.includes(`voice`)) { 
									console.log(f[data]); 
									voicez.push(f[data]); 
								}
							}
							if (data.includes(`script[${scriptscene}]`)) scriptscene++;
						}
						console.log(mcids);
						if (!has2chars) return res.end(JSON.stringify({ 
							error: 'You must have 2 characters talking to one another. please fix all of the errors you made and preview this video again.' 
						}));
						let char1id = charIds[0];
						let char2id = charIds[1];
						let sound = 0;
						console.log("text: " + texts);
						let scenetime = 2;
						if (data.theme == "life") scenetime = 3;
						let scenetimes = [2, 2];
						console.log(scenetimes);
						console.log("Voices:" + voicez);
						let sum = 0;
						let duration;
						const ttsid = [];
						let di;
						let ouri = 0;
						gentts();
						// Had to rewrite this because it kept cutting out clips
						async function gentts() {
							let i = ouri;
							if (mcids[i] == "") {
								var formData = new FormData();
								console.log("page:", i);
								formData.append('voice', voicez[i]);
								formData.append('text', texts[i]);
								var options;
								if (req.headers.host == `localhost:${process.env.SERVER_PORT}`) {
									options = {
										hostname: 'localhost',
										port: process.env.SERVER_PORT,
										path: '/goapi/convertTextToSoundAsset/',
										method: 'POST',
										headers: formData.getHeaders()
									};
								} else {
									options = {
										hostname: req.headers.host,
										path: '/goapi/convertTextToSoundAsset/',
										method: 'POST',
										headers: formData.getHeaders()
									};
								}
								var rea = http.request(options, (response) => {
									console.log("DID THE API");
									let body = "";
									response.on("data", (b) => body += b).on("end", async () => {
										console.log("Body: " + body);
										di = body.slice(22, 33);
										setTimeout(async () => {
											const buffer = fs.readFileSync(path.join(afolder, di));
											const duration = await rFileUtil.mp3Duration(buffer);
											if (duration.toString().includes(".")) {
												const round = Math.round(duration);
												let seconds = round / 1000;
												console.log("This is rounding:" + seconds);
												scenetimes.push(seconds + 1);
											}
											else {
												let seconds = duration / 1000;
												console.log(seconds);
												scenetimes.push(seconds + 1);
											}
											console.log("Id:" + di);
											ttsid.push(di);
											let helper = ttsid.toString();
											while (!ttsid.toString().includes(di)) {
												if (!helper.includes(di)) {
													ttsid.push(di);
													console.log("Keep pushing till its there");
												}
											}
											ouri++;
											if (i == texts.length - 1) genxml();
											else gentts();
										}, 200);
									});
								});
								formData.pipe(rea);
							} else {
								ttsid.push(mcids[i] + ".mp3");
								let helper = ttsid.toString();
								while (!ttsid.toString().includes(mcids[i])) {
									if (!helper.includes(mcids[i])) {
										ttsid.push(mcids[i] + ".mp3");
										console.log("Keep pushing till its there");
									}
								}
								const micbuffer = asset.load(mcids[i] + ".mp3");
								const duration = await getMp3Duration(micbuffer);
								if (duration.toString().includes(".")) {
									const round = Math.round(duration);
									let seconds = round / 1000;
									console.log("This is rounding:" + seconds);
									scenetimes.push(seconds + 1);
								} else {
									let seconds = duration / 1000;
									console.log(seconds);
									scenetimes.push(seconds + 1);
								}
								ouri++;
								if (i == texts.length - 1) genxml();
								else gentts();
							}
						}
						function genxml() {
							console.log(ttsid);
							scenetimes.push(2);
							for (let i = 0; i < scenetimes.length; i++) {
								console.log("adding");
								sum = sum + scenetimes[i]; // The old math script didnt work. So I made one myself
							}
							if (data.theme == "life") {
								sum = sum + 2;
								console.log(sum);
								//XML shit
								let moviexml;
								if (data.theme == "bar") moviexml += `<film copyable="0" duration="${sum}" published="1" pshare="1">
								<meta>
								  <title><![CDATA[our qvm template]]></title>
								  <tag><![CDATA[school]]></tag>
								  <hiddenTag><![CDATA[retro,matt,anthone]]></hiddenTag>
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
								<scene id="SCENE1" adelay="${Math.round(scenetimes[0]) * 24}" lock="Y" index="1" color="16777215" guid="85382EA4-7327-E7D4-3C47-D95AB3D73182">
								  <bg id="BG2" index="0">
									<file>retro.bar.swf</file>
								  </bg>
								  <char id="AVATOR3" index="1" raceCode="0">
									<action face="-1" motionface="1">retro.matt.stand.swf</action>
									<x>179.7</x>
									<y>237.7</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <char id="AVATOR4" index="2" raceCode="0">
									<action face="1,1" motionface="1">retro.anthone.walk.swf</action>
									<x>638.45,439.8</x>
									<y>304.3,304.45</y>
									<xscale>1,1</xscale>
									<yscale>1,1</yscale>
									<rotation>0,0</rotation>
									<assetMotion ver="2"/>
								  </char>
								  <effectAsset id="EFFECT0" themecode="common" index="3">
									<effect x="0" y="0" w="550" h="354" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
									<x>47</x>
									<y>24</y>
									<width>550</width>
									<height>354</height>
									<speech>0</speech>
								  </effectAsset>
								  <aTranList>
									<aTran id="0" target="AVATOR4" type="MotionPath" atype="Character" direction="2" section="6" timing="3" duration="24" delay="0">null</aTran>
								  </aTranList>
								</scene>
								<scene id="SCENE2" adelay="${Math.round(scenetimes[1]) * 24}" lock="Y" index="2" color="16777215" guid="09015665-309C-2FA0-71EF-4E1E0F077D1A">
								  <bg id="BG2" index="0">
									<file>retro.bar.swf</file>
								  </bg>
								  <char id="AVATOR3" index="1" raceCode="0">
									<action face="-1" motionface="1">retro.matt.stand.swf</action>
									<x>179.7</x>
									<y>237.7</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <char id="AVATOR4" index="2" raceCode="0">
									<action face="1" motionface="1">retro.anthone.standing.swf</action>
									<x>439.75</x>
									<y>304.45</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <effectAsset id="EFFECT0" themecode="common" index="3">
									<effect x="0" y="0" w="550" h="354" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
									<x>47</x>
									<y>24</y>
									<width>550</width>
									<height>354</height>
									<speech>0</speech>
								  </effectAsset>
								</scene>
								<scene id="SCENE2" adelay="${Math.round(scenetimes[3]) * 24}" lock="Y" index="3" color="16777215" guid="5E864F5F-62B4-3AF7-9627-6909C5796303">
								  <bg id="BG2" index="0">
									<file>retro.bar.swf</file>
								  </bg>
								  <char id="AVATOR3" index="1" raceCode="0">
									<action face="-1" motionface="1">retro.matt.stand.swf</action>
									<head id="PROP1">
									  <file>retro.matt.head.head_talk.swf</file>
									</head>
									<x>179.7</x>
									<y>237.7</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <char id="AVATOR4" index="2" raceCode="0">
									<action face="1" motionface="1">retro.anthone.standing.swf</action>
									<x>439.75</x>
									<y>304.45</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <effectAsset id="EFFECT0" themecode="common" index="3">
									<effect x="0" y="0" w="255.8898305" h="164.7" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
									<x>57.35</x>
									<y>134.75</y>
									<width>255.8898305</width>
									<height>164.7</height>
									<speech>0</speech>
								  </effectAsset>
								</scene>
								<scene id="SCENE3" adelay="${Math.round(scenetimes[3]) * 24}" lock="Y" index="3" color="16777215" guid="9FEFDE90-724B-3A3D-FB25-85D369E6DC5D">
								  <bg id="BG2" index="0">
									<file>retro.bar.swf</file>
								  </bg>
								  <char id="AVATOR3" index="1" raceCode="0">
									<action face="-1" motionface="1">retro.matt.stand.swf</action>
									<x>179.7</x>
									<y>237.7</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <char id="AVATOR4" index="2" raceCode="0">
									<action face="1" motionface="1">retro.anthone.standing.swf</action>
									<x>439.75</x>
									<y>304.45</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <effectAsset id="EFFECT0" themecode="common" index="3">
									<effect x="0" y="0" w="255.8898305" h="164.7" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
									<x>328.55</x>
									<y>151.55</y>
									<width>255.8898305</width>
									<height>164.7</height>
									<speech>0</speech>
								  </effectAsset>
								</scene>
								<scene id="SCENE4" adelay="48" lock="Y" index="4" color="16777215" guid="86902661-F625-451A-5B03-48B1270A034D">
								  <bg id="BG2" index="0">
									<file>retro.bar.swf</file>
								  </bg>
								  <char id="AVATOR3" index="1" raceCode="0">
									<action face="-1,-1" motionface="-1">retro.matt.walk.swf</action>
									<x>179.7,649.5</x>
									<y>237.7,244.45</y>
									<xscale>1,1</xscale>
									<yscale>1,1</yscale>
									<rotation>0,0</rotation>
									<assetMotion ver="2"/>
								  </char>
								  <char id="AVATOR4" index="2" raceCode="0">
									<action face="1" motionface="1">retro.anthone.standing.swf</action>
									<x>439.75</x>
									<y>304.45</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<rotation>0</rotation>
								  </char>
								  <effectAsset id="EFFECT5" index="3">
									<effect id="fade_out.swf" type="ANIME"/>
									<x>47</x>
									<y>24</y>
									<xscale>1</xscale>
									<yscale>1</yscale>
									<file>common.fade_out.swf</file>
								  </effectAsset>
								  <effectAsset id="EFFECT0" themecode="common" index="4">
									<effect x="0" y="0" w="550" h="354" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
									<x>47</x>
									<y>24</y>
									<width>550</width>
									<height>354</height>
									<speech>0</speech>
								  </effectAsset>
								  <aTranList>
									<aTran id="2" target="AVATOR3" type="MotionPath" atype="Character" direction="2" section="6" timing="3" duration="24" delay="0">null</aTran>
								  </aTranList>
								</scene>
								<sound id="SOUND1" index="0" track="0" vol="1" tts="1">
								  <sfile>ugc.${ttsid[0]}</sfile>
								  <start>${48 * 2}</start>
								  <stop>${(Math.round(scenetimes[2]) * 24) + 96}</stop>
								  <fadein duration="0" vol="0"/>
								  <fadeout duration="0" vol="0"/>
								  <ttsdata>
									<type><![CDATA[tts]]></type>
									<text><![CDATA[oh my god!]]></text>
									<voice><![CDATA[eric]]></voice>
								  </ttsdata>
								</sound>
								<sound id="SOUND3" index="1" track="0" vol="1" tts="1">
								  <sfile>ugc.${ttsid[1]}</sfile>
								  <start>${(Math.round(scenetimes[2]) * 24) + 96}</start>
								  <stop>${(Math.round(scenetimes[3]) * 24) + (scenetimes[2] * 24) + 96}</stop>
								  <fadein duration="0" vol="0"/>
								  <fadeout duration="0" vol="0"/>
								  <ttsdata>
									<type><![CDATA[tts]]></type>
									<text><![CDATA[poop]]></text>
									<voice><![CDATA[joey1]]></voice>
								  </ttsdata>
								</sound>
								<linkage>SOUND1,~~~AVATOR3,SCENE2~~~</linkage>
								<linkage>SOUND3,~~~AVATOR4,SCENE3~~~</linkage>
							  </film>`;
								else {
									moviexml += `<film copyable="0" duration="${sum + 2}" published="0" pshare="1">
									<meta>
									  <title><![CDATA[qvm2]]></title>
									  <tag><![CDATA[school]]></tag>
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
									<scene id="SCENE0" adelay="12" lock="N" index="0" color="0" guid="145DEF5A-776B-0571-D0B3-DBBAA945D1A1">
								<durationSetting countMinimum="1" countTransition="1" countAction="1" countBubble="1" countSpeech="1"/>
								<effectAsset id="EFFECT0" themecode="common" index="1">
								  <effect x="0" y="0" w="550" h="354" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
								  <x>47</x>
								  <y>24</y>
								  <width>550</width>
								  <height>354</height>
								  <speech>0</speech>
								</effectAsset>
							  </scene>
									<scene id="SCENE1" adelay="72" lock="Y" index="1" color="16777215" guid="95FE26D7-BA31-22D8-DF22-9609751888FA" combgId="custom.cbg_office_pentry">
									  <bg id="cbg_office_pentry_BG102" index="0">
										<file>custom.office_pentry_bg.swf</file>
									  </bg>
									  <char id="AVATOR133" index="3" raceCode="1">
										<action face="1" motionface="1">ugc.${char2id}.stand.xml</action>
										<x>165</x>
										<y>234</y>
										<xscale>1</xscale>
										<yscale>1</yscale>
										<rotation>0</rotation>
									  </char>
									  <char id="AVATOR134" index="4" raceCode="1">
										<action face="1,1" motionface="1">ugc.${char1id}.walk.xml</action>
										<x>639.6,432.75</x>
										<y>225.575,224.775</y>
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
									  <effectAsset id="EFFECT0" themecode="common" index="5">
										<effect x="0" y="0" w="550" h="354" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
										<x>47</x>
										<y>24</y>
										<width>550</width>
										<height>354</height>
										<speech>0</speech>
									  </effectAsset>
									  <trans id="GoTrans" index="6">
										<fx dur="24" type="fl.Fade.out" ease="null"/>
									  </trans>
									  <aTranList>
										<aTran id="0" target="AVATOR134" type="MotionPath" atype="Character" direction="2" section="6" timing="3" duration="24" delay="0">null</aTran>
									  </aTranList>
									</scene>
									<scene id="SCENE2" adelay="${Math.round(scenetimes[1]) * 24}" lock="Y" index="2" color="16777215" guid="0E8CFF0B-3CF0-60A2-E264-0838F25A50C7">
									  <bg id="cbg_office_pentry_BG102" index="0">
										<file>custom.office_pentry_bg.swf</file>
									  </bg>
									  <char id="AVATOR133" index="3" raceCode="1">
										<action face="-1" motionface="1">ugc.${char2id}.stand.xml</action>
										<x>165</x>
										<y>234</y>
										<xscale>1</xscale>
										<yscale>1</yscale>
										<rotation>0</rotation>
									  </char>
									  <char id="AVATOR134" index="4" raceCode="1">
										<action face="1" motionface="-1">ugc.${char1id}.stand.xml</action>
										<x>432.75</x>
										<y>224.775</y>
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
										<effect x="0" y="0" w="550" h="354" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
										<x>47</x>
										<y>24</y>
										<width>550</width>
										<height>354</height>
										<speech>0</speech>
									  </effectAsset>
									</scene>`;
									let endnumber = 0;
									let avaternum = 133;
									let avatournum = 134;
									for (let i = 0; i < texts.length; i++) {
										grrrrrr.push(avaternum.toString());
										grrrrrr.push(avatournum.toString());
										endnumber = i + 2;
										if (charorder[i] == "1") moviexml += `<scene id="SCENE${i + 2}" adelay="${
											Math.round(scenetimes[i + 2]) * 24
										}" lock="Y" index="${i + 2}" color="16777215" guid="6EC3FEC5-E515-C35C-9D64-D0DEF4F6C605">
										<bg id="cbg_office_pentry_BG102" index="0">
										  <file>custom.office_pentry_bg.swf</file>
										</bg>
										<char id="AVATOR${avaternum}" index="3" raceCode="1">
										  <action face="-1" motionface="1">ugc.${char2id}.stand.xml</action>
										  <head id="PROP4" raceCode="1">
										  <file>ugc.${char2id}.head.head_${expressions[i]}.xml</file>
										</head>
										  <x>165</x>
										  <y>234.375</y>
										  <xscale>1</xscale>
										  <yscale>1</yscale>
										  <rotation>0</rotation>
										</char>
										<char id="AVATOR${avatournum}" index="4" raceCode="1">
										  <action face="1" motionface="1">ugc.${char1id}.stand.xml</action>
										  <x>432.75</x>
										  <y>224.775</y>
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
										  <effect x="0" y="0" w="281.059322" h="180.9" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
										  <x>47</x>
										  <y>64.1</y>
										  <width>281.059322</width>
										  <height>180.9</height>
										  <speech>0</speech>
										</effectAsset></scene>`;
									    else moviexml += `<scene id="SCENE${i + 2}" adelay="${Math.round(scenetimes[i + 2]) * 24}" lock="Y" index="${i + 2}" color="16777215" guid="02A88A18-1AA4-15AA-3F1B-C7BE9BB0B73E">
										<bg id="cbg_office_pentry_BG102" index="0">
										  <file>custom.office_pentry_bg.swf</file>
										</bg>
										<char id="AVATOR${avaternum}" index="3" raceCode="1">
										  <action face="-1" motionface="1">ugc.${char2id}.stand.xml</action>
										  <x>165</x>
										  <y>234.375</y>
										  <xscale>1</xscale>
										  <yscale>1</yscale>
										  <rotation>0</rotation>
										</char>
										<char id="AVATOR${avatournum}" index="4" raceCode="1">
										  <action face="1" motionface="1">ugc.${char1id}.stand.xml</action>
										  <head id="PROP4" raceCode="1">
										  <file>ugc.${char1id}.head.head_${expressions[i]}.xml</file>
										</head>
										  <x>432.75</x>
										  <y>224.775</y>
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
										  <effect x="0" y="0" w="281.059322" h="180.9" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
										  <x>284.95</x>
										  <y>68.95</y>
										  <width>281.059322</width>
										  <height>180.9</height>
										  <speech>0</speech>
										</effectAsset></scene>`
										avaternum += 2;
										avatournum += 2;
									}
									moviexml += `<scene id="SCENE${endnumber + 1}" adelay="24" lock="Y" index="${endnumber + 1}" color="16777215" guid="0E8CFF0B-3CF0-60A2-E264-0838F25A50C7">
									<bg id="cbg_office_pentry_BG102" index="0">
									  <file>custom.office_pentry_bg.swf</file>
									</bg>
									<char id="AVATOR133" index="3" raceCode="1">
									  <action face="-1" motionface="1">ugc.${char2id}.stand.xml</action>
									  <x>165</x>
									  <y>234</y>
									  <xscale>1</xscale>
									  <yscale>1</yscale>
									  <rotation>0</rotation>
									</char>
									<char id="AVATOR134" index="4" raceCode="1">
									  <action face="1" motionface="-1">ugc.${char1id}.stand.xml</action>
									  <x>432.75</x>
									  <y>224.775</y>
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
									  <effect x="0" y="0" w="550" h="354" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/>
									  <x>47</x>
									  <y>24</y>
									  <width>550</width>
									  <height>354</height>
									  <speech>0</speech>
									</effectAsset>
								    </scene>
								    <scene id="SCENE${endnumber + 2}" adelay="48" lock="Y" index="${endnumber + 2}" color="16777215" guid="9DBEBB96-EDC5-CC66-0E44-925FD76410FF">
								    <bg id="cbg_office_pentry_BG102" index="0"><file>custom.office_pentry_bg.swf</file></bg><char id="AVATOR1000" index="3" raceCode="1">
								    <action face="1" motionface="1">ugc.${char2id}.stand.xml</action><x>165</x><y>234.325</y><xscale>1</xscale><yscale>1</yscale><rotation>0</rotation></char>
								    <char id="AVATOR1001" index="4" raceCode="1"><action face="-1,-1" motionface="-1">ugc.${char1id}.walk.xml</action><x>433.85,660.45</x>
								    <y>224.725,225.125</y><xscale>1,1</xscale><yscale>1,1</yscale><rotation>0,0</rotation><assetMotion ver="2"/></char>
								    <prop id="cbg_office_pentry_PROP71" index="1" attached="Y"><file>custom.office_pentry_coffee.swf</file><x>120</x><y>190</y><xscale>1</xscale><yscale>1</yscale>
								    <face>1</face><rotation>0</rotation></prop><prop id="cbg_office_pentry_PROP72" index="2" attached="Y"><file>custom.office_pentry_water_dispenser.swf</file>
								    <x>445</x><y>245</y><xscale>1</xscale><yscale>1</yscale><face>1</face><rotation>0</rotation></prop><effectAsset id="EFFECT0" themecode="common" index="6">
								    <effect x="0" y="0" w="550" h="354" rotate="0" id="cut" type="ZOOM" isCut="true" isPan="false"/><x>47</x><y>24</y><width>550</width><height>354</height>
								    <speech>0</speech></effectAsset><effectAsset id="EFFECT5" index="5"><effect id="fade_out.swf" type="ANIME"/><x>47</x><y>24</y><xscale>1</xscale>
									<yscale>1</yscale><file>common.fade_out.swf</file></effectAsset><aTranList>
									<aTran id="1" target="AVATOR134" type="MotionPath" atype="Character" direction="2" section="6" timing="3" duration="24" delay="0">null</aTran></aTranList>
									</scene<sound id="SOUND0" index="0" track="0" vol="0.75" tts="0"><sfile>common.Sunshine.mp3</sfile><start>1</start><stop>${(sum * 72)}</stop>
									<trimEnd>${(sum * 72)}</trimEnd><fadein duration="48" vol="1"/><fadeout duration="48" vol="0"/></sound>
									<sound id="SOUND2" index="1" track="0" vol="1" tts="1"><sfile>ugc.${ttsid[0]}</sfile><start>${132}</start><stop>${(Math.round(scenetimes[2]) * 24) + 132}</stop>
									<fadein duration="0" vol="0"/><fadeout duration="0" vol="0"/><ttsdata><type><![CDATA[tts]]></type><text><![CDATA[poop]]></text>
									<voice><![CDATA[joey1]]></voice></ttsdata></sound>`;
									console.log("The length of tts ids are: " + ttsid.length);
									sound = 4;
									let endingformat = 132;
									for (let i = 1; i < ttsid.length; i++) {
										moviexml += `<sound id="SOUND${sound}" index="${i + 1}" track="0" vol="1" tts="1"><sfile>ugc.${ttsid[i]}</sfile><start>${
											(Math.round(scenetimes[i + 1]) * 24) + endingformat
										}</start><stop>${
											(
												Math.round(
													scenetimes[
														i + 2
													]
												) * 24
											) + (scenetimes[
												i + 1
											] * 24) + endingformat
										}</stop><fadein duration="0" vol="0"/><fadeout duration="0" vol="0"/><ttsdata><type><![CDATA[tts]]></type><text><![CDATA[poop]]></text>
										<voice><![CDATA[converted from the qvm]]></voice></ttsdata></sound>`;
										sound += 2;
										endingformat = (Math.round(scenetimes[i + 1]) * 24) + endingformat;
									}
									let soundoffset = 2;
									let sceneoffset = 2;
									for (let i = 0; i < charorder.length; i++) {
										if (charorder[i] == "1") moviexml += `<linkage>SOUND${soundoffset},SCENE${sceneoffset}~~~AVATOR${grrrrrr[soundoffset - 2]}</linkage>`;
										else if (charorder[i] == "2") moviexml += `<linkage>SOUND${soundoffset},SCENE${sceneoffset}~~~AVATOR${grrrrrr[soundoffset - 1]}</linkage>`;
										soundoffset += 2;
										sceneoffset += 1;
									}
									moviexml += `</film>`;
								}
								fs.writeFileSync(`./previews/template.xml`, moviexml.substring(9));
								res.end(JSON.stringify({
									script: f, 
									player_object: {
										movieId: "templatePreview",
										siteId: "go",
										autostart: 1,
										isEmbed: 1,
										isWide: 1,
										ut: 23,
										apiserver: "/",
										storePath: process.env.STORE_URL + "/<store>",
										clientThemePath: process.env.CLIENT_URL + "/<client_theme>"
									}
								}));
							}
						}*/
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
							} else res.end(Buffer.concat([base, await parse.packMovie(fs.readFileSync("./previews/template.xml"), false, false, false, templateAssets)]));
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