    var URL_TEACHERS_IN_SCHOOL = "/ajax/allTeachers";
    var URL_STUDENTS_IN_SCHOOL = "/ajax/allStudents";
    var URL_MANAGE_ACCOUNTS = "/ajax/manageAccList";
    var URL_GET_MOVIELIST = "/ajax/getMovieList";
    var URL_GET_COMMENTS = "/ajax/getComments";
    var URL_GET_FEEDS = "/ajax/getFeeds";
    var URL_GALLERY = "/ajax/topScoredMovies";
    var URL_ADMIN_FIND_USER = "/ajax/adminFindSchoolUsers";
    var URL_GET_GROUP = "/ajax/browseGroupPages";
    function goPreviousPage(e, j, h, i, d, c, f, a) {
        i = Math.max(0, i - 1);
        var b;
        var g = "/" + e + "/" + j + "/" + h + "/" + i + "/" + d;
        switch (j) {
        case "allTeachers":
            b = URL_TEACHERS_IN_SCHOOL + g;
            break;
        case "allStudents":
            b = URL_STUDENTS_IN_SCHOOL + g + "/" + f + "/" + a;
            break;
        case "manageStudents":
            b = URL_MANAGE_ACCOUNTS + g + "/student";
            break;
        case "manageTeachers":
            b = URL_MANAGE_ACCOUNTS + g + "/teacher";
            break;
        case "teacherview_movielist":
            b = URL_GET_MOVIELIST + "/" + c + "/" + e + "/" + j + "/" + h + "/" + i;
            break;
        case "public_movielist":
            b = URL_GET_MOVIELIST + "/" + c + "/" + e + "/" + j + "/" + h + "/" + i;
            break;
        case "movie_comment":
        case "movie_comment_public":
            b = URL_GET_COMMENTS + "/" + c + "/" + e + "/" + j + "/" + h + "/" + i + "/movie";
            break;
        case "user_comment":
            b = URL_GET_COMMENTS + "/" + c + "/" + e + "/" + j + "/" + h + "/" + i;
            break;
        case "user_comment_public":
            b = URL_GET_COMMENTS + "/" + c + "/" + e + "/" + j + "/" + h + "/" + i;
            break;
        case "gallery":
            b = URL_GALLERY + "/" + d + "/" + i;
            break;
        case "getGroup":
            b = URL_GET_GROUP + "/" + c + "/" + d + "/" + i;
            break;
        case "adminFindUser":
            b = URL_ADMIN_FIND_USER + "/" + c + "/" + i;
            break
        }
        jQuery.post(b, function(k) {
            pagingComplete(k, e, i)
        })
    }
    function goNextPage(f, k, i, j, d, c, g, a, l, e) {
        j = Math.max(0, j + 1);
        var b;
        var h = "/" + f + "/" + k + "/" + i + "/" + j + "/" + d;
        switch (k) {
        case "allTeachers":
            b = URL_TEACHERS_IN_SCHOOL + h;
            break;
        case "allStudents":
            b = URL_STUDENTS_IN_SCHOOL + h + "/" + g + "/" + a;
            break;
        case "manageStudents":
            b = URL_MANAGE_ACCOUNTS + h + "/student";
            break;
        case "manageTeachers":
            b = URL_MANAGE_ACCOUNTS + h + "/teacher";
            break;
        case "teacherview_movielist":
            b = URL_GET_MOVIELIST + "/" + c + "/" + f + "/" + k + "/" + i + "/" + j;
            break;
        case "public_movielist":
            b = URL_GET_MOVIELIST + "/" + c + "/" + f + "/" + k + "/" + i + "/" + j;
            break;
        case "movie_comment":
        case "movie_comment_public":
            b = URL_GET_COMMENTS + "/" + c + "/" + f + "/" + k + "/" + i + "/" + j + "/movie";
            break;
        case "user_comment":
            b = URL_GET_COMMENTS + "/" + c + "/" + f + "/" + k + "/" + i + "/" + j;
            break;
        case "user_comment_public":
            b = URL_GET_COMMENTS + "/" + c + "/" + f + "/" + k + "/" + i + "/" + j;
            break;
        case "get_feeds":
            if (jQuery("#group_filter").val() != undefined) {
                a = jQuery("#group_filter").val()
            } else {
                a = "all"
            }
            if (e == undefined) {
                e = "feed_wide"
            } else {
                if (e == "feed_public") {
                    e = "feed_public"
                }
            }
            b = URL_GET_FEEDS + "/" + f + "/" + l + "/" + i + "/" + j + "/" + c + "/" + a + "/" + e;
            break;
        case "gallery":
            b = URL_GALLERY + "/" + d + "/" + j;
            break;
        case "getGroup":
            if (d == "") {
                d = 0
            }
            b = URL_GET_GROUP + "/" + c + "/" + d + "/" + j + "/" + f;
            break;
        case "adminFindUser":
            b = URL_ADMIN_FIND_USER + "/" + c + "/" + j;
            break
        }
        jQuery.post(b, function(m) {
            pagingComplete(m, f, j)
        })
    }
    function pagingComplete(b, e, c) {
        parseResponse(b);
        if (responseArray.code == "0") {
            if (e == "all" || e == "selected") {
                jQuery("#" + e).html(responseArray.html)
            } else {
                jQuery("#" + e).html(responseArray.html);
                var d = (jQuery(".content_main_wide").length) ? jQuery(".content_main_wide") : jQuery(".content_main");
                var a = d.height();
                if (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) < 10) {
                    a = d[0].clientHeight - 50
                }
                jQuery(".content_left, .content_right").css("height", a + "px")
            }
        } else {
            displayFeedback(responseArray.code + responseArray.json.error)
        }
        resetResponse()
    }
    function goFilterStudents(b, a) {
        var c = jQuery("#group_filter").val();
        location.href = b + "students/" + a + "/" + c
    }
    function goFilterTeachers(b, a) {
        var c = jQuery("#group_filter").val();
        location.href = b + "teachers/" + a + "/" + c
    }
    ;