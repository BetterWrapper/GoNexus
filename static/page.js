const fUtil = require("../misc/file");
const { getThemes } = require("../movie/parse");
const fs = require("fs");
const http = require("http");
const ejs = require('ejs');
const { existsSync } = require("fs");
const session = require("../misc/session");
function toAttrString(table) {
	return typeof table == "object"
		? Object.keys(table)
				.filter((key) => table[key] !== null)
				.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(table[key])}`)
				.join("&")
		: table.replace(/"/g, '\\"');
}
function toParamString(table) {
	return Object.keys(table)
		.map((key) => `<param name="${key}" value="${toAttrString(table[key])}">`)
		.join(" ");
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs)
		.map((key) => `${key}="${attrs[key].replace(/"/g, '\\"')}"`)
		.join(" ")}>${toParamString(params)}</object>`;
}
function fetchCharOrder(themeId, pathname) {
	const json = {};
	for (const themes of getThemes()) {
		if (themeId == themes.attr.cc_theme_id) {
			switch (pathname) {
				case "/cc": {
					json.html = `<li><a href="/cc_browser?themeId=${themeId}">${
						themes.attr.name
					} Characters</a></li><li class="active">Create a new character</li>`;
					break;
				} case "/cc_browser": {
					json.html = `<li class="active">${themes.attr.name} Characters</li>`;
					json.msg = `Browse characters already available in the ${
						themes.attr.name
					 } theme and use them as a starting point to create new custom characters.`;
					break;
				}
			}
		}
	}
	return json;
}
function retroFilename(filename, page_layout) {
	switch (page_layout) {
		case "2012": return filename + "_2012";
		case "2010": return filename + "_2010";
		default: return filename;
	}
}
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET") return;
	let uInfo = {};
	const query = url.query;
	const userSession = session.get(req);
	var attrs, params, title, filename, charOrder = '';
	if (
		userSession 
		&& userSession.data 
		&& userSession.data.current_uid
	) uInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == userSession.data.current_uid);
	if (
		req.headers.host == "localhost" 
		|| req.headers.host == `localhost:${process.env.SERVER_PORT}` 
		|| userSession && userSession.data && userSession.data.site_access_key_is_correct
	) switch (url.pathname) {
		case "/cc/embed": {
			title = "Character Creator";
			filename = 'app_embed';
			attrs = {
				data: (query.animationPath || process.env.SWF_URL) + "/cc.swf", // data: 'cc.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: "100%",
				height: "100%",
			};
			params = {
				type: "cc",
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					original_asset_id: query["id"] || null,
					themeId: "business",
					ut: 60,
					bs: "default",
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
				},
				allowScriptAccess: "always",
				movie: (query.animationPath || process.env.SWF_URL) + "/cc.swf", // 'http://localhost/cc.swf'
			};
			break;
		} case "/cc_browser/embed": {
			title = "CC Browser";
			filename = "app_embed"
			attrs = {
				data: (query.animationPath || process.env.SWF_URL) + "/cc_browser.swf", // data: 'cc_browser.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					original_asset_id: query["id"] || null,
					themeId: "family",
					ut: 60,
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
					lid: 13,
				},
				allowScriptAccess: "always",
				movie: (query.animationPath || process.env.SWF_URL) + "/cc_browser.swf", // 'http://localhost/cc_browser.swf'
			};
			break;
		} case "/cc": {
			title = "Character Creator";
			filename = "cc";
			charOrder = fetchCharOrder(url.query.themeId || "family", "/cc");
			attrs = {
				data: process.env.SWF_URL + "/cc.swf", // data: 'cc.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: "960",
				height: "600",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					themeId: "family",
					ut: 60,
					bs: "adam",
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
				},
				allowScriptAccess: "always",
				movie: process.env.SWF_URL + "/cc.swf", // 'http://localhost/cc.swf'
			};
			break;
		} case "/public_index": {
			filename = "index";
			break;
		} case "/getting_started": {
			filename = "getting_started";
			break;
		} case "/dashboard": {
			filename = "dashboard";
			break;
		}  case "/public_faq": {
			filename = "faq";
			break;
		} case "/account": {
			filename = "account";
			break;
		} case "/public_signup": {
			filename = "signup";
			break;
		} case "/forgotpassword": {
			filename = "forgotpassword";
			break;
		} case "/videos": {
			filename = "videos";
			break;
		} case "/create": {
			params = {
				themes: getThemes(),
				templates: JSON.parse(fs.readFileSync('./templates.json')),
				users: JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users
			}
			filename = retroFilename("create", query.page_layout);
			if (query.sort_by) filename = filename + `_${query.sort_by}`;
			break;
		} case "/studio": {
			params = {
				themes: getThemes(),
				templates: JSON.parse(fs.readFileSync('./templates.json')),
				users: JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users
			}
			filename = "create_2012";
			break;
		} case "/text2video": { // this url path will be for certain qvms like talkingpicz, ecards, etc.
			const quickvideoThemeids = {
				talkingpicz: true,
				"ecards-free": true,
				election: true
			};
			if (quickvideoThemeids[url.query.filename]) filename = url.query.filename;
			else return res.end('This theme has not been added to the server. Current Theme: ' + url.query.filename);
			break;
		} case "/quickvideo": {
			filename = "qvm";
			const template = JSON.parse(fs.readFileSync('./templates.json'))[url.query.theme];
			if (!template) return res.end('This theme has not been added to the server. Current Theme: ' + url.query.theme);
			params = {
				qvm: template,
				customCharInfo: new URLSearchParams(template.customChars_info).toString()
			}
			break;
		} case "/login": {
			filename = "login";
			break;
		} case "/templateManager": {
			filename = "templateManager";
			if (query.action) filename = filename + '_' + query.action
			break;
		} case "/movies": {
			filename = "list";
			break;
		} case "/cc_browser": {
			title = "CC Browser";
			filename = "cc";
			charOrder = fetchCharOrder(url.query.themeId || "family", "/cc_browser");
			attrs = {
				data: process.env.SWF_URL + "/cc_browser.swf", // data: 'cc_browser.swf',
				type: "application/x-shockwave-flash",
				id: "ccbrowser",
				width: "960",
				height: "1200",
			};
			params = {
				flashvars: {
					apiserver: req.headers.host + "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					themeId: "family",
					ut: 60,
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
					lid: 13,
				},
				allowScriptAccess: "always",
				movie: process.env.SWF_URL + "/cc_browser.swf", // 'http://localhost/cc_browser.swf'
			};
			break;
		} case "/go_full": {
			let presave = query.movieId && query.movieId.startsWith("m") ? query.movieId: `m-${fUtil.getNextFileId("movie-", ".xml")}`;
			const path = query.movieId ? query.movieId.startsWith("m-") ? fUtil.getFileIndex("movie-", ".xml", query.movieId.substr(query.movieId.lastIndexOf(
				"-"
			) + 1)) : query.movieId.startsWith("ft-") ? `./ftContent/${url.query.movieId.split("ft-")[1]}.zip` : "" : "";
			if (query.movieId && (url.query.movieId.startsWith("m-") || url.query.movieId.startsWith("ft-")) && !existsSync(path)) {
				res.statusCode = 302;
				res.setHeader("Location", "/");
				return res.end();
			}
			title = "Video Editor";
			filename = retroFilename("studio", query.page_layout);
			attrs = {
				data: query.swfPath ? query.swfPath : process.env.SWF_URL + "/go_full.swf",
				type: "application/x-shockwave-flash",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					presaveId: presave,
					v: query.year || '',
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					tray: query.theme || "custom",
					nextUrl: "/api/redirect",
					has_asset_char: 1,
					initcb: "studioLoaded",
					upl: 1,
					hb: 1,
					pts: 1,
					appCode: "go",
					uisa: 1,
					isLogin: "Y",
					tlang: "en_US",
					isEmbed: 1,
					isWide: 1,
					siteId: 11,
					lid: 11,
					ut: 20,
					apiserver: "/",
					newusr: 1
				},
				allowScriptAccess: "always",
			};
			break;
		} case "/player": {
			const path = url.query.movieId.startsWith("m-") ? fUtil.getFileIndex("movie-", ".xml", url.query.movieId.substr(
				url.query.movieId.lastIndexOf("-") + 1
			)) : url.query.movieId.startsWith(
				"ft-"
			) ? `./ftContent/${url.query.movieId.split("ft-")[1]}.zip` : "";
			if ((url.query.movieId.startsWith("m-") || url.query.movieId.startsWith("ft-")) && existsSync(path)) filename = "player";
			else {
				res.statusCode = 302;
				res.setHeader("Location", "/");
				return res.end();
			}
			title = "Player";
			params = {
				id: "Player",
				swf: process.env.SWF_URL + "/player.swf",
				height: 349,
				width: 620,
				bgcolor: "#000000",
				scale: "exactfit",
				allowScriptAccess: "always",
				allowFullScreen: "true",
				wmode: "opaque",
				hasVersion: "10.3",
				flashvars: {
					ut: 20,
					apiserver: "/",
					ctc: "school",
					tlang: "en_US",
					autostart: 1,
					appCode: "go",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					animationPath: process.env.SWF_URL + "/",
					isEmbed: 0,
					endStyle: 2,
					isWide: "1",
					initcb: "flashPlayerLoaded"
				},
			};
			break;
		} case "/public_movie": {
			const path = url.query.movieId.startsWith("m-") ? fUtil.getFileIndex("movie-", ".xml", url.query.movieId.substr(
				url.query.movieId.lastIndexOf("-") + 1
			)) : url.query.movieId.startsWith(
				"ft-"
			) ? `./ftContent/${url.query.movieId.split("ft-")[1]}.zip` : "";
			if ((url.query.movieId.startsWith("m-") || url.query.movieId.startsWith("ft-")) && existsSync(path)) filename = "lvp";
			else return redir()
			function redir() {
				res.statusCode = 302;
				res.setHeader("Location", "/");
				return res.end();
			}
			params = {
				id: "Player",
				swf: process.env.SWF_URL + "/player.swf",
				height: 349,
				width: 620,
				bgcolor: "#000000",
				scale: "exactfit",
				allowScriptAccess: "always",
				allowFullScreen: "true",
				wmode: "opaque",
				hasVersion: "10.3",
				flashvars: {
					ut: 20,
					apiserver: "/",
					ctc: "go",
					tlang: "en_US",
					autostart: 1,
					appCode: "go",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					animationPath: process.env.SWF_URL + "/",
					isEmbed: 0,
					endStyle: 2,
					movieLid: 11,
					themeColor: "school",
					initcb: "flashPlayerLoaded"
				},
			};
			for (const userInfo of JSON.parse(fs.readFileSync(`./_ASSETS/users.json`)).users) {
				const movieInfo = userInfo.movies.find(i => i.id == query.movieId);
				if (!movieInfo) continue;
				params.movieInfo = movieInfo;
				title = params.flashvars.movieTitle = params.movieInfo.title;
				params.flashvars.movieDesc = params.movieInfo.desc;
				params.flashvars.duration = params.movieInfo.duration;
				params.flashvars.isPublished = params.movieInfo.published;
				params.flashvars.is_private_shared = params.movieInfo.pshare;
				params.flashvars.isWide = params.movieInfo.isWide;
				params.flashvars.copyable = params.movieInfo.copyable;
				params.flashvars.movieOwner = userInfo.name;
				params.flashvars.movieOwnerId = userInfo.id;
			}
			if (params.flashvars.isPublished != 1 && params.flashvars.is_private_shared != 1) return redir();
			break;
		} case "/player/embed": {
			const path = url.query.movieId.startsWith("m-") ? fUtil.getFileIndex("movie-", ".xml", url.query.movieId.substr(
				url.query.movieId.lastIndexOf("-") + 1
			)) : url.query.movieId.startsWith(
				"ft-"
			) ? `./ftContent/${url.query.movieId.split("ft-")[1]}.zip` : "";
			if ((url.query.movieId.startsWith("m-") || url.query.movieId.startsWith("ft-")) && existsSync(path)) filename = "app_embed";
			else {
				res.statusCode = 302;
				res.setHeader("Location", "/");
				return res.end();
			}
			title = "Player";
			attrs = {
				data: process.env.SWF_URL + "/player.swf",
				type: "application/x-shockwave-flash",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					apiserver: "/",
					endStyle: 2,
					storePath: process.env.STORE_URL + "/<store>",
					ut: 20,
					autostart: 1,
					isWide: 1,
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
				},
				allowScriptAccess: "always",
				allowFullScreen: "true",
			};
			break;
		} default: return;
	} else switch (url.pathname) {
		default: {
			if (url.pathname != "/") {
				res.statusCode = 302;
				res.setHeader("Location", `/?returnto=${url.path}`);
				return res.end();
			}
			filename = "closed";
			break;
		}
	}
	Object.assign(params ? params.flashvars : {}, query);
	ejs.renderFile(`./views/${filename}.ejs`, {
		gopoints: uInfo.gopoints || 0,
		css: uInfo.settings ? `<style>${uInfo.settings.api.customcss}</style>` : '<script>checkIfSiteNeeds2ReloadAfterLogin()</script>',
		returnto: url.query.returnto,
		title,
		attrs,
		params,
		charOrder,
		flashvarsString: new URLSearchParams(params ? params.flashvars : {}).toString(),
		object: toObjectString,
		paramString: toParamString
	}, function(err, str){
		if (err) {
			console.log(err);
			res.end(err.toString());
		} else {
			res.setHeader("Content-Type", "text/html; charset=UTF-8");
			res.end(str);
		}
	});
	return true;
};
