/**
 * qvm generation jyvee edition (meant for certain templates)
 */
// modules
const fs = require("fs");
const xmlJs = require('xml-js');
const xml2js = require('xml2js');
// export functions
module.exports = {
	xmlToJson(xmlString) {
		return new Promise((resolve, reject) => {
			const parser = new xml2js.Parser();
			parser.parseString(xmlString, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	},
	genxml(theme, c1, c2, textarray, charorders, cam, micids, times, id) {
		console.log(c1, c2);
		return new Promise((resolve, reject) => {
			const scenetimes = times;
			let sound = 0;
			let cachedmovie = [];
			const scenecache = [];
			const moviearray = [];
			let moviexml, settings;
			console.log(theme);
			if (fs.existsSync(`./_TEMPLATES/${theme}.${id}.xml`) && fs.existsSync(`./_TEMPLATES/${theme}.${id}.json`)) {
				moviexml = fs.readFileSync(`./_TEMPLATES/${theme}.${id}.xml`).toString()
				settings = JSON.parse(fs.readFileSync(`./_TEMPLATES/${theme}.${id}.json`));
			} else return resolve({
				success: false, 
				message: `For some reason, the movie xml or settings for the selected scene do not exist. 
				If you are the owner of this template, please use Templates button under Manage to access this template and see 
				what is going on with the selected scene and why this message popped up. If for some reason you can't find anything,
				you are advised to contact our staff at the GoNexus Discord Server and we will take care of your issue as long as you
				have enough evidence to back up your claim (Video or screenshot evidence is recommended so that 
					we can better understand your issue and we can take a more precise look at it to see what part of this 
					LVM project is causing your issue
				).`
			});
			console.log(settings);
			//let jObj = "";
			const xmlJs = require('xml-js');
			const scenejsoncache = [];
			(async () => {
				try {
					const jsonOutput = await this.xmlToJson(moviexml);
					//Add the first scene timings
					for (let v of settings.toffset) scenetimes.unshift(v);
					//Add the last scene timings
					for (let v of settings.toffset_end) scenetimes.push(v);
					//The qvms will be a straight line of an xml! for now
					for (let i = 0; i < Infinity; i++) {
						if (cachedmovie.join("").toString().includes("<sc")) {
							//console.log(cachedmovie.join(""), "also here");
							moviearray.push(cachedmovie.join("").slice(0, -3));
							cachedmovie = [];
							break;
						}
						else cachedmovie.push(moviexml.charAt(i));
						if (i >= 5200) break;
					}
					//Meta all the scenes
					for (let number = 0; number < jsonOutput.film.scene.length; number++) {
						let ruffer = jsonOutput.film.scene[number];
						scenecache.push(this.sceneMeta2Xml(ruffer, number));
					}
					//This vars is for the thingy!!
					let hasPassedStartPos = false;
					let hasPassedEndPos = false;
					let grrrrrr = [];
					let avaternum = 1133;
					let avatournum = 1134;
					let bum = 0;
					let swapnum1 = "1";
					let swapnum2 = "2";
					if (settings.swap == true) {
						swapnum1 = "2";
						swapnum2 = "1";
					}
					let sum = 0;
					for (let i = 0; i < scenetimes.length; i++) {
						sum = sum + scenetimes[i]; // The old math script didnt work. So I made one myself
					}
					//Time to generate for real
					for (let num = 0; num < scenetimes.length; num++) {
						let pson;
						if (num == settings.startPos && !hasPassedStartPos) hasPassedStartPos = true;
						//console.log(JSON.stringify(pson));
						console.log(num, hasPassedEndPos);
						if (micids[num - settings.startPos] == undefined && hasPassedStartPos || hasPassedEndPos) {
							console.log("ended");
							hasPassedStartPos = false;
							hasPassedEndPos = true;
							bum++;
							console.log(settings.toffset_end[bum - 1]);
							if (settings.toffset_end[bum - 1] === undefined) {
								console.log("And we're out");
								//break;
							}
						}
						if (hasPassedStartPos) {
							if (charorders[num - settings.startPos] == swapnum1) {
								let scenepson;
								if (
									cam[num - settings.startPos] != "normal"
								) scenepson = await this.xmlToJson(scenecache[settings.char1camscene]);
								else scenepson = await this.xmlToJson(scenecache[settings.char1scene]);
								grrrrrr.push(avaternum.toString());
								grrrrrr.push(avatournum.toString());
								for (const v in scenepson.scene.char) {
									if (scenepson.scene.char[v]._attributes.id == settings.avater1id) {
										let maction = scenepson.scene.char[v].action[0]._text.toString().split(".");
										scenepson.scene.char[v]._attributes.id = "AVATOR" + avaternum;
										maction[1] = c1;
										console.log(c1);
										//Only make a head if it doesnt exist already
										if (
											charorders[num - settings.startPos] == swapnum2 && textarray[num - settings.startPos] != "default"
										) {
											if (!scenepson.scene.char[v].head) {
												scenepson.scene.char[v].head = [];
												scenepson.scene.char[v].head.push(
													{
														_attributes: {
															id: "PROP29817",
															raceCode: "1"
														},
														file: [
															"ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml"
														]
													});
											}
											else scenepson.scene.char[v].head[0].file[0] = "ugc." + maction[1] + ".head.head_" + textarray[
												num - settings.startPos
											] + ".xml";
										}
										scenepson.scene.char[v].action[0]._text = maction.join(".");
									}
									if (scenepson.scene.char[v]._attributes.id == settings.avater2id) {
										scenepson.scene.char[v]._attributes.id = "AVATOR" + avatournum;
										let maction = scenepson.scene.char[v].action[0]._text.toString().split(".");
										maction[1] = c2;
										console.log(c2);
										//Only make a head if it doesnt exist already
										if (charorders[num - settings.startPos] == swapnum1 && textarray[
											num - settings.startPos
										] != "default") {
											if (!scenepson.scene.char[v].head) {
												console.log("The qvm goes in here even when its not supposed to");
												scenepson.scene.char[v].head = [];
												scenepson.scene.char[v].head.push(
													{
														_attributes: {
															id: "PROP165678",
															raceCode: "1"
														},
														file: [
															"ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml"
														]
													});
											}
											else scenepson.scene.char[v].head[0].file[0] = "ugc." + maction[1] + ".head.head_" + textarray[
												num - settings.startPos
											] + ".xml";
										}
										scenepson.scene.char[v].action[0]._text = maction.join(".");
									}
								}
								scenepson.scene._attributes.index = num;
								scenepson.scene._attributes.id = "SCENE" + num;
								scenepson.scene._attributes.adelay = Math.round(scenetimes[num]) * 24;
								const xmlData = this.jsonToXml(scenepson);
								scenejsoncache.push(xmlData);
								avaternum += 2;
								avatournum += 2;
							} else {
								let scenepson;
								if (cam[num - settings.startPos] != "normal") scenepson = await this.xmlToJson(
									scenecache[settings.char2camscene]
								);
								else scenepson = await this.xmlToJson(scenecache[settings.char2scene]);
								grrrrrr.push(avaternum.toString());
								grrrrrr.push(avatournum.toString());
								for (const v in scenepson.scene.char) {
									if (scenepson.scene.char[v]._attributes.id == settings.avater1id) {
										let maction = scenepson.scene.char[v].action[0]._text.toString().split(".");
										scenepson.scene.char[v]._attributes.id = "AVATOR" + avaternum;

										maction[1] = c1;
										console.log(c1);
										//Only make a head if it doesnt exist already
										if (charorders[num - settings.startPos] == swapnum2 && textarray[
											num - settings.startPos
										] != "default") {
											if (!scenepson.scene.char[v].head) {
												scenepson.scene.char[v].head = [];
												scenepson.scene.char[v].head.push(
													{
														_attributes: {
															id: "PROP282778",
															raceCode: "1"
														},
														file: [
															"ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml"
														]
													});
											}
											else scenepson.scene.char[v].head[0].file[0] = "ugc." + maction[1] + ".head.head_" + textarray[
												num - settings.startPos
											] + ".xml";
										}
										scenepson.scene.char[v].action[0]._text = maction.join(".");
										//console.log(maction.join("."));
									}
									if (scenepson.scene.char[v]._attributes.id == settings.avater2id) {
										let maction = scenepson.scene.char[v].action[0]._text.toString().split(".");
										scenepson.scene.char[v]._attributes.id = "AVATOR" + avatournum;
										maction[1] = c2;
										console.log(c2);
										//Only make a head if it doesnt exist already
										if (charorders[num - settings.startPos] == swapnum1 && textarray[
											num - settings.startPos
										] != "default") {
											if (!scenepson.scene.char[v].head) {
												scenepson.scene.char[v].head = [];												
												scenepson.scene.char[v].head.push(
													{
														_attributes: {
															id: "PROP165678",
															raceCode: "1"
														},
														file: [
															"ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml"
														]
													});
											}
											else {
												console.log("char2");
												scenepson.scene.char[v].head[0].file[0] = "ugc." + maction[1] + ".head.head_" + textarray[
													num - settings.startPos
												] + ".xml";
											}
										}
										scenepson.scene.char[v].action[0]._text = maction.join(".");
									}
								}
								scenepson.scene._attributes.index = num;
								scenepson.scene._attributes.id = "SCENE" + num;
								scenepson.scene._attributes.adelay = Math.round(scenetimes[num]) * 24;
								const xmlData = this.jsonToXml(scenepson);
								scenejsoncache.push(xmlData);
								avaternum += 2;
								avatournum += 2;
							}
						} else {
							if (!hasPassedEndPos) {
								pson = await this.xmlToJson(scenecache[num]);
								if (num != 0) {
									//Assign the correct chars
									for (const v in pson.scene.char) {
										if (pson.scene.char[v]._attributes.id == settings.avater1id) {
											let maction = pson.scene.char[v].action[0]._text.toString().split(".");
											maction[1] = c1;
											pson.scene.char[v].action[0]._text = maction.join(".");
											//console.log(maction.join("."));
										}
										if (pson.scene.char[v]._attributes.id == settings.avater2id) {
											let maction = pson.scene.char[v].action[0]._text.toString().split(".");
											maction[1] = c2;
											pson.scene.char[v].action[0]._text = maction.join(".");
										}
									}
								}
								pson.scene._attributes.index = num;
								pson.scene._attributes.id = "SCENE" + num;
								if (scenetimes[num] == 0.25 || scenetimes[num] == 0.5 || scenetimes[num] == 0.75) {
									pson.scene._attributes.adelay = scenetimes[num] * 24;
								} else pson.scene._attributes.adelay = Math.round(scenetimes[num]) * 24;
								const xmlData = this.jsonToXml(pson);
								scenejsoncache.push(xmlData);
							} else {
								let dson = await this.xmlToJson(scenecache[(settings.endPos - 1) + bum]);
								for (const v in dson.scene.char) {
									if (dson.scene.char[v]._attributes.id == settings.avater1id) {
										let maction = dson.scene.char[v].action[0]._text.toString().split(".");
										dson.scene.char[v]._attributes.id = "AVATOR" + avaternum;
										maction[1] = c1;
										dson.scene.char[v].action[0]._text = maction.join(".");
										//console.log(maction.join("."));
									}
									if (dson.scene.char[v]._attributes.id == settings.avater2id) {
										let maction = dson.scene.char[v].action[0]._text.toString().split(".");
										dson.scene.char[v]._attributes.id = "AVATOR" + avatournum;

										maction[1] = c2;
										dson.scene.char[v].action[0]._text = maction.join(".");
										//console.log(maction.join("."));
									}
								}
								dson.scene._attributes.index = num;
								dson.scene._attributes.id = "SCENE" + num;
								dson.scene._attributes.adelay = Math.round(settings.toffset_end[bum - 1]) * 24;
								const xmlData = this.jsonToXml(dson);
								scenejsoncache.push(xmlData);
							}
						}
					}
					//console.log(scenejsoncache);
					//console.log("poop", times);
					//Time for the cool thing people want, SOUNDNDUdyiesiuhdwogyftdwcuxei2wpuyfdtewsuiefpwdyftdewusipfeuwystfdrewyu
					//Add a placeholder sound for some reason idk
					if (settings.usesSong == "Y") {
						scenejsoncache.push(`<sound id="SOUND0" index="0" track="0" vol="0.75" tts="0">
							<sfile>${settings.song}</sfile>
							<start>1</start>
							<stop>${(sum * 72)}</stop>
							<trimEnd>${(sum * 72)}</trimEnd>
							<fadein duration="48" vol="1"/>
							<fadeout duration="48" vol="0"/>
						</sound>`);
					}
					scenejsoncache.push(`<sound id="SOUND2" index="1" track="0" vol="1" tts="1">
						<sfile>ugc.${micids[0]}</sfile>
						<start>${settings.audioOffset}</start>
						<stop>${(Math.round(times[settings.toffset.length]) * 24) + settings.audioOffset}</stop>
						<fadein duration="0" vol="0"/>
						<fadeout duration="0" vol="0"/>
						<ttsdata>
							<type><![CDATA[tts]]></type>
							<text><![CDATA[poop]]></text>
							<voice><![CDATA[joey1]]></voice>
						</ttsdata>
					</sound>`);
					sound = 4;
					let endingformat = settings.audioOffset;
					for (let i = 1; i < micids.length; i++) {
						scenejsoncache.push(`<sound id="SOUND${sound}" index="${i + 1}" track="0" vol="1" tts="1">
							<sfile>ugc.${micids[i]}</sfile>
							<start>${(Math.round(times[settings.toffset.length + i - 1]) * 24) + endingformat}</start>
							<stop>${(Math.round(times[settings.toffset.length + i]) * 24) + (
								times[settings.toffset.length + i - 1] * 24
							) + endingformat}</stop>
							<fadein duration="0" vol="0"/>
							<fadeout duration="0" vol="0"/>
							<ttsdata>
								<type><![CDATA[tts]]></type>
								<text><![CDATA[poop]]></text>
								<voice><![CDATA[converted from the qvm]]></voice>
							</ttsdata>
						</sound>`);
						sound += 2;
						endingformat = (Math.round(times[settings.toffset.length + i - 1]) * 24) + endingformat;
					}
					let soundoffset = 2;
					let sceneoffset = settings.toffset.length;
					let owne = 1;
					let twro = 2;
					if (settings.swap) {
						//OMG SWAP FOR ONE CHARRRR
						owne = 2;
						twro = 1;
					}
					for (let i = 0; i < charorders.length; i++) {
						if (charorders[i] == "1") scenejsoncache.push(`<linkage>SOUND${soundoffset},SCENE${sceneoffset}~~~AVATOR${
							grrrrrr[soundoffset - owne]
						}</linkage>`);
						else if (charorders[i] == "2") scenejsoncache.push(`<linkage>SOUND${soundoffset},SCENE${sceneoffset}~~~AVATOR${
							grrrrrr[soundoffset - twro]
						}</linkage>`);
						soundoffset += 2;
						sceneoffset++;
					}
					fs.writeFileSync('./previews/qvm.xml', moviearray + scenejsoncache.join("") + "</film>")
					//console.log("ITS DONE!");
					resolve({ "success": true });
				} catch (e) {
					console.log(e);
					resolve({
						success: false,
						error: e.toString()
					})
				}
			})();
		});
	},
	/**
	 * Converts a movie scene into an xml. Puts it in the scene array: @var {array} scenearray
	 * @param {string} pson 
	 * @param {num} scenepos 
	 * @returns {fs.readStream}
	 */
	sceneMeta2Xml(v, num = 0) {
		//if (num != 0) v.char[0]._attributes.id = "AVATER121";
		//if (num != 0) v.char[1]._attributes.id = "AVATER122";
		return this.jsonToXml({ scene: v });
	},
	jsonToXml(jsonData) {
		const options = {
			compact: true,
			ignoreComment: true,
			spaces: 4
		};
		return xmlJs.js2xml(jsonData, options);
	}
}
