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
function getCharEmotionsJson(v) { // loads char emotions from the cc theme xml.
	const emotions = {
		default: {
			eye: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action,
			eyebrow: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action,
			mouth: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action
		}
	}
	const ccTheme = fs.readFileSync(`./charStore/${v.theme_id}/cc_theme.xml`);
	const result = new xmldoc.XmlDocument(ccTheme);
	for (const facial of result.children.filter(i => i.name == "facial")) {
		emotions[facial.attr.id] = {};
		for (const stuff of facial.children.filter(i => i.name == "selection")) {
			emotions[facial.attr.id][stuff.attr.type] = stuff.attr.state_id;
		}
	}
	return emotions;
}
function getJyveeEmotions(tId) { // Jyvee we are finally loading your emotions into Nexus :)
	const emotions = {};
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
function getCharActionsJson(v) { // loads char actions from the cc theme xml using char bs
	const actions = {
		default: {
			upper_body: v.action,
			lower_body: v.action,
			skeleton: v.action
		}
	}
	const ccTheme = fs.readFileSync(`./charStore/${v.theme_id}/cc_theme.xml`);
	const result = new xmldoc.XmlDocument(ccTheme);
	const shapes = result.children.filter(i => i.name == "bodyshape");
	const char = shapes.find(i => i.attr.id == v.bs);
	for (const charActions of char.children.filter(i => i.name == "action")) {
		actions[charActions.attr.id] = {};
		for (const act of charActions.children.filter(i => i.name == "selection")) {
			if (!act.attr.facial_id) actions[charActions.attr.id][act.attr.type] = act.attr.state_id;
		}
	}
	return actions;
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
let isAction = false;
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
				case "/goapi/getCharacter/": {
					loadPost(req, res).then(async data => {
						//Check first to see if its a cc theme
						res.setHeader("Content-type", "application/zip");
						let isCcThemeChar = false;
						let charInfo;
						const files = asset.list(data.userId, "char", 0);
						for (const file of files) {
							if (file.id == data.assetId) {
								isCcThemeChar = true;
								charInfo = file;
								break;
							}
						}
						//This code is so hard for people so hear are commentz
						/*if (!isCcThemeChar) {
							const zip = nodezip.create();
							let num;
							let xnl = fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm", "theme.xml")).toString();
							let result = new xmldoc.XmlDocument(xnl);
							const data = JSON.parse(result);
							let hasmatch = false;
							for (let i = 0; i < data.theme.char.length; i++) {
								num = i;
								if (data.theme.char[i]._attributes.id == data.assetId) {
									// Was used for logging
				
									//console.log("We've found a match here..");
									//console.log("Heres the json metainfo:", data.theme.char[i]._attributes);
									//console.log("And the actions:", data.theme.char[num].action);
									//Handler for one action chars
									if (data.theme.char[num].action[0] === undefined) {
										fUtil.addToZip(zip, `char/${data.assetId}/${data.theme.char[num].action._attributes.id}`, fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm/char", data.assetId, data.theme.char[num].action._attributes.id)));
									}
									else {
										for (let b = 0; b < data.theme.char[num].action.length; b++) {
											// Check if the action exists before going rogue to add them
											if (fs.existsSync(path.join(__dirname, "../../server", "/static/store/Comm/char", data.assetId, data.theme.char[num].action[b]._attributes.id))) {
												fUtil.addToZip(zip, `char/${data.assetId}/${data.theme.char[num].action[b]._attributes.id}`, fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm/char", data.assetId, data.theme.char[num].action[b]._attributes.id)));
											}
										}
									}
									hasmatch = true;
								}
							}
							if (hasmatch) {
				
								res.end(await zip.zip());
							}
							else {
								res.statusCode = "500";
								res.json({ "status": "error", "massage": "Character not found, listed wrong" });
							}
						}
						else {*/
							const zip = nodezip.create();
							const buf = await character.load(data.assetId);
							const result = new xmldoc.XmlDocument(buf);
							const themeid = charInfo.themeId;
							const libArray = result.children.filter(i => i.name == "library");
							let mappedLibrary;
							if (themeid == "cc2" || themeid == "business") {
								mappedLibrary = libArray.map(meta2libraryXml).join("");
							}
							const colorArray = result.children.filter(i => i.name == "color");
							let mappedColors;
							isAction = true;
							mappedColors = colorArray.map(meta2colourXml).join("");
							const componentArray = [];
							for (const i of result.children.filter(i => i.name == "component")) {
								const inf = i.attr;
								inf.bs = character.getCharTypeViaBuff(buf);
								componentArray.unshift(inf);
							}
							let mappedComponent;
							mappedComponent = componentArray.map(meta2componentXml2).join("");
							const actions = Object.keys(getCharActionsJson({
								action: "stand",
								bs: character.getCharTypeViaBuff(buf),
								theme_id: themeid
							}));
							for (var num = 0; num < actions.length; num++) {
								const components = result.children.filter(i => i.name == "component");
								const componentswithactions = {};
								const actionzip = nodezip.create();
								fUtil.addToZip(actionzip, `desc.xml`, Buffer.from(`<cc_char ${
									result.attr ? `xscale='${
										result.attr.xscale
									}' yscale='${result.attr.yscale}' hxscale='${
										result.attr.hxscale
									}' hyscale='${result.attr.hyscale}' headdx='${
										result.attr.headdx
									}' headdy='${result.attr.headdy}'` : ``
								}>${
									mappedColors
								}${mappedComponent}${
									themeid == "cc2" || themeid == "business" ? mappedLibrary : ``
								}</cc_char>`));
								const action = (getCharActionsJson({
									action: actions[num],
									bs: character.getCharTypeViaBuff(buf),
									theme_id: themeid
								}))[actions[num]]
								for (const i in action) {
									const component = components.find(d => d.attr.type == i);
									if (component && fs.existsSync(`./charStore/${
										component.attr.theme_id
									}/${component.attr.type}/${component.attr.component_id}/${
										action[component.attr.type]
									}.swf`)) {
										fUtil.addToZip(actionzip, `${component.attr.theme_id}.${
											component.attr.type
										}.${component.attr.component_id}.swf`, fs.readFileSync(`./charStore/${
											component.attr.theme_id
										}/${component.attr.type}/${component.attr.component_id}/${
											action[component.attr.type]
										}.swf`));
										componentswithactions[component.attr.type] = true;
									}
								}
								for (const component of components) {
									switch (component.attr.type) {
										case "bodyshape": {
											fUtil.addToZip(actionzip, `${component.attr.theme_id}.bodyshape.${
												component.attr.component_id
											}.swf`, fs.readFileSync(`./charStore/${
												component.attr.theme_id
											}/bodyshape/${
												component.attr.component_id
											}/thumbnail.swf`))
											break;
										} default: {
											if (
												!componentswithactions[component.attr.type] 
												&& fs.existsSync(`./charStore/${
													component.attr.theme_id
												}/${component.attr.type}/${
													component.attr.component_id
												}/default.swf`)
											) fUtil.addToZip(
												actionzip, `${component.attr.theme_id}.${
													component.attr.type
												}.${
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
								console.log(actionzip);
								fUtil.addToZip(zip, `char/${data.assetId}/${
									actions[num]
								}.zip`, await actionzip.zip());
							}
				
				
							const facials = Object.keys(getCharActionsJson({
								action: "default",
								bs: character.getCharTypeViaBuff(buf),
								theme_id: themeid
							})).filter(i => i != "default");
							for (a = 0; a < facials.length; a++) {
								const components = result.children.filter(i => i.name == "component");
								isAction = false;
								const componentswithactions = {};
								const facialzip = nodezip.create();
								fUtil.addToZip(facialzip, `desc.xml`, Buffer.from(`<cc_char ${
									result.attr ? `xscale='${
										result.attr.xscale
									}' yscale='${result.attr.yscale}' hxscale='${
										result.attr.hxscale
									}' hyscale='${result.attr.hyscale}' headdx='${
										result.attr.headdx
									}' headdy='${result.attr.headdy}'` : ``
								}>${mappedColors}${mappedComponent}${
									themeid == "cc2" || themeid == "business" ? mappedLibrary : ``
								}</cc_char>`));
								const emotion = (getCharEmotionsJson({
									action: facials[a],
									theme_id: themeid
								}))[facials[a]]
								for (const i in emotion) {
									const component = components.find(d => d.attr.type == i);
									if (component && fs.existsSync(`./charStore/${component.attr.theme_id}/${
										component.attr.type
									}/${
										component.attr.component_id
									}/${emotion[component.attr.type]}.swf`)) {
										fUtil.addToZip(facialzip, `${component.attr.theme_id}.${
											component.attr.type
										}.${
											component.attr.component_id
										}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
											component.attr.type
										}/${
											component.attr.component_id
										}/${emotion[component.attr.type]}.swf`));
										componentswithactions[component.attr.type] = true;
									}
								}
								for (const component of components) {
									switch (component.attr.type) {
										case "bodyshape": {
											fUtil.addToZip(facialzip, `${component.attr.theme_id}.bodyshape.${
												component.attr.component_id
											}.swf`, fs.readFileSync(`./charStore/${
												component.attr.theme_id
											}/bodyshape/${
												component.attr.component_id
											}/thumbnail.swf`))
											break;
										} default: {
											if (
												!componentswithactions[component.attr.type] 
												&& fs.existsSync(`./charStore/${
													component.attr.theme_id
												}/${
													component.attr.type
												}/${component.attr.component_id}/default.swf`)
											) fUtil.addToZip(
												facialzip, `${component.attr.theme_id}.${
													component.attr.type
												}.${
													component.attr.component_id
												}.swf`, fs.readFileSync(`./charStore/${
													component.attr.theme_id
												}/${
													component.attr.type
												}/${component.attr.component_id}/default.swf`)
											);
											break;
										}
									}
								}
								console.log(facialzip);
								fUtil.addToZip(zip, `char/${data.assetId}/head/head_${
									facials[a]
								}.zip`, await facialzip.zip());
							}
							console.log(zip);
							res.end(await zip.zip());
						//}
					})
				} case "/api/getChars": {
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
								action: data.facialId.split(".zip")[0],
								theme_id: character.getTheme(buf)
							}))[data.facialId.split(".zip")[0]]
							const action = (getCharActionsJson({
								action: data.actionId.split(".zip")[0],
								bs: character.getCharTypeViaBuff(buf),
								theme_id: character.getTheme(buf)
							}))[data.actionId.split(".zip")[0]]
							fUtil.addToZip(zip, "desc.xml", buf);
							res.setHeader("Content-Type", "application/zip");
							for (const i in action) {
								const component = components.find(d => d.attr.type == i);
								if (component) {
									fUtil.addToZip(zip, `${component.attr.theme_id}.${component.attr.type}.${
										component.attr.component_id
									}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
										component.attr.type
									}/${
										component.attr.component_id
									}/${action[component.attr.type]}.swf`));
									componentswithactions[component.attr.type] = true;
								}
							}
							for (const i in emotion) {
								const component = components.find(d => d.attr.type == i);
								if (component) {
									fUtil.addToZip(zip, `${component.attr.theme_id}.${
										component.attr.type
									}.${
										component.attr.component_id
									}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
										component.attr.type
									}/${
										component.attr.component_id
									}/${emotion[component.attr.type]}.swf`));
									componentswithactions[component.attr.type] = true;
								}
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
									action: data.actionId.split(".zip")[0],
									bs: character.getCharTypeViaBuff(buf),
									theme_id: character.getTheme(buf)
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
											inf.bs = character.getCharTypeViaBuff(buf);
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
									action: data.facialId.split(".zip")[0],
									theme_id: character.getTheme(buf)
								}))[data.facialId.split(".zip")[0]]
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
								res.end(`<facial>${componentArray.map(meta2componentXml).join("")}${
									colorArray.map(meta2colourXml).join("")
								}</facial>`);
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
