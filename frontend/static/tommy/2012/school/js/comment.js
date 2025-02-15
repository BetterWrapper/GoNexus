    var URL_POST_COMMENT = "/ajax/postComment";
    var URL_POST_MULTI_COMMENT = "/ajax/postMultiComment";
    var URL_DELETE_COMMENT = "/ajax/deleteComment";
    var URL_MULTI_DELETE_COMMENT = "/ajax/deleteMultiComment";
    function postComment(e, d, f) {
        var b = jQuery("#" + e);
        var c = b.find("[name=subject]")
          , a = b.find("[name=comment_content]");
        if (c.length > 0 && c.val() == "") {
            displayFeedback("2" + GT.gettext("Please enter your subject"));
            return
        }
        if (a.val() == "") {
            displayFeedback("3" + GT.gettext("Please enter your message"));
            return
        }
        ga("send", "pageview", "/pageTracker/ajax/comment/postComment");
        jQuery.post(URL_POST_COMMENT, b.serialize(), function(g) {
            postCommentComplete(g, e, d, f)
        }, "json");
        b.form("disable");
        jQuery("#comment_overlay").modal("hide")
    }
    function postCommentComplete(b, d, c, e) {
        var a = jQuery("#" + d);
        a.form("enable");
        if (b.code == "0") {
            ga("send", "pageview", "/pageTracker/ajax/comment/postComplete");
            displayFeedback("0Message Sent");
            if (c == "append" || c == "prepend") {
                displayComment(b.htmloutput, c, e)
            }
            document.saveCommentForm.comment_content.disabled = "disabled";
            if (typeof document.saveCommentForm.Post != "undefined") {
                if (typeof document.saveCommentForm.Post.disabled == "function") {
                    document.saveCommentForm.Post.disabled("disabled")
                } else {
                    document.saveCommentForm.Post.disabled = "disabled"
                }
            }
            a.form("reset")
        } else {
            displayFeedback("1" + b.error)
        }
    }
    function postMultiCommentComplete(c, b, a, d) {
        parseResponse(c);
        $(b).form("enable");
        switch (responseArray.code) {
        case "0":
            responseArray.json.error = GT.gettext("Message Sent");
            displayFeedback(responseArray.code + responseArray.json.error);
            jQuery("#comments").html(responseArray.html);
            $(b).form("reset");
            break;
        default:
            displayFeedback(responseArray.code + responseArray.json.error);
            break
        }
        resetResponse()
    }
    function displayComment(a, b, c) {
        if (b == "prepend") {
            jQuery("#" + c).prepend(a)
        } else {
            jQuery("#" + c).append(a)
        }
    }
    function deleteComment(c, a, b) {
        var d = GT.gettext("Are you sure to delete this Comment/Post?");
        if (!confirm(d)) {
            return
        }
        jQuery.post(URL_DELETE_COMMENT + "/" + c + "/" + b, function(e) {
            parseResponse(e);
            if (typeof responseArray.json.url != "undefined") {
                window.location = responseArray.json.url
            } else {
                if (responseArray.code == "0") {
                    jQuery("#" + a).fadeOut(300, function() {
                        jQuery(this).remove()
                    });
                    displayFeedback("0" + GT.gettext("Comment has been deleted"))
                } else {
                    displayFeedback(responseArray.code + responseArray.json.error)
                }
            }
            resetResponse()
        })
    }
    function deleteMultiComment(c, a, b) {
        var d = GT.gettext("Are you sure to delete this Comment/Post?");
        if (!confirm(d)) {
            return
        } else {
            jQuery.post(URL_MULTI_DELETE_COMMENT + "/" + c + "/" + b, function(e) {
                if (e.error) {
                    displayFeedback("1" + e.error);
                    return
                }
                if (e.html) {
                    displayFeedback("0" + GT.gettext("Comment has been deleted"));
                    jQuery("#comments").html(e.html)
                } else {
                    displayFeedback("Success!")
                }
            }, "json")
        }
        resetResponse()
    }
    function getMessageOverlay() {
        jQuery.get("/ajax/getMessageOverlay", function(a) {
            if (a.error) {
                return
            }
            jQuery("#message_overlay").remove();
            jQuery("body").append(a.html);
            jQuery("#message_overlay").modal({
                show: true
            })
        }, "json")
    }
    function getCommentOverlay(b, a) {
        jQuery.post("/ajax/getCommentOverlay", {
            type: b,
            entity_id: a
        }, function(c) {
            if (c.error) {
                return
            }
            jQuery("#comment_overlay").remove();
            jQuery("body").append(c.html);
            jQuery("#comment_overlay").modal({
                show: true
            })
        }, "json")
    }
    function lookup(a) {
        if (a.length == 0) {
            jQuery("#suggestions").fadeOut()
        } else {
            jQuery.get("/ajax/messengerLookUp/" + a, function(b) {
                jQuery("#suggestions").fadeIn();
                jQuery("#suggestions").html(b)
            })
        }
    }
    function addToList(c, b, a) {
        jQuery("input[type=text][name=receipient]").val(b);
        jQuery("input[type=text][name=receipient]").addClass("chosen");
        jQuery("input[type=hidden][name=receipient_id]").val(c);
        jQuery("input[type=hidden][name=receipient_type]").val(a);
        jQuery("#searchresults").hide()
    }
    function enableTextbox() {
        jQuery("input[type=text][name=receipient]").removeClass("chosen");
        jQuery("#searchresults").show()
    }
    function sendMessage() {
        var e = "searchform";
        var b = jQuery("input[type=text][name=recipient]").val();
        var a = jQuery("#searchform input[name=ct]").val();
        var c = jQuery("#textarea").val();
        var d = "redirect";
        if (b == "") {
            displayFeedback("2" + GT.gettext("Please choose receipient"));
            return
        }
        if (c == "") {
            displayFeedback("3" + GT.gettext("Please enter your message"));
            return
        }
        jQuery.post(URL_POST_MULTI_COMMENT, {
            comment_content: c,
            re_array: b,
            post: "post",
            is_private: "1",
            ct: a
        }, function(f) {
            $(e).form("enable");
            if (f.code == 0) {
                displayFeedback("0Message Sent");
                $(e).form("reset");
                jQuery("#message_overlay").modal("hide")
            } else {
                displayFeedback("1" + f.error)
            }
        }, "json")
    }
    ;