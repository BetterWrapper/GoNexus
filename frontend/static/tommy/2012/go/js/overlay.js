    function grayOut(c, i, a) {
        if (i == undefined) {
            dataLayer.push({
                event: "ga-pageview-t1",
                path: "/pageTracker/ajax/overlay/demo/" + c
            })
        } else {
            if (i != "showPleaseWait" && i != "showAlertBox" && i != "showConfirmBox" && i != "showInputBox" && i != "showProgressBox") {
                if (i == "showEmailContact" && view_name == "go") {
                    dataLayer.push({
                        event: "ga-pageview-t1",
                        path: "/pageTracker/ajax/iframe/" + i + "/" + c
                    })
                } else {
                    dataLayer.push({
                        event: "ga-pageview-t1",
                        path: "/pageTracker/ajax/overlay/" + i + "/" + c
                    })
                }
            }
        }
        var j = document.getElementById("darkenScreenObject");
        var h = $("overlayObject");
        if (c) {
            if (document.body && (document.body.scrollWidth || document.body.scrollHeight)) {
                var l = document.body.scrollWidth + 30 + "px";
                var g = document.body.scrollHeight + 30 + "px"
            } else {
                if (document.body.offsetWidth) {
                    var l = document.body.offsetWidth + "px";
                    var g = document.body.offsetHeight + "px"
                } else {
                    var l = "100%";
                    var g = "100%"
                }
            }
            j.style.width = l;
            j.style.height = g;
            j.style.display = "block";
            h.style.display = "block";
            if (Prototype.Browser.IE) {
                var d = document.body.offsetWidth
            } else {
                var d = window.innerWidth
            }
            var e = 650;
            var k = (d - h.clientWidth) / 2;
            if (a == undefined) {
                h.style.left = k > 0 ? (k + "px") : "0px"
            } else {
                k += a;
                h.style.left = k > 0 ? (k + "px") : "0px"
            }
            var f = (e - h.clientHeight) / 2;
            h.style.top = f > 0 ? (f + "px") : "0px"
        } else {
            j.style.display = "none";
            h.style.display = "none";
            var b = h.innerHTML;
            h.innerHTML = "";
            h.innerHTML = b;
            window.onResize = ""
        }
    }
    function grayOut2(b, h) {
        var i = document.getElementById("darkenScreenObject");
        var g = $("overlayObject2");
        if (b) {
            if (document.body && (document.body.scrollWidth || document.body.scrollHeight)) {
                var k = document.body.scrollWidth + 30 + "px";
                var f = document.body.scrollHeight + 30 + "px"
            } else {
                if (document.body.offsetWidth) {
                    var k = document.body.offsetWidth + "px";
                    var f = document.body.offsetHeight + "px"
                } else {
                    var k = "100%";
                    var f = "100%"
                }
            }
            i.style.width = k;
            i.style.height = f;
            i.style.display = "block";
            g.style.display = "block";
            if (Prototype.Browser.IE) {
                var c = document.body.offsetWidth
            } else {
                var c = window.innerWidth
            }
            var d = 650;
            var j = (c - g.clientWidth) / 2;
            g.style.left = j > 0 ? (j + "px") : "0px";
            var e = (d - g.clientHeight) / 2;
            g.style.top = e > 0 ? (e + "px") : "0px"
        } else {
            i.style.display = "none";
            g.style.display = "none";
            var a = g.innerHTML;
            g.innerHTML = "";
            g.innerHTML = a;
            window.onResize = ""
        }
    }
    function grayOutPreview(c, i, a) {
        if (i == undefined) {
            dataLayer.push({
                event: "ga-pageview-t1",
                path: "/pageTracker/ajax/overlay/demo/" + c
            })
        } else {
            if (i != "showPleaseWait" && i != "showAlertBox" && i != "showConfirmBox" && i != "showInputBox" && i != "showProgressBox") {
                dataLayer.push({
                    event: "ga-pageview-t1",
                    path: "/pageTracker/ajax/overlay/" + i + "/" + c
                })
            }
        }
        var j = document.getElementById("darkenScreenObject");
        var h = $("overlayObjectPreview");
        if (c) {
            if (document.body && (document.body.scrollWidth || document.body.scrollHeight)) {
                var l = document.body.scrollWidth + 30 + "px";
                var g = document.body.scrollHeight + 30 + "px"
            } else {
                if (document.body.offsetWidth) {
                    var l = document.body.offsetWidth + "px";
                    var g = document.body.offsetHeight + "px"
                } else {
                    var l = "100%";
                    var g = "100%"
                }
            }
            j.style.width = l;
            j.style.height = g;
            j.style.display = "block";
            h.style.display = "block";
            if (Prototype.Browser.IE) {
                var d = document.body.offsetWidth
            } else {
                var d = window.innerWidth
            }
            var e = 650;
            var k = (d - h.clientWidth) / 2;
            if (a == undefined) {
                h.style.left = k > 0 ? (k + "px") : "0px"
            } else {
                k += a;
                h.style.left = k > 0 ? (k + "px") : "0px"
            }
            var f = (e - h.clientHeight) / 2;
            h.style.top = f > 0 ? (f + "px") : "0px"
        } else {
            j.style.display = "none";
            h.style.display = "none";
            var b = h.innerHTML;
            h.innerHTML = "";
            h.innerHTML = b;
            window.onResize = ""
        }
    }
    function grayOutGlobal(c, i, a) {
        if (i == undefined) {
            dataLayer.push({
                event: "ga-pageview-t1",
                path: "/pageTracker/ajax/overlay/demo/" + c
            })
        } else {
            if (i != "showPleaseWait" && i != "showAlertBox" && i != "showConfirmBox" && i != "showProgressBox" && i != "DoNotLog") {
                dataLayer.push({
                    event: "ga-pageview-t1",
                    path: "/pageTracker/ajax/overlay/" + i + "/" + c
                })
            }
        }
        var j = document.getElementById("darkenScreenObject");
        var h = $("overlayObjectGlobal");
        if (c) {
            if (document.body && (document.body.scrollWidth || document.body.scrollHeight)) {
                var l = document.body.scrollWidth + 30 + "px";
                var g = document.body.scrollHeight + 30 + "px"
            } else {
                if (document.body.offsetWidth) {
                    var l = document.body.offsetWidth + "px";
                    var g = document.body.offsetHeight + "px"
                } else {
                    var l = "100%";
                    var g = "100%"
                }
            }
            j.style.width = l;
            j.style.height = g;
            j.style.display = "block";
            h.style.display = "block";
            if (Prototype.Browser.IE) {
                var d = document.body.offsetWidth
            } else {
                var d = window.innerWidth
            }
            var e = 650;
            var k = (d - h.clientWidth) / 2;
            if (a == undefined) {
                h.style.left = k > 0 ? (k + "px") : "0px"
            } else {
                k += a;
                h.style.left = k > 0 ? (k + "px") : "0px"
            }
            var f = (e - h.clientHeight) / 2;
            h.style.top = f > 0 ? (f + "px") : "0px"
        } else {
            j.style.display = "none";
            h.style.display = "none";
            var b = h.innerHTML;
            h.innerHTML = "";
            h.innerHTML = b;
            window.onResize = ""
        }
    }
    function reloadNow(a) {
        var g = document.getElementById("darkenScreenObject");
        if (g && g.style.display != "none") {
            if (document.body && (document.body.scrollWidth || document.body.scrollHeight)) {
                var i = document.body.scrollWidth + 30 + "px";
                var e = document.body.scrollHeight + 30 + "px"
            } else {
                if (document.body.offsetWidth) {
                    var i = document.body.offsetWidth + "px";
                    var e = document.body.offsetHeight + "px"
                } else {
                    var i = "100%";
                    var e = "100%"
                }
            }
            g.style.width = i;
            g.style.height = e
        }
        var f = $("overlayObject");
        if (f && f.style.display != "none") {
            if (Prototype.Browser.IE) {
                var b = document.body.offsetWidth
            } else {
                var b = window.innerWidth
            }
            var c = 650;
            var h = (b - f.clientWidth) / 2;
            if (a == undefined) {
                f.style.left = h > 0 ? (h + "px") : "0px"
            } else {
                h += a;
                f.style.left = h > 0 ? (h + "px") : "0px"
            }
            var d = (c - f.clientHeight) / 2;
            f.style.top = d > 0 ? (d + "px") : "0px"
        }
    }
    function reloadNow2() {
        var e = document.getElementById("darkenScreenObject");
        if (e && e.style.display != "none") {
            if (document.body && (document.body.scrollWidth || document.body.scrollHeight)) {
                var c = document.body.scrollWidth + 30 + "px";
                var f = document.body.scrollHeight + 30 + "px"
            } else {
                if (document.body.offsetWidth) {
                    var c = document.body.offsetWidth + "px";
                    var f = document.body.offsetHeight + "px"
                } else {
                    var c = "100%";
                    var f = "100%"
                }
            }
            e.style.width = c;
            e.style.height = f
        }
        var d = $("overlayObject2");
        if (d.style.display != "none") {
            if (Prototype.Browser.IE) {
                var h = document.body.offsetWidth
            } else {
                var h = window.innerWidth
            }
            var g = 650;
            var b = (h - d.clientWidth) / 2;
            d.style.left = b > 0 ? (b + "px") : "0px";
            var a = (g - d.clientHeight) / 2;
            d.style.top = a > 0 ? (a + "px") : "0px"
        }
    }
    function reloadNowGlobal(a) {
        var g = document.getElementById("darkenScreenObject");
        if (g && g.style.display != "none") {
            if (document.body && (document.body.scrollWidth || document.body.scrollHeight)) {
                var i = document.body.scrollWidth + 30 + "px";
                var e = document.body.scrollHeight + 30 + "px"
            } else {
                if (document.body.offsetWidth) {
                    var i = document.body.offsetWidth + "px";
                    var e = document.body.offsetHeight + "px"
                } else {
                    var i = "100%";
                    var e = "100%"
                }
            }
            g.style.width = i;
            g.style.height = e
        }
        var f = $("overlayObjectGlobal");
        if (f && f.style.display != "none") {
            if (Prototype.Browser.IE) {
                var b = document.body.offsetWidth
            } else {
                var b = window.innerWidth
            }
            var c = 650;
            var h = (b - f.clientWidth) / 2;
            if (a == undefined) {
                f.style.left = h > 0 ? (h + "px") : "0px"
            } else {
                h += a;
                f.style.left = h > 0 ? (h + "px") : "0px"
            }
            var d = (c - f.clientHeight) / 2;
            f.style.top = d > 0 ? (d + "px") : "0px"
        }
    }
    var t;
    function countDown(b, a) {
        $("transferLink").href = "javascript:cancelTransfer();$('" + b + "').submit();";
        $("transfer_sec").innerHTML = a;
        a = a - 1;
        if (a >= 0) {
            t = setTimeout("countDown('" + b + "'," + a + ")", 1000)
        } else {
            $(b).submit()
        }
    }
    function cancelTransfer() {
        clearTimeout(t)
    }
    function hideObject(b) {
        var a = $("overlayObject" + b);
        a.style.display = "none"
    }
    function ssShowPreviewOverlay(c, d, b) {
        var a = currPos();
        b = a[1];
        $("overlaySSPreviewBoxTitle").innerHTML = (d === "" ? "&nbsp;" : d);
        $("overlaySSPreviewBox").style.display = "block";
        $("overlayObject").style.margin = b + "px 0px 0px 0px";
        jQuery("#ss-home-usethisbtn_button").click(function() {
            ssChooseTemplate(c, true)
        });
        jQuery("#ss-home-preview-demo").attr("src", "/static/" + view_name + "/tutorial/slideshow/demo_" + c + ".html");
        grayOut(true, "slideshow/previewdemo/" + c + "/true")
    }
    function showPreviewOverlay(b, c, a) {
        a -= 100;
        $("overlaySSPreviewBoxTitle").innerHTML = (c === "" ? "&nbsp;" : c);
        $("overlaySSPreviewBox").style.display = "block";
        $("overlayObject").style.margin = a + "px 0px 0px 0px";
        $("ss-home-usethisbtn-a").href = "javascript:ssChooseTemplate('" + b + "', true)";
        $("ss-home-preview-demo").src = "/static/" + view_name + "/tutorial/slideshow/demo_" + b + ".html";
        grayOut(true, "slideshow/previewdemo/" + b + "/true")
    }
    function showSoundTutorial() {
        grayOut(true, "studio/soundtutorial/true")
    }
    function ssHidePreviewOverlay() {
        grayOut(false, "slideshow/previewdemo/false");
        $("overlaySSPreviewBox").style.display = "none"
    }
    var emsg_overlay_url = "";
    function previewMovieOverlay(c, d, a) {
        previewMovie(c);
        if (a == "emessage") {
            $("emsg_link").show();
            emsg_overlay_url = "/go/studio/copyemessage/" + c
        } else {
            if (a == "cn") {
                $("msg_link").href = "javascript:hidePreviewMovieOverlay();showUpdatePhone(250,true);";
                $("phone_ch").value = c
            } else {
                $("emsg_link").hide()
            }
        }
        var b = currPos();
        $("overlayPreviewBoxTitle").innerHTML = (d === "" ? "&nbsp;" : d);
        $("overlayPreviewBox").style.display = "block";
        $("overlayObjectPreview").style.margin = b[1] + "px 0px 0px 0px";
        grayOutPreview(true, "movie/preview/" + c + "/true")
    }
    function gotoPreviewURL() {
        location.href = emsg_overlay_url
    }
    function hidePreviewMovieOverlay() {
        grayOutPreview(false, "movie/preview/false");
        $("overlayPreviewBox").style.display = "none"
    }
    function previewYouTubeOverlay(f, b, c, e) {
        var d = currPos();
        $("overlayObjectGlobal").style.width = "700px";
        $("overlayObjectGlobal").style.height = "530px";
        $("OG_title").innerHTML = (f === "" ? "&nbsp;" : f);
        $("overlayGeneral").style.margin = d[1] + "px 0px 0px 0px";
        $("overlayGeneral").style.display = "block";
        if (typeof c == "undefined") {
            $("tracker_id").innerHTML = "Cartoon_Software/youtube_demo"
        } else {
            $("tracker_id").innerHTML = c
        }
        grayOutGlobal(true, $("tracker_id").innerHTML);
        var a = '<div id="OG_content_child" style="padding:10px 10px 0;height:409px"></div>';
        if (typeof e == "undefined" || !e) {
            $("OG_content").innerHTML = a + '<div style="padding:10px 10px 0;width:680px;"><div class="centeredentity"><ul class="centeredentity_ul"><li class="centeredentity_ul_li"><div onclick="javascript:hideOG();showBizSignup(250);" onmouseout="javascript:buttonOut(this.id);" onmouseover="javascript:buttonOver(this.id, -40);" style="overflow: hidden; height: 40px; cursor: pointer; float: left;" id="youtube_signup_btn"><ol style="margin: 0px;"><li style="margin: 0pt; float: left; display: block; height: 80px;" id="youtube_signup_btnleft"><img width="10" height="80" onload="javascript:iePngFix(this, 10, 80);" src="/static/go/img/buttons/green/btn_green_80_left.png"/></li><li style="padding: 5px 5px 0px; background: transparent url(/static/go/img/buttons/green/btn_green_80_mid.gif) repeat-x scroll 0pt 0pt; float: left; display: block; height: 80px;" id="youtube_signup_btncenterinactive"><span style="color:white;font-size:20px;line-height:30px;vertical-align:top;font-weight:normal;">' + GT.gettext("Sign up now") + '</span></li><li style="padding: 5px 5px 0px; background: transparent url(/static/go/img/buttons/green/btn_green_80_mid.gif) repeat-x scroll 0pt -40px; float: left; display: none; height: 80px;" id="youtube_signup_btncenteractive"><span style="color:white;font-size:20px;line-height:30px;vertical-align:top;font-weight:normal;">' + GT.gettext("Sign up now") + '</span></li><li style="margin: 0pt; float: left; display: block; height: 80px;" id="youtube_signup_btnright"><img width="10" height="80" onload="javascript:iePngFix(this, 10, 80);" src="/static/go/img/buttons/green/btn_green_80_right.png"/></li></ol></div></li></ul></div></div>'
        } else {
            $("OG_content").innerHTML = a
        }
        jQuery("#OG_content_child").flash({
            id: "ga_demo_video",
            swf: b,
            height: 409,
            width: 680,
            allowFullScreen: "true",
            allowScriptAccess: "always",
            wmode: "transparent"
        })
    }
    function hideOG() {
        var a = $("tracker_id").innerHTML;
        grayOutGlobal(false, a);
        $("overlayObjectGlobal").style.width = "550px";
        $("OG_content").style.padding = "0px"
    }
    function showProcessing(c, b) {
        var a = currPos();
        a[1] += 150;
        $("overlayObjectGlobal").style.width = "700px";
        $("overlayObjectGlobal").style.height = "530px";
        $("OG_title").innerHTML = (c === "" ? "&nbsp;" : c);
        $("overlayGeneral").style.margin = a[1] + "px 0px 0px 0px";
        $("overlayGeneral").style.display = "block";
        $("OG_close_btn").style.display = "none";
        grayOutGlobal(true, "DoNotLog");
        $("OG_content").innerHTML = b
    }
    function hideProcessing() {
        grayOutGlobal(false, "DoNotLog");
        $("OG_content").innerHTML = ""
    }
    var overlayManager = (function() {
        var a = [];
        var b = false;
        function c() {
            if (a.length) {
                var d = a.shift();
                if (typeof d == "function") {
                    d.apply()
                } else {
                    jQuery.blockUI(d);
                    blockUICenterX()
                }
            }
        }
        return {
            append: function(d) {
                a.push(d)
            },
            prepend: function(d) {
                a.unshift(d)
            },
            start: function() {
                if (b) {
                    return
                }
                b = true;
                c()
            },
            next: function() {
                jQuery.unblockUI();
                if (a.length) {
                    setTimeout(c, 500)
                }
            }
        }
    }
    )();
    if (typeof jQuery == "function" && jQuery) {
        jQuery(document).ready(function() {
            overlayManager.start()
        })
    }
    ;