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
					json.html = `<li><a href="/cc_browser?themeId=${themeId}">${themes.attr.name} Characters</a></li><li class="active">Create a new character</li>`;
					break;
				} case "/cc_browser": {
					json.html = `<li class="active">${themes.attr.name} Characters</li>`;
					json.msg = `Browse characters already available in the ${themes.attr.name} theme and use them as a starting point to create new custom characters.`;
					break;
				}
			}
		}
	}
	return json;
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
				data: process.env.SWF_URL + "/cc.swf", // data: 'cc.swf',
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
				movie: process.env.SWF_URL + "/cc.swf", // 'http://localhost/cc.swf'
			};
			break;
		} case "/cc_browser/embed": {
			title = "CC Browser";
			filename = "app_embed"
			attrs = {
				data: process.env.SWF_URL + "/cc_browser.swf", // data: 'cc_browser.swf',
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
				movie: process.env.SWF_URL + "/cc_browser.swf", // 'http://localhost/cc_browser.swf'
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
			filename = "create";
			break;
		} case "/quickvideo": {
			const quickvideoThemeids = {
				everydaylife: true,
				basketball: true
			};
			if (quickvideoThemeids[url.query.filename]) filename = url.query.filename;
			else return res.end('This theme has not been added to the server. Current Theme: ' + url.query.filename);
			break;
		} case "/login": {
			filename = "login";
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
			filename = "studio";
			attrs = {
				data: query.swfPath ? query.swfPath : process.env.SWF_URL + "/go_full.swf",
				type: "application/x-shockwave-flash",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					presaveId: presave,
					v: query.year,
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					ut: 20,
					isEmbed: 0,
					nextUrl: "/api/redirect",
					lid: "11",
					ctc: "go",
					tlang: "en_US",
					siteId: "11",
					appCode: "go",
					upl: 1,
					hb: "1",
					pts: "1",
					has_asset_char: 1,
					initcb: "studioLoaded",
					uisa: 1,
					tray: query.theme || "custom",
					isWide: 1
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
					movieLid: "0",
					ut: "23",
					numContact: "",
					apiserver: "/",
					playcount: 1,
					ctc: "go",
					tlang: "en_US",
					autostart: "0",
					appCode: "go",
					is_slideshow: "0",
					originalId: "0Y7-ebJ36Ip4",
					is_emessage: "0",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					animationPath: process.env.SWF_URL + "/",
					isEmbed: !url.query.isEmbed ? "0" : "1",
					refuser: null,
					utm_source: null,
					uid: null,
					isTemplate: "0",
					showButtons: "1",
					chain_mids: "",
					averageRating: 5,
					ratingCount: "1",
					fb_app_url: "/",
					ad: 1,
					endStyle: 0,
					isWide: "1",
					pwm: 1,
					initcb: "flashPlayerLoaded",
					showshare: false
				},
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
