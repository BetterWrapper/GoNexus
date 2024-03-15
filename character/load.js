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
function getDaniel() {
	return new Promise((res, rej) => {
		https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004797.xml', r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
		});
	});
}
function getDavidEscobar() {
	return new Promise((res, rej) => {
		https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004414.xml', r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
		});
	});
}
function getRage() {
	return new Promise((res, rej) => {
		https.get('https://file.garden/ZP0Nfnn29AiCnZv5/6667041.xml', r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
		});
	});
}
function getBluePeacocks() { // Does not work (probably because the 2010 lvm char does not support some face)
	return new Promise((res, rej) => {
		https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004418.xml', r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
		});
	});
}
function getTutGirl() {
	return new Promise((res, rej) => {
		https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0000001.xml', r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
		});
	});
}
function getOwen() {
	return new Promise((res, rej) => {
		https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0000000.xml', r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
		});
	});
}
function getJyvee() {
	return new Promise((res, rej) => {
		https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004416.xml', r => {
			const buffers = [];
			r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
		});
	});
}
function meta2componentXml3(v) {
	let xml;
	let ty = v.attr.type;

	if (ty == "eye" || ty == "eyebrow" || ty == "mouth") {
		let animetype = v.attr.theme_id == "anime" ? "side_" + trim2[ty] : v.attr.theme_id == "business" ? "front_" + trim2[ty] : trim2[ty];
		xml = `<component type="${v.attr.type}" ${isAction ? `component_id="${v.attr.component_id}"` : ``} theme_id="${v.attr.theme_id}" file="${animetype}.swf" path="${v.attr.component_id}" x="${v.attr.x}" y="${v.attr.y}" xscale="${v.attr.xscale}" yscale="${v.attr.yscale}" offset="${v.attr.offset}" rotation="${v.attr.rotation}" ${v.attr.split ? `split="N"` : ``}/>`;
	}
	else {
		if (v.attr.id) xml = `<component id="${v.attr.id}" ${isAction ? `file="default.swf"` : ``} type="${v.attr.type}" theme_id="${v.attr.theme_id}" ${isAction ? `component_id="${v.attr.component_id}"` : ``} path="${v.attr.component_id}" x="${v.attr.x}" y="${v.attr.y}" xscale="${v.attr.xscale}" yscale="${v.attr.yscale}" offset="${v.attr.offset}" rotation="${v.attr.rotation}" />`;
		else if (v.attr.type != "skeleton" && v.attr.type != "bodyshape" && v.attr.type != "freeaction") xml = `<component type="${v.attr.type}" theme_id="${v.attr.theme_id}" ${isCC || isAction && v.attr.theme_id != "business" ? `file="default.swf"` : v.attr.theme_id == "business" ? `file="front_default.swf"` : ``} ${isAction ? `component_id="${v.attr.component_id}"` : ``} path="${v.attr.component_id}" x="${v.attr.x}" y="${v.attr.y}" xscale="${v.attr.xscale}" yscale="${v.attr.yscale}" offset="${v.attr.offset}" rotation="${v.attr.rotation}" />`;
		else xml = `<component type="${v.attr.type}" theme_id="${v.attr.theme_id}" ${v.attr.type == "skeleton" ? `file="stand.swf"` : v.attr.type == "freeaction" && v.attr.theme_id == "cc2" ? `file="stand.swf"` : v.attr.type == "freeaction" && v.attr.theme_id == "business" ? `file="stand01.swf"` : `file="thumbnail.swf"`} path="${v.attr.component_id}" ${isAction ? `component_id="${v.attr.component_id}"` : ``} x="${v.attr.x}" y="${v.attr.y}" xscale="${v.attr.xscale}" yscale="${v.attr.yscale}" offset="${v.attr.offset}" rotation="${v.attr.rotation}" />`;
	}
	return xml;
}
function getCharEmotionsJson(v) { // loads char emotions from the cc theme xml (not all emotions work).
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
			if (stuff.attr.state_id != "default") emotions[facial.attr.id][stuff.attr.type] = stuff.attr.state_id;
		}
	}
	return emotions;
}
function getJyveeEmotions(tId) { // Jyvee we are finally loading your emotions into Nexus :)
	const emotions = {};
	fs.readdirSync(`./charStore/${tId}/emotions`).filter(i => i.startsWith("head_")).forEach(feeling => {
		emotions[feeling.split(".json")[0]] = JSON.parse(fs.readFileSync(`./charStore/${tId}/emotions/${
			feeling
		}`));
	});
	return emotions;
}
function getJyveeActions(tId) { // Jyvee we are finally loading your actions into Nexus :)
	const actions = {};
	fs.readdirSync(`./charStore/${tId}/emotions`).filter(i => !i.startsWith("head_")).forEach(act => {
		actions[act.split(".json")[0]] = JSON.parse(fs.readFileSync(`./charStore/${tId}/emotions/${act}`));
	});
	return actions;
}
function meta2componentXml(v) {
	const stuff = getCharEmotionsJson(v);
	let xml;
	let ty = v.type;
	const action2 = stuff[v.action] && stuff[v.action][v.type] ? stuff[v.action][
		v.type
	] : stuff.head_neutral[v.type];
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
			skeleton: v.action == "default" ? "stand" : v.action
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
						const buf = await character.load(data.assetId);
						//Check first to see if its a cc theme
						let isCcThemeChar = false;
						const files = asset.list(data.userId, "char", 0, character.getTheme(buf));
						for (const file in files) {
							if (files[file].id == data.assetId) {
								isCcThemeChar = true;
								break;
							}
						}
						//This code is so hard for people so hear are commentz
						/*
						if (!isCcThemeChar) {
							const zip = nodezip.create();
							let num;
							let xnl = fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm", "theme.xml")).toString();
							let result = convert.xml2json(xnl, { compact: true, spaces: 4 });
							const data = JSON.parse(result);
							let hasmatch = false;
							for (let i = 0; i < data.theme.char.length; i++) {
								num = i;
								if (data.theme.char[i].attr.id == req.body.assetId) {
									// Was used for logging
				
									//console.log("We've found a match here..");
									//console.log("Heres the json metainfo:", data.theme.char[i].attr);
									//console.log("And the actions:", data.theme.char[num].action);
									//Handler for one action chars
									if (data.theme.char[num].action[0] === undefined) {
										fUtil.addToZip(zip, `char/${req.body.assetId}/${data.theme.char[num].action.attr.id}`, fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action.attr.id)));
									}
									else {
										for (let b = 0; b < data.theme.char[num].action.length; b++) {
											// Check if the action exists before going rogue to add them
											if (fs.existsSync(path.join(__dirname, "../../server", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action[b].attr.id))) {
												fUtil.addToZip(zip, `char/${req.body.assetId}/${data.theme.char[num].action[b].attr.id}`, fs.readFileSync(path.join(__dirname, "../../server", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action[b].attr.id)));
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
							const result = new xmldoc.XmlDocument(buf);
							const themeid = character.getTheme(buf);
							isAction = true;
							const components = result.children.filter(i => i.name == "component");
							res.setHeader("Content-type", "application/zip");
							const actions = getJyveeActions(themeid);
							const actionproperties = Object.keys(actions);
							for (var num = 0; num < actionproperties.length; num++) {
								const action = actions[actionproperties[num]];
								const libArray = []
								const mappedColors = [];
								const mappedComponent = [];
								const componentswithactions = {};
								const actionzip = nodezip.create();
								for (const info of result.children) {
									switch (info.name) {
										case "component": {
											const inf = info.attr;
											inf.action = actionproperties[num];
											inf.bs = character.getCharTypeViaBuff(buf);
											const themeid = inf.theme_id;
											/*const libArray = data.cc_char.library;
											if (themeid == "cc2") charXml += libArray.map(meta2libraryXml).join("");*/
											mappedComponent.unshift(inf);
											break;
										} case "color": {
											const inf = info.attr;
											inf.text = info.val;
											mappedColors.unshift(inf);
											break;
										}
									}
								}
								fUtil.addToZip(actionzip, `desc.xml`, `<cc_char ${
									result.attr ? `xscale='${result.attr.xscale}' yscale='${
										result.attr.yscale
									}' hxscale='${result.attr.hxscale}' hyscale='${
										result.attr.hyscale
									}' headdx='${result.attr.headdx}' headdy='${result.attr.headdy}'` : ``
								}>${mappedComponent.map(meta2componentXml2).join("")}${
									mappedColors.map(meta2colourXml).join("")
								}</cc_char>`);
								for (const i in action) {
									const component = components.find(d => d.attr.type == i);
									if (component) {
										fUtil.addToZip(actionzip, `${component.attr.theme_id}.${
											component.attr.type
										}.${
											component.attr.component_id
										}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
											component.attr.type
										}/${
											component.attr.component_id
										}/${action[component.attr.type]}.swf`));
										componentswithactions[component.attr.type] = true;
									}
								}
								for (const component of components) {
									switch (component.attr.type) {
										case "bodyshape": {
											fUtil.addToZip(actionzip, `${component.attr.theme_id}.${
												component.attr.type
											}.${
												component.attr.component_id
											}.swf`, fs.readFileSync(`./charStore/${
												component.attr.theme_id
											}/${component.attr.type}/${
												component.attr.component_id
											}/thumbnail.swf`))
											break;
										} default: {
											if (!componentswithactions[component.attr.type]) fUtil.addToZip(
												actionzip, `${component.attr.theme_id}.${component.attr.type}.${
													component.attr.component_id
												}.swf`, fs.readFileSync(`./charStore/${
													component.attr.theme_id
												}/${
													component.attr.type
												}/${component.attr.component_id}/${
													component.attr.type == "skeleton" ? "stand" : "default"
												}.swf`)
											);
											break;
										}
									}
								}
								fUtil.addToZip(zip, `char/${data.assetId}/${
									actionproperties[num]
								}.zip`, Buffer.from(await actionzip.zip()));
							}
				
							const facials = getJyveeEmotions(themeid)
							const testfacials = Object.keys(facials);
							for (a = 0; a < 2; a++) {
								isAction = false;
								const libArray = []
								const mappedColors = [];
								const mappedComponent = [];
								const componentswithactions = {};
								const facialzip = nodezip.create();
								for (const info of result.children) {
									switch (info.name) {
										case "component": {
											const inf = info.attr;
											inf.action = testfacials[a];
											inf.bs = character.getCharTypeViaBuff(buf);
											const themeid = inf.theme_id;
											/*const libArray = data.cc_char.library;
											if (themeid == "cc2") charXml += libArray.map(meta2libraryXml).join("");*/
											mappedComponent.unshift(inf);
											break;
										} case "color": {
											const inf = info.attr;
											inf.text = info.val;
											mappedColors.unshift(inf);
											break;
										}
									}
								}
								fUtil.addToZip(facialzip, `desc.xml`, `<cc_char ${
									result.attr ? `xscale='${result.attr.xscale}' yscale='${
										result.attr.yscale
									}' hxscale='${result.attr.hxscale}' hyscale='${
										result.attr.hyscale
									}' headdx='${result.attr.headdx}' headdy='${result.attr.headdy}'` : ``
								}>${mappedComponent.map(meta2componentXml2).join("")}${
									mappedColors.map(meta2colourXml).join("")
								}</cc_char>`);
								for (const i in facials[testfacials[a]]) {
									const component = components.find(d => d.attr.type == i);
									if (component) {
										fUtil.addToZip(facialzip, `${component.attr.theme_id}.${
											component.attr.type
										}.${
											component.attr.component_id
										}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
											component.attr.type
										}/${
											component.attr.component_id
										}/${facials[testfacials[a]][component.attr.type]}.swf`));
										componentswithactions[component.attr.type] = true;
									}
								}
								for (const component of components) {
									switch (component.attr.type) {
										case "lower_body":
										case "upper_body":
										case "skeleton": break;
										case "bodyshape": {
											fUtil.addToZip(facialzip, `${component.attr.theme_id}.${
												component.attr.type
											}.${
												component.attr.component_id
											}.swf`, fs.readFileSync(`./charStore/${
												component.attr.theme_id
											}/${component.attr.type}/${
												component.attr.component_id
											}/thumbnail.swf`))
											break;
										} default: {
											if (!componentswithactions[component.attr.type]) fUtil.addToZip(
												facialzip, `${component.attr.theme_id}.${component.attr.type}.${
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
								fUtil.addToZip(zip, `char/${data.assetId}/head/${
									testfacials[a]
								}.zip`, Buffer.from(await facialzip.zip()));
							}
							res.end(await zip.zip());
						//}
					})
					break;
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
						const charId = data.charId.includes(".") ? data.charId.split(".")[0] : data.charId;
						let buf;
						if (charId == "4048901") buf = await getJoseph();
						else if (charId == "4715202") buf = await getTutGirl();
						else if (charId == "192") buf = await getDavidEscobar();
						else if (charId == "60897073") buf = await getBluePeacocks();
						else if (charId == "66670973") buf = await getJyvee();
						else if (charId == "4635901") buf = await getOwen();
						else if (charId == "0000000") buf = await getRage();
						else if (charId == "666") buf = await getDaniel();
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
										fUtil.addToZip(zip, `${component.attr.theme_id}.${component.attr.type}.${
											component.attr.component_id
										}.swf`, fs.readFileSync(`./charStore/${
											component.attr.theme_id
										}/${component.attr.type}/${
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
