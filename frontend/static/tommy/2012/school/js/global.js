    var URL_RESET_PASSWORD_SCHOOL_ACCOUNT = "/ajax/resetSchoolAccPassword";
    function bookmark_us(c, a, b) {
        if (!a) {
            a = location.href
        }
        if (!c) {
            c = document.title
        }
        if ((typeof window.sidebar == "object") && (typeof window.sidebar.addPanel == "function")) {
            window.sidebar.addPanel(c, a, "")
        } else {
            if (document.all) {
                window.external.AddFavorite(a, c)
            } else {
                if (window.opera && document.createElement) {
                    b.setAttribute("rel", "sidebar");
                    b.setAttribute("href", a);
                    b.setAttribute("title", c)
                } else {
                    displayFeedback("1" + GT.gettext("Sorry, your browser doesn't support bookmarks. Press ctrl+D"));
                    return false
                }
            }
        }
        return true
    }
    function showOG(a) {
        jQuery("#tracker_id").html(a);
        showOverlay(jQuery("#overlayGeneral"), {
            width: "700",
            top: "25%",
            left: "30%",
            textAlign: "left"
        })
    }
    function hideOG() {
        jQuery.unblockUI()
    }
    function resetAccPassword(c, a) {
        var b = {
            enc_user_id: c,
            accType: a,
            display: "Y",
            ct: jQuery("#editAccountForm input[name=ct]").val()
        };
        jQuery.post(URL_RESET_PASSWORD_SCHOOL_ACCOUNT, b, function(d) {
            parseResponse(d);
            if (responseArray.code == 0) {
                jQuery("#OG_content").html(responseArray.html);
                showOG()
            } else {
                if (responseArray.code == 1) {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
        })
    }
    function confirmResetPassword(c, a) {
        var b = {
            password: jQuery("#reset_password").val(),
            enc_user_id: c,
            accType: a,
            display: "N",
            confirm: "Y",
            ct: jQuery("#resetpasswordfrm input[name=ct]").val()
        };
        jQuery.post(URL_RESET_PASSWORD_SCHOOL_ACCOUNT, b, function(d) {
            parseResponse(d);
            if (responseArray.code == 0) {
                jQuery("#OG_content").html(responseArray.html)
            } else {
                if (responseArray.code == 1) {
                    jQuery("#deleteAccErr").html(responseArray.json.error)
                }
            }
        })
    }
    function waitForStudio() {
        if (!jQuery("#init_studio").length) {
            return
        }
        setTimeout(function() {
            showWaitForStudio()
        }, 2000)
    }
    function showWaitForStudio() {
        showOverlay(jQuery("#init_studio"), {
            top: "150px"
        })
    }
    jQuery(window).resize(blockUICenterX);