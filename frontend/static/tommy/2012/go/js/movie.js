    var URL_FLAG_MOVIE = "/ajax/flagMovie";
    var URL_DELETE_MOVIE = "/ajax/deleteMovie";
    var URL_DELETE_MOVIE_BY_TEACHER = "/ajax/deleteMovieByTeacher";
    var URL_UNDELETE_MOVIE = "/ajax/undeleteMovie";
    var URL_REJECT_MOVIE = "/ajax/rejectMovie";
    var URL_DELETE_FAVORITE = "/ajax/deleteFavorite";
    var URL_STAFFPICKS_MOVIE = "/ajax/addStaffpicksMovie";
    var URL_ADD_BEST_ANIMATION = "/ajax/addBestAnimation";
    var URL_ADD_FEATUED_ANIMATION = "/ajax/addFeaturedAnimation";
    var URL_SET_COPYABLE = "/ajax/setcopyable";
    var URL_SET_PUBLISHED = "/ajax/setpublished";
    var URL_SET_PRIVATE_SHARE = "/ajax/setprivateshare";
    var URL_SET_PRIVATE_SHARE_FOR_SCHOOL = "/ajax/setprivateshareforschool";
    var URL_SET_PUBLISHED_PSHARE = "/ajax/setpublishedpshare";
    var URL_CHECK_MOVIE_COPY = "/ajax/checkCopyMovie";
    var URL_CHECK_MOVIE_EDIT = "/ajax/checkEditMovie";
    var URL_RECOMMEND = "/ajax/movie_recommend";
    var URL_SET_TITLE_PREFIX = "/ajax/setMovieTitlePrefix";
    var _publishStatusHistory = new Array();
    var _pshareStatusHistory = new Array();
    function checkEditMovie(movie_id) {
        jQuery.post(URL_CHECK_MOVIE_EDIT + "/" + movie_id, function(response) {
            parseResponse(response);
            if (typeof responseArray.json.url != "undefined") {
                if (responseArray.json.url == "reload") {
                    window.location = window.location
                } else {
                    var _script;
                    if (_script = responseArray.json.url.match(/^javascript:(.*)$/)) {
                        eval(_script[1])
                    } else {
                        window.location = responseArray.json.url
                    }
                }
            } else {
                if (responseArray.code == "0") {
                    var html = responseArray.html;
                    if (view_name == "school") {
                        jQuery("#OG_title").html(GT.gettext("Recover Animation"));
                        jQuery("#OG_content").html(html);
                        showOG()
                    } else {
                        if (view_name == "go") {
                            var $html = $(html);
                            $html.appendTo("body").modal()
                        } else {
                            if (view_name == "ed") {
                                showOverlay($(html), {
                                    top: "110px",
                                    position: "absolute"
                                })
                            } else {
                                showHTMLBox(GT.gettext("Recover Animation"), 180, html, "autosave_dialog", undefined, true)
                            }
                        }
                    }
                    jQuery("#altime, #alatime").each(function() {
                        jQuery(this).html(autosaveTimeFormat(jQuery(this).html()))
                    })
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function autosaveTimeFormat(d) {
        var c = convertTime(d);
        var b = new Date(d * 1000);
        var a = b.getFullYear();
        var e = c.indexOf(a);
        if (e > 0) {
            c = c.replace(a, a + "<br/>")
        }
        return c
    }
    function convertTime(e) {
        var c = new Date(e * 1000);
        var a = c.toLocaleString();
        var f = c.getTimezoneOffset();
        var d = a.indexOf("(");
        if (d > 0) {
            a = a.substring(0, d)
        }
        if (a.indexOf("GMT") < 0) {
            var b = Math.abs(f / 60);
            if (b < 10) {
                b = "0" + b
            }
            b = b + "00";
            if (f > 0) {
                a = a + " GMT-" + b
            } else {
                a = a + " GMT+" + b
            }
        }
        return a
    }
    function flagMovie(a) {
        dataLayer.push({
            event: "ga-pageview-t1",
            path: "/pageTracker/ajax/flagMovie"
        });
        jQuery.post(URL_FLAG_MOVIE + "/" + a, function(b) {
            parseResponse(b);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + GT.gettext("Video flagged as inappropriate"))
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function deleteMovie(d, b, e, a) {
        if (b && e && a) {
            var f = jQuery("#" + e).html() - 0;
            var c = URL_DELETE_MOVIE + "/" + d + "/" + b + "/" + f
        } else {
            var c = URL_DELETE_MOVIE + "/" + d
        }
        jQuery.post(c, function(h) {
            parseResponse(h);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + GT.gettext("This video has successfully been moved to your trash."));
                    typeof addDelCount == "function" && addDelCount();
                    if (b && e && a) {
                        jQuery("#" + a).html(responseArray.html);
                        var g = jQuery.Event("delete");
                        g.hasNextPage = (responseArray.json.next_page == 1);
                        g.movieId = d;
                        jQuery("#" + a).trigger(g)
                    }
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function deleteMovieByTeacher(d, b, e, a) {
        var g = GT.gettext("You will not be able to watch this animation any more!");
        if (!confirm(g)) {
            return
        } else {
            if (b && e && a) {
                var f = $(e).innerHTML - 0;
                var c = URL_DELETE_MOVIE_BY_TEACHER + "/" + d + "/" + b + "/" + f
            } else {
                var c = URL_DELETE_MOVIE_BY_TEACHER + "/" + d
            }
            new Ajax.Request(c,{
                method: "post",
                onSuccess: function(j) {
                    var i = j.responseText;
                    parseResponse(i);
                    if (typeof responseArray.json.url != "undefined") {
                        window.location = responseArray.json.url
                    } else {
                        if (responseArray.code == "0") {
                            displayFeedback(responseArray.code + GT.gettext("Animation has been deleted"));
                            if (b && e && a) {
                                jQuery("#" + a).html(responseArray.html);
                                var h = jQuery.Event("delete");
                                h.hasNextPage = (responseArray.json.next_page == 1);
                                h.movieId = d;
                                jQuery("#" + a).trigger(h)
                            }
                        } else {
                            displayFeedback(responseArray.code + responseArray.json.error)
                        }
                    }
                    resetResponse()
                },
                onFailure: function() {
                    displayFeedback("1Error contacting the server")
                }
            })
        }
    }
    function undeleteMovie(d, b, e, a) {
        if (b && e && a) {
            var f = jQuery("#" + e).html() - 0;
            var c = URL_UNDELETE_MOVIE + "/" + d + "/" + b + "/" + f
        } else {
            var c = URL_UNDELETE_MOVIE + "/" + d
        }
        jQuery.post(c, function(h) {
            parseResponse(h);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + GT.gettext("This video has successfully been recovered."));
                    typeof addMvCount == "function" && addMvCount();
                    if (b && e && a) {
                        jQuery("#" + a).html(responseArray.html);
                        var g = jQuery.Event("delete");
                        g.hasNextPage = (responseArray.json.next_page == 1);
                        g.movieId = d;
                        jQuery("#" + a).trigger(g)
                    }
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function rejectMovie(b) {
        var c = "Are you sure you want to reject this video?";
        if (!confirm(c)) {
            return
        }
        var a = URL_REJECT_MOVIE + "/" + b;
        jQuery.post(a, function(d) {
            parseResponse(d);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + "Video has been rejected")
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function deleteFavorite(d, a, e, c) {
        var g = GT.gettext("Are you sure you want to remove this video from your favorite list?");
        if (!confirm(g)) {
            return
        }
        var f = jQuery("#" + e).html() - 0;
        var b = URL_DELETE_FAVORITE + "/" + d + "/" + a + "/" + f;
        jQuery.post(b, function(h) {
            parseResponse(h);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + GT.gettext("Video has been removed from your recommendations"));
                    jQuery("#" + c).html(responseArray.html)
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function copyMovie(b, a) {
        var c = "This movie was not created on this site.\nAre you sure to copy it to this site?";
        if (confirm(c)) {
            checkCopyMovie(b, a)
        }
    }
    function editMovie(a) {
        var b = "To edit this movie, you are about to leave this site.\nDo you want to continue?";
        if (confirm(b)) {
            location.href = a
        }
    }
    function staffpicksMovie(a) {
        var b = "Are you sure to Staffpicks this video?";
        if (!confirm(b)) {
            return
        }
        jQuery.post(URL_STAFFPICKS_MOVIE + "/" + a, function(c) {
            parseResponse(c);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + "The video has been added to Staffpicks")
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function addBestAnimation(a) {
        var b = "Are you sure to add this video as one of the best animations?";
        if (!confirm(b)) {
            return
        }
        jQuery.post(URL_ADD_BEST_ANIMATION + "/" + a, function(c) {
            parseResponse(c);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + "The video is one of the best animations now")
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function featureAnimation(a) {
        var b = "Are you sure to feature this video?";
        if (!confirm(b)) {
            return
        }
        jQuery.post(URL_ADD_FEATUED_ANIMATION + "/" + a, function(c) {
            parseResponse(c);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + "The video has been added as featured animation")
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function registerMoviePublishStatusHistory(b, a) {
        _publishStatusHistory[b] = a
    }
    function getMoviePublishStatusHistory(a) {
        if (!_publishStatusHistory[a]) {
            return null
        }
        return _publishStatusHistory[a]
    }
    function registerMoviePshareStatusHistory(b, a) {
        _pshareStatusHistory[b] = a
    }
    function getMoviePshareStatusHistory(a) {
        if (!_pshareStatusHistory[a]) {
            return null
        }
        return _pshareStatusHistory[a]
    }
    function updateMovieStatus(f, h, g, e, b, d, a) {
        dataLayer.push({
            event: "ga-pageview-t1",
            path: "/pageTracker/ajax/" + f + "/" + b
        });
        var c;
        switch (f) {
        case "copy":
            c = URL_SET_COPYABLE + "/" + e + "/" + b;
            break;
        case "publish":
            c = URL_SET_PUBLISHED + "/" + e + "/" + b;
            break;
        case "pshare":
            c = URL_SET_PRIVATE_SHARE + "/" + e + "/" + b;
            break;
        case "pshareteacher":
            c = URL_SET_PRIVATE_SHARE_FOR_SCHOOL + "/" + e + "/" + b;
            break;
        case "publishpshare":
            c = URL_SET_PUBLISHED_PSHARE + "/" + e + "/" + b;
            break
        }
        new Ajax.Request(c,{
            method: "post",
            onSuccess: function(l) {
                var i = l.responseText;
                parseResponse(i);
                if (typeof responseArray.json.url != "undefined") {
                    window.location = responseArray.json.url
                } else {
                    if (responseArray.code == "0") {
                        if ($("movie_thumb_" + e)) {
                            $("movie_thumb_" + e).src = "/static/go/img/v2/" + d + "_overlay.gif"
                        } else {
                            if (f != "copy" && $("animation_" + e)) {
                                var k = jQuery("#animation_" + e);
                                var j = ["public", "private", "draft", "processing", "hidden"].filter(function(n, m, o) {
                                    return k.hasClass(n)
                                })[0];
                                k.trigger("updateMovieStatus", [j, d])
                            }
                        }
                        if ($(h)) {
                            $(h).show()
                        }
                        if ($(g)) {
                            $(g).hide()
                        }
                        if (f == "pshare") {
                            registerMoviePshareStatusHistory(e, b);
                            if (b == "1") {
                                if ($(a)) {
                                    $(a).triggerPshareStatusChange(e, true)
                                }
                            } else {
                                if ($(a)) {
                                    $(a).triggerPshareStatusChange(e, false)
                                }
                            }
                        }
                        if (f == "publish") {
                            registerMoviePublishStatusHistory(e, b);
                            if (b == "1") {
                                if ($(a)) {
                                    $(a).triggerPublishStatusChange(e, true)
                                }
                            } else {
                                if ($(a)) {
                                    $(a).triggerPublishStatusChange(e, false)
                                }
                            }
                        }
                        if (f == "publishpshare") {
                            registerMoviePshareStatusHistory(e, b);
                            registerMoviePublishStatusHistory(e, b);
                            if (b == "1") {
                                if ($(a)) {
                                    $(a).triggerPshareStatusChange(e, false);
                                    $(a).triggerPublishStatusChange(e, true)
                                }
                            } else {
                                if ($(a)) {
                                    $(a).triggerPublishStatusChange(e, false);
                                    $(a).triggerPshareStatusChange(e, true)
                                }
                            }
                        }
                    } else {
                        displayFeedback(responseArray.code + responseArray.json.error)
                    }
                }
                resetResponse()
            },
            onFailure: function() {
                displayFeedback("1Error contacting the server")
            }
        })
    }
    function updatePrivateSharing(a, b, c) {
        if (c) {
            jQuery("#" + c).toggle(!a)
        }
        if (b) {
            jQuery("#" + b).toggle(!!a)
        }
    }
    function setPrivateSharing(a) {
        is_private_sharing = a;
        return
    }
    function checkCopyMovie(b, a) {
        jQuery.post(URL_CHECK_MOVIE_COPY + "/" + a, function(c) {
            parseResponse(c);
            if (responseArray.json.free == "true") {
                location.href = b
            } else {
                var d = GT.gettext("This animation contains premium character(s)\nThe cost to copy this movie is:\n");
                if (responseArray.json.money_points > 0 && responseArray.json.sharing_points > 0) {
                    d = d + responseArray.json.money_points + " GoBucks and " + responseArray.json.sharing_points + " GoPoints."
                } else {
                    if (responseArray.json.money_points > 0) {
                        d = d + responseArray.json.money_points + " GoBucks."
                    } else {
                        if (responseArray.json.sharing_points > 0) {
                            d = d + responseArray.json.sharing_points + " GoPoints."
                        }
                    }
                }
                if (responseArray.json.notenoughpoints == "true") {
                    d = d + "\n\n" + GT.gettext("You do not have sufficient points to copy this animation.");
                    alert(d)
                } else {
                    d = d + "\n\n" + GT.gettext("Would you like to buy it?");
                    if (confirm(d)) {
                        location.href = b
                    }
                }
            }
            resetResponse()
        })
    }
    function toggleGigya() {
        jQuery("#divWildfirePost").toggle()
    }
    function toggleUserStats() {
        showHideContent("1");
        $("toggleLink").writeAttribute("expanded", 1 - ($("toggleLink").readAttribute("expanded") || "0"));
        if ($("toggleLink").readAttribute("expanded") == "1") {
            $("toggleLink").innerHTML = GT.gettext("minimize");
            $("short_description").hide();
            $("join_date").style.display = "block";
            $("userstats").style.height = "55px"
        } else {
            $("toggleLink").innerHTML = GT.gettext("more");
            $("join_date").style.display = "none";
            $("short_description").show();
            $("userstats").style.height = "27px"
        }
    }
    function handleFacebookLike(a) {
        dataLayer.push({
            event: "ga-pageview-t1",
            path: "/pageTracker/ajax/fbLike"
        });
        jQuery("#recommend_button").trigger("click")
    }
    function recommendMovie(a) {
        dataLayer.push({
            event: "ga-pageview-t1",
            path: "/pageTracker/ajax/favoriteMovie"
        });
        jQuery.post(URL_RECOMMEND, {
            movie_id: a
        }, function(b) {
            parseResponse(b);
            if (responseArray.code == 0) {
                jQuery("#recommended_button, #recommend_button").remove();
                jQuery("#recommend_button_div").prepend(responseArray.html);
                displayFeedback("0" + responseArray.json.message)
            } else {
                displayFeedback("1" + responseArray.error)
            }
            resetResponse()
        })
    }
    function handleFacebookShare(b, a) {
        FB.ui({
            method: "share",
            href: b
        })
    }
    function getMovieFBMLShareOverlay(a) {
        if (!jQuery("#movie_fbml_share_overlay").length) {
            jQuery.get("/ajax/getMovieFBMLShareOverlay/" + a, function(b) {
                parseResponse(b);
                if (responseArray.code == "0") {
                    document.getElementById("offer_container").innerHTML = responseArray.html;
                    FB.XFBML.parse(document.getElementById("movie_fbml_share_overlay"));
                    showOfferOverlay(jQuery("#movie_fbml_share_overlay"))
                } else {
                    displayFeedback("1" + responseArray.error)
                }
            })
        } else {
            FB.XFBML.parse(document.getElementById("movie_fbml_share_overlay"));
            showOfferOverlay(jQuery("#movie_fbml_share_overlay"))
        }
    }
    function getMovieYoutubeExportOverlay(a, b) {
        b = (!b) ? "0" : "1";
        jQuery.get("/ajax/getMovieYoutubeExportOverlay/" + a + "/" + b, function(c) {
            parseResponse(c);
            if (responseArray.code == "0") {
                var d = jQuery("#movie_youtube_export_overlay");
                if (d.length) {
                    d.replaceWith(responseArray.html)
                } else {
                    jQuery("body").append(responseArray.html);
                    jQuery("#youtube_export_public,#youtube_export_private").live("click", function() {
                        window.open(jQuery(this).attr("href"), "_ga_youtube_export", "toolbar=no,status=no,height=500,width=960")
                    })
                }
                showOfferOverlay(jQuery("#movie_youtube_export_overlay"))
            } else {
                displayFeedback("1" + responseArray.json.error)
            }
        })
    }
    function embedMovieInfo(a) {
        jQuery.post("/ajax/getMovieEmbedInfo/" + a, function(b) {
            showOverlay(b, {
                top: "200px"
            })
        })
    }
    function setMovieTitlePrefix(b) {
        if (typeof MOVIE_TITLE === "undefined" || typeof MOVIE_USERNAME === "undefined" || typeof MOVIE_TITLE_PREFIX === "undefined") {
            return false
        }
        var e = MOVIE_TITLE + " - " + MOVIE_USERNAME;
        var d = MOVIE_TITLE_PREFIX;
        var c = prompt("Enter title prefix for this movie", d);
        if (c != null && c != d) {
            var a = URL_SET_TITLE_PREFIX + "/" + b;
            jQuery.post(a, {
                prefix: c
            }, function(f) {
                parseResponse(f);
                if (responseArray.code == "0") {
                    displayFeedback(responseArray.code + "Title prefix has been updated.");
                    MOVIE_TITLE_PREFIX = c;
                    document.title = (c != "") ? c + " - " + e : e
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
                resetResponse()
            })
        }
    }
    ;