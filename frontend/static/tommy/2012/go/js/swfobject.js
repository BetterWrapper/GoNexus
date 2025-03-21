    if (typeof deconcept == "undefined") {
        var deconcept = new Object()
    }
    if (typeof deconcept.util == "undefined") {
        deconcept.util = new Object()
    }
    if (typeof deconcept.SWFObjectUtil == "undefined") {
        deconcept.SWFObjectUtil = new Object()
    }
    deconcept.SWFObject = function(m, b, n, e, j, k, g, f, d, l) {
        if (!document.getElementById) {
            return
        }
        this.DETECT_KEY = l ? l : "detectflash";
        this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
        this.params = new Object();
        this.variables = new Object();
        this.attributes = new Array();
        if (m) {
            this.setAttribute("swf", m)
        }
        if (b) {
            this.setAttribute("id", b)
        }
        if (n) {
            this.setAttribute("width", n)
        }
        if (e) {
            this.setAttribute("height", e)
        }
        if (j) {
            this.setAttribute("version", new deconcept.PlayerVersion(j.toString().split(".")))
        }
        this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion();
        if (!window.opera && document.all && this.installedVer.major > 7) {
            deconcept.SWFObject.doPrepUnload = true
        }
        if (k) {
            this.addParam("bgcolor", k)
        }
        var a = g ? g : "high";
        this.addParam("quality", a);
        this.setAttribute("useExpressInstall", false);
        this.setAttribute("doExpressInstall", false);
        var i = (f) ? f : window.location;
        this.setAttribute("xiRedirectUrl", i);
        this.setAttribute("redirectUrl", "");
        if (d) {
            this.setAttribute("redirectUrl", d)
        }
    }
    ;
    deconcept.SWFObject.prototype = {
        useExpressInstall: function(a) {
            this.xiSWFPath = !a ? "expressinstall.swf" : a;
            this.setAttribute("useExpressInstall", true)
        },
        setAttribute: function(a, b) {
            this.attributes[a] = b
        },
        getAttribute: function(a) {
            return this.attributes[a]
        },
        addParam: function(b, a) {
            this.params[b] = a
        },
        getParams: function() {
            return this.params
        },
        addVariable: function(b, a) {
            this.variables[b] = a
        },
        getVariable: function(a) {
            return this.variables[a]
        },
        getVariables: function() {
            return this.variables
        },
        getVariablePairs: function() {
            var c = new Array();
            var b;
            var a = this.getVariables();
            for (b in a) {
                c[c.length] = b + "=" + a[b]
            }
            return c
        },
        getSWFHTML: function() {
            var b = "";
            if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
                if (this.getAttribute("doExpressInstall")) {
                    this.addVariable("MMplayerType", "PlugIn");
                    this.setAttribute("swf", this.xiSWFPath)
                }
                b = '<embed type="application/x-shockwave-flash" src="' + this.getAttribute("swf") + '" width="' + this.getAttribute("width") + '" height="' + this.getAttribute("height") + '" style="' + this.getAttribute("style") + '"';
                b += ' id="' + this.getAttribute("id") + '" name="' + this.getAttribute("id") + '" ';
                var f = this.getParams();
                for (var e in f) {
                    b += [e] + '="' + f[e] + '" '
                }
                var d = this.getVariablePairs().join("&");
                if (d.length > 0) {
                    b += 'flashvars="' + d + '"'
                }
                b += "/>"
            } else {
                if (this.getAttribute("doExpressInstall")) {
                    this.addVariable("MMplayerType", "ActiveX");
                    this.setAttribute("swf", this.xiSWFPath)
                }
                b = '<object id="' + this.getAttribute("id") + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + this.getAttribute("width") + '" height="' + this.getAttribute("height") + '" style="' + this.getAttribute("style") + '">';
                b += '<param name="movie" value="' + this.getAttribute("swf") + '" />';
                var c = this.getParams();
                for (var e in c) {
                    b += '<param name="' + e + '" value="' + c[e] + '" />'
                }
                var a = this.getVariablePairs().join("&");
                if (a.length > 0) {
                    b += '<param name="flashvars" value="' + a + '" />'
                }
                b += "</object>"
            }
            return b
        },
        write: function(b) {
            if (this.getAttribute("useExpressInstall")) {
                var a = new deconcept.PlayerVersion([6, 0, 65]);
                if (this.installedVer.versionIsValid(a) && !this.installedVer.versionIsValid(this.getAttribute("version"))) {
                    this.setAttribute("doExpressInstall", true);
                    this.addVariable("MMredirectURL", escape(this.getAttribute("xiRedirectUrl")));
                    document.title = document.title.slice(0, 47) + " - Flash Player Installation";
                    this.addVariable("MMdoctitle", document.title)
                }
            }
            if (this.skipDetect || this.getAttribute("doExpressInstall") || this.installedVer.versionIsValid(this.getAttribute("version"))) {
                var c = (typeof b == "string") ? document.getElementById(b) : b;
                c.innerHTML = this.getSWFHTML();
                return true
            } else {
                if (this.getAttribute("redirectUrl") != "") {
                    document.location.replace(this.getAttribute("redirectUrl"))
                }
            }
            return false
        }
    };
    deconcept.SWFObjectUtil.getPlayerVersion = function() {
        var f = new deconcept.PlayerVersion([0, 0, 0]);
        if (navigator.plugins && navigator.mimeTypes.length) {
            var a = navigator.plugins["Shockwave Flash"];
            if (a && a.description) {
                f = new deconcept.PlayerVersion(a.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."))
            }
        } else {
            if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0) {
                var b = 1;
                var c = 3;
                while (b) {
                    try {
                        c++;
                        b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + c);
                        f = new deconcept.PlayerVersion([c, 0, 0])
                    } catch (d) {
                        b = null
                    }
                }
            } else {
                try {
                    var b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7")
                } catch (d) {
                    try {
                        var b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                        f = new deconcept.PlayerVersion([6, 0, 21]);
                        b.AllowScriptAccess = "always"
                    } catch (d) {
                        if (f.major == 6) {
                            return f
                        }
                    }
                    try {
                        b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
                    } catch (d) {}
                }
                if (b != null) {
                    f = new deconcept.PlayerVersion(b.GetVariable("$version").split(" ")[1].split(","))
                }
            }
        }
        return f
    }
    ;
    deconcept.PlayerVersion = function(a) {
        this.major = a[0] != null ? parseInt(a[0]) : 0;
        this.minor = a[1] != null ? parseInt(a[1]) : 0;
        this.rev = a[2] != null ? parseInt(a[2]) : 0
    }
    ;
    deconcept.PlayerVersion.prototype.versionIsValid = function(a) {
        if (this.major < a.major) {
            return false
        }
        if (this.major > a.major) {
            return true
        }
        if (this.minor < a.minor) {
            return false
        }
        if (this.minor > a.minor) {
            return true
        }
        if (this.rev < a.rev) {
            return false
        }
        return true
    }
    ;
    deconcept.util = {
        getRequestParameter: function(c) {
            var d = document.location.search || document.location.hash;
            if (c == null) {
                return d
            }
            if (d) {
                var b = d.substring(1).split("&");
                for (var a = 0; a < b.length; a++) {
                    if (b[a].substring(0, b[a].indexOf("=")) == c) {
                        return b[a].substring((b[a].indexOf("=") + 1))
                    }
                }
            }
            return ""
        }
    };
    deconcept.SWFObjectUtil.cleanupSWFs = function() {
        var b = document.getElementsByTagName("OBJECT");
        for (var c = b.length - 1; c >= 0; c--) {
            b[c].style.display = "none";
            for (var a in b[c]) {
                if (typeof b[c][a] == "function") {
                    b[c][a] = function() {}
                }
            }
        }
    }
    ;
    if (deconcept.SWFObject.doPrepUnload) {
        if (!deconcept.unloadSet) {
            deconcept.SWFObjectUtil.prepUnload = function() {
                __flash_unloadHandler = function() {}
                ;
                __flash_savedUnloadHandler = function() {}
                ;
                window.attachEvent("onunload", deconcept.SWFObjectUtil.cleanupSWFs)
            }
            ;
            window.attachEvent("onbeforeunload", deconcept.SWFObjectUtil.prepUnload);
            deconcept.unloadSet = true
        }
    }
    if (!document.getElementById && document.all) {
        document.getElementById = function(a) {
            return document.all[a]
        }
    }
    var getQueryParamValue = deconcept.util.getRequestParameter;
    var FlashObject = deconcept.SWFObject;
    var SWFObject = deconcept.SWFObject;