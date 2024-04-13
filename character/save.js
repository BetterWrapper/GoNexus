const loadPost = require("../misc/post_body");
const character = require("./main");
const http = require("http");
const fs = require("fs");
const fUtil = require("../misc/file");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method == "POST") {
		switch (url.pathname) {
			case "/goapi/saveCCCharacterTemplate/": {
				loadPost(req, res).then(async data => {
					const userFile = JSON.parse(fs.readFileSync(`./_ASSETS/users.json`));
					const json = userFile.users.find(i => i.id == data.userId);
					json.gopoints -= 5;
					const id = await character.save(await character.load(data.assetId));
					json.assets.unshift({ 
						id,
						enc_asset_id: id,
						file: id + ".xml",
						type: "char",
						subtype: 0,
						title: "Untitled",
						published: 0,
						tags: "",
						themeId: character.getTheme(await character.load(data.assetId))
					});
					fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(userFile, null, "\t"));
					res.end(`0<points sharing="${json.gopoints}" money="0" asset_id="${info.id}"/>`);
				});
				break;
			} case "/goapi/saveCCCharacter/": {
				loadPost(req, res).then(async data => {
					const id = await character.save(data.body);
					if (parseInt(data.v || data.studio) <= 2013) {
						const info = {
							id,
							enc_asset_id: id,
							file: id + ".xml",
							type: "char",
							subtype: 0,
							title: data.title || "Untitled",
							published: 0,
							tags: "",
							themeId: character.getTheme(Buffer.from(data.body))
						}
						var head;
						if (data.imagedata) {
							info.head_url = `/char_heads/${id}.png`;
							head = Buffer.from(data.imagedata, "base64");
							character.saveHead(head, id);
						}
						const userFile = JSON.parse(fs.readFileSync(`./_ASSETS/users.json`));
						const json = userFile.users.find(i => i.id == data.userId);
						const stuff = data.studio && data.studio == "2010" ? (() => {
							json.gopoints -= 5;
							return `<points sharing="${json.gopoints}" money="0" asset_id="${id}"/>`;
						})() : id;
						console.log(stuff);
						json.assets.unshift(info);
						fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(userFile, null, "\t"));
						res.end(`0${stuff}`);
					} else {
						var thumb, head;
						const info = {
							id,
							enc_asset_id: id,
							file: id + ".xml",
							type: "char",
							subtype: 0,
							title: data.title || "Untitled",
							published: 0,
							tags: "",
							themeId: character.getTheme(Buffer.from(data.body))
						}
						if (data.thumbdata) {
							info.thumb_url = `/char_thumbs/${id}.png`;
							thumb = Buffer.from(data.thumbdata, "base64");
							character.saveThumb(thumb, id);
						}
						if (data.imagedata) {
							info.head_url = `/char_heads/${id}.png`;
							head = Buffer.from(data.imagedata, "base64");
							character.saveHead(head, id);
						}
						const userFile = JSON.parse(fs.readFileSync(`./_ASSETS/users.json`));
						const json = userFile.users.find(i => i.id == data.userId);
						json.assets.unshift(info);
						fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(userFile, null, "\t"));
						res.end(`0${id}`);
					}
				});
				break;
			} case "/goapi/saveCCThumbs/": {
				loadPost(req, res).then(data => {
					// fake a thumb save because we have no thumbdata
					res.end(`0${data.assetId}`);
				});
				break;
			} case "/ajax/saveCCCharacterTemplate": {
				loadPost(req, res).then(data => {
					const newId = fUtil.getNextFileId("char-", ".xml");
					if (!data.assetId.startsWith("c-")) {
						(
							[
								"xml",
								"thumb",
								"head"
							]
						).forEach(folder => {
							fs.readdirSync(`./premadeChars/${folder}`).forEach(file => {
								const buffer = fs.readFileSync(`./premadeChars/${folder}/${file}`);
								if (file.startsWith(data.assetId)) {
									switch (folder) {
										case "head": {
											fs.writeFileSync(fUtil.getFileIndex("head-", ".png", newId), buffer);
											break;
										} case "thumb": {
											fs.writeFileSync(fUtil.getFileIndex("char-", ".png", newId), buffer);
											break;
										} case "xml": {
											fs.writeFileSync(fUtil.getFileIndex("char-", ".xml", newId), buffer);
											break;
										}
									}
								}
							})
						});
						const users = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
						const userInfo = users.users.find(i => i.id == data.userId);
						userInfo.assets.unshift({
							id: `c-${newId}`,
							enc_asset_id: `c-${newId}`,
							file: `c-${newId}.xml`,
							head_url: `/char_heads/c-${newId}.png`,
							thumb_url: `/char_thumbs/c-${newId}.png`,
							type: "char",
							subtype: 0,
							title: "Untitled",
							published: 0,
							tags: "",
							themeId: data.themeId
						})
						fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(users, null, "\t"));
						res.end(JSON.stringify({
							code: 0
						}))
					} else res.end(JSON.stringify({
						code: 1,
						error: `Character ${data.assetId} already exists in the database.`
					}))
				})
				break;
			} default: return;
		}
	} else return;
};
