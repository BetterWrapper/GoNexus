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
            const currentSession = this.get(req);
            if (!currentSession.data && !currentSession.ip) {
                userSessions.unshift({
                    ip,
                    data
                });
            } else for (const i in data) {
                currentSession.data[i] = data[i];
            }
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    get(req) {
        const ip = this.getIp(req);
        const currentSession = userSessions.find(i => i.ip == ip);
        if (currentSession) return currentSession;
        else return {};
    },
    remove(req, data) {
        try {
            const currentSession = this.get(req);
            if (currentSession.data) {
                for (const i in data) {
                    currentSession.data[i] = "";
                }
                return true;
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
