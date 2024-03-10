const loadPost = require("../misc/post_body");
const character = require("./main");
const asset = require("../asset/main");
const http = require("http");
const xmldoc = require("xmldoc");
const fs = require("fs");
const https = require("https");
const nodezip = require("node-zip");
const fUtil = require("../misc/file");
function meta2libraryXml(w) {
	let xml;
	xml = `<library type="${w.type}" file="${w.component_id}" path="${w.component_id}" component_id="${
		w.component_id
	}" theme_id="${w.theme_id}"/>`
	return xml;
}
function getJoseph() {
	return new Promise((res, rej) => {
		https.get('https://wrapperclassic.netlify.app/chars/4048901.xml', r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
		});
	});
}
function getCharEmotionsJson(v) {
	return {
		default: {
			eye: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action,
			eyebrow: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action,
			mouth: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action
		},
		asleep: {
			eye: "asleep",
			eyebrow: "default",
			mouth: "default"
		},
		chewing: {
			eye: "default",
			eyebrow: "default",
			mouth: "chewing"
		},
		disgusted: {
			eye: "sick",
			eyebrow: "disgusted",
			mouth: "sad"
		},
		laugh: {
			eye: "happy",
			eyebrow: "happy",
			mouth: "laugh"
		},
		talk_angry: {
			eye: "angry",
			eyebrow: "angry",
			mouth:"talk_angry"
		},
		talk_happy: {
			eye: "happy",
			eyebrow: "happy",
			mouth:"talk_happy"
		},
		talk_netural_a: {
			eye: "default",
			eyebrow: "default",
			mouth:"talk_a"
		},
		talk_netural_b: {
			eye: "default",
			eyebrow: "default",
			mouth:"talk_b"
		},
		talk_sad: {
			eye: "sad",
			eyebrow: "sad",
			mouth:"talk_sad"
		},
		thinking: {
			eye: "thinking",
			eyebrow: "sad",
			mouth: "default"
		},
		taunt: {
			eye: "angry",
			eyebrow: "angry",
			mouth: "taunt"
		}
	}
}
function meta2componentXml(v) {
	const stuff = getCharEmotionsJson(v);
	let xml;
	let ty = v.type;
	const action2 = stuff[v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action] && stuff[
		v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action
	][v.type] ? stuff[v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action][
		v.type
	] : stuff.default[v.type] ? stuff.default[v.type] : "default";
	const action = fs.existsSync(`./charStore/${v.theme_id}/${v.type}/${v.component_id}/${
		action2
	}.swf`) ? action2 : "default";
	if (ty == "eye" || ty == "eyebrow" || ty == "mouth") {
		let animetype = v.theme_id == "anime" ? "side_" + action : action;
		xml = `<component type="${v.type}" ${isAction ? `component_id="${v.component_id}"` : ``} theme_id="${
			v.theme_id
		}" file="${animetype}.swf" path="${v.component_id}" x="${v.x}" y="${v.y}" xscale="${
			v.xscale
		}" yscale="${v.yscale}" offset="${v.offset}" rotation="${v.rotation}" ${v.split ? `split="N"` : ``}/>`;
	} else if (v.id) xml = `<component id="${v.id}" ${isAction ? `file="default.swf" component_id="${
		v.component_id
	}"` : ``} type="${v.type}" theme_id="${v.theme_id}" path="${v.component_id}" x="${v.x}" y="${
		v.y
	}" xscale="${v.xscale}" yscale="${v.yscale}" offset="${v.offset}" rotation="${v.rotation}" />`;
	else if (
		v.type != "skeleton" 
		&& v.type != "bodyshape" 
		&& v.type != "freeaction"
	) xml = `<component type="${v.type}" theme_id="${
		v.theme_id
	}" ${isAction ? `file="default.swf" component_id="${v.component_id}"` : ``} path="${v.component_id}" x="${
		v.x
	}" y="${v.y}" xscale="${v.xscale}" yscale="${v.yscale}" offset="${v.offset}" rotation="${v.rotation}" />`;
	else xml = `<component type="${v.type}" theme_id="${v.theme_id}" ${
		v.type == "skeleton" ? `file="${
			action
		}.swf"` : v.type == "freeaction" && v.theme_id == "cc2" ? `file="${
			action
		}.swf"` : `file="thumbnail.swf"`
	} path="${v.component_id}" ${isAction ? `component_id="${v.component_id}"` : ``} x="${v.x}" y="${
		v.y
	}" xscale="${v.xscale}" yscale="${v.yscale}" offset="${v.offset}" rotation="${v.rotation}" />`;
	return xml;
}
function getCharActionsJson(v) {
	return {
		stand: {
			upper_body: "default",
			lower_body: "default",
			skeleton: "stand"
		},
		dislike: {
			eye: "sick",
			eyebrow: "disgusted",
			mouth: "sad",
			lower_body: "default",
			upper_body: "taunt",
			skeleton: "taunt",
		},
		furious: {
			eye: "angry",
			eyebrow: "angry",
			mouth: "angry",
			lower_body: "laugh",
			upper_body: "excited",
			skeleton: "excited",
		},
		grab: {
			eye: "angry",
			eyebrow: "angry",
			mouth: "angry",
			lower_body: "laugh",
			upper_body: "laugh",
			skeleton: "laugh",
		},
		makefunof: {
			mouth: "laugh",
			lower_body: "laugh",
			upper_body: "point_at",
			skeleton: "laugh",
		},
		laugh: {
			mouth: "laugh",
		},
		punch: {
			eye: "angry",
			eyebrow: "angry",
			mouth: "angry",
			lower_body: "default",
			upper_body: "run",
			skeleton: "stand",
		},
		drive: {
			lower_body: "sit",
			upper_body: "run",
			skeleton: "sit",
		},
		xarms: {
			upper_body: "crossed_arms",
			skeleton: "crossed_arms",
			lower_body: "default"
		},
		xarms3: {
			upper_body: "crossed_arms",
			skeleton: "crossed_arms",
			lower_body: "walk"
		},
		chuckle: {
			lower_body: "default"
		},
		talk: {
			skeleton: "talk",
			mouth: "talk",
			lower_body: "default"
		},
		kneelcross: {
			upper_body: "crossed_arms",
			skeleton: "crossed_arms",
			lower_body: "kneel_down"
		},
		kneel: {
			upper_body: "kneel_down",
			skeleton: "sit",
			lower_body: "kneel_down"
		},
		kneelphone: {
			mouth: "talk",
			upper_body: "talk_on_phone",
			skeleton: "talk_on_phone",
			lower_body: "kneel_down"
		},
		talk_phone: {
			mouth: "talk",
			upper_body: "talk_on_phone",
			skeleton: "talk_on_phone",
			lower_body: "default"
		},
		talk_phone3: {
			mouth: "talk",
			upper_body: "talk_on_phone",
			skeleton: "talk_on_phone",
			lower_body: "walk"
		},
		taunt: {
			lower_body: "default",
			mouth: "taunt"
		},
		pt_at: {
			upper_body: "point_at",
			skeleton: "point_at",
			lower_body: "default"
		},
		sad: {
			mouth: "sad",
			eye: "sad",
			eyebrow: "sad",
			lower_body: "default"
		},
		sitchuckle: {
			upper_body: "chuckle",
			skeleton: "chuckle",
			lower_body: "sit"
		},
		xarms2: {
			upper_body: "crossed_arms",
			skeleton: "crossed_arms",
			lower_body: "sit"
		},
		xarmspoint: {
			upper_body: "point_at",
			skeleton: "point_at",
			lower_body: "sit"
		},
		talk_phone2: {
			mouth: "talk",
			upper_body: "talk_on_phone",
			skeleton: "talk_on_phone",
			lower_body: "sit"
		},
		default: {
			upper_body: v.action,
			lower_body: v.action,
			skeleton: v.action
		},
		fearful: {
			mouth: "sad"
		},
		dance: {
			mouth: "happy"
		},
		excited: {
			mouth: "happy",
			skeleton: "excited"
		},
		walk: {
			lower_body: "walk",
			upper_body: "walk",
			skeleton: "walk"
		}
	}
}
function meta2componentXml2(v) {
	const stuff = getCharActionsJson(v);
	const action = stuff[v.action] && stuff[v.action][v.type] ? stuff[v.action][v.type] : stuff.default[
		v.type
	] ? stuff.default[v.type] : v.type == "bodyshape" ? 'thumbnail' : "default";
	return `<component type="${v.type}" theme_id="${v.theme_id}" file="${action}.swf" path="${
		v.component_id
	}" component_id="${v.component_id}" x="${v.x}" y="${v.y}" xscale="${v.xscale}" yscale="${
		v.yscale
	}" offset="${v.offset}" rotation="${v.rotation}" />`;
}
function meta2colourXml(v) {
	let xml;
	if (v.oc === undefined && !v.targetComponent) xml = `<color r="${v.r}">${v.text}</color>`;
	else if (v.targetComponent === undefined) xml = `<color r="${v.r}" oc="${v.oc}">${v.text}</color>`;	
	else xml = `<color r="${v.r}" targetComponent="${v.targetComponent}">${v.text}</color>`;	
	return xml;
}
let isAction = false, whereWeAt = -1;
const session = require("../misc/session");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			const match = url.pathname.match(/\/characters\/([^.]+)(?:\.xml)?$/);
			if (!match) return;

			var id = match[1];
			if (match[2] != "xml") return;
			res.setHeader("Content-Type", "text/xml");
			character.load(id).then((v) => {
				(res.statusCode = 200), res.end(v);
			}).catch((e) => {
				(res.statusCode = 404), 
				console.log(e),
				res.end(e);
			});
			break;
		} case "POST": {
			switch (url.pathname) {
				case "/api/getChars": {
					loadPost(req, res).then(async data => {
						const json = asset.list(data.userId, 'char', 0, data.cc_theme_id);
						if (!json) return res.end(JSON.stringify([
							{
								error: "Unable to get your characters. userid: " + data.userId
							}
						]));
						res.end(JSON.stringify(json));
					});
					break;
				} case "/goapi/getCcCharCompositionXml/": {
					loadPost(req, res).then(async data => {
						res.setHeader("Content-Type", "text/html; charset=UTF-8");
						character.load(data.assetId || data.original_asset_id).then((v) => {
							(res.statusCode = 200), res.end(0 + v);
						}).catch(e => { 
							res.statusCode = 404, 
							console.log(e),
							res.end(1 + e); 
						});
					});
					break;
				} case "/goapi/getCharacterAction/": {
					loadPost(req, res).then(async data => { try {
						const componentArray = [];
						const colorArray = [];
						const charId = data.charId.split(".")[0];
						let buf;
						if (charId == "4048901") buf = await getJoseph();
						else buf = await character.load(charId);
						const result = new xmldoc.XmlDocument(buf);
						if (
							data.actionId 
							&& data.facialId 
							&& data.facialId.endsWith(".zip") 
							&& data.actionId.endsWith(".zip")
						) { // 2010 tutorial
							const components = result.children.filter(i => i.name == "component");
							const componentswithactions = {};
							const zip = nodezip.create();
							const emotion = (getCharEmotionsJson({
								action: data.facialId.split(".zip")[0]
							}))[data.facialId.split(".zip")[0].split("head_")[1]]
							const action = (getCharActionsJson({
								action: data.actionId.split(".zip")[0]
							}))[data.actionId.split(".zip")[0]]
							fUtil.addToZip(zip, "desc.xml", buf);
							res.setHeader("Content-Type", "application/zip");
							for (const i in action) {
								const component = components.find(d => d.attr.type == i);
								fUtil.addToZip(zip, `${component.attr.theme_id}.${component.attr.type}.${
									component.attr.component_id
								}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
									component.attr.type
								}/${
									component.attr.component_id
								}/${action[component.attr.type]}.swf`));
								componentswithactions[component.attr.type] = true;
							}
							for (const i in emotion) {
								const component = components.find(d => d.attr.type == i);
								fUtil.addToZip(zip, `${component.attr.theme_id}.${component.attr.type}.${
									component.attr.component_id
								}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
									component.attr.type
								}/${
									component.attr.component_id
								}/${emotion[component.attr.type]}.swf`));
								componentswithactions[component.attr.type] = true;
							}
							for (const component of components) {
								switch (component.attr.type) {
									case "bodyshape": {
										fUtil.addToZip(zip, `${component.attr.theme_id}.bodyshape.${
											component.attr.component_id
										}.swf`, fs.readFileSync(`./charStore/${
											component.attr.theme_id
										}/bodyshape/${
											component.attr.component_id
										}/thumbnail.swf`))
										break;
									} default: {
										if (!componentswithactions[component.attr.type]) fUtil.addToZip(
											zip, `${component.attr.theme_id}.${component.attr.type}.${
												component.attr.component_id
											}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
												component.attr.type
											}/${component.attr.component_id}/default.swf`)
										);
										break;
									}
								}
							}
							res.end(await zip.zip());				
						} else if (data.actionId) { // now we are getting back in track. everything works normally, but not the tutorial for some reason
							if (data.actionId.endsWith(".zip")) {
								const components = result.children.filter(i => i.name == "component");
								const componentswithactions = {};
								const zip = nodezip.create();
								const action = (getCharActionsJson({
									action: data.actionId.split(".zip")[0]
								}))[data.actionId.split(".zip")[0]]
								fUtil.addToZip(zip, "desc.xml", buf);
								res.setHeader("Content-Type", "application/zip");
								for (const i in action) {
									const component = components.find(d => d.attr.type == i);
									fUtil.addToZip(zip, `${component.attr.theme_id}.${component.attr.type}.${
										component.attr.component_id
									}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
										component.attr.type
									}/${
										component.attr.component_id
									}/${action[component.attr.type]}.swf`));
									componentswithactions[component.attr.type] = true;
								}
								for (const component of components) {
									switch (component.attr.type) {
										case "bodyshape": {
											fUtil.addToZip(zip, `${component.attr.theme_id}.bodyshape.${
												component.attr.component_id
											}.swf`, fs.readFileSync(`./charStore/${
												component.attr.theme_id
											}/bodyshape/${
												component.attr.component_id
											}/thumbnail.swf`))
											break;
										} default: {
											if (!componentswithactions[component.attr.type]) fUtil.addToZip(
												zip, `${component.attr.theme_id}.${component.attr.type}.${
													component.attr.component_id
												}.swf`, fs.readFileSync(`./charStore/${
													component.attr.theme_id
												}/${component.attr.type}/${
													component.attr.component_id
												}/default.swf`)
											);
											break;
										}
									}
								}
								res.end(await zip.zip());	
							} else if (data.actionId.endsWith(".xml")) {
								isAction = true;
								res.setHeader("Content-Type", "application/xml");
								for (const info of result.children) {
									switch (info.name) {
										case "component": {
											const inf = info.attr;
											inf.action = data.actionId.split(".xml")[0];
											const themeid = inf.theme_id;
											/*const libArray = data.cc_char.library;
											if (themeid == "cc2") charXml += libArray.map(meta2libraryXml).join("");*/
											componentArray.unshift(inf);
											break;
										} case "color": {
											const inf = info.attr;
											inf.text = info.val;
											colorArray.unshift(inf);
											break;
										}
									}
								}							
								res.end(`<cc_char ${
									result.attr ? `xscale='${result.attr.xscale}' yscale='${
										result.attr.yscale
									}' hxscale='${result.attr.hxscale}' hyscale='${
										result.attr.hyscale
									}' headdx='${result.attr.headdx}' headdy='${result.attr.headdy}'` : ``
								}>${componentArray.map(meta2componentXml2).join("")}${
									colorArray.map(meta2colourXml).join("")
								}</cc_char>`);
							} 
						} else if (data.facialId) {
							if (data.facialId.endsWith(".zip")) {
								const components = result.children.filter(i => i.name == "component");
								const componentswithactions = {};
								const zip = nodezip.create();
								const emotion = (getCharEmotionsJson({
									action: data.facialId.split(".zip")[0]
								}))[data.facialId.split(".zip")[0].split("head_")[1]]
								fUtil.addToZip(zip, "desc.xml", buf);
								res.setHeader("Content-Type", "application/zip");
								for (const i in emotion) {
									const component = components.find(d => d.attr.type == i);
									fUtil.addToZip(zip, `${component.attr.theme_id}.${component.attr.type}.${
										component.attr.component_id
									}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
										component.attr.type
									}/${
										component.attr.component_id
									}/${emotion[component.attr.type]}.swf`));
									componentswithactions[component.attr.type] = true;
								}
								for (const component of components) {
									switch (component.attr.type) {
										case "bodyshape": {
											fUtil.addToZip(zip, `${component.attr.theme_id}.bodyshape.${
												component.attr.component_id
											}.swf`, fs.readFileSync(`./charStore/${
												component.attr.theme_id
											}/bodyshape/${
												component.attr.component_id
											}/thumbnail.swf`))
											break;
										} default: {
											if (!componentswithactions[component.attr.type]) fUtil.addToZip(
												zip, `${component.attr.theme_id}.${component.attr.type}.${
													component.attr.component_id
												}.swf`, fs.readFileSync(`./charStore/${
													component.attr.theme_id
												}/${component.attr.type}/${
													component.attr.component_id
												}/default.swf`)
											);
											break;
										}
									}
								}
								res.end(await zip.zip());	
							} else if (data.facialId.endsWith(".xml")) {
								res.setHeader("Content-Type", "application/xml");
								isAction = false;
								for (const info of result.children) {
									switch (info.name) {
										case "component": {
											const inf = info.attr;
											inf.action = data.facialId.split(".xml")[0];
											componentArray.unshift(inf);
											break;
										} case "color": {
											const inf = info.attr;
											inf.text = info.val;
											colorArray.unshift(inf);
											break;
										}
									}
								}
								res.end(`<facial>${componentArray.map(meta2componentXml).join("")}${colorArray.map(meta2colourXml).join("")}</facial>`);
							}
						}
					} catch (e) {
						console.log(e);
					}});
				} default: return;
			}
		} default: return;
	}
	return true;
};
