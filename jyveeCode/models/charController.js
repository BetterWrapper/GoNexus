/**
 * character routes
 */
// modules
const fs = require("fs");
const path = require("path");
const nodezip = require("node-zip");
let isAction = false;
let charpart;
let whatCCTheme;
// stuff
const Char = require("./charModel");
const char = require("../../character/main");
const folder = path.join(__dirname, "../../frontend", "/static/store/cc_store");
// create the group
const fUtil = require("../../misc/file");
let trim;
let trim2;
let isCC = false;
let whereWeAt = -1;
function makeACCCharComponentsGoInAnArrayThatIsFormattedLikeThe2010LVMSupports(component) {
	console.log(component);
	let arrary = [];
	for (let i = 0; i < component.length; i++) {
		arrary.push(`${component[i]._attributes.theme_id}.${component[i]._attributes.type}.${component[i]._attributes.component_id}.swf`);
	}
	return arrary;
}
function meta2libraryXml(w) {
	let xml;
	xml = `<library type="${w._attributes.type}" file="${w._attributes.component_id}" path="${w._attributes.component_id}" component_id="${w._attributes.component_id}" theme_id="${w._attributes.theme_id}"/>`
	return xml;
}
function meta2componentXml(v) {
	let xml;
	let ty = v._attributes.type;

	if (ty == "eye" || ty == "eyebrow" || ty == "mouth") {
		let animetype = v._attributes.theme_id == "anime" ? "side_" + trim2[ty] : v._attributes.theme_id == "business" ? "front_" + trim2[ty] : trim2[ty];
		xml = `<component type="${v._attributes.type}" ${isAction ? `component_id="${v._attributes.component_id}"` : ``} theme_id="${v._attributes.theme_id}" file="${animetype}.swf" path="${v._attributes.component_id}" x="${v._attributes.x}" y="${v._attributes.y}" xscale="${v._attributes.xscale}" yscale="${v._attributes.yscale}" offset="${v._attributes.offset}" rotation="${v._attributes.rotation}" ${v._attributes.split ? `split="N"` : ``}/>`;
	}
	else {
		if (v._attributes.id) xml = `<component id="${v._attributes.id}" ${isAction ? `file="default.swf"` : ``} type="${v._attributes.type}" theme_id="${v._attributes.theme_id}" ${isAction ? `component_id="${v._attributes.component_id}"` : ``} path="${v._attributes.component_id}" x="${v._attributes.x}" y="${v._attributes.y}" xscale="${v._attributes.xscale}" yscale="${v._attributes.yscale}" offset="${v._attributes.offset}" rotation="${v._attributes.rotation}" />`;
		else if (v._attributes.type != "skeleton" && v._attributes.type != "bodyshape" && v._attributes.type != "freeaction") xml = `<component type="${v._attributes.type}" theme_id="${v._attributes.theme_id}" ${isCC || isAction && v._attributes.theme_id != "business" ? `file="default.swf"` : v._attributes.theme_id == "business" ? `file="front_default.swf"` : ``} ${isAction ? `component_id="${v._attributes.component_id}"` : ``} path="${v._attributes.component_id}" x="${v._attributes.x}" y="${v._attributes.y}" xscale="${v._attributes.xscale}" yscale="${v._attributes.yscale}" offset="${v._attributes.offset}" rotation="${v._attributes.rotation}" />`;
		else xml = `<component type="${v._attributes.type}" theme_id="${v._attributes.theme_id}" ${v._attributes.type == "skeleton" ? `file="stand.swf"` : v._attributes.type == "freeaction" && v._attributes.theme_id == "cc2" ? `file="stand.swf"` : v._attributes.type == "freeaction" && v._attributes.theme_id == "business" ? `file="stand01.swf"` : `file="thumbnail.swf"`} path="${v._attributes.component_id}" ${isAction ? `component_id="${v._attributes.component_id}"` : ``} x="${v._attributes.x}" y="${v._attributes.y}" xscale="${v._attributes.xscale}" yscale="${v._attributes.yscale}" offset="${v._attributes.offset}" rotation="${v._attributes.rotation}" />`;
	}
	return xml;
}

