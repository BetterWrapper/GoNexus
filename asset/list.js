const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const asset = require("./main");
const char = require("../character/main");
const http = require("http");
const base2 = Buffer.from([0x0]);
const xmldoc = require("xmldoc");
const fs = require('fs');
function getTid(tId) {
	switch (tId) {
		case "custom": return "family";
		case "action": return "cc2";
		default: return tId;
	}
}
const motionsxml = '<motion id="run.xml" name="Run" loop="Y" totalframe="24" is_motion="Y" enable="Y"/><motion id="walk.xml" name="Walk" loop="Y" totalframe="24" is_motion="Y" enable="Y"/><motion id="xarms3.xml" name="Walk - Crossed arms" loop="Y" totalframe="24" enable="Y"/><motion id="talk_phone3.xml" name="Walk - Talk on phone" loop="Y" totalframe="115" enable="Y"/>'
const motionszip = '<motion id="run.zip" name="Run" loop="Y" totalframe="24" is_motion="Y" enable="Y"/><motion id="walk.zip" name="Walk" loop="Y" totalframe="24" is_motion="Y" enable="Y"/><motion id="xarms3.zip" name="Walk - Crossed arms" loop="Y" totalframe="24" enable="Y"/><motion id="talk_phone3.zip" name="Walk - Talk on phone" loop="Y" totalframe="115" enable="Y"/>'
function search4fatials(tId, type, facialId) {
	for (const folder2 of fs.readdirSync(`./charStore/${tId}/${type}`)) {
		for (const i of fs.readdirSync(`./charStore/${tId}/${type}/${folder2}`)) {
			if (fs.existsSync(`./charStore/${tId}/${type}/${folder2}/${facialId}.swf`)) return true;
		}
	}
}
async function listAssets(data, makeZip) {
	var files, xmlString;
	switch (data.type) {
		case "char": {
			const tId = data.cc_theme_id || getTid(data.themeId);
			const fatials = {};
			const fileExtention = data.studio == "2010" ? ".zip" : ".xml";
			const actions = {
				adam: `<action id="stand${fileExtention}" name="Stand" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="sit${fileExtention}" name="Sit" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="kneel${fileExtention}" name="Kneel down" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="kneelphone${fileExtention}" name="Kneel down - Talk on phone" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="excited${fileExtention}" name="Excited / Cheers" loop="Y" totalframe="80" enable="Y" category="emotion" is_motion="N"/><action id="furious${fileExtention}" name="Furious" loop="Y" totalframe="80" enable="Y" category="emotion" is_motion="N"/><action id="xarms2${fileExtention}" name="Sit - Crossed arms" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="xarmspoint${fileExtention}" name="Sit - Point at" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="kneelcross${fileExtention}" name="Kneel down - Crossed arms" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="dislike${fileExtention}" name="Dislike" loop="Y" totalframe="60" enable="Y" category="emotion" is_motion="N"/><action id="taunt${fileExtention}" name="Taunt" loop="Y" totalframe="60" enable="Y" category="emotion" is_motion="N"/><action id="makefunof${fileExtention}" name="Make fun of" loop="Y" totalframe="60" enable="Y" category="emotion" is_motion="N"/><action id="grab${fileExtention}" name="Grab" loop="Y" totalframe="60" enable="Y" is_motion="N"/><action id="chuckle${fileExtention}" name="Chuckle" loop="Y" totalframe="6" enable="Y" category="emotion" is_motion="N"/><action id="sitchuckle${fileExtention}" name="Sit - Chuckle" loop="Y" totalframe="6" enable="Y" category="emotion" is_motion="N"/><action id="pt_at${fileExtention}" name="Point at" loop="Y" totalframe="30" enable="Y" is_motion="N"/><action id="laugh${fileExtention}" name="Laugh" loop="Y" totalframe="6" enable="Y" category="emotion" is_motion="N"/><action id="sad${fileExtention}" name="Sad" loop="Y" totalframe="60" enable="Y" category="emotion" is_motion="N"/><action id="talk_phone${fileExtention}" name="Talk on phone" loop="Y" totalframe="115" enable="Y" is_motion="N"/><action id="talk_phone2${fileExtention}" name="Sit - Talk on phone" loop="Y" totalframe="115" enable="Y" is_motion="N"/><action id="punch${fileExtention}" name="Punch" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="dance${fileExtention}" name="Dance" loop="Y" totalframe="23" enable="Y" is_motion="N"/><action id="fearful${fileExtention}" name="Fearful" loop="Y" totalframe="60" enable="Y" category="emotion" is_motion="N"/><action id="talk${fileExtention}" name="Talk" loop="Y" totalframe="100" enable="Y" is_motion="N"/><action id="drive${fileExtention}" name="Drive" loop="Y" totalframe="1" enable="Y" category="traveling" is_motion="N"/>`,
				bob: '',
				eve: `<action id="stand${fileExtention}" name="Stand" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="movearms${fileExtention}" name="Move arms" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="sit${fileExtention}" name="Sit 1" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="lie${fileExtention}" name="Lie down" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="kneel${fileExtention}" name="Kneel down" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="xarms${fileExtention}" name="Crossed arms" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="useitem${fileExtention}" name="Use item" loop="Y" totalframe="1" enable="Y" category="fighting" is_motion="N"/><action id="excited${
					fileExtention
				}" name="Excited / Cheers" loop="Y" totalframe="80" enable="Y" category="emotion" is_motion="N"/><action id="furious${fileExtention}" name="Furious" loop="Y" totalframe="80" enable="Y" category="emotion" is_motion="N"/><action id="xarmspoint${fileExtention}" name="Sit - Point at" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="kneelcross${fileExtention}" name="Kneel down - Crossed arms" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="makefunof${fileExtention}" name="Make fun of" loop="Y" totalframe="60" enable="Y" category="fighting" is_motion="N"/><action id="bendover${fileExtention}" name="Bend over" loop="Y" totalframe="60" enable="Y" is_motion="N"/><action id="doublepunch${fileExtention}" name="Double punch" loop="Y" totalframe="80" enable="Y" category="fighting" is_motion="N"/><action id="creep${fileExtention}" name="Creep" loop="Y" totalframe="80" enable="Y" category="traveling" is_motion="N"/><action id="grab${fileExtention}" name="Grab" loop="Y" totalframe="6" enable="Y" is_motion="N"/><action id="xarms2${fileExtention}" name="Sit - Crossed arms" loop="Y" totalframe="1" enable="Y" is_motion="N"/><action id="taunt${fileExtention}" name="Taunt" loop="Y" totalframe="60" enable="Y" category="emotion" is_motion="N"/><action id="chuckle${fileExtention}" name="Chuckle" loop="Y" totalframe="6" enable="Y" category="emotion" is_motion="N"/><action id="pt_at${fileExtention}" name="Point at" loop="Y" totalframe="30" enable="Y" is_motion="N"/><action id="laugh${fileExtention}" name="Laugh" loop="Y" totalframe="6" enable="Y" category="emotion" is_motion="N"/><action id="sad${fileExtention}" name="Sad" loop="Y" totalframe="60" enable="Y" category="emotion" is_motion="N"/><action id="blowkiss${fileExtention}" name="Blow kiss" loop="Y" totalframe="60" enable="Y" is_motion="N"/><action id="talk_phone${fileExtention}" name="Talk on phone" loop="Y" totalframe="115" enable="Y" is_motion="N"/><action id="talk_phone2${fileExtention}" name="Sit - Talk on phone" loop="Y" totalframe="115" enable="Y" is_motion="N"/><action id="dance${fileExtention}" name="Dance" loop="Y" totalframe="23" enable="Y" is_motion="N"/><action id="fearful${fileExtention}" name="Fearful" loop="Y" totalframe="60" enable="Y" category="emotion" is_motion="N"/><action id="talk${fileExtention}" name="Talk" loop="Y" totalframe="100" enable="Y" is_motion="N"/>`,
				rocky: ''
			};
			files = asset.list(data.userId, "char", 0, tId);
			if (parseInt(data.studio) <= 2012) {
				xmlString = `${header}<ugc id="ugc" name="ugc" more="0" moreChar="0">`;
				for (const file of files) {
					fatials[file.id] = fatials[file.id] || [];
					const data = new xmldoc.XmlDocument(fs.readFileSync(`./charStore/${file.themeId}/cc_theme.xml`));
					for (const info of data.children.filter(i => i.name == 'facial')) {
						for (const data of info.children.filter(i => i.name == 'selection')) {
							if (!fatials[file.id].find(i => i.id == info.attr.id) && search4fatials(tId, data.attr.type, info.attr.id.split("head_")[1])) {
								const inf = info.attr;
								inf.id = info.attr.id + ".xml";
								fatials[file.id].unshift(inf);
							}
						}
					}
					xmlString += `<char id="${file.id}" thumb="${file.id}.zip" name="${file.title || ""}" cc_theme_id="${
						file.themeId
					}" default="stand${fileExtention}" motion="walk${fileExtention}" enable="Y" copyable="Y" isCC="Y" locked="N" facing="left" published="0"><tags>${file.tags || ""}</tags>${
						actions[await char.getCharType(file.id)]
					}${fatials[file.id].map(v => `<facial id="${v.id}" name="${v.name}" enable="${v.enable}"/>`).join("")}${data.studio == "20110" ? motionszip : motionsxml}</char>`;
				}
				xmlString += `</ugc>`;
			}
			break;
		} default: {
			files = asset.list(data.userId, data.type);
			break;
		}
	}
	if (!xmlString) xmlString = `${header}<ugc more="0">${files.map(asset.meta2Xml).join("")}</ugc>`;
	if (makeZip) {
		const zip = nodezip.create();
		fUtil.addToZip(zip, "desc.xml", Buffer.from(xmlString));
		console.log(data);
		for (const file of files) {
			switch (file.type) {
				case "bg": {
					const buffer = asset.load(file.id);
					fUtil.addToZip(zip, `bg/${file.id}`, buffer);
					break;
				} case "char": {
					const buffer = await char.loadThumb(file.id);
					fUtil.addToZip(zip, `char/${file.id}/${file.id}.png`, buffer);
					break;
				}
			}
		}
		return await zip.zip();
	} else return Buffer.from(xmlString);
}
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	var makeZip = false;
	switch (url.pathname) {
		case "/goapi/getUserAssets/":
			makeZip = true;
			break;
		case "/goapi/getUserAssetsXml/":
			break;
		default:
			return;
	}

	switch (req.method) {
		case "GET": {
			var q = url.query;
			if (q.userId && q.type) {
				listAssets(q, makeZip).then((buff) => {
					const type = makeZip ? "application/zip" : "text/xml";
					res.setHeader("Content-Type", type);
					res.end(buff);
				});
				return true;
			} else return;
		}
		case "POST": {
			loadPost(req, res).then(async data => {
				if (data.movieId && data.movieId.startsWith("ft-") && data.type == "sound") res.end(1 + '<error><code>Because you are using a video that has been imported from FlashThemes, you cannot use your sounds in this video at the moment as this video is right now using the FlashThemes servers to get all of the assets provided in this video. Please save your video as a normal one in order to get some LVM features back.</code></error>');
				else {
					const buff = await listAssets(data, makeZip);
					const type = makeZip ? "application/zip" : "text/xml";
					res.setHeader("Content-Type", type);
					if (makeZip) {
						if (!data.studio) res.write(base);
						else return res.end(Buffer.concat([base2, buff]));
					}
					res.end(buff);
				}
			});
			return true;
		}
		default:
			return;
	}
};