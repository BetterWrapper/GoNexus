const fs = require("fs");
const env = Object.assign(process.env, JSON.parse(fs.readFileSync("./env.json")), JSON.parse(fs.readFileSync("./config.json")));
const apiKeys = {
	FreeConvert: env.API_KEYS.FreeConvert,
	Typesense: env.API_KEYS.Typesense
}
const xmldoc = require("xmldoc");
const exec = require("child_process");
const JSZip = require("jszip");
const http = require("http");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const asset = require("./asset/main");
const fUtil = require("./misc/file");
const nodezip = require("node-zip");
const loadPost = require("./misc/post_body");
const https = require("https");
const usr = require("./static/user");
const chr = require("./character/redirect");
const pmc = require("./character/premade");
const chl = require("./character/load");
const chs = require("./character/save");
const cht = require("./character/thmb");
const chh = require("./character/head");
const mvu = require("./movie/upload");
const asu = require("./asset/upload");
const com = require("./asset/community");
const swf = require("./static/swf");
const qvm = require("./static/qvm");
const snd = require("./sound/save");
const sn1 = require("./sound/load/old");
const sn2 = require("./sound/load/2010");
const str = require("./starter/save");
const stl = require("./static/load");
const tmp = require("./static/tmp");
const pre = require("./static/preview");
const stp = require("./static/page");
const asl = require("./asset/load");
const asL = require("./asset/list");
const ast = require("./asset/thmb");
const mvl = require("./movie/load");
const mvL = require("./movie/list");
const mvm = require("./movie/meta");
const mvs = require("./movie/save");
const mvt = require("./movie/thmb");
const ebd = require("./movie/embed");
const thl = require("./theme/load");
const tsv = require("./tts/voices");
const tsl = require("./tts/load");
const lcl = require("./tts/local");
const fme = require("./static/frames");
const pse = require("./movie/parse");
const sdb = require("./school/db");
const slg = require("./school/login");
const gsd = require("./school/getting_started");
const url = require("url");
const path = require("path");
const discord = require("discord.js");
const formidable = require("formidable");
const session = require("./misc/session");
const functions = [
	lcl,
	mvL,
	sn1, 
	sn2,
	qvm, 
	tmp, 
	ebd, 
	pre, 
	snd, 
	fme, 
	str, 
	swf, 
	tsl, 
	pmc, 
	asl, 
	chl, 
	chh, 
	thl, 
	chs, 
	cht, 
	asL, 
	chr, 
	ast, 
	mvm, 
	mvl, 
	mvs, 
	mvt, 
	tsv, 
	asu,
	mvu, 
	stp, 
	stl,
	sdb,
	slg,
	gsd,
	com,
	usr
];
function stream2Buffer(readStream) {
	return new Promise((res, rej) => {
		let buffers = [];
		readStream.on("data", (c) => buffers.push(c));
		readStream.on("end", () => res(Buffer.concat(buffers)));
	});
}
const {
	getBuffersOnline
} = require("./movie/main");
const { stdout, stderr } = require("process");
let json = {};
http
	.createServer(async (req, res) => {
		try {
			function checkFtAcc(data) {
				https.request({
					hostname: "flashthemes.net",
					path: "/ajax/doLogin",
					method: "POST",
					headers: { 
						"Content-Type": "application/json"
					}
				}, r => {
					if (session.set(res, {
						flashThemesLogin: Buffer.from(r.headers['set-cookie'][1]).toString("base64")
					})) {
						const buffers = [];
						r.on("data", b => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers).toString("utf8")));
					}
				}).end(JSON.stringify(data));
			}
			if (!fs.existsSync('./_ASSETS')) fs.mkdirSync('./_ASSETS');
			if (!fs.existsSync('./_ASSETS/users.json')) fs.writeFileSync('./_ASSETS/users.json', JSON.stringify({
				users: []
			}, null, "\t"));
			if (!fs.existsSync(env.SAVED_FOLDER)) fs.mkdirSync(env.SAVED_FOLDER);
			const parsedUrl = url.parse(req.url, true);
			function missingFilesError() {
				return res.end(JSON.stringify({
					success: false,
					error: "One of the files is missing from your zip file. please upload a zip file with all of the files in tact."
				}));
			}
			function sameFilesError() {
				return res.end(JSON.stringify({
					success: false,
					error: "Some of your files have ids that are already in this server. please upload a different zip file that contains the profile.json file and files with different ids."
				}));
			}
			// pages
			switch (req.method) {
				case "GET": {
					switch (parsedUrl.pathname) {
						case "/api/getTemplateFiles": {
							const zip = nodezip.create();
							const path = `./static/qvm/templates/${parsedUrl.query.theme}`;
							fs.readdirSync(path).forEach(file => {
								const stats = fs.lstatSync(`${path}/${file}`);
								if (stats.isDirectory()) {
									fs.readdirSync(`${path}/${file}`).forEach(folder => {
										if (fs.existsSync(`${path}/${file}/${folder}`)) {
											const stats = fs.lstatSync(`${path}/${file}/${folder}`);
											if (stats.isDirectory()) {
												fs.readdirSync(`${path}/${file}/${folder}`).forEach(file2 => {
													fUtil.addToZip(zip, `${file}/${folder}/${file2}`, fs.readFileSync(`${path}/${
														file
													}/${folder}/${file2}`));
												});
											} else fUtil.addToZip(zip, `${file}/${folder}`, fs.readFileSync(`${path}/${file}/${folder}`));
										}
									});
								} else fUtil.addToZip(zip, file, fs.readFileSync(`${path}/${file}`));
							});
							res.setHeader("Content-Type", "application/zip");
							zip.zip().then(i => res.end(i));
							break;
						} case "/api/serveLVMViaURL": {
							if (parsedUrl.query.i.endsWith(".mo")) res.setHeader("Content-Type", "application/x-gettext-translation; charset=UTF-8")
							else if (parsedUrl.query.i.endsWith(".swf")) res.setHeader("Content-Type", "application/vnd.adobe.flash.movie");
							https.get(parsedUrl.query.i, r => {
								const buffers = []
								r.on("data", b => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers)))
							})
							break;
						} case "/api/getTTSVoices": { // gets all of the TTS Voices
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(JSON.parse(fs.readFileSync('./tts/info.json'))));
							break;
						} case "/api/getTemplates": {
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(JSON.parse(fs.readFileSync('./templates.json'))));
							break;
						} case "/api/themes/get": { // list's all themes from the themelist.xml file
							const themes = pse.getThemes(parsedUrl.query);
							res.setHeader("Content-Type", parsedUrl.query.get_theme_xml ? "text/xml" : "application/json");
							res.end(parsedUrl.query.get_theme_xml ? themes : JSON.stringify(themes));
							break;
						} case "/api/theme/get": {
							const themes = pse.getThemes({
								get_theme_xml: true,
								value: parsedUrl.query.tId
							});
							const json = new xmldoc.XmlDocument(themes);
							res.end(JSON.stringify(json.children.filter(i => i.name == parsedUrl.query.tag)));
							break;
						} case "/api/convertUrlQuery2JSON": { // idk
							try {
								res.setHeader("Content-Type", "application/json");
								res.end(JSON.stringify(parsedUrl.query));
							} catch (e) {
								console.log(e);
							}
							break;
						} case "/api/postDiscordLogin": {
							if (!parsedUrl.query.code) res.end("Login Error: Code Not Found");
							const discord = {
								baseurl: {
									domain: 'discordapp.com',
									path: '/api'
								},
								client: {
									id: '1249730227513458759',
									secret: 'sWuiEMfp80A2Zowbt0CP2sXjTK--Bdxk'
								},
								tokenGrantParams: {
									grant_type: 'authorization_code',
									code: parsedUrl.query.code,
									redirect_uri: `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}${
										parsedUrl.pathname
									}`
								}
							};
							const creds = Buffer.from(Object.keys(discord.client).map(v => discord.client[v]).join(":")).toString("base64");
							https.request({
								hostname: discord.baseurl.domain,
								path: `${discord.baseurl.path}/oauth2/token`,
								method: "POST",
								headers: {
									Authorization: `Basic ${creds}`,
									'Content-Type': 'application/json'
								}
							}, r => {
								const buffers = [];
								r.on("data", b => buffers.push(b)).on("end", () => {
									console.log(Buffer.concat(buffers).toString())
								})
							}).end(JSON.stringify(discord.tokenGrantParams));
						} default: break;
					}
					break;
				} case "POST": {
					switch (parsedUrl.pathname) {
						case "/api/templateStuff/get": {
							fs.readFile(`./_TEMPLATES/${parsedUrl.query.filename}`, (err, data) => {
								if (err) res.end(JSON.stringify(err));
								else {
									if (parsedUrl.query.header) {
										const split = parsedUrl.query.header.split(",");
										res.setHeader(split[0], split[1]);
									}
									res.end(data);
								}
							})
							break;
						} case "/api/localDatabase/get": {
							res.setHeader("Content-Type", "application/json");
							res.end(fs.readFileSync("./_ASSETS/local.json"));
							break;
						} case "/api/group/join": {
							loadPost(req, res).then(data => {
								const queryData = Object.fromEntries(new URLSearchParams(parsedUrl.query));
								if (!queryData.groupCode) return res.end("1You need to enter a group code.");
								const users = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								const adminInfo = users.users.find(i => i.id == data.admin);
								const schoolUserInfo = adminInfo.school[data.role + 's'].find(i => i.id == data.id);
								function finalizeGroup(info) {
									fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(users, null, "\t"));
									res.end(`0You have successfully joined a group called ${info.name}!`);
								}
								function check4validgroupcode(callback) {
									for (const groupInfo of adminInfo.school.groups) {
										const hasedGroupInfo = CryptoJS.AES.decrypt(groupInfo.pass, 'Secret Passphrase');
										const groupCode = hasedGroupInfo.toString(CryptoJS.enc.Utf8)
										if (queryData.groupCode == groupCode) callback(groupInfo);
									}
								}
								switch (data.role) {
									case "teacher": {
										if (schoolUserInfo.group) return res.end("1You are already in a group.");
										check4validgroupcode(function(groupInfo) {
											schoolUserInfo.group = groupInfo.id;
											return finalizeGroup(groupInfo);
										});
										break;
									} case "student": {
										check4validgroupcode(function(groupInfo) {
											schoolUserInfo.groups.push(groupInfo.id);
											return finalizeGroup(groupInfo);
										});
										break;
									}
								}
								res.end('1You have entered an invalid group code.');
							})
							break;
						} case "/api/CryptoJS/AES/decrypt": {
							loadPost(req, res).then(data => {
								const hashedData = CryptoJS.AES.decrypt(data.text, data.word);
								res.end(hashedData.toString(CryptoJS.enc.Utf8));
							});
							break;
						} case "/api/school/login": {
							loadPost(req, res).then(data => {
								try {
									for (const userInfo of JSON.parse(
										fs.readFileSync('./_ASSETS/users.json')
									).users) {
										if (userInfo.school && userInfo.school.id == parsedUrl.query.id) {
											const infofromloginname = userInfo.school[data.role + 's'].find(i => i.name == data.username);
											if (!infofromloginname) res.end(
												JSON.stringify({
													error: 'You have an invalid login name. please try again.'
												})
											);
											else {
												const hashedPass = CryptoJS.AES.decrypt(infofromloginname.pass, "Secret Passphrase");
												const originalPass = hashedPass.toString(CryptoJS.enc.Utf8);
												if (data.password != originalPass) res.end(
													JSON.stringify({
														error: 'You have an invalid password. please try again.'
													})
												);
												else {
													infofromloginname.role = data.role;
													res.end(JSON.stringify({
														cookie: {
															name: 'u_info_school',
															value: CryptoJS.AES.encrypt(JSON.stringify(infofromloginname), 'User Info 4 School').toString()
														},
														redirect: '/dashboard'
													}))
												}
											}
										}
									}
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										error: 'An unknown error occured.'
									}));
								}
							});
							break;
						} case "/api/school/create": {
							loadPost(req, res).then(data => {
								res.setHeader("Content-Type", "text/plain");
								try {
									const userData = JSON.parse(data.user);
									const users = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								    const userInfo = users.users.find(i => i.id == userData.uid);
								    const formData = Object.fromEntries(new URLSearchParams(data.formdata));
								    if (!userInfo.school) {
									    userInfo.school = {
											id: crypto.randomBytes(7).toString("hex"),
										    name: formData.school_name,
										    groups: [],
										    students: [],
										    teachers: [],
											admin: userData.uid
										};
									    fs.writeFileSync(
											`./_ASSETS/users.json`, JSON.stringify(users, null, "\t")
										);
										res.end("0School " + userInfo.school.id + " was successfully created.")
									} else res.end("1You already have a school created in your account.");
								} catch (e) {
									console.log(e);
									res.end(`1The School you were trying to create could not be created due to an unknown error.`);
								}
							})
							break;
						} case "/api/school/modify": {
							loadPost(req, res).then(data => {
								res.setHeader("Content-Type", "text/plain");
								try {
									const userData = JSON.parse(data.user);
									const users = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								    const userInfo = users.users.find(i => i.id == userData.uid);
								    const formData = Object.fromEntries(new URLSearchParams(data.formdata));
								    if (!userInfo.school) res.end(
										"1You cannot modify a school that isn't created in your account."
									);
									else for (var i in formData) userInfo.school[i] = formData[i]
									fs.writeFileSync(
										`./_ASSETS/users.json`, JSON.stringify(users, null, "\t")
									);
									res.end("0School " + userInfo.school.id + " was successfully modified.")
								} catch (e) {
									console.log(e);
									res.end(`1School ${
										userInfo.school.id
									} could not be modified because an unknown error occured.`);
								}
							})
							break;
						} case "/api/school/delete": {
							loadPost(req, res).then(data => {
								res.setHeader("Content-Type", "text/plain");
								try {
									const userData = JSON.parse(data.user);
									const users = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								    const userInfo = users.users.find(i => i.id == userData.uid);
									const schoolId = userInfo.school ? userInfo.school.id : '';
								    if (!userInfo.school) res.end(
										"1You cannot delete a school that isn't created in your account."
									);
									else delete userInfo.school;
									fs.writeFileSync(
										`./_ASSETS/users.json`, JSON.stringify(users, null, "\t")
									);
									res.end("0School " + schoolId + " was successfully deleted.")
								} catch (e) {
									console.log(e);
									res.end(`1School ${
										schoolId
									} could not be deleted because an unknown error occured.`);
								}
							})
							break;
						} case "/api/school/get": {
							loadPost(req, res).then(data => {
								const users = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								const userInfo = users.users.find(i => i.id == (data.admin || data.uid || data.id));
								res.setHeader("Content-Type", "application/json");
								if (userInfo && userInfo.school) res.end(JSON.stringify(userInfo.school));
								else res.end(JSON.stringify({}));
							});
							break;
						} case "/api/getNewMovieId": {
							res.setHeader("Content-Type", "text/plain");
							res.end(`m-${fUtil.getNextFileId("movie-", ".xml")}`);
							break;
						} case "/api/deleteParamInfo": {
							loadPost(req, res).then(data => {
								res.setHeader("Content-Type", "application/json");
								const options = [];
								for (const type of data.types.split("_")) options.unshift({
									hostname: data.apiHost,
									path: `${data.apiPath}/api/deleteParamInfo?type=${type}`,
									method: data.method,
									headers: {
										"Content-Type": "application/json"
									}
								});
								function deleteParamInfo(r) {
									const buffers = [];
									r.on("data", b => buffers.push(b)).on("end", () => setTimeout(() => res.end(Buffer.concat(buffers)), 5000));
								}
								if (data.protocall) switch (data.protocall) {
									case "http": {
										for (const option of options) http.request(option, deleteParamInfo).end();
										break;
									} case "https": {
										for (const option of options) https.request(option, deleteParamInfo).end();
										break;
									}
								}
							});
							break;
						} case "/api/lvmVarsStatus": {
							res.setHeader("Content-Type", "application/json");
							const options = {
								hostname: parsedUrl.query.apiHost,
								path: parsedUrl.query.apiPath + "/api/varStatus",
								method: parsedUrl.query.method,
								headers: {
									"Content-Type": "application/json"
								}
							};
							function checkLVMVarStatus(r) {
								const buffers = [];
								r.on("data", b => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers)));
							}
							if (parsedUrl.query.protocall) switch (parsedUrl.query.protocall) {
								case "http": {
									http.request(options, checkLVMVarStatus).end();
									break;
								} case "https": {
									https.request(options, checkLVMVarStatus).end();
									break;
								}
							}
							break;
						} case "/api/sendParamInfo2Server": {
							loadPost(req, res).then(data => {
								function successfullDataSend() {
									console.log(`SUCCESSFULLY SENT THE DATA TO ${parsedUrl.query.protocall.toUpperCase()}://${parsedUrl.query.apiHost.toUpperCase()}${
										parsedUrl.query.apiPath.toUpperCase()
									} USING THE ${parsedUrl.query.method.toUpperCase()} METHOD!!`);
									res.end();
								}
								const options = {
									hostname: parsedUrl.query.apiHost,
									path: parsedUrl.query.apiPath + `/api/getParamInfoFromServer?type=${parsedUrl.query.type}`,
									method: parsedUrl.query.method,
									headers: {
										"Content-Type": "application/json"
									}
								}
								if (parsedUrl.query.protocall) switch (parsedUrl.query.protocall) {
									case "http": {
										http.request(options, successfullDataSend).end(JSON.stringify(data));
										break;
									} case "https": {
										https.request(options, successfullDataSend).end(JSON.stringify(data));
										break;
									}
								}
							});
							break;
						} case "/api/getAllFTUserFeeds": {
							res.setHeader("Content-Type", "text/html; charset=UTF-8");
							console.log(parsedUrl.query);
							if (parsedUrl.query.page) {
								let page = parsedUrl.query.page;
								const currentSession = session.get(req);
								console.log(currentSession);
								if (
									currentSession 
									&& currentSession.data 
									&& currentSession.data.loggedIn
									&& currentSession.data.flashThemesLogin 
									&& currentSession.data.current_uid
								) {
									const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(
										i => i.id == currentSession.data.current_uid
									);
									if (userInfo && userInfo.isFTAcc) {
										async function getAllFTUserFeeds(count) {
											console.log(count);
											return (await getBuffersOnline({
												hostname: "flashthemes.net",
												path: `/ajax/getUserFeed/idols/owner/10/${count}/all/0`,
												headers: {
													cookie: Buffer.from(currentSession.data.flashThemesLogin, "base64")
												}
											})).toString("utf8").split("}")[1];
										}
										let html = await getAllFTUserFeeds(page);
										while (!html.includes('There are no activities')) html += await getAllFTUserFeeds(page++);
										res.end(html);
									}
								}
							}
							break;
						} case "/api/getFTUserFeeds": {
							res.setHeader("Content-Type", "text/html; charset=UTF-8");
							if (parsedUrl.query.page) {
								const currentSession = session.get(req);
								console.log(currentSession);
								if (
									currentSession 
									&& currentSession.data 
									&& currentSession.data.loggedIn
									&& currentSession.data.flashThemesLogin 
									&& currentSession.data.current_uid
								) {
									const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == currentSession.data.current_uid);
									if (userInfo && userInfo.isFTAcc) res.end((await getBuffersOnline({
										hostname: "flashthemes.net",
										path: `/ajax/getUserFeed/idols/owner/10/${parsedUrl.query.page}/all/0`,
										headers: {
											cookie: Buffer.from(currentSession.data?.flashThemesLogin || "iufhvsbuif", "base64")
										}
									})).toString("utf8"));
								} else res.end('Please login to GoNexus with your FlashThemes account in order to see your FlashThemes user feed');
							}
							break;
						} case "/api/formApplication/submit": {
							loadPost(req, res).then(data => {
								const roleTitles = {
									tester: "Beta Tester",
									developer: "Project Developer"
								};
								const fields = [
									{
										name: "Name",
										value: data.user_name
									},
									{
										name: "Discord Username",
										value: data.user_discordUsername,
									},
									{
										name: "Date Of Birth",
										value: data.user_dob,
									},
									{
										name: "Country",
										value: data.user_country,
									},
									{
										name: "Role",
										value: roleTitles[data.user_role],
									},
									{
										name: `Does ${data.user_name} Know How To Use DevTools?`,
										value: data.user_devToolsUsage,
									}
								]
								switch (data.user_role) {
									case "tester": {
										const array = [
											{
												name: `Role Experience`,
												value: data.tester_experience,
											},
											{
												name: `What ${data.user_name} Will Do With His Role`,
												value: data.tester_plan,
											}
										];
										if (data.tester_formQuestions) array.unshift({
											name: `${data.user_name}'s Application Question`,
											value: data.tester_formQuestions
										});
										for (const stuff of array) fields.unshift(stuff);
										break;
									} case "developer": {
										const array = [
											{
												name: `Does ${data.user_name} Know How A Server Computer Works?`,
												value: data.developer_serverComputerKnowledge,
											},
											{
												name: `Does ${data.user_name} Know How Computer Coding Works?`,
												value: data.developer_codingKnowledge,
											},
											{
												name: `Does ${data.user_name} Know How Localhost Works?`,
												value: data.developer_localhostKnowledge,
											},
											{
												name: `Coding languages that ${data.user_name} knows`,
												value: data.developer_codingLanguageKnowledge,
											},
											{
												name: `The side that ${data.user_name} plans to code on in GoNexus`,
												value: data.developer_coderType,
											}
										];
										if (data.developer_formQuestions) array.unshift({
											name: `${data.user_name}'s Application Question`,
											value: data.developer_formQuestions
										});
										for (const stuff of array) fields.unshift(stuff);
										break;
									}
								}
								const rest = new discord.REST({
									version: process.env.DISCORD_API_VERSION
								}).setToken(process.env.DISCORD_BOT_TOKEN);
								if (data.fieldsMissing == undefined) rest.post(discord.Routes.channelMessages("1276358369304776767"), {
									body: {
										content: `Hello @everyone, a user named ${
											data.user_name
										} has posted their form application for GoNexus. below is the application info:`,
										tts: false,
										embeds: [
											{
												title: `${data.user_name}'s Application`,
												description: `This is an Application by ${data.user_name} that is ready for review. 
												After you review the application, you may choose to either approve or reject this application.
												In order to tell ${data.user_name} that you approve or reject this application,
												you are required to DM the discord username that ${
													data.user_name
												} has provided which is ${data.user_discordUsername}. 
												Just in case you need to know what the site access key is, it's ${
													process.env.PROJECT_ACCESS_KEY
												}.`,
												fields: fields.reverse()
											}
										],
										allowed_mentions: {
											parse: ["everyone"]
										}
									}
								}).then(json => {
									console.log(json);
									res.end(
										`0Your application was successfully sent to the GoNexus staff members. 
										One of our staff members should DM you about your application being approved or rejected pretty soon.
										In the meantime, why don't you head back to the <a href="/">
											homepage
										</a> and wait to see what happens with us on discord.`
									);
								}).catch(e => {
									console.log(e);
									res.end(1 + e.toString());
								})
								else res.end("1You need to fill in some missing fields");
							})
							break;
						} case "/api/getUserSWFFiles": {
							res.setHeader("Content-Type", "application/json");
							const userData = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(
								i => i.id == parsedUrl.query.userId
							);
							const table = [];
							if (userData && userData.assets) for (const assetInfo of userData.assets) {
								if (assetInfo.file.endsWith(".swf")) table.unshift({
									url: `${req.headers.origin}/assets/${assetInfo.id}`,
									id: assetInfo.id
								});
							}
							res.end(JSON.stringify(table));
							break;
						} case "/api/beginVideoConvertFromURL": { // URL to Video Converter
							loadPost(req, res).then(async data => {
								res.setHeader("Content-Type", "application/json");
								const params = new URLSearchParams(data.body);
								const data2 = Object.fromEntries(params);
								if (data.converting == 'true') {
									let d2url = data2.url;
									if (!d2url) return res.end(JSON.stringify({
										success: false,
										error: 'Please enter in a URL'
									}))
									if (json) json = {
										videoConvertedOn: data.for
									};
									switch (json.videoConvertedOn) {
										case "flashthemes": {
											json.videoConvertedOnTitle = "FlashThemes";
											const currentSession = session.get(req);
											if (!d2url.startsWith("https://flashthemes.net/movie/")) return res.end(JSON.stringify({
												success: false,
												error: 'Please enter in a valid FlashThemes Video URL'
											}))
											else if (d2url.includes("?id=")) {
												const urlStuff = url.parse(d2url, true);
												d2url = `${urlStuff.protocol}//${urlStuff.host}${urlStuff.pathname}${urlStuff.query.id}`;
											}
											const ftHeaders = {};
											if (currentSession.data?.flashThemesLogin) ftHeaders.cookie = Buffer.from(
												currentSession.data.flashThemesLogin, 'base64'
											);
											console.log(ftHeaders)
											const movieData = await getBuffersOnline({
												hostname: "flashthemes.net",
												path: d2url.split("flashthemes.net")[1],
												headers: Object.assign({ 
													"Content-type": "text/html; charset=UTF-8"
												}, ftHeaders)
											});
											const htmldata = movieData.toString();
											//console.log(htmldata);
											if (htmldata.includes("502 Bad Gateway")) {
												return res.end(JSON.stringify({
													success: false,
													error: "FlashThemes is currently having gateway issues right now. please check back later."
												}));
											}
											if (htmldata.includes("302 Found")) {
												if (htmldata.includes("https://flashthemes.net/maintenance/")) return res.end(JSON.stringify({
													success: false,
													error: "FlashThemes is currently undergoing maintenance right now. please check back later."
												}));
											}
											if (htmldata.includes(".flash({")) {
												const flashvars = JSON.parse(
													htmldata.split(".flash({")[1].split("flashvars: ")[1].split("});")[0].split("\\").join("")
												);
												for (const i in flashvars) json[i] = flashvars[i];
												if (json.movieDesc) json.movieDesc = decodeURIComponent(json.movieDesc);
												const plainText = await getBuffersOnline({
													hostname: "flashthemes.net",
													method: "POST",
													path: `/goapi/getMovie/?movieId=${flashvars.movieId}&userId=&ut=`,
													headers: Object.assign({ 
														"Content-type": "text/plain"
													}, ftHeaders)
												}, JSON.stringify({movieId: flashvars.movieId}));
												const fileUrl = plainText.toString();
												console.log(fileUrl);
												if (
													fileUrl.startsWith("Found. Redirecting to https://flashthemes.net/ajax/getMovieCache/") 
													&& fileUrl.endsWith(`-${flashvars.movieId}.zip`)
												) {
													json.movieZipUrl = fileUrl.split("Found. Redirecting to ")[1];
													json.videoTitle = decodeURIComponent(htmldata.split(
														`</h1><span class="views">`
													)[0].split("<h1>")[1].split("&#39;").join("'"));
													json.success = true;
													return res.end(JSON.stringify(json));
												}
											} else return res.end(JSON.stringify({
												success: false,
												error: htmldata.split('<div id="movie-unavailable-message">')[1].split("</div>")[0]
											}));
											break;
										}
									}
								} else if (json.movieZipUrl) {
									json.data = data2;
									switch (data2.videoType) {
										case "zip": {
											if (json.movieZipUrl.includes(".zip")) {
												const buffer = await getBuffersOnline(json.movieZipUrl)
												json.base64 = `data:@file/zip;base64,${buffer.toString("base64")}`
												json.fileExt = "zip";
												return res.end(JSON.stringify(json));
											}
											res.end(JSON.stringify({
												success: false,
												error: "Becuase of the requested videotype, the url needs to go to a zip file."
											}));
											break;
										} case "preview": {
											json.flashfata =  {
												swf: process.env.SWF_URL + "/player.swf",
												type: "application/x-shockwave-flash",
												width: "640",
												height: "360",
												flashvars: {
													apiserver: "/",
													storePath: process.env.STORE_URL + "/<store>",
													ut: 60,
													autostart: 1,
													isWide: 1,
													clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
													movieId: `url-${json.movieZipUrl}`
												},
												allowScriptAccess: "always",
												allowFullScreen: "true",
											};
											res.end(JSON.stringify(json));
											break;
										} case "import": {
											if (data.loggedIn && data.userParams) {
												const buffer = await getBuffersOnline(json.movieZipUrl)
												function movieMeta(desc, prefix) {
													return {
														desc,
														hiddenTag: "NAN",
														date: new Date().toDateString(),
														durationString: json.duration ? (() => {
															const min = ("" + ~~(json.duration / 60)).padStart(2, "0");
															const sec = ("" + ~~(json.duration % 60)).padStart(2, "0");
															return `${min}:${sec}`;
														})() : `<small style="color: red;">Could not retrieve movie duration</small>`,
														duration: json.duration || "NAN",
														title: json.videoTitle,
														published: 0,
														tags: "",
														publishStatus: "draft",
														id: `${prefix}-${json.movieId}`,
														enc_asset_id: json.movieId,
														type: "movie",
														file: `${json.movieId}.zip`,
														thumbUrl: `${json.apiserver}${json.thumbnailURL}`
													}
												}
												const params = new URLSearchParams(data.userParams);
												const userData = Object.fromEntries(params);
												const usersData = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
												const userInfo = usersData.users.find(i => i.id == (userData.uid || userData.id))
												function writeContent(folderName, prefix) {
													if (!fs.existsSync(folderName)) fs.mkdirSync(folderName);
													fs.writeFileSync(`${folderName}/${json.movieId}.zip`, buffer);
													fs.writeFileSync(`${asset.folder}/users.json`, JSON.stringify(usersData, null, "\t"));
													res.end(JSON.stringify({
														success: true,
														redirect: `/go_full?movieId=${prefix}-${json.movieId}`,
														data: data2
													}));
												}
												switch (json.videoConvertedOn) {
													case "flashthemes": {
														userInfo.movies.unshift(
															movieMeta(
																`${
																	json.movieDesc ? json.movieDesc + " In other words," : ''
																} This video has been imported from FlashThemes. 
																because of that, all of the assets and waveforms you see in the video will be
																fetched via the FlashThemes server causing some functions to not work correctly
																for this video in the LVM. 
																to fix this issue, please save this video normally.`, "ft"
															)
														);
														writeContent('./ftContent', 'ft');
														break;
													}
												}
											} else return res.end(JSON.stringify({
												success: false,
												error: `Please login to your account in order to import a ${
													json.videoConvertedOnTitle
												} converted video into GoNexus`
											}));
										}
									}
								} else res.end(JSON.stringify({
									success: false,
									error: "Please restart the converter in order to continue."
								}))
							});
							break;
						} case "/api/linkAccount": {
							loadPost(req, res).then(async data => {
								res.setHeader("Content-Type", "application/json");
								const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								const userInfo = json.users.find(i => i.id == data.uid);
								switch (data.type) {
									case "FlashThemes": {
										try {
										    userInfo.isFTAcc = true;
										    userInfo.base64 = Buffer.from(data.password).toString("base64");
										    userInfo.linkedFTAcc = true;
										    fs.writeFileSync(
												'./_ASSETS/users.json', 
												JSON.stringify(json, null, "\t")
											);
										    res.end(JSON.stringify({
												success: true
										    }));
										} catch (e) {
											console.log(e);
											res.end(JSON.stringify({
												success: false,
												error: e.toString()
											}));
										}
										break;		
									}
								}
							});
							break;
						} case "/api/deleteAccount": {
							loadPost(req, res).then(data => {
								res.setHeader("Content-Type", "application/json");
								const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								const userInfo = json.users.find(i => i.id == data.uid);
								const userInfoIndex = json.users.findIndex(i => i.id == data.uid);
								console.log(json, userInfoIndex);
								for (const assetInfo of userInfo.assets) try {
									asset.delete({
										id: assetInfo.id
									}, true);
								} catch (e) {
									console.log(e);
									return res.end(JSON.stringify({
										success: false,
										error: e.toString()
									}));
								}
								for (const movieInfo of userInfo.movies) try {
									const filepaths = [];
									if (movieInfo.id.includes("-")) {
										const prefix = movieInfo.id.substr(0, movieInfo.id.lastIndexOf("-"));
										const suffix = movieInfo.id.substr(movieInfo.id.lastIndexOf("-") + 1);
										switch (prefix) {
											case "m": {
												filepaths.push(fUtil.getFileIndex("movie-", ".xml", suffix));
												filepaths.push(fUtil.getFileIndex("thumb-", ".png", suffix));
												break;
											} default: {
												return res.end(JSON.stringify({
													success: false,
													error: `The prefix: ${prefix} does not exist in our database.`
												}))
											}
										}
									}
									for (const filepath of filepaths) fs.unlinkSync(filepath);
								} catch (e) {
									console.log(e);
									return res.end(JSON.stringify({
										success: false,
										error: e.toString()
									}));
								}
								json.users.splice(userInfoIndex, 1);
								fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
								res.end(JSON.stringify({
									success: session.remove(res, session.get(req)),
									error: "Your account was deleted successfully, but an error occured while removing your session."
								}));
							});
							break;
						} case "/api/updateCustomCSS": {
							loadPost(req, res).then(data => {
								res.setHeader("Content-Type", "application/json");
								try {
									const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
									const userInfo = json.users.find(i => i.id == data.uid);
									userInfo.settings.api.customcss = data.newcss;
									fs.writeFileSync("./_ASSETS/users.json", JSON.stringify(json, null, "\t"));
									res.end(JSON.stringify({
										success: true
									}));
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										error: e.toString()
									}));
								}
							});
							break;
						} case "/api/updateTTSApi": {
							loadPost(req, res).then(data => {
								res.setHeader("Content-Type", "application/json");
								try {
									const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
									const userInfo = json.users.find(i => i.id == data.uid);
									userInfo.settings.api.ttstype.value = data.newapi;
									userInfo.settings.api.ttstype.apiserver = data.newapiserver;
									fs.writeFileSync("./_ASSETS/users.json", JSON.stringify(json, null, "\t"));
									res.end(JSON.stringify({
										success: true
									}));
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										error: e.toString()
									}));
								}
							});
							break;
						} case "/api/checkEmail": {
							loadPost(req, res).then(data => {
								res.setHeader("Content-Type", "application/json");
								const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.filter(i => i.email == data.email);
								res.end(JSON.stringify({
									success: userInfo.length <= 1,
									error: `This email address already exists inside of GoNexus's database. 
									Please use a different email address`
								}));
							});
							break;
						}
						case "/api/removeSession": {
							loadPost(req, res).then(data => {
								if (session.remove(res, data)) res.end(JSON.stringify({
									success: true
								}));
							});
							break;
						} case "/api/getUserInfoFromSession": { // sends user info from the current session
							res.setHeader("Content-Type", "application/json");
							const currentSession = session.get(req);
							if (currentSession.data.loggedIn && currentSession.data.current_uid) {
								res.end(JSON.stringify(JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(
									i => i.id == currentSession.data.current_uid
								)));
							} else res.end(JSON.stringify({}));
							break;
						} case "/api/getUserInfoFromDB": {
							loadPost(req, res).then(data => res.end(
								JSON.stringify(JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == data.uid))
							));
							break;
						} case "/api/getSession": {
							res.end(JSON.stringify(session.get(req)));
							break;
						} case "/api/addFTAcc": { // add the flashthemes account to the server after all checks are complete.
							loadPost(req, res).then(async data => {
								res.setHeader("Content-Type", "application/json");
								if (data.uid) {
									const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == data.uid);
									if (userInfo.isFTAcc) res.end(JSON.stringify({
										success: true
									}));
								} else if (data.code == '0') try {
									const base64c = Buffer.from(data.password).toString("base64");
									function findUserInfo() {
										return new Promise((res, rej) => {
											const json = JSON.parse(fs.readFileSync(
												'./_ASSETS/users.json'
											));
											const info = {};
											const users = json.users.filter(i => i.isFTAcc == true);
											const userInfo = users.find(i => i.base64 == base64c);
											if (userInfo) {
												info.success = true;
												info.data = userInfo;
												info.info = "success";
											} else {
												info.success = false;
												info.error = "No FlashThemes Account Has Been Found In\
												The GoNexus DB! Creating DB...";
												info.info = "ft_acc_not_found";
											}
											res(info);
										});
									}
									const json = await findUserInfo();
									console.log(json);
									if (!json.success) {
										console.log(data.displayName, json.error);
										switch (json.info) {
											case "ft_acc_not_found": {
												if (!data.displayName) {
													res.end(JSON.stringify({
														displayNameRequired: true
													}));
												} else {
													const num = Math.floor(Math.random() * (28 - 7 + 1) + 1);
													const uid = crypto.randomBytes(num).toString('hex');
													const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
													const meta = json.users.find(i => i.email == data.email);
													if (meta && !meta.linkedFTAcc) {
														res.end(JSON.stringify({
															success: false,
															error: "Your email address has already been taken by someone who has created their account on GoNexus. If this is your email address and you are trying to link your flashthemes account to GoNexus, please contact one of our developers on the GoNexus Discord Server for some help."
														}))
													} else {
														json.users.unshift({
															name: data.displayName,
															isFTAcc: true,
															base64: base64c,
															id: uid,
															email: data.email,
															movies: [],
															assets: [],
															apiKeys: {
																Topmediaai: "",
																FreeConvert: ""
															},
															settings: {
																api: {
																	ttstype: {
																		apiserver: "https://lazypy.ro/",
																		value: "Acapela"
																	},
																	customcss: ""
																}
															}
														});
														fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
														if (session.set(res, {
															loggedIn: true,
															current_uid: uid,
															displayName: data.displayName,
															email: data.email
														})) {
															res.end(JSON.stringify({
																success: true
															}));
														}
													}
												};
												break;
											}
										}
									} else if (session.set(res, {
										loggedIn: true,
										current_uid: json.data.id,
										displayName: json.data.name,
										email: json.data.email
									})) {
										res.end(JSON.stringify({
											success: true
										}));
									}
								} catch (e) {
									console.log(e);
								}
							});
							break; // checks flashthemes's server to see if the account info the user entered in exists in their servers. if something went wrong, an error spits out.
						} case "/api/checkFTAcc": {
							loadPost(req, res).then(checkFtAcc);
							break;
						} case "/api/fixFlashThemesLoginCookie": {
							const currentSession = session.get(req);
							if (!currentSession.data?.flashThemesLogin) {
								const userInfo = JSON.parse(
									fs.readFileSync(`${asset.folder}/users.json`)
								).users.find(i => i.id == currentSession.data.current_uid);
								checkFtAcc({
									lc: "en_US",
									returnto: "/",
									email: userInfo.email,
									password: Buffer.from(userInfo.base64, "base64").toString()
								});
							} else res.end(1 + JSON.stringify({
								errmsg: "You already have an existing flashthemes session."
							}));
							break;
						} case "/api/checkFlashthemesLogin": {
							res.setHeader("Content-Type", "application/json");
							const currentSession = session.get(req);
							console.log(currentSession);
							res.end(JSON.stringify({
								loginExists: currentSession.data?.flashThemesLogin ? true : false
							}));
							break;
						} case "/api/submitAPIKeys": { // sends both the Topmediai and FreeConvert API Keys To The Server
							loadPost(req, res).then(data => {
								if (!data.uid) return res.end(JSON.stringify({
									success: false,
									message: "Please login to your account in order to submit both your Topmediai and FreeConvert API Keys"
								}));
								const usersJson = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								const userInfo = usersJson.users.find(i => i.id == data.uid);
								const API_KEYS = {
									topMediaAIKey: userInfo.apiKeys.Topmediaai || apiKeys.Topmediaai,
									freeConvertKey: userInfo.apiKeys.FreeConvert || apiKeys.FreeConvert
								};
								function submitFreeConvertKey(dontWrite = false) {
									return new Promise((res, rej) => {
										try {
											userInfo.apiKeys.FreeConvert = data.freeConvertKey;
											if (!dontWrite) fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(usersJson, null, "\t"));
											res();
										} catch (e) {
											rej(e);
										}
									});
								}
								function submitTopMediaAIKey(dontWrite = false) {
									return new Promise((res, rej) => {
										try {
											https.get({
												hostname: "api.topmediai.com",
												path: "/v1/get_api_key_info",
												headers: {
													accept: 'application/json',
													'x-api-key': data.topMediaAIKey
												}
											}, (r) => {
												const buffers = [];
												r.on("data", b => buffers.push(b)).on("end", () => {
													const json = JSON.parse(Buffer.concat(buffers));
													console.log(json);
													if (json.detail) {
														switch (typeof json.detail) {
															case "string": {
																switch (json.detail) {
																	case "x_api_key is invalid": return rej("Invaild API key for Topmediaai. Please enter a correct API key for Topmediaai.");
																}
																break;
															}
														}
													} else if (json.x_api_key && json.email) {
														if (json.email != userInfo.email) return rej("The api key you typed in for Topmediaai does not belong to you. Please enter in your own api key for Topmediaai.");
														userInfo.apiKeys.Topmediaai = json.x_api_key;
														if (!dontWrite) fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(usersJson, null, "\t"));
														res();
													}
												}).on("error", rej);
											}).on("error", rej);
										} catch (e) {
											rej(e);
										}
									})
								}
								if (API_KEYS.topMediaAIKey != data.topMediaAIKey) {
									submitTopMediaAIKey().then(() => {
										return res.end(JSON.stringify({
											success: true,
											message: "Your api key for Topmediaai has been sent in successfully!"
										}))
									}).catch(e => {
										console.log(e);
										return res.end(JSON.stringify({
											success: false,
											message: e
										}));
									});
								} else if (API_KEYS.freeConvertKey != data.freeConvertKey) {
									submitFreeConvertKey().then(() => {
										return res.end(JSON.stringify({
											success: true,
											message: "Your api key for freeConvert has been sent in successfully!"
										}))
									}).catch(e => {
										console.log(e);
										return res.end(JSON.stringify({
											success: false,
											message: e
										}));
									});
								}
								submitTopMediaAIKey(true).then(() => {
									submitFreeConvertKey(true).then(() => {
										console.log(userInfo);
										fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(usersJson, null, "\t"));
										res.end(JSON.stringify({
											success: true,
											message: "Both your freeConvert and Topmediaai API keys have been sent in successfully!"
										}))
									}).catch(e => {
										console.log(e);
										res.end(JSON.stringify({
											success: false,
											message: e.toString()
										}));
									});
								}).catch(e => {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										message: e.toString()
									}));
								});
							})
							break;
						} case "/api/fetchAPIKeys": { // fetches the API keys from the server
							const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == parsedUrl.query.uid);
							res.end(JSON.stringify({
								topMediaAIKey: userInfo ? (userInfo.apiKeys.Topmediaai || apiKeys.Topmediaai) : apiKeys.Topmediaai,
								freeConvertKey: userInfo ? (userInfo.apiKeys.FreeConvert || apiKeys.FreeConvert) : apiKeys.FreeConvert
							}));
							break;
						} case "/api/check4MovieAutosaves": { // checks to see if a movie is autosaved or not.
							loadPost(req, res).then(data => {
								console.log(data, fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", data.mId.substr(2))));
								res.end(JSON.stringify({
									isAutosaved: fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", data.mId.substr(2)))
								}));
							});
							break;
						} case "/api/uploadMyStuff": { // uploads a user profile to the server
							new formidable.IncomingForm().parse(req, async (e, f, files) => {
								if (e) {
									console.log(e);
									return res.end(JSON.stringify({
										success: false,
										error: e.toString()
									}));
								}
								console.log(f, files);
								if ((files.import.name || files.import.originalFilename).endsWith(".zip") && files.import.mimetype == "application/zip") try {
									const zip = nodezip.unzip(fs.readFileSync(files.import.path || files.import.filepath));
									console.log(zip);
									if (!zip['profile.json']) return res.end(JSON.stringify({
										success: false,
										error: "Your zip file must contain the profile.json file containing your stuff in it witch has been assigned to the profile.json file. please upload a different zip file."
									}));
									const fakeProfile = {
										name: "John Doe",
										id: "490369038276834906546354",
										email: "johndoecreates@goanimate.com",
										movies: [],
										assets: [],
										apiKeys: {
											Topmediaai: "775690357860759807389",
											FreeConvert: "9538673598094783458348540325739893478692085848745"
										},
										settings: {
											api: {
												ttstype: {
													apiserver: "https://lazypy.ro/",
													value: "Acapela"
												},
												customcss: ""
											}
										}
									}
									const json = JSON.parse(await stream2Buffer(zip['profile.json'].toReadStream()));
									console.log(json);
									for (const i in fakeProfile) if (!json[i]) return res.end(JSON.stringify({
										success: false,
										error: "Your profile.json file does not contain the fields like your name, id, email, movies, and assets. Please upload a different zip file."
									}));
									if (json.id != f.userId) res.end(JSON.stringify({
										success: false,
										error: "You cannot upload someone else's stuff to this server due to sercuity conserns. please upload your own stuff."
									}));
									else {
										const usersFile = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
										const meta = usersFile.users.find(i => i.id == json.id);
										for (let i = 0; i < json.assets.length; i++) {
											const assetInfo = json.assets[i];
											if (meta.assets[i] && meta.assets[i].id == assetInfo.id) return sameFilesError();
											meta.assets.unshift(assetInfo);
											if (assetInfo.id.startsWith("s-")) {
												if (!zip[assetInfo.id + '.xml'] || !zip[assetInfo.id + '.png']) return missingFilesError();
												fs.writeFileSync(fUtil.getFileIndex("starter-", ".xml", assetInfo.id.substr(2)), await stream2Buffer(zip[assetInfo.id + '.xml'].toReadStream()));
												fs.writeFileSync(fUtil.getFileIndex("starter-", ".png", assetInfo.id.substr(2)), await stream2Buffer(zip[assetInfo.id + '.png'].toReadStream()));
											} else {
												if (!zip[assetInfo.file]) return missingFilesError();
												fs.writeFileSync(`./_ASSETS/${assetInfo.file}`, await stream2Buffer(zip[assetInfo.file].toReadStream()));
											}
										}
										for (let i = 0; i < json.movies.length; i++) {
											const movieInfo = json.movies[i];
											if (meta.movies[i] && meta.movies[i].id == movieInfo.id) return sameFilesError();
											meta.movies.unshift(movieInfo);
											if (movieInfo.id.startsWith("m-")) {
												if (!zip[movieInfo.id + '.xml'] || !zip[movieInfo.id + '.png']) return missingFilesError();
												fs.writeFileSync(fUtil.getFileIndex("movie-", ".xml", movieInfo.id.substr(2)), await stream2Buffer(zip[movieInfo.id + '.xml'].toReadStream()));
												fs.writeFileSync(fUtil.getFileIndex("thumb-", ".png", movieInfo.id.substr(2)), await stream2Buffer(zip[movieInfo.id + '.png'].toReadStream()));
											}
										}
										fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(usersFile, null, "\t"));
										res.end(JSON.stringify({
											success: true,
											msg: "Your stuff has successfully been uploaded to the server. If you need to upload any more of your stuff to this server, feel free to do so."
										}));
									}
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										error: e.toString()
									}));
								}
								else res.end(JSON.stringify({
									success: false,
									error: "Invalid File Type"
								}));
							});
							break;
						} case "/api/fetchMyStuff": { // fetches the user profile from the server
							loadPost(req, res).then(async data => {
								try {
									const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == data.uid);
									const zip = new JSZip();
									zip.file('profile.json', JSON.stringify(userInfo, null, "\t"));
									for (const assetInfo of userInfo.assets) {
										if (assetInfo.id.startsWith("s-")) {
											zip.file(assetInfo.id + '.xml', fs.readFileSync(fUtil.getFileIndex(
												"starter-", ".xml", assetInfo.id.substr(2)
											)));
											zip.file(assetInfo.id + '.png', fs.readFileSync(fUtil.getFileIndex(
												"starter-", ".png", assetInfo.id.substr(2)
											)));
										} else zip.file(assetInfo.file, fs.readFileSync(`./_ASSETS/${assetInfo.file}`));
									}
									for (const movieInfo of userInfo.movies) {
										if (movieInfo.id.startsWith("m-")) {
											zip.file(movieInfo.id + '.xml', fs.readFileSync(fUtil.getFileIndex("movie-", ".xml", movieInfo.id.substr(2))));
											zip.file(movieInfo.id + '.png', fs.readFileSync(fUtil.getFileIndex("thumb-", ".png", movieInfo.id.substr(2))));
										}
									}
									fs.writeFileSync(`${env.CACHÉ_FOLDER}/myStuff.zip`, await zip.generateAsync({type: "string"}));
									res.end(JSON.stringify({
										success: true,
										fileUrl: '/tmp/myStuff.zip'
									}));
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										error: e.toString()
									}));
								}
							});
							break;
						} case "/api/getProjectDownloads": { // lists downloads for this project without the need to upload files. base64 will help just nicely.
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify({
								hasProjectDownloads: true,
								projectDownloads: [
									{
										downloadUrl: "https://github.com/josephanimate2021/Nexus/archive/refs/heads/main.zip",
										projectName: "Nexus Version 0.1.0"
									}
								]
							}));
							break;
						} case "/api/getAllUsers": { // fetches all users on this server
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users));
							break;
						} case "/api/submitSiteAccessKey": { // grants a user permision to the site
							loadPost(req, res).then(data => {
								if (!data.access_key) res.end(JSON.stringify({error: "Please enter in an access key."}));
								else if (data.access_key != env.PROJECT_ACCESS_KEY) res.end(JSON.stringify({error: "Invaild Access Key"}));
								else if (
									session.set(
										res, {
											site_access_key_is_correct: ''
										}
									)
								) {
									if (data.returnto) res.end(JSON.stringify({success: true, url: decodeURIComponent(data.returnto)}));
									else res.end(JSON.stringify({success: true}));
								}
							});
							break;
						} case "/api/redirect": { // idk
							res.statusCode = 302;
							res.setHeader("Location", "/");
							res.end();
							break;
						} case "/api/checkCurrentCustomCSS": {
							loadPost(req, res).then(data => {
								const info = {
									customcss: JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(
										i => i.id == data.uid
									).settings.api.customcss.split("&amp;").join("&").split("&#34;").join('"')
								}
								console.log(info)
								res.end(JSON.stringify({
									reload: info.customcss != data.current
								}));
							});
							break;
						} case "/api/check4SavedUserInfo": { // checks for some saved user info on the server
							loadPost(req, res).then(data => {
								try {
									const info = {
										name: true,
										id: true,
										email: true
									}
									const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
									const meta = json.users.find(i => i.id == data.uid);
									if (!meta) {
										const newUserInfo = {
											name: data.displayName,
											id: data.uid,
											admin: data.admin,
											email: data.email,
											role: data.role,
											movies: [],
											assets: [],
											apiKeys: {
												Topmediaai: "",
												FreeConvert: ""
											},
											gopoints: 0,
											settings: {
												api: {
													ttstype: {
														apiserver: "https://lazypy.ro/",
														value: "Acapela"
													},
													customcss: ""
												}
											}
										}
										if (data.role) delete newUserInfo.name;
										json.users.unshift(newUserInfo);
									} else {
										for (const stuff in data) {
											if (info[stuff]) {
												if (data[stuff] != meta[stuff]) {
													meta[stuff] = data[stuff];
												}
											}
										}
									}
									fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
									session.set(res, {
										current_uid: data.uid
									});
								} catch (e) {
									console.log(e);
								}
								res.end();
							})
							break;
						} default: break;
					}
					break;
				} default: break;
			}
			functions.find((f) => f(req, res, parsedUrl, apiKeys));
		} catch (x) {
			res.statusCode = 500;
			console.log(x);
			res.end(x.toString());
		}
		const date = new Date();
		const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
		console.log(time, req.method, req.url, '-', res.statusCode);
	}).listen(process.env.PORT || env.SERVER_PORT, '127.0.0.1', async () => {
		if (!fs.existsSync('./_CACHÉ')) fs.mkdirSync('./_CACHÉ');
		fs.readdirSync(env.CACHÉ_FOLDER).forEach(file => fs.unlinkSync(`${env.CACHÉ_FOLDER}/${file}`));
		console.log("GoNexus has started.");
	});