module.exports = {
	async getStoreCustomCharXml(req, res) {
		var convert = require('xml-js');
		isAction = true;
		whereWeAt++;
		const zip = nodezip.create();
		const filters = {
			themeId: "family",
			type: "char"
		};
		const files = req.listFiles(filters);
		let hasFoundItYet = false;
		//Filter by POS
		for (const file in files) {
			if (files[file].id == req.matches[1]) {
				whereWeAt = file;
				hasFoundItYet = true;
				console.log("WE FOUD IT!");
				break;
			}
		}
		charpart = [];
		if (!hasFoundItYet) {
			const buf = await char.load(req.matches[1]);
			let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
			const realresult = JSON.parse(result);
			charpart.push(makeACCCharComponentsGoInAnArrayThatIsFormattedLikeThe2010LVMSupports(realresult.cc_char.component));
			whereWeAt = charpart.length - 1;
		}
		let cid;
		if (hasFoundItYet) {
			cid = files[whereWeAt].id;
		}
		else {
			cid = req.matches[1];
		}
		console.log(charpart[charpart.length - 1]);
		console.log(cid);
		const desc = await char.load(cid);
		fUtil.addToZip(zip, "desc.xml", Buffer.from(desc),);
		for (let i = 0; i < charpart[whereWeAt].length; i++) {
			let pieces = charpart[whereWeAt][i].split(".");
			fUtil.addToZip(zip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../frontend`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" ? `stand` : pieces[1] == "bodyshape" ? `thumbnail` : `default`}.swf`,)));
		}
		res.end(await zip.zip());
	},
	async getCharacter(req, res) {
		//Check first to see if its a cc theme
		let isCcThemeChar = false;
		const filters = {
			themeId: whatCCTheme,
			type: "char"
		};
		const files = req.listFiles(filters);
		for (const file in files) {
			if (files[file].id == req.body.assetId) {
				isCcThemeChar = true;
				break;
			}
		}
		//This code is so hard for people so hear are commentz
		if (!isCcThemeChar) {
			var convert = require('xml-js');
			const zip = nodezip.create();
			let num;
			let xnl = fs.readFileSync(path.join(__dirname, "../../frontend", "/static/store/Comm", "theme.xml")).toString();
			let result = convert.xml2json(xnl, { compact: true, spaces: 4 });
			const data = JSON.parse(result);
			let hasmatch = false;
			for (let i = 0; i < data.theme.char.length; i++) {
				num = i;
				if (data.theme.char[i]._attributes.id == req.body.assetId) {
					// Was used for logging

					//console.log("We've found a match here..");
					//console.log("Heres the json metainfo:", data.theme.char[i]._attributes);
					//console.log("And the actions:", data.theme.char[num].action);
					//Handler for one action chars
					if (data.theme.char[num].action[0] === undefined) {
						fUtil.addToZip(zip, `char/${req.body.assetId}/${data.theme.char[num].action._attributes.id}`, fs.readFileSync(path.join(__dirname, "../../frontend", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action._attributes.id)));
					}
					else {
						for (let b = 0; b < data.theme.char[num].action.length; b++) {
							// Check if the action exists before going rogue to add them
							if (fs.existsSync(path.join(__dirname, "../../frontend", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action[b]._attributes.id))) {
								fUtil.addToZip(zip, `char/${req.body.assetId}/${data.theme.char[num].action[b]._attributes.id}`, fs.readFileSync(path.join(__dirname, "../../frontend", "/static/store/Comm/char", req.body.assetId, data.theme.char[num].action[b]._attributes.id)));
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
		else {
			var convert = require('xml-js');
			const zip = nodezip.create();
			const buf = await char.load(req.body.assetId);
			const filters = {
				themeId: whatCCTheme,
				type: "char"
			};
			const files = req.listFiles(filters);
			for (const file in files) {
				if (files[file].id == req.body.assetId) {
					whereWeAt = file;
					console.log("WE FOUD IT!")
					break;
				}
			}
			console.log(buf);
			let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
			const data = JSON.parse(result);
			const themeid = data.cc_char.component[0]._attributes.theme_id;
			const libArray = data.cc_char.library;
			let mappedLibrary;
			if (themeid == "cc2" || themeid == "business") {
				mappedLibrary = libArray.map(meta2libraryXml).join("");
			}
			trim = fs.readFileSync(path.join(folder, themeid, "emotions", "head_neutral.json"));
			trim2 = JSON.parse(trim);
			const colorArray = data.cc_char.color;
			let mappedColors;
			isAction = true;
			mappedColors = colorArray.map(Char.meta2colourXml).join("");
			const componentArray = data.cc_char.component;
			let mappedComponent;
			mappedComponent = componentArray.map(meta2componentXml).join("");
			res.setHeader("Content-type", "application/zip");
			let actions = ["stand", "walk"];
			let actionproperties = ["default", "walk"];
			for (var num = 0; num < actions.length; num++) {
				const actionzip = nodezip.create();
				fUtil.addToZip(actionzip, `desc.xml`, Buffer.from(`<cc_char ${data.cc_char._attributes ? `xscale='${data.cc_char._attributes.xscale}' yscale='${data.cc_char._attributes.yscale}' hxscale='${data.cc_char._attributes.hxscale}' hyscale='${data.cc_char._attributes.hyscale}' headdx='${data.cc_char._attributes.headdx}' headdy='${data.cc_char._attributes.headdy}'` : ``}>${mappedColors}${mappedComponent}${themeid == "cc2" || themeid == "business" ? mappedLibrary : ``}</cc_char>`));
				for (let i = 0; i < charpart[whereWeAt].length; i++) {
					let pieces = charpart[whereWeAt][i].split(".");
					fUtil.addToZip(actionzip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../frontend`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" ? actions[num] : pieces[1] == "bodyshape" ? `thumbnail` : pieces[1] == "eye" || pieces[1] == "eyebrow" || pieces[1] == "mouth" ? `default` : pieces[1] != "lower_body" && pieces[1] != "upper_body" ? `default` : actionproperties[num]}.swf`,)));
				}
				fUtil.addToZip(zip, `char/${req.body.assetId}/${actions[num]}.xml`, Buffer.from(await actionzip.zip()));
			}


			if (themeid == "family")
			{
			let testfacials = ["neutral","shocked","angry","sad","talk_a"];
			for (a = 0; a < testfacials.length; a++)
			{
			isAction = false;
			const facialzip = nodezip.create();
			let json = fs.readFileSync(path.join(folder, themeid, "emotions", `head_${testfacials[a]}.json`),'utf-8');
			let json2 = JSON.parse(json);
			fUtil.addToZip(facialzip, `desc.xml`, Buffer.from(`<cc_char ${data.cc_char._attributes ? `xscale='${data.cc_char._attributes.xscale}' yscale='${data.cc_char._attributes.yscale}' hxscale='${data.cc_char._attributes.hxscale}' hyscale='${data.cc_char._attributes.hyscale}' headdx='${data.cc_char._attributes.headdx}' headdy='${data.cc_char._attributes.headdy}'` : ``}>${mappedColors}${mappedComponent}${themeid == "cc2" || themeid == "business" ? mappedLibrary : ``}</cc_char>`));
			for (let i = 0; i < charpart[whereWeAt].length; i++) {
				let pieces = charpart[whereWeAt][i].split(".");
				if (pieces[1] != "lower_body"|| pieces[1] != "upper_body"|| pieces[1] != "skeleton") fUtil.addToZip(facialzip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../frontend`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" ? `stand` : pieces[1] == "bodyshape" ? `thumbnail` : pieces[1] == "mouth" ? json2.mouth : pieces[1] == "eyebrow" ? json2.eyebrow : pieces[1] == "eye" ? json2.eye : pieces[1] != "lower_body" && pieces[1] != "upper_body" ? `default` : `default`}.swf`,)));
			}
			fUtil.addToZip(zip, `char/${req.body.assetId}/head/head_${testfacials[a]}.xml`, Buffer.from(await facialzip.zip()));
			}
			}
			res.end(await zip.zip());
		}
	},
	getCharSwfPartsForThe2010LvmRightFreakingNow(req, res) {
		charpart = req.body.array;
		whatCCTheme = req.body.themeid;
		console.log(req.body.themeid);
		is2010 = true;
		whereWeAt = -1;
		res.end();
	},
	getUserAssets() {
		console.log("call")
		is2010 = false;
		whereWeAt = -1;
	},
	async getCharacterAction(req, res) {
		console.log(req, res)
		var convert = require('xml-js');
		if (req.body.actionId.includes(".zip")) {
			isAction = true;
			whereWeAt++;
			const zip = nodezip.create();
			const filters = {
				themeId: "family",
				type: "char"
			};
			const buf = req.body.charXml || await char.load(req.body.charId);
			let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
			const realresult = JSON.parse(result);
			let charpart = [];
			charpart.push(makeACCCharComponentsGoInAnArrayThatIsFormattedLikeThe2010LVMSupports(realresult.cc_char.component));
			whereWeAt = charpart.length - 1;
			let json;
			if (req.body.facialId != "") json = fs.readFileSync(path.join(folder, 'family', "emotions", `${req.body.facialId.slice(0, -4)}.json`));
			else json = fs.readFileSync(path.join(folder, 'family', "emotions", `head_neutral.json`));
			let json2 = JSON.parse(json);
			let json3 = fs.readFileSync(path.join(folder, 'family', "emotions", `${req.body.actionId.slice(0, -4)}.json`));
			let json4 = JSON.parse(json3);
			fUtil.addToZip(zip, "desc.xml", Buffer.from(buf));
			for (let i = 0; i < charpart[whereWeAt].length; i++) {
				let pieces = charpart[whereWeAt][i].split(".");
				fUtil.addToZip(zip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../frontend`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" || pieces[1] == "freeaction" ? json4.skeleton : pieces[1] == "bodyshape" ? `thumbnail` : pieces[1] == "eye" ? json2.eye : pieces[1] == "eyebrow" ? json2.eyebrow : pieces[1] == "mouth" ? json2.mouth : pieces[1] == "upper_body" ? json4.upper_body : pieces[1] == "lower_body" ? json4.lower_body : `default`}.swf`,)));
			}
			res.end(await zip.zip());
		}
		else {
			if (req.body.facialId.includes(".xml")) {
				res.assert(
					req.body.charId,
					req.body.facialId,
					400, "Missing one or more fields."
				);
				isAction = false;
				const buf = await char.load(req.body.charId.slice(0, -5));
				let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
				const data = JSON.parse(result);
				const themeid = data.cc_char.component[0]._attributes.theme_id;
				trim = fs.readFileSync(path.join(folder, themeid, "emotions", req.body.facialId.slice(0, -4) + ".json"));
				trim2 = JSON.parse(trim);
				const colorArray = data.cc_char.color;
				const mappedColors = colorArray.map(Char.meta2colourXml).join("");
				const tag = !req.body.isPlayer ? 'facial' : 'cc_char';
				const componentArray = data.cc_char.component;
				const mappedComponent = componentArray.map(meta2componentXml).join("")
				const response = tag == "cc_char" ? `<cc_char ${
					data.cc_char._attributes ? `xscale='${data.cc_char._attributes.xscale}' yscale='${
						data.cc_char._attributes.yscale
					}' hxscale='${data.cc_char._attributes.hxscale}' hyscale='${data.cc_char._attributes.hyscale}' headdx='${
						data.cc_char._attributes.headdx
					}' headdy='${data.cc_char._attributes.headdy}'` : ``
				}>` : `<${tag}>`;
				res.setHeader("Content-Type", "application/xml");
				res.end(response + mappedColors + mappedComponent + `</${tag}>`);
			}
			else if (req.body.actionId.includes(".xml")) {
				if (req.body.default != undefined) {
					isAction = true;
					const buf = req.body.charXml || await char.load(req.body.charId);
					let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
					const data = JSON.parse(result);
					const themeid = data.cc_char.component[0]._attributes.theme_id;
					const libArray = data.cc_char.library;
					let mappedLibrary;
					if (themeid == "cc2" || themeid == "business") mappedLibrary = libArray.map(meta2libraryXml).join("");
					trim = fs.readFileSync(path.join(folder, themeid, "emotions", "head_neutral.json"));
					trim2 = JSON.parse(trim);
					const colorArray = data.cc_char.color;
					const mappedColors = colorArray.map(Char.meta2colourXml).join("");
					const componentArray = data.cc_char.component;
					const mappedComponent = componentArray.map(meta2componentXml).join("");
					res.setHeader("Content-type", "application/xml");
					res.end(`<cc_char ${data.cc_char._attributes ? `xscale='${data.cc_char._attributes.xscale}' yscale='${data.cc_char._attributes.yscale}' hxscale='${data.cc_char._attributes.hxscale}' hyscale='${data.cc_char._attributes.hyscale}' headdx='${data.cc_char._attributes.headdx}' headdy='${data.cc_char._attributes.headdy}'` : ``}>
			${mappedColors}
			${mappedComponent}${themeid == "cc2" || themeid == "business" ? mappedLibrary : ``}</cc_char>`);
				}
				else if (!req.body.facialId.includes(".zip")) {
					console.log("SEE ME!")
					isAction = true;
					whereWeAt++;
					const zip = nodezip.create();
					const filters = {
						themeId: whatCCTheme,
						type: "char"
					};
					const files = req.listFiles(filters);
					let hasFoundItYet = false;
					//Filter by POS
					for (const file in files) {
						if (files[file].id == req.body.charId) {
							whereWeAt = file;
							hasFoundItYet = true;
							break;
						}
					}
					if (!hasFoundItYet) {
						const buf = await char.load(req.body.charId);
						let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
						const realresult = JSON.parse(result);
						charpart.push(makeACCCharComponentsGoInAnArrayThatIsFormattedLikeThe2010LVMSupports(realresult.cc_char.component));
						whereWeAt = charpart.length - 1;
					}
					let cid;
					if (hasFoundItYet) {
						cid = files[whereWeAt].id;
					}
					else {
						cid = req.body.charId;
					}
					const desc = await char.load(cid);
					fUtil.addToZip(zip, "desc.xml", Buffer.from(desc));
					for (let i = 0; i < charpart[whereWeAt].length; i++) {
						let pieces = charpart[whereWeAt][i].split(".");
						fUtil.addToZip(zip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../frontend`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" || pieces[1] == "freeaction" ? `stand` : pieces[1] == "bodyshape" ? `thumbnail` : `default`}.swf`,)));
					}
					res.end(await zip.zip());
				}
				else
				{
					isAction = true;
					whereWeAt++;
					const zip = nodezip.create();
					const filters = {
						themeId: whatCCTheme,
						type: "char"
					};
					const files = req.listFiles(filters);
					let hasFoundItYet = false;
					//Filter by POS
					for (const file in files) {
						if (files[file].id == req.body.charId) {
							whereWeAt = file;
							hasFoundItYet = true;
							console.log("WE FOUD IT!");
							break;
						}
					}
					if (!hasFoundItYet) {
						const buf = await char.load(req.body.charId);
						let result = convert.xml2json(buf.toString(), { compact: true, spaces: 4 });
						const realresult = JSON.parse(result);
						charpart.push(makeACCCharComponentsGoInAnArrayThatIsFormattedLikeThe2010LVMSupports(realresult.cc_char.component));
						whereWeAt = charpart.length - 1;
					}
					let cid;
					if (hasFoundItYet) {
						cid = files[whereWeAt].id;
					}
					else {
						cid = req.body.charId;
					}
					const desc = await char.load(cid);
					let json = fs.readFileSync(path.join(folder, themeid, "emotions", `${req.body.facialId.slice(0,-4)}.json`));
					let json2 = JSON.parse(json);
					let json3 = fs.readFileSync(path.join(folder, themeid, "emotions", `${req.body.actionId.slice(0,-4)}.json`));
					let json4 = JSON.parse(json3);
					fUtil.addToZip(zip, "desc.xml", Buffer.from(desc));
					for (let i = 0; i < charpart[whereWeAt].length; i++) {
						let pieces = charpart[whereWeAt][i].split(".");
						fUtil.addToZip(zip, charpart[whereWeAt][i], fs.readFileSync(path.join(__dirname, `../../frontend`, `/static/store/cc_store/${pieces[0]}/${pieces[1]}/${pieces[2]}/${pieces[1] == "skeleton" || pieces[1] == "freeaction" ? json4.skeleton : pieces[1] == "bodyshape" ? `thumbnail` : pieces[1] == "eye" ? json2.eye :pieces[1] == "eyebrow" ? json2.eyebrow : pieces[1] == "mouth" ? json2.mouth : pieces[1] == "upper_body" ? json4.upper_body : pieces[1] == "lower_body" ? json4.lower_body : `default`}.swf`,)));
					}
					res.end(await zip.zip());				
				}
			}
			else {
				const fileder = path.join(__dirname, "../../frontend", "/static/store/Comm/char");
				res.end(fs.readFileSync(path.join(fileder, "Robert/" + req.body.actionId)));
			}
		}
	}
}
