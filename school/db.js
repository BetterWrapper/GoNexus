// variables
const fs = require("fs");
const loadPost = require("../misc/post_body");
const CryptoJS = require("crypto-js");
// peform function
module.exports = (req, res, url) => {
    if ( // only peform this function when an api path below is being called.
        req.method != "POST" || (
            !url.pathname.startsWith("/api/schooldb")
        )
    ) return;
    loadPost(req, res).then(data => {
        try {
            const type = url.pathname.split("/")[3];
            const action = url.pathname.split("/")[4];
            const userData = JSON.parse(data.user);
            const formData = Object.fromEntries(new URLSearchParams(data.formdata));
            const users = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
            const userInfo = users.users.find(i => i.id == userData.uid || userData.id);
            var schoolUserInfo = userInfo.school;
            if (userInfo.role) {
                const adminInfo = users.users.find(i => i.id == userInfo.admin);
                schoolUserInfo = adminInfo.school[userInfo.role + 's'].find(i => i.id == userInfo.id);
                delete formData[userInfo.role + 's']
            }
            console.log(schoolUserInfo);
            if (schoolUserInfo) switch (action) {
                case "create": {
                    for (const i in formData) if (
                        formData[i] == '[]' 
                        || formData[i] == '{}'
                    ) formData[i] = JSON.parse(formData[i]);
                    if (formData.pass) formData.pass = CryptoJS.AES.encrypt(formData.pass, "Secret Passphrase").toString();
                    formData.id = data.id;
                    schoolUserInfo[type].unshift(formData);
                    fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(users, null, "\t"));
                    res.end(`0${type.slice(0, -1)} ${data.id} has been created successfully`);
                    break;
                } case "modify": {
                    break;
                } case "delete": {
                    break;
                } case "apply_permissions": {
                    break;
                }
            } else res.end("1No school info means you cannot do anything with GoNexus's School Database.");
        } catch (e) {
            console.log(e);
            res.end("1An unknown error occured");
        }
    });
    return true;
}