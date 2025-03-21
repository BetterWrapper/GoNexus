    var URL_UPDATE_GROUP_NAME = "/ajax/updateGroupName";
    var URL_UPDATE_GROUP_STATUS = "/ajax/updateGroupStatus";
    var URL_MANAGE_GROUP = "/ajax/manageGroup";
    var URL_MANAGE_GROUP_USERS = "/ajax/manageGroupUsers";
    var URL_COPY_GROUP = "/ajax/copyGroup";
    function updateGroupStatus(a, b) {
        var c = {
            status: a,
            group_id: b,
            current_member: jQuery("#active_groups").val()
        };
        jQuery.post(URL_UPDATE_GROUP_STATUS, c, function(d) {
            parseResponse(d);
            if (responseArray.code == 0) {
                jQuery("#manage_groups_block").html(responseArray.html);
                displayFeedback(responseArray.code + GT.gettext("Group updated successfully"))
            } else {
                if (responseArray.code == 1) {
                    displayFeedback(responseArray.code + GT.gettext("Update failed"))
                }
            }
        })
    }
    function toggleBlock(b, a) {
        jQuery(a).hide();
        jQuery(b).show()
    }
    function resetDefaultPermission() {
        var a = {
            group_id: jQuery("#group_id").val()
        };
        jQuery.post(URL_UPDATE_GROUP_DEF_PERMISSION, a, function(b) {
            parseResponse(b);
            if (responseArray.code == 0) {
                jQuery("#ani_permission").val("moderated");
                jQuery("#com_permission").val("active_no_moderation");
                jQuery("#rating_permission").val("active");
                jQuery("#student_embed_permission").val("disallow");
                displayFeedback(responseArray.code + GT.gettext("Reset to default"))
            } else {
                if (responseArray.code == 1) {
                    displayFeedback(responseArray.code + GT.gettext("Reset failed"))
                }
            }
        })
    }
    function manageGroupUsers() {
        var a = jQuery("#group_id").val();
        var b = [];
        jQuery('input["students"]:checked').each(function() {
            b.push(jQuery(this).val())
        });
        jQuery.post(URL_MANAGE_GROUP_USERS, "group_id=" + a + "&users=" + b, function(c) {
            if (c.error) {
                displayFeedback("1" + GT.gettext("Failed"));
                return
            }
            var d = c.student_added;
            var f = c.student_removed;
            var g = jQuery("#students_in_class .group_member_selection_block");
            var e = jQuery("#students_not_in_class .group_member_selection_block");
            jQuery.each(d, function(h, j) {
                jQuery("#group_" + j).parent().appendTo(g)
            });
            jQuery.each(f, function(h, j) {
                jQuery("#group_" + j).parent().appendTo(e)
            });
            jQuery("#numStudents").html(jQuery("#students_in_class .account_entry").length);
            displayFeedback("0" + GT.gettext("Student Manage Group is updated"))
        }, "json")
    }
    function manageGroup(a) {
        var b = {
            group_id: jQuery("#group_id").val(),
            user_id: jQuery(a).val(),
            action: jQuery(a).is(":checked")
        };
        jQuery.post(URL_MANAGE_GROUP, b, function(c) {
            parseResponse(c);
            if (responseArray.code == 0) {
                jQuery("#students_in_class .group_member_selection_block");
                jQuery("#numStudents").html(responseArray.json.numStudents);
                displayFeedback(responseArray.code + GT.gettext("Student Manage Group is updated"))
            } else {
                if (responseArray.code == 1) {
                    displayFeedback(responseArray.code + GT.gettext("Failed"))
                }
            }
            if (action == false) {
                jQuery("#school_" + user_id).removeAttr("checked")
            }
        })
    }
    function formReset(a) {
        jQuery("#" + a).each(function() {
            this.reset()
        })
    }
    function copyGroup(a) {
        var b = {
            group_id: a
        };
        jQuery.post(URL_COPY_GROUP, b, function(d) {
            var c = d.teacher_groups;
            if (c) {
                $("#teacher_groups_body").html("");
                $("#group-block-template").tmpl(c).appendTo("#teacher_groups_body");
                $(".popover-dismiss").popover({});
                $(".group-status-active .count").text(parseInt($(".group-status-active .count").text()) + 1);
                showNotice(GT.gettext("Group copied successfully"))
            } else {
                showNotice(GT.gettext("Failed to copy group"), true)
            }
        }, "json")
    }
    function getGroup(a, b, c) {
        jQuery.get("/ajax/getGroup/" + a + "/" + b + "/" + c, function(d) {
            if (d.error) {
                return
            }
            jQuery("#group-content").remove();
            jQuery("body").append(d.html);
            jQuery("#group-content").modal({
                show: true
            });
            toggleBlock("#students_not_in_class", "#students_in_class");
            jQuery("#add_students").addClass("on");
            jQuery("#members").removeClass("on")
        }, "json")
    }
    function joinGroup() {
        var a = $("#group_code").val();
        if ($.trim(a).length == 0) {
            showNotice("Please enter a group code.", true);
            $("#group_code").focus();
            return
        }
        var b = {
            group_id: a
        };
        $.post("/ajax/joinGroupByGroupCode", b, function(c) {
            if (c.error) {
                showNotice(c.error, true);
                return
            }
            showNotice("You have new joined the group: " + c.group_name)
        }, "json")
    }
    function getGroupCode(a) {
        $("#groupCodeWindow").modal({
            show: true
        })
    }
    function searchUsers(c, b, a) {
        jQuery.post("/ajax/browseGroupPages/" + a + "/" + b + "/0/" + c, function(d) {
            parseResponse(d);
            if (responseArray.code == "0") {
                jQuery("#" + c).html(responseArray.html);
                if (c == "selected") {
                    jQuery("#students_in_class .on").removeClass("on");
                    jQuery("#students_in_class #" + b).addClass("on")
                } else {
                    jQuery("#students_not_in_class .on").removeClass("on");
                    jQuery("#students_not_in_class #" + b).addClass("on")
                }
            } else {
                displayFeedback(responseArray.code + responseArray.json.error)
            }
            resetResponse()
        })
    }
    function saveGroup(a) {
        a.attr("action", "/ajax/saveGroup");
        return true;
        var b = {};
        b.group_name = a.find('input[name="group_name"]').val();
        b.group_desc = a.find('[name="group_desc"]').val();
        b.group_id = a.find('input[name="group_id"]').val();
        b.animation_permission = a.find('input[name="animation_permission"]').is(":checked");
        b.comments_allow = a.find('input[name="comments_allow"]').is(":checked");
        b.comments_permission = a.find('input[name="comments_permission"]').is(":checked");
        b.group_admin = a.find('input[name="group_admin"]').val();
        b.ct = a.find('input[name="ct"]').val();
        a.find("input, select, textarea").prop("disabled", true);
        jQuery.post("/ajax/saveGroup", b, function(c) {
            if (c.error) {
                displayFeedback("1" + c.error);
                jQuery("#group-content").modal("hide");
                return
            }
            if (c["new"]) {
                displayFeedback("0New group is created")
            } else {
                displayFeedback("0Group settings are updated")
            }
            if ($("body.page-action-manage_groups").length) {
                curr_status = "active";
                if ($(".manage-nav .active")) {
                    curr_status = $(".manage-nav .active").data("group-status-filter")
                }
                manageGroupsList("status=" + curr_status)
            } else {
                if ($("body.page-action-group").length) {
                    $(".top-profile-container").find(".header").text(b.name).end().find(".desc").text(b.description).end()
                }
            }
            jQuery("#group-content").modal("hide")
        }, "json")
    }
    var student_action_array = {};
    function updateStudent(b) {
        var a = jQuery(b).val();
        var c = jQuery(b).is(":checked");
        if (c == false) {
            jQuery("#students_not_in_class .group_member_selection_block #group_" + a).removeAttr("checked");
            numStudents = parseInt(jQuery("#numStudents").html().replace(/[^0-9$.,]/g, ""), 10) - 1;
            jQuery("#students_in_class .group_member_selection_block #group_" + a).parent().parent().remove()
        } else {
            numStudents = parseInt(jQuery("#numStudents").html().replace(/[^0-9$.,]/g, ""), 10) + 1;
            jQuery(b).parent().parent().clone().appendTo("#students_in_class .group_member_selection_block");
            jQuery(".select_block_text").hide()
        }
        student_action_array[a] = c;
        if (numStudents < 2) {
            jQuery("#numStudents").html("Member (" + numStudents + ")")
        } else {
            jQuery("#numStudents").html("Members (" + numStudents + ")")
        }
        if (parseInt(jQuery("#numStudents").html(), 10) < 1) {
            jQuery(".select_block_text").show()
        }
    }
    function firstGroupOverlay() {
        showOverlay(jQuery("#message_overlay"))
    }
    function manageGroupsList(a) {
        jQuery.post("/ajax/manageGroupsList", a, function(d) {
            var c = d.teacher_groups;
            if (c === null || c.length === 0) {
                var e = document.createElement("tr")
                  , b = document.createElement("td")
                  , f = document.createElement("p");
                f.setAttribute("class", "text-center");
                f.appendChild(document.createTextNode("No groups found"));
                b.appendChild(f);
                e.appendChild(b);
                $("#teacher_groups_body").html(e)
            } else {
                $("#teacher_groups_body").html("");
                $("#group-block-template").tmpl(c).appendTo("#teacher_groups_body");
                $(".popover-dismiss").popover({})
            }
        }, "json")
    }
    function manageGroupStatus(b, a) {
        data = {
            group_id: b,
            status: a
        };
        jQuery.post("/ajax/manageGroupStatus", data, function(c) {
            if (c.suc) {
                curr_status = a;
                if ($(".manage-nav .active")) {
                    curr_status = $(".manage-nav .active").data("group-status-filter")
                }
                manageGroupsList("status=" + curr_status);
                if ($(".manage-nav li[data-group-status-filter]").length) {
                    var d = 0;
                    if ("string" == typeof b) {
                        d = 1
                    } else {
                        d = b.length
                    }
                    switch (a) {
                    case "active":
                        $(".manage-nav li.group-status-disabled[data-group-status-filter] .count").text(parseInt($(".manage-nav li.group-status-disabled[data-group-status-filter] .count").text(), 10) - d);
                        $(".manage-nav li.group-status-active[data-group-status-filter] .count").text(parseInt($(".manage-nav li.group-status-active[data-group-status-filter] .count").text(), 10) + d);
                        break;
                    case "disabled":
                        $(".manage-nav li.group-status-active[data-group-status-filter] .count").text(parseInt($(".manage-nav li.group-status-active[data-group-status-filter] .count").text(), 10) - d);
                        $(".manage-nav li.group-status-disabled[data-group-status-filter] .count").text(parseInt($(".manage-nav li.group-status-disabled[data-group-status-filter] .count").text(), 10) + d);
                        break
                    }
                }
            } else {
                displayFeedback("1Cannot update group status.")
            }
        }, "json")
    }
    function manageGroupMember(b, a, c) {
        data = {
            group_id: b,
            member_list: a,
            act: c
        };
        jQuery.post("/ajax/manageGroupMember", data, function(d) {
            if (d.suc) {
                if ($("body.page-action-group").length && $(".top-profile-container .content-count").length) {
                    $(".top-profile-container .content-count").text(d.count)
                }
                manageGroupMembersList({
                    group_id: b
                })
            } else {
                displayFeedback("1" + d.err)
            }
        }, "json")
    }
    function manageGroupMembersList(a) {
        jQuery.post("/ajax/manageGroupMembersList", a, function(b) {
            jQuery("#manage_group_members_block").html(b)
        })
    }
    function manageGroupAddMembersList(a) {
        jQuery.post("/ajax/manageGroupAddMembersList", a, function(b) {
            jQuery("#add-member-panel-search-result").html(b)
        })
    }
    ;