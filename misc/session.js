/**
 * Session Manager For GoNexus (Codename: BetterWrapper)
 * 
 * if you see any bugs happening here. please contact @_sleepyguy on discord to get those bugs fixed although he might just be asking the devs to help him fix it.
 */
const userSessions = [];

module.exports = {
    getIp(req) {
		return req.headers['x-forwarded-for'];
	},
    set(req, data) {
        try {
            const ip = this.getIp(req);
            userSessions.unshift({
                ip,
                data
            });
            return true
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    get(req) {
        const ip = this.getIp(req);
        return userSessions.find(i => i.ip == ip);
    },
    remove(req) {
        try {
            const ip = this.getIp(req);
            const index = userSessions.findIndex(i => i.ip == ip);
            userSessions.splice(index, 1);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
