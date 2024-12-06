/**
 * This used to be a Session Manager For GoNexus (Codename: BetterWrapper) but has changed to a manager for browser cookies.
 * 
 * if you see any bugs happening here. please contact one of our developers on discord to get those bugs fixed.
 */
module.exports = {
    cookieData: 'HttpOnly; path=/',
    set(res, data) { // sets a cookie for the user
        try {
            const array = [];
            for (const i in data) array.push(`${i}=${data[i]}; max-age=${Math.round(31619000 * 31619000)}; ${this.cookieData}`);
            res.setHeader("Set-Cookie", array);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    get(req) { // parses a user's cookies for the server
        const data = {};
        if (req.headers.cookie) {
            const array = req.headers.cookie.split("; ");
            for (const i of array) {
                data[i.split("=")[0]] = i.split("=")[1];
            }
        }
        return { data };
    },
    remove(res, data) { // removes a user cookie from the server.
        try {
            const array = [];
            for (const i in data) array.push(`${i}=${data[i]}; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${this.cookieData}`);
            res.setHeader("Set-Cookie", array);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
