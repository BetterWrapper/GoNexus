// variables
const fs = require("fs");
const loadPost = require("../misc/post_body");
const crypto = require("crypto");
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
            if (formData.id) delete formData.id;
            if (userInfo.role) {
                const adminInfo = users.users.find(i => i.id == userInfo.admin);
                schoolUserInfo = adminInfo.school[userInfo.role + 's'].find(i => i.id == userInfo.id);
                delete formData[userInfo.role + 's']
            }
            if (schoolUserInfo) switch (action) {
                case "create": {
                    if (!formData.name) return res.end(`1You need to insert a ${type.slice(0, -1)} name`);
                    for (const i in formData) if (
                        formData[i] == '[]' 
                        || formData[i] == '{}'
                    ) formData[i] = JSON.parse(formData[i]);
                    if (data.type == "groups") formData.pass = crypto.randomUUID();
                    if (formData.pass) formData.pass = CryptoJS.AES.encrypt(
                        formData.pass || data.pass, "Secret Passphrase"
                    ).toString();
                    formData.id = data.id;
                    schoolUserInfo[type].unshift(formData);
                    fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(users, null, "\t"));
                    res.end(`0${type.slice(0, -1)} ${data.id} has been created successfully`);
                    break;
                } case "modify": {
                    break;
                } case "delete": {
                    if (users.users.find(i => i.id == data.id)) {
                        const userIndex = users.users.findIndex(i => i.id == data.id);
                        users.users.splice(userIndex, 1);
                    }
                    if (schoolUserInfo[type].find(i => i.id == data.id)) {
                        const schoolIndex = schoolUserInfo[type].findIndex(i => i.id == data.id)
                        schoolUserInfo[type].splice(schoolIndex, 1);
                    }
                    fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(users, null, "\t"));
                    res.end(`0${type.slice(0, -1)} ${data.id} has been deleted successfully`);
                    break;
                } case "apply_permissions": {
                    const schoolUser = schoolUserInfo[type].find(i => i.id == data.id);
                    schoolUser.permissions = {};
                    for (const i in formData) {
                        if (formData[i] == "on") formData[i] = '1';
                        schoolUser.permissions[i] = formData[i];
                    }
                    fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(users, null, "\t"));
                    res.end(`0${type.slice(0, -1)} ${data.id}'s permissions were applied successfully`);
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