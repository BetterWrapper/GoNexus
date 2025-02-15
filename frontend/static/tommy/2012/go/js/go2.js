    var responseArray = {};
    var URL_FBCONNECT_CHECK = "/ajax/FBConnectCheck";
    var URL_CHOOSE_LANGUAGE = "/ajax/chooseLanguage";
    var REQUIRED_PASSWORD_LENGTH = 6;
    var flashVar = "";
    var flashAppName = "Player";
    var inviteContactName = "rcpt_ml_area";
    var on_signup_or_login_complete_handler;
    var on_signup_or_login_cancel_handler;
    registerSignupLoginCompleteHandler(redirect_after_signup_complete);
    registerSignupLoginCancelHandler(goVoid);
    var _returnto = "";
    function goVoid() {}
    function flashInterface(a, b) {
        document.getElementById(a).share(b)
    }
    function add2flash(a) {
        document.getElementById(flashAppName).addContact(a);
        showAddressBook(false)
    }
    function add2form(b) {
        var a = $(inviteContactName).value;
        if (a.length > 0) {
            a += "\n"
        }
        $(inviteContactName).value = a + b;
        showAddressBook(false);
        grayOut(false, "addImportToInvite")
    }
    function getSelected() {
        var a = "";
        if (document.contactform.mlist.length == undefined) {
            if (document.contactform.mlist.checked == true) {
                a += document.contactform.mlist.value
            }
        } else {
            for (i = 0; i < document.contactform.mlist.length; i++) {
                if (document.contactform.mlist[i].checked == true) {
                    if ($("rcpt_ml_area") == null) {
                        a += document.contactform.mlist[i].value + ","
                    } else {
                        if ($("movieId") != null) {
                            a += document.contactform.mlist[i].value + ", "
                        } else {
                            a += document.contactform.mlist[i].value + "\n"
                        }
                    }
                }
            }
            a = a.substr(0, a.length - 1)
        }
        return a
    }
    function recordSignUp() {
        dataLayer.push({
            event: "ga-pageview-t1",
            path: "/pageTracker/ajax/signUpComplete"
        })
    }
    function _ga_evalJSON(str) {
        var retval = null;
        var tests = [function() {
            return jQuery.parseJSON(str)
        }
        , function() {
            return str.evalJSON()
        }
        , function() {
            var _temp;
            eval("_temp = " + str);
            return _temp
        }
        ];
        for (var i = 0; i < tests.length; i++) {
            try {
                retval = tests[i]();
                break
            } catch (e) {
                retval = null
            }
        }
        return retval
    }
    function parseResponse(b) {
        var c = b.indexOf("{");
        var a = b.indexOf("}");
        responseArray.code = (-1 != c) ? b.substring(0, c) : b.charAt(0);
        responseArray.json = _ga_evalJSON(b.substring(c, a + 1));
        responseArray.html = b.substring(a + 1)
    }
    function parseRenderString(a) {
        this.responseData = {};
        responseArray.code = a.charAt(0);
        responseArray.string = a.substring(1)
    }
    function parseResponseClass(b) {
        this.responseData = {};
        responseArray.code = b.charAt(0);
        var c = b.indexOf("{");
        var a = b.indexOf("}");
        this.responseData.json = b.substring(c, a + 1).evalJSON();
        this.responseData.html = b.substring(a + 1)
    }
    function parseResponseJson(b) {
        responseArray.code = b.charAt(0);
        var c = b.indexOf("{");
        var a = b.lastIndexOf("}");
        responseArray.json = _ga_evalJSON(b.substring(c, a + 1))
    }
    function resetResponse() {
        responseArray = {}
    }
    function clearFeedback() {
        jQuery("#feedback_block").hide()
    }
    function displayFeedback(c) {
        var b = c.charAt(0);
        var a = c.substring(1);
        showNotice(a, b != "0")
    }
    function showNotice(c, a) {
        a = typeof (a) != "undefined" ? a : false;
        var b = jQuery('<div class="growlUI"></div>');
        b.toggleClass("error", a);
        b.append("<h1>Notification</h1>");
        b.append("<h2>" + c + "</h2>");
        jQuery.blockUI({
            message: b,
            fadeIn: 700,
            fadeOut: 700,
            centerY: false,
            timeout: 5000,
            showOverlay: false,
            css: {
                width: "350px",
                top: "10px",
                left: "",
                right: "10px",
                textAlign: "left",
                border: "none",
                padding: "15px",
                backgroundColor: "#000",
                "border-radius": "10px",
                opacity: 0.8,
                color: "#fff"
            }
        })
    }
    function saveCurFlashVar(a) {
        flashVar = a
    }
    function getCurFlashVar() {
        return flashVar
    }
    function isPepperFlashInForce() {
        var e = false;
        var c = "application/x-shockwave-flash";
        var b = navigator.mimeTypes;
        var a = function(g, f) {
            return g.indexOf(f, g.length - f.length) !== -1
        };
        if (b && b[c] && b[c].enabledPlugin && (b[c].enabledPlugin.filename == "pepflashplayer.dll" || b[c].enabledPlugin.filename == "libpepflashplayer.so" || a(b[c].enabledPlugin.filename, "PepperFlashPlayer.plugin"))) {
            e = true
        }
        return e
    }
    function fullscreenStudio(b) {
        var a;
        if (isPepperFlashInForce()) {
            window.location.href = b
        } else {
            a = window.open(b, "wndstudio");
            if (a == null) {
                window.alert("Cannot open new window for studio")
            }
        }
    }
    loadedFullscreenStudio = false;
    function full_screen_studio() {
        loadedFullscreenStudio = true;
        jQuery("body").addClass("full_screen_studio");
        jQuery(".footer, .bottomlangbar, .footer_bottom").hide()
    }
    function tutorialMode() {
        resize_studio = false;
        jQuery("#studio_container").width(960).height(630).css("left", "200px")
    }
    function printDot(b) {
        var a = $(b).innerHTML;
        if (a.length >= 3) {
            $(b).innerHTML = ""
        } else {
            $(b).innerHTML = a + "."
        }
    }
    var wddd = "";
    function showPleaseWait(b, a) {
        a -= 100;
        $("overlayWaitingTitle").innerHTML = b;
        $("overlayWaiting").style.display = "block";
        $("overlayObject").style.margin = a + "px 0px 0px 0px";
        ddd = window.setInterval('printDot("WaitingDotDotDot")', 300);
        grayOut(true, "showPleaseWait")
    }
    function hidePleaseWait() {
        grayOut(false, "showPleaseWait");
        $("overlayWaiting").style.display = "none";
        window.clearInterval(ddd)
    }
    function showHTMLBox(h, g, e, b, f, a) {
        $("overlayHTMLBoxTitle").innerHTML = (h === "" ? "&nbsp;" : h);
        $("HTMLBoxMessage").innerHTML = e;
        $("overlayHTMLBox").style.display = "block";
        if (typeof a == "undefined") {
            $("overlayHTMLBox").style.backgroundImage = "url(/static/go/img/v2/overlay_title01_bg.gif)";
            $("overlayHTML_close").className = "html_overlay_close"
        } else {
            if (view_name == "domo") {
                $("overlayHTMLBox").style.backgroundImage = "url(/static/domo/img/user/overlay_title02_bg.gif)"
            } else {
                if (view_name == "cn") {
                    $("overlayHTMLBox").style.backgroundImage = "url(/static/cn/img/user/overlay_title02_bg.gif)"
                }
            }
            $("overlayHTML_close").className = "html_overlay_alert_close"
        }
        $("HTMLBoxTP").innerHTML = b;
        var c = currPos();
        grayOutGlobal(true, b, f);
        $("overlayObjectGlobal").style.top = g + c[1] + "px"
    }
    function hideHTMLBox() {
        var a = $("HTMLBoxTP").innerHTML;
        grayOutGlobal(false, a);
        $("overlayHTMLBox").style.display = "none"
    }
    function showAlertBox(f, e, b, c) {
        $("overlayAlertBoxTitle").innerHTML = (f === "" ? "&nbsp;" : f);
        $("alertBoxMessage").innerHTML = b;
        $("overlayAlertBox").style.display = "block";
        var a = currPos();
        grayOutGlobal(true, "showAlertBox", c);
        $("overlayObjectGlobal").style.top = e + a[1] + "px"
    }
    function hideAlertBox() {
        grayOutGlobal(false, "showAlertBox");
        $("overlayAlertBox").style.display = "none"
    }
    function showConfirmBox(g, f, c, h, a, e) {
        $("overlayConfirmBoxTitle").innerHTML = (g === "" ? "&nbsp;" : g);
        $("overlayConfirmConfirmBtn").innerHTML = "<input type='button' onClick='javascript:" + h + ";' value='" + GT.gettext("Confirm") + "'>";
        $("overlayConfirmCancelBtn").innerHTML = "<input type='button' onClick='javascript:" + a + ";' value='" + GT.gettext("Cancel") + "'>";
        $("confirmBoxMessage").innerHTML = c;
        $("overlayConfirmBox").style.display = "block";
        var b = currPos();
        grayOut(true, "showConfirmBox", e);
        $("overlayObject").style.top = f + b[1] + "px"
    }
    function hideConfirmBox() {
        grayOut(false, "showConfirmBox");
        $("overlayConfirmBox").style.display = "none"
    }
    function showInputBox(g, f, c, h, a, e) {
        $("overlayInputBoxTitle").innerHTML = (g === "" ? "&nbsp;" : g);
        $("overlayInputSaveBtn").innerHTML = "<input type='button' onClick='javascript:" + h + ";' value='" + GT.gettext("Save") + "'>";
        $("overlayInputCancelBtn").innerHTML = "<input type='button' onClick='javascript:" + a + ";' value='" + GT.gettext("Cancel") + "'>";
        $("inputBoxMessage").innerHTML = c;
        $("overlayInputBox").style.display = "block";
        var b = currPos();
        grayOut(true, "showInputBox", e);
        $("overlayObject").style.top = f + b[1] + "px";
        $("inputTextBox").focus()
    }
    function hideInputBox() {
        grayOut(false, "showInputBox");
        $("overlayInputBox").style.display = "none"
    }
    function showProgressBox(h, f, g, b, l, c, j, a, k) {
        $("overlayProgressBoxTitle").innerHTML = (h === "" ? "&nbsp;" : h);
        $("progressTotal").innerHTML = g;
        $("progressCurr").innerHTML = "1";
        $("progressBoxMessage").innerHTML = l;
        $("overlayProgressClose").innerHTML = '<a href="javascript:' + a + '"></a>';
        $("overlayProgressBoxBtn").innerHTML = '<input id="overlayProgressBtn" type="button" value="' + c + '" onClick="javascript:' + j + '">';
        $("overlayProgressBox").style.display = "block";
        var e = currPos();
        if (k == undefined) {
            grayOut(true, "showProgressBox", b)
        } else {
            grayOut(true, k, b)
        }
        $("overlayObject").style.top = f + e[1] + "px"
    }
    function hideProgressBox(a) {
        if (a == undefined) {
            grayOut(false, "showProgressBox")
        } else {
            grayOut(false, a)
        }
        $("overlayProgressBox").style.display = "none"
    }
    function findPosY(b) {
        obj = $(b);
        var a = 0;
        if (obj.offsetParent) {
            while (1) {
                a += obj.offsetTop;
                if (!obj.offsetParent) {
                    break
                }
                obj = obj.offsetParent
            }
        } else {
            if (obj.y) {
                a += obj.y
            }
        }
        return a
    }
    function showLogin(e, c, f) {
        if (view_name == "go") {
            var b = ""
              , a = window.location.host;
            if (a == "goanimate.com") {
                b = "https://" + a + "/login"
            } else {
                b = "http://" + a + "/login"
            }
            if (c) {
                b += "?r=" + encodeURIComponent(c)
            }
            document.location = b;
            return
        }
    }
    function registerSignupLoginCompleteHandler(a) {
        on_signup_or_login_complete_handler = a
    }
    function getSignupLoginCompleteHandler() {
        return on_signup_or_login_complete_handler
    }
    function registerSignupLoginCancelHandler(a) {
        on_signup_or_login_cancel_handler = a
    }
    function getSignupLoginCancelHandler() {
        return on_signup_or_login_cancel_handler
    }
    function showSignup(e, c) {
        if (view_name == "go") {
            var b = ""
              , a = window.location.host;
            if (a == "goanimate.com") {
                b = "https://" + a + "/signup"
            } else {
                b = "http://" + a + "/signup"
            }
            if (c) {
                b += "?r=" + encodeURIComponent(c)
            }
            document.location = b;
            return
        }
        dataLayer.push({
            event: "ga-pageview-t1",
            path: "/pageTracker/ajax/overlay/signup/true"
        })
    }
    function switchSignupToLogin() {
        var b = on_signup_or_login_complete_handler;
        var a = on_signup_or_login_cancel_handler;
        on_signup_or_login_complete_handler = null;
        on_signup_or_login_cancel_handler = null;
        hideSignup();
        on_signup_or_login_complete_handler = b;
        on_signup_or_login_cancel_handler = a;
        showLogin(350)
    }
    function redirect_after_signup_complete() {
        window.location = responseArray.json.redirect
    }
    function fillDisplayName(b) {
        var a = jQuery("#signup_username");
        var c = b.indexOf("@");
        if (c > 0) {
            a.val(b.substring(0, c))
        }
    }
    if (typeof jQuery == "function" && jQuery) {
        jQuery(document).ready(function() {
            jQuery(document).bind("user.signup user.login", function(a) {
                on_signup_or_login_complete_handler()
            })
        })
    }
    function getCookie(c) {
        var b = document.cookie;
        var f = c + "=";
        var e = b.indexOf("; " + f);
        if (e == -1) {
            e = b.indexOf(f);
            if (e != 0) {
                return null
            }
        } else {
            e += 2
        }
        var a = document.cookie.indexOf(";", e);
        if (a == -1) {
            a = b.length
        }
        return unescape(b.substring(e + f.length, a))
    }
    function SetCookie(c, f, a, j, e, h) {
        var b = new Date();
        b.setTime(b.getTime());
        if (a) {
            a = a * 1000 * 60 * 60 * 24
        }
        var g = new Date(b.getTime() + a);
        document.cookie = c + "=" + escape(f) + ((a) ? ";expires=" + g.toGMTString() : "") + ((j) ? ";path=" + j : "") + ((e) ? ";domain=" + e : "") + ((h) ? ";secure" : "")
    }
    function utmvCookieCheck(b) {
        var a = getCookie("__utmv");
        if (a == null) {
            return false
        }
        a = a.replace(/^\d*\./, "");
        return (a == b || a == "logged-in") ? true : false
    }
    function currPos() {
        var b = 0
          , a = 0;
        if (typeof (window.pageYOffset) == "number") {
            a = window.pageYOffset;
            b = window.pageXOffset
        } else {
            if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                a = document.body.scrollTop;
                b = document.body.scrollLeft
            } else {
                if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                    a = document.documentElement.scrollTop;
                    b = document.documentElement.scrollLeft
                }
            }
        }
        return [b, a]
    }
    function trim(a) {
        a = a.replace(/^\s+/, "");
        a = a.replace(/\s+$/, "");
        return a
    }
    function showCouponPremiumAssetAlert(a, c, e) {
        var b = "";
        b = '<div style="background:transparent url(/static/store/' + a + "/char/" + c + '/thumbnail.jpg) -20px top no-repeat;padding-left:100px;clear:both;width:220px;"><p style="font-size:18px">Get ' + e + ' for free</p><br/><p style="font-size: 13px;width:220px">Create an account now or just login to get access to our <span style="font-size:16px;font-weight:bold;line-height:21px;color:orange">' + e + '</span> character for free.</p><br/><ul class="overlayHTMLul"><li style="width:110px;height:47px;overflow:hidden"><a href="javascript:hideHTMLBox();showSignup(250);"><img src="/static/go/img/v2/btn_signup_arrow_small.gif" width="110" height="94" border="0"></a></li><li style="padding:10px 0px 10px 30px;"><a href="javascript:hideHTMLBox();showLogin(250);">login</a></li></ul></div>';
        showHTMLBox("", 180, b, "pr_willie_alert")
    }
    function showCouponPremiumAssetConfirm(a, c, e) {
        var b = "";
        b = '<div style="background:transparent url(/static/store/' + a + "/char/" + c + '/thumbnail.jpg) -20px top no-repeat;padding-left:100px;clear:both;width:220px;"><p style="font-size:18px">Congratulations!</p><br/><p style="font-size: 13px;width:220px"><span style="font-size:16px;font-weight:bold;line-height:21px;color:orange">' + e + '</span> is waiting for you to animate him in our studio.</p><br/><br/><ul class="overlayHTMLul"><li style="width:110px;height:39px;overflow:hidden"><a href="javascript:hideHTMLBox();location.href=\'/go/create\'"><img src="/static/go/img/v2/btn_create.png" width="110" height="78" border="0"></a></li><li style="padding:10px 0px 10px 30px;"><a href="javascript:hideHTMLBox();">Close</a></li></ul></div>';
        showHTMLBox("", 180, b, "pr_willie_confirm")
    }
    function iePngFix(e, a, l) {
        var g = navigator.appVersion.split("MSIE");
        var h = parseFloat(g[1]);
        if ((h >= 5.5) && (h < 7) && (document.body.filters)) {
            var f = (e.id) ? "id='" + e.id + "' " : "";
            var k = (e.className) ? "class='" + e.className + "' " : "";
            var c = (e.title) ? "title='" + e.title + "' " : "title='" + e.alt + "' ";
            var j = "display:inline-block;" + e.style.cssText;
            if (e.align == "left") {
                j = "float:left;" + j
            }
            if (e.align == "right") {
                j = "float:right;" + j
            }
            if (e.parentElement.href) {
                j = "cursor:hand;" + j
            }
            var b = "<span " + f + k + c + ' style="width:' + a + "px; height:" + l + "px;" + j + ";filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + e.src + "', sizingMethod='scale');\"></span>";
            e.outerHTML = b
        }
    }
    function in_array(g, f, c) {
        var e = false, b, a = !!c;
        for (b in f) {
            if ((a && f[b] === g) || (!a && f[b] == g)) {
                e = true;
                break
            }
        }
        return e
    }
    function array_push(e) {
        var b, a = arguments, c = a.length;
        for (b = 1; b < c; b++) {
            e[e.length++] = a[b]
        }
        return e.length
    }
    var textareamaxlength = 2000;
    function checkmaxlengthkeypress(c, a) {
        var b = window.event ? event.keyCode : a.which;
        if ((b == 32) || (b == 13) || (b > 47)) {
            if (c.value.length > textareamaxlength - 1) {
                if (window.event) {
                    window.event.returnValue = null
                } else {
                    a.cancelDefault;
                    return false
                }
            }
        }
    }
    function checkmaxlengthkeyup(a) {
        if (a.value.length > textareamaxlength - 1) {
            a.value = a.value.substr(0, textareamaxlength)
        }
    }
    function checkmaxlengthpaste(f) {
        if ((window.event) && (detect.indexOf("safari") + 1 == 0)) {
            var c = f.document.selection.createRange();
            var b = textareamaxlength - f.value.length + c.text.length;
            try {
                var a = window.clipboardData.getData("Text").substr(0, b);
                c.text = a
            } catch (e) {}
            if (window.event) {
                window.event.returnValue = null
            } else {
                f.value = f.value.substr(0, textareamaxlength);
                return false
            }
        }
    }
    function reloadiFrame(a) {
        for (i = 0; i < a.length; i++) {
            $(a[i]).src = $(a[i]).src
        }
    }
    function createPlayer(v, j, a, b, D, P, l, I, r, T, C, q, H, L, c, K, N, w, G, u, p, z, s, R, E, t, f, e, Q, g, x, O, o, A, m, B, M, y, h, k, S, n, F) {
        if (typeof F == "undefined") {
            F = "high"
        }
        var J = {
            movieOwner: P,
            movieOwnerId: l,
            movieId: I,
            movieLid: r,
            movieTitle: T,
            movieDesc: C,
            userId: q,
            username: H,
            uemail: L,
            ut: "-1",
            apiserver: c,
            thumbnailURL: K,
            copyable: N,
            isPublished: w,
            ctc: G,
            tlang: u,
            is_private_shared: p,
            autostart: z,
            appCode: "go",
            is_slideshow: R,
            originalId: E,
            is_emessage: t,
            isEmbed: f,
            refuser: e,
            utm_source: Q,
            uid: g,
            isTemplate: x,
            showButtons: O,
            chain_mids: o,
            showshare: A,
            averageRating: m,
            ratingCount: B,
            fb_app_url: M,
            numContact: y,
            isInitFromExternal: h,
            storePath: k,
            clientThemePath: S,
            animationPath: n
        };
        jQuery("#" + v).flash({
            id: "Player",
            swf: j,
            height: b,
            width: a,
            quality: F,
            scale: "exactfit",
            allowScriptAccess: "always",
            allowFullScreen: "true",
            wmode: D,
            hasVersion: "10.3",
            flashvars: J
        })
    }
    function createPreviewPlayer(b, c, a) {
        jQuery("#" + b).flash({
            id: "Player",
            swf: c.player_url,
            height: c.height,
            width: c.width,
            quality: c.quality,
            scale: "exactfit",
            allowScriptAccess: "always",
            allowFullScreen: "true",
            wmode: "window",
            hasVersion: "10.3",
            flashvars: a
        })
    }
    function submitFBConnect() {
        if (!FB) {
            displayFeedback("1" + GT.gettext("Sorry, Facebook is blocked at your location."));
            return
        }
        FB.login(function(a) {
            if (a.authResponse) {
                FBConnectCheck()
            }
        }, {
            scope: "email,publish_stream,offline_access"
        })
    }
    function FBConnectCheck() {
        jQuery.post(URL_FBCONNECT_CHECK, function(a) {
            parseResponse(a);
            if (responseArray.code == "0") {
                window.location.href = responseArray.json.url
            } else {
                displayFeedback("1" + responseArray.json.error)
            }
        })
    }
    function googleLogin() {
        window.open("/googleConnect", "openIdLogin", "height=450,width=550,directories=no,menubar=no,scrollbars=yes,status=no,toolbar=no")
    }
    function chooseLanguage(b) {
        var a = {
            lang: b,
            uri: window.location.href
        };
        jQuery.post(URL_CHOOSE_LANGUAGE, a, function(c) {
            parseResponse(c);
            if (typeof responseArray.json.url != "undefined") {
                window.location.reload()
            }
            resetResponse()
        })
    }
    function buttonOver(b, a) {
        $(b + "left").style.margin = a + "px 0 0 0";
        $(b + "right").style.margin = a + "px 0 0 0";
        $(b + "centerinactive").style.display = "none";
        $(b + "centeractive").style.display = "block"
    }
    function buttonOut(a) {
        $(a + "left").style.margin = "0 0 0 0";
        $(a + "right").style.margin = "0 0 0 0";
        $(a + "centeractive").style.display = "none";
        $(a + "centerinactive").style.display = "block"
    }
    function setNavGoBuckGoPoint(c, b) {
        jQuery("#header_gobucks > div:eq(0)").text(number_format(c));
        jQuery("#header_gopoints > div:eq(0)").text(number_format(b));
        var a = jQuery("#animator");
        if (a.length) {
            a.find(".money .value").text(number_format(c));
            a.find(".sharing .value").text(number_format(b))
        }
    }
    function number_format(g, c, j, f) {
        var b = !isFinite(+g) ? 0 : +g
          , a = !isFinite(+c) ? 0 : Math.abs(c)
          , l = (typeof f === "undefined") ? "," : f
          , e = (typeof j === "undefined") ? "." : j
          , k = ""
          , h = function(p, o) {
            var m = Math.pow(10, o);
            return "" + Math.round(p * m) / m
        };
        k = (a ? h(b, a) : "" + Math.round(b)).split(".");
        if (k[0].length > 3) {
            k[0] = k[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, l)
        }
        if ((k[1] || "").length < a) {
            k[1] = k[1] || "";
            k[1] += new Array(a - k[1].length + 1).join("0")
        }
        return k.join(e)
    }
    function setPageTitle(a) {
        if (a) {
            document.title = "GoAnimate - " + a
        }
    }
    function calcServerTime(a) {
        d = new Date();
        utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        nd = new Date(utc + (3600000 * a));
        return nd
    }
    function timeAgo(e) {
        var a = e / 60 | 0;
        var g = a / 60 | 0;
        var h = g / 24 | 0;
        var f = h / 30 | 0;
        var c = f / 12 | 0;
        var b = "";
        if (c != 0) {
            b = GT.strargs(GT.gettext("feed_timestamp_formatstr"), [c, GT.ngettext("year", "years", c)])
        } else {
            if (f != 0) {
                b = GT.strargs(GT.gettext("feed_timestamp_formatstr"), [f, GT.ngettext("month", "months", f)])
            } else {
                if (h != 0) {
                    b = GT.strargs(GT.gettext("feed_timestamp_formatstr"), [h, GT.ngettext("day", "days", h)])
                } else {
                    if (g != 0) {
                        b = GT.strargs(GT.gettext("feed_timestamp_formatstr"), [g, GT.ngettext("hour", "hours", g)])
                    } else {
                        if (a != 0) {
                            b = GT.strargs(GT.gettext("feed_timestamp_formatstr"), [a, GT.ngettext("minute", "minutes", a)])
                        } else {
                            if (e != 0) {
                                b = GT.strargs(GT.gettext("feed_timestamp_formatstr"), [e, GT.ngettext("second", "seconds", e)])
                            }
                        }
                    }
                }
            }
        }
        return b
    }
    function blockUICenterX() {
        $block = jQuery(".blockUI.blockMsg");
        $block.css("left", (jQuery(window).width() - $block.width()) / 2 + jQuery(window).scrollLeft() + "px")
    }
    function showOverlay(c, a) {
        a = a || {};
        var b = {
            padding: 0,
            margin: 0,
            width: "auto",
            top: "100px",
            left: "29%",
            textAlign: "center",
            color: "#000",
            border: "none",
            backgroundColor: "transparent",
            cursor: "auto"
        };
        jQuery.extend(b, a);
        jQuery.blockUI({
            message: c,
            css: b,
            overlayCSS: {
                cursor: "auto"
            }
        });
        blockUICenterX()
    }
    function showOfferOverlay(a) {
        showOverlay(a)
    }
    !function(b) {
        var a = {
            enable: function(c) {
                b(c).find(":input").each(function() {
                    this.disabled = false
                })
            },
            disable: function(c) {
                b(c).find(":input").each(function() {
                    this.disabled = true
                })
            },
            reset: function(c) {
                c.reset()
            }
        };
        b.fn.form = function(c) {
            return this.each(function() {
                if (!b(this).is("form")) {
                    return
                }
                if (typeof c == "string" && typeof a[c] == "function") {
                    a[c](this)
                }
            })
        }
    }(jQuery);
    function getSeasonalOfferOverlay() {
        if (!jQuery("#seasonal_offer_overlay").length) {
            jQuery.get("/ajax/getSeasonalOfferOverlay", function(a) {
                document.getElementById("offer_container").innerHTML = a;
                showOfferOverlay(jQuery("#seasonal_offer_overlay"))
            })
        } else {
            showOfferOverlay(jQuery("#seasonal_offer_overlay"))
        }
    }
    function getGoPlusFreeTrialOverlay() {
        if (!jQuery("#goplus_free_trial_overlay").length) {
            jQuery.get("/ajax/getGoPlusFreeTrialOverlay", function(a) {
                jQuery("#offer_container").html(a);
                jQuery("#goplus_free_trial_overlay").modal()
            })
        } else {
            jQuery("#goplus_free_trial_overlay").modal()
        }
    }
    function offerFacebookShare(b, a) {
        FB.getLoginStatus(function(c) {
            if (c.authResponse) {
                FB.XFBML.parse(document.getElementById("seasonal_offer_facebook"));
                showOfferOverlay(jQuery("#seasonal_offer_facebook"))
            } else {
                FB.ui({
                    method: "share",
                    href: a
                }, function(e) {
                    offerShareViaFacebookSharer(b)
                })
            }
        })
    }
    function offerTwitterShare(a) {
        jQuery.post("/ajax/offerShareViaTwitter", {
            offer: a
        }, function(b) {
            parseResponse(b);
            if (responseArray.code == "0") {
                offerComplete()
            }
        })
    }
    function offerShareViaFacebookSharer(a) {
        jQuery.post("/ajax/offerShareViaFacebookSharer", {
            offer: a
        }, function(b) {
            parseResponse(b);
            if (responseArray.code == "0") {
                offerComplete()
            }
        })
    }
    function initOfferEmailIframe() {
        jQuery("#seasonal_offer_email_iframe_container").html('<iframe src="/email_offer" style="border:0;width:540px;height:360px" frameborder="0" scrolling="no" allowtransparency="true"></iframe>')
    }
    function offerComplete() {
        showOfferOverlay(jQuery("#seasonal_offer_confirm"))
    }
    function showDailyGameOverlay() {
        if (!jQuery.flash.available) {
            overlayManager.next();
            return
        }
        var a = new Date();
        if (getCookie("daily_game_off") == a.toDateString()) {
            return
        }
        showOverlay(jQuery("#daily_game_overlay"), {
            top: "80px",
            left: "24%",
            position: "absolute"
        })
    }
    function closeDailyGameOverlay() {
        overlayManager.next()
    }
    function getUnclaimBadgeOverlay() {
        jQuery.get("/ajax/getUnclaimBadgeOverlay", function(a) {
            parseResponse(a);
            if (responseArray.code == "0") {
                var b = jQuery("#claim_badge_overlay");
                if (b.length) {
                    b.replaceWith(responseArray.html)
                } else {
                    jQuery("body").append(responseArray.html)
                }
                showOverlay(jQuery("#claim_badge_overlay"), {
                    position: "absolute"
                })
            } else {
                displayFeedback("1" + responseArray.json.error)
            }
        })
    }
    function getCreativeBadgeClaimOverlay(a) {
        jQuery.get("/ajax/getCreativeBadgeClaimOverlay/" + a, function(b) {
            parseResponse(b);
            if (responseArray.code == "0") {
                var c = jQuery("#claim_creative_badge_overlay");
                if (c.length) {
                    c.replaceWith(responseArray.html)
                } else {
                    jQuery("body").append(responseArray.html)
                }
                showOverlay(jQuery("#claim_creative_badge_overlay"), {
                    position: "absolute"
                })
            } else {
                displayFeedback("1" + responseArray.json.error)
            }
        })
    }
    function assignWatermark(b, a, c) {
        jQuery.ajax({
            type: "GET",
            url: "/ajax/assignwatermark/" + b + "/" + a + "/" + c,
            success: function(e) {
                if (e.error) {
                    displayFeedback("1" + e.error)
                } else {
                    if (b == "movie") {
                        displayFeedback("0" + GT.gettext("Logo assigned to movie"))
                    } else {
                        displayFeedback("0" + GT.gettext("Logo assigned to user"))
                    }
                }
            },
            error: function() {
                displayFeedback("1" + GT.gettext("Error contacting the server"))
            },
            dataType: "json"
        })
    }
    function getOptimizelyExperimentId() {
        var a = null;
        if (window.optimizely !== undefined) {
            if (window.optimizely.data.state.activeExperiments.length > 0) {
                a = window.optimizely.data.state.activeExperiments[0]
            }
        }
        return a
    }
    function getOptimizelyExperimentVariationId() {
        var b = getOptimizelyExperimentId()
          , a = null
          , c = null;
        if (b !== null) {
            a = window.optimizely.data.state.variationIdsMap[b];
            if (a !== undefined) {
                c = a[0]
            }
        }
        return c
    }
    function getAmplitudeOptimizelyPropertyName() {
        var b = getOptimizelyExperimentId()
          , a = null;
        if (b !== null) {
            a = ["Optimizely", window.location.pathname, b].join("-")
        }
        return a
    }
    var CCStandaloneBannerAdUI;
    (function() {
        var a = undefined;
        var b = function() {
            var c = hideOG;
            hideOG = function() {
                jQuery.unblockUI();
                hideOG = c
            }
            ;
            showOverlay(jQuery("#overlayGeneral"))
        };
        CCStandaloneBannerAdUI = (CCStandaloneBannerAdUI || {
            gaLogTx: {
                createCCPartLogger: function(c) {
                    var f = c;
                    var h = 0;
                    var g = "AS" + f;
                    var e = {};
                    this.setTemplateId = function(j) {
                        h = j
                    }
                    ;
                    this.addItem = function(k) {
                        var j = [k.theme, k.ctype, k.id].join("_");
                        e[j] = (e[j] || 0) + 1
                    }
                    ;
                    this.submit = function() {
                        return;
                        var j = 0;
                        for (itmId in e) {
                            j++
                        }
                        if (j == 0) {
                            return
                        }
                        dataLayer.push({
                            event: "ecommerce:addTransaction",
                            id: g,
                            affiliation: "GoAnimate Store",
                            revenue: "0",
                            tax: "0.00",
                            shipping: "0.00"
                        });
                        for (itmId in e) {
                            dataLayer.push({
                                event: "ecommerce:addItem",
                                id: g,
                                sku: itmId,
                                name: itmId,
                                category: ((h > 0) ? ("template #" + h) : "template"),
                                price: "0",
                                quantity: e[itmId]
                            })
                        }
                        dataLayer.push({
                            event: "ecommerce:send"
                        })
                    }
                    ;
                    return this
                },
                logCCPartsNormal: function(h, e, g) {
                    return;
                    var j = {};
                    for (var f = 0; f < e.length; f++) {
                        var c = [e[f].theme, e[f].ctype, e[f].id].join("_");
                        j[c] = (j[c] || 0) + 1
                    }
                    if (e.length == 0) {
                        return
                    }
                    var k = "AS" + h;
                    dataLayer.push({
                        event: "ecommerce:addTransaction",
                        id: k,
                        affiliation: "GoAnimate Store",
                        revenue: "0",
                        tax: "0.00",
                        shipping: "0.00"
                    });
                    for (c in j) {
                        dataLayer.push({
                            event: "ecommerce:addItem",
                            id: k,
                            sku: c,
                            name: c,
                            category: ((g > 0) ? ("template #" + g) : "custom"),
                            price: "0",
                            quantity: j[c]
                        })
                    }
                    dataLayer.push({
                        event: "ecommerce:send"
                    })
                },
                logActionpack: function(e, c, g) {
                    return;
                    var f = "AP" + e + "_" + c;
                    dataLayer.push({
                        event: "ecommerce:addTransaction",
                        id: f,
                        affiliation: "GoAnimate Store",
                        revenue: "0",
                        tax: "0.00",
                        shipping: "0.00"
                    });
                    dataLayer.push({
                        event: "ecommerce:addItem",
                        id: f,
                        sku: c,
                        name: g,
                        category: "actionpack",
                        price: "0",
                        quantity: "1"
                    });
                    dataLayer.push({
                        event: "ecommerce:send"
                    })
                }
            },
            showSuccess: function(c) {
                jQuery.ajax({
                    type: "GET",
                    url: "/ajax/renderCCBannerAdDialogue/success",
                    dataType: "text",
                    success: function(e) {
                        parseResponse(e);
                        if (responseArray.code == "0") {
                            jQuery("#OG_content").html(responseArray.html);
                            jQuery("#OG_title").html(GT.gettext("SUCCESS!"));
                            b()
                        }
                    }
                })
            },
            showInsufficientBalance: function() {
                jQuery.ajax({
                    type: "GET",
                    url: "/ajax/renderCCBannerAdDialogue",
                    dataType: "text",
                    success: function(c) {
                        parseResponse(c);
                        if (responseArray.code == "0") {
                            jQuery("#OG_content").html(responseArray.html);
                            jQuery("#OG_title").html(GT.gettext("Insufficient Balance"));
                            b()
                        }
                    }
                })
            },
            hideActionShop: function() {
                jQuery.unblockUI();
                try {
                    jQuery("#Studio").get(0).reloadAllCC(a)
                } catch (c) {}
                a = undefined
            },
            showActionShop: function(c) {
                a = c;
                jQuery("#actionshopdiv").remove();
                jQuery("<div>", {
                    id: "actionshopdiv",
                    css: {
                        width: "954px",
                        height: "500px",
                        display: "none"
                    }
                }).appendTo("body");
                jQuery("#actionshopdiv").flash({
                    id: "actionshopswf",
                    swf: CCStandaloneBannerAdUI.actionshopSWF,
                    width: "954",
                    height: "500",
                    align: "middle",
                    allowScriptAccess: "always",
                    wmode: "transparent",
                    flashvars: {
                        isEmbed: 0,
                        apiserver: CCStandaloneBannerAdUI.apiserver,
                        clientThemePath: CCStandaloneBannerAdUI.clientThemePath,
                        appCode: "go",
                        userId: CCStandaloneBannerAdUI.userId,
                        aid: c,
                        ctc: "go",
                        tlang: I18N_LANG
                    }
                });
                jQuery.blockUI({
                    message: jQuery("#actionshopdiv"),
                    css: {
                        padding: 0,
                        margin: 0,
                        width: "954",
                        left: "21%",
                        top: "10%",
                        textAlign: "left",
                        color: "#000",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "normal"
                    },
                    overlayCSS: {
                        backgroundColor: "#000",
                        opacity: 0.85
                    }
                });
                blockUICenterX()
            }
        })
    }
    )();
    if (typeof (DOMParser) == "undefined") {
        DOMParser = function() {}
        ;
        DOMParser.prototype.parseFromString = function(f, g) {
            var c;
            try {
                c = new ActiveXObject("MSXML.DomDocument");
                c.async = false;
                c.loadXML(f);
                return c
            } catch (b) {
                try {
                    c = new XMLHttpRequest;
                    if (!g) {
                        g = "application/xml"
                    }
                    c.open("GET", "data:" + g + ";charset=utf-8," + encodeURIComponent(f), false);
                    if (c.overrideMimeType) {
                        c.overrideMimeType(g)
                    }
                    c.send(null);
                    return c.responseXML
                } catch (a) {
                    return null
                }
            }
        }
    }
    function lectoraActivation() {
        var a = jQuery("#user_id").val();
        var c = jQuery("#password").val();
        var b = jQuery("#encrypted_movie_id").val();
        if (a == "") {
            lectoraErrorAlert("Please fill in your Lectora User ID.")
        } else {
            if (c == "") {
                lectoraErrorAlert("Please fill in the password for your Lectora account.")
            } else {
                jQuery.post("/ajax/createLectoraREST", {
                    USERID: a,
                    PASSWORD: c,
                    movie_id: b
                }, function(e) {
                    var h = false;
                    try {
                        var g = JSON.parse(e);
                        h = true
                    } catch (f) {
                        h = false
                    }
                    if (h == true) {
                        lectoraErrorAlert("ERROR: " + g.message + " (code: " + g.code + ")");
                        return
                    } else {
                        lectoraConnectSuccess(e)
                    }
                })
            }
        }
    }
    function lectoraAuthorization(a) {
        var b = a.USERID;
        jQuery.post("/ajax/authLectora", {
            USERID: a.USERID,
            PASSWORD: a.PASSWORD,
            TS: a.TS,
            CS: a.CS
        }, function(c) {
            if (c.error) {
                lectoraErrorAlert(c.error.message);
                return
            }
            c.USERID = b;
            lectoraApproved(c)
        }, "json")
    }
    function lectoraApproved(a) {
        var b = jQuery("#encrypted_movie_id").val();
        jQuery.post("/ajax/authLectoraApproved", {
            token: a.token,
            USERID: a.USERID,
            movie_id: b
        }, function(c) {
            jQuery("#video-export").html(c);
            jQuery("#error_alert").hide()
        })
    }
    function lectoraErrorAlert(a) {
        jQuery("#error_alert").html(a);
        jQuery("#error_alert").show()
    }
    function escapeHtml(a) {
        if (typeof a !== "string") {
            return a
        }
        return a.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
    }
    var ModalBase = function() {};
    ModalBase.create = function(b) {
        var a = $("<div/>").attr({
            id: b,
            "class": "modal",
            role: "dialog",
            "aria-hidden": "true"
        });
        a.html('<div class="modal-dialog"><div class="modal-content"></div></div>');
        return a
    }
    ;
    ModalBase.ensure = function(b) {
        var a = $("#" + b);
        if (a.length == 0) {
            a = ModalBase.create(b).appendTo("body")
        }
        return a
    }
    ;
    ModalBase.prototype = {
        loading: function() {},
        load: function(a) {
            var b = this;
            this.$el.modal();
            this.loading();
            $.get(a, function(c) {
                b.$el.find(".modal-dialog").replaceWith(c);
                b.$el.find('[rel="tooltip"]').tooltip({
                    container: b.$el
                });
                b.remoteUrl = a;
                b.$el.trigger("loaded")
            })
        },
        refresh: function() {
            if (!this.remoteUrl) {
                return
            }
            this.load(this.remoteUrl)
        },
        alert: function(b, a) {
            a = a || "success";
            this.$el.find(".alert").remove();
            var c = $('<div class="alert alert-dismissible"><button class="close" type="button" data-dismiss="alert">&times;</button></div>');
            c.addClass("alert-" + a).append(b).prependTo(this.$el.find(".modal-body"))
        }
    };