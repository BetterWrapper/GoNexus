/**
 * Account System For Nexus (Codenames: GoNexus & BetterWrapper).
 * Firebase is required in order to run this file.
 * This JS file uses firebase. you may learn more at https://firebase.google.com/
 */
if (
    window.location.pathname != "/cc" && window.location.pathname != "/cc_browser"
) localStorage.removeItem("charcreatoryear");
const params = new URLSearchParams(window.location.search);
const auth = firebase.auth();
let signupComplete = false;
let loginComplete = false;
let displayName = null;
let userData = '';
var schoolInfo = {};
function getInfoFromArray(array, index) {
    if (array && index) return array[index];
}
function getSchoolInfo () {
    schoolInfo = {};
    if (userData) {
        jQuery(".action-disabled").block({
            message: null,
            css: {
                'background-color': '#FFFFFF',
                opacity: '0.5',
                cursor: 'auto'
            },
            overlayCSS: {
                'background-color': '#FFFFFF',
                opacity: '0.5',
                cursor: 'auto'
            }
        });
        jQuery(".form_user_id").val(userData.uid || userData.id);
        jQuery.post("/api/school/get", {
            uid: userData.admin || userData.id || userData.uid
        }, d => {
            schoolInfo = d;
            if (d.name) {
                if (d.admin == (userData.uid || userData.id)) jQuery(".is_school_admin").show()
                jQuery(".no-school").hide();
                jQuery(".has-school").show();
                jQuery("#schoolName").html(
                    `<a href="javascript:copyText('#schoolUrl', '#manage_school')">${d.name}</a>`
                );
                jQuery("#schoolUrl").remove();
                jQuery(`<input type="hidden" id="schoolUrl" value="${
                    window.location.origin
                }/school/${d.id}"/>`).appendTo('body');
                add2Element('schoolId', d.id, 'title');
                jQuery("#schoolId").text(d.id);
                const texts = {
                    groups: `${d.groups.length} Groups`,
                    teachers: `${d.teachers.length} Teachers`,
                    students: `${d.students.length} Students`
                }
                for (const i in texts) if (d[i].length == 1) texts[i] = texts[i].slice(0, -1);
                jQuery("#groupCount").text(texts.groups);
                jQuery("#teacherCount").text(texts.teachers);
                jQuery("#studentCount").text(texts.students);
                function get(type) {
                    if (!userData.role) return d[type];
                    return d[userData.role + 's'].find(i => i.id == userData.id)[type] || []
                }
                jQuery("#has-groups").html((get('groups')).map(v => {
                    const texts = {
                        teachers: `${
                            v.teachers ? v.teachers.length : '1'
                        } ${v.teachers ? 'Teachers' : 'Teacher'}`,
                        students: `${
                            v.students ? v.students.length : '1'
                        } ${v.students ?  'Students' : 'Student'}`
                    }
                    for (const i in texts) if (v[i] && v[i].length == 1) texts[i] = texts[i].slice(0, -1);
                    return `<div class="col-sm-3">${
                        v.name
                    }<br><img src="${v.image}" height="128" width="128"/><br>${v.id}<br>${
                        texts.teachers
                    }<br>${texts.students}<br><div style="display: ${
                        v.admin == (userData.uid || userData.id) ? 'block' : 'none'
                    };">
                        <button type="button" class="btn btn-orange dropdown-toggle" data-toggle="dropdown">
                            Actions <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" role="menu">
                            <li><a href="javascript:edit('group', '${
                                v.id
                            }', '#manage_groups')">Edit Group</a></li>
                            <li><a href="javascript:permissions('group', '${
                                v.id
                            }', '#manage_groups')">Edit Group permissions</a></li>
                            <li class="divider"></li>
                            <li><a href="javascript:del('groups', '${v.id}', '#manage_groups')">Delete Group</a></li>
                        </ul>
                    </div></div>`
                }).join(""));
                jQuery("#has-teachers").html((get('teachers')).map(v => {
                    const texts = {
                        groups: `${v.groups.length} Groups`,
                        students: `${
                            v.students ? v.students.length : '1'
                        } ${v.students ?  'Students' : 'Student'}`
                    }
                    for (const i in texts) if (v[i] && v[i].length == 1) texts[i] = texts[i].slice(0, -1);
                    return `<div class="col-sm-3">${
                        v.name
                    }<br><img src="${v.image}" height="128" width="128"/><br>${v.id}<br>${
                        texts.groups
                    }<br>${texts.students}<br><div style="display: ${
                        v.admin == (userData.uid || userData.id) ? 'block' : 'none'
                    };">
                        <button type="button" class="btn btn-orange dropdown-toggle" data-toggle="dropdown">
                            Actions <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" role="menu">
                            <li><a href="javascript:edit('teacher', '${
                                v.id
                            }', '#manage_teachers')">Edit teacher Info</a></li>
                            <li><a href="javascript:permissions('teacher', '${
                                v.id
                            }', '#manage_teachers')">Edit teacher permissions</a></li>
                            <li class="divider"></li>
                            <li><a href="javascript:del('teachers', '${v.id}')">Delete Teacher</a></li>
                        </ul>
                    </div></div>`
                }).join(""));
                jQuery("#has-students").html((get('students')).map(v => {
                    const texts = {
                        groups: `${v.groups.length} Groups`,
                        teachers: `${
                            v.teachers ? v.teachers.length : '1'
                        } ${v.teachers ?  'Teachers' : 'Teacher'}`
                    }
                    for (const i in texts) if (v[i] && v[i].length == 1) texts[i] = texts[i].slice(0, -1);
                    return `<div class="col-sm-3">${
                        v.name
                    }<br><img src="${v.image}" height="128" width="128"/><br>${v.id}<br>${
                        texts.groups
                    }<br>${texts.teachers}<br><div style="display: ${
                        v.admin == (userData.uid || userData.id) ? 'block' : 'none'
                    };">
                        <button type="button" class="btn btn-orange dropdown-toggle" data-toggle="dropdown">
                            Actions <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" role="menu">
                            <li><a href="javascript:edit('student', '${
                                v.id
                            }', '#manage_students')">Edit student Info</a></li>
                            <li><a href="javascript:permissions('student', '${
                                v.id
                            }', '#manage_students')">Edit student permissions</a></li>
                            <li class="divider"></li>
                            <li><a href="javascript:del('students', '${v.id}')">Delete Student</a></li>
                        </ul>
                    </div></div>`
                }).join(""));
                jQuery(".group-select").html('<option value="">No Group Selected</option>' + (get('groups')).map(v => `<option value="${
                    v.id
                }">${v.name}</option>`));
                const groupSelectorLimited = jQuery("#group-select-limited");
                if (groupSelectorLimited) for (let i = 0; i < groupSelectorLimited.data("number"); i++)  {
                    const groupInfo = (get('groups'))[i]
                    if (groupInfo) groupSelectorLimited.append(`<option value="${
                        groupInfo.id
                    }">${groupInfo.name}</option>`);
                }
                if ((get('groups')).length >= 1) {
                    jQuery("#no-groups").hide();
                    jQuery("#has-groups").show().append(`<a href="javascript:;" onclick="showOverlayOnElement(
                        '#manage_groups', jQuery('#group_maker')
                    )">Create more groups</a>`);
                } else {
                    jQuery("#has-groups").html('').hide();
                    jQuery("#no-groups").show();
                }
                if ((get('teachers')).length >= 1) {
                    jQuery("#no-teachers").hide();
                    jQuery("#has-teachers").show().append(`<a href="javascript:;" onclick="showOverlayOnElement(
                        '#manage_teachers', jQuery('#assign_teacher')
                    )">Assign More Teachers</a>`);
                } else {
                    jQuery("#has-teachers").html('').hide();
                    jQuery("#no-teachers").show();
                }
                if ((get('students')).length >= 1) {
                    jQuery("#no-students").hide();
                    jQuery("#has-students").show().append(`<a href="javascript:;" onclick="showOverlayOnElement(
                        '#manage_students', jQuery('#assign_student')
                    )">Assign More Students</a>`);;
                } else {
                    jQuery("#has-students").html('').hide();
                    jQuery("#no-students").show();
                }
            } else {
                jQuery(".has-school").hide();
                jQuery(".no-school").show();
                jQuery("#has-groups").html('').hide();
                jQuery("#no-groups").show();
                jQuery("#has-teachers").html('').hide();
                jQuery("#no-teachers").show();
                jQuery("#has-students").html('').hide();
                jQuery("#no-students").show();
            }
        })
    }
}
auth.onAuthStateChanged(user => {
    if (user) {
        if (displayName != null) auth.currentUser.updateProfile({displayName}).catch(e => {
            console.log(e);
            displayFeeback(1 + e.message);
        });
        if (!user.emailVerified) {
            jQuery.post(`/api/fetchAPIKeys`, (d) => {
                const json = JSON.parse(d);
                add2Element('freeconvert-key', json.freeConvertKey, 'value');
                add2Element('topmediaai-key', json.topMediaAIKey, 'value');
            });
            jQuery("#signup-processing").modal('hide');
            showElement('email-verification-signup');
            hideElement('login-container');
            showElement('logout-link');
            showElement('email-verification-login');
            if (signupComplete || loginComplete) {
                signupComplete = false;
                loginComplete = false;
                auth.currentUser.sendEmailVerification().catch(e => {
                    console.log(e);
                    displayFeeback(1 + e.message);
                });
            }
            switch (window.location.pathname) {
                case "/templateManager":
                case "/dashboard":
                case "/videos":
                case "/forgotpassword":
                case "/create":
                case "/cc_browser": 
                case "/cc": 
                case "/account":
                case "/go_full": 
                case "/movies": {
                    window.location.href = '/';
                    break;
                }
                case "/public_signup":
                case "/login": {
                    switch (window.location.pathname) {
                        case "/public_signup": {
                            jQuery("#signup-container").hide();
                            jQuery("#signup-processing").hide();
                            break;
                        } case "/login": {
                            jQuery("#login-container").hide();
                            break;
                        }
                    }
                    jQuery("#email-verification-container").show();
                    break;
                }
            }
        } else loggedIn(user);
    } else if (!localStorage.getItem("u_info_school")) logout('auto');
});
function logout(t) {
    jQuery.post("/api/getSession", json => {
        if (json.data && json.data.loggedIn && json.data.current_uid) {
            if (t != 'auto') jQuery.post('/api/removeSession', {
                current_uid: json.data.current_uid
            }, d => {
                if (JSON.parse(d).success) {
                    jQuery.post(`/api/fetchAPIKeys`, (d) => {
                        const json = JSON.parse(d);
                        add2Element('freeconvert-key', json.freeConvertKey, 'value');
                        add2Element('topmediaai-key', json.topMediaAIKey, 'value');
                    });
                    hideElement('isAccountAdmin');
                    hideElement('isLogin');
                    showElement('signup-button');
                    showElement('login-button');
                    switch (window.location.pathname) {
                        case "/dashboard":
                        case "/videos":
                        case "/account":
                        case "/cc_browser": 
                        case "/create":
                        case "/cc": 
                        case "/go_full": 
                        case "/templateManager":
                        case "/movies": {
                            window.location.href = '/';
                            break;
                        } 
                    }
                }
            });
            else jQuery.post('/api/getUserInfoFromSession', loggedIn);
        } else {
            jQuery.post(`/api/fetchAPIKeys`, (d) => {
                const json = JSON.parse(d);
                add2Element('freeconvert-key', json.freeConvertKey, 'value');
                add2Element('topmediaai-key', json.topMediaAIKey, 'value');
            });
            hideElement('isLogin');
            showElement('signup-button');
            showElement('login-button');
            switch (window.location.pathname) {
                case "/dashboard":
                case "/videos":
                case "/account":
                case "/cc_browser": 
                case "/create":
                case "/cc": 
                case "/go_full": 
                case "/templateManager":
                case "/movies": {
                    window.location.href = '/';
                    break;
                }
            }
        }
    });
}
function loggedIn(user) {
    userData = user;
    getSchoolInfo();
    hideElement('signup-button');
    hideElement('login-button');
    showElement('isLogin');
    switch (window.location.pathname) {
        case "/templateManager": {
            if (!window.location.search) getTemplates(user);
            else {
                while (
                    templateManager.templateEditor 
                    && templateManager.templateEditor.allTemplates 
                    && templateManager.templateEditor.id
                    && templateManager.templateEditor.allTemplates[templateManager.templateEditor.id]
                ) {
                    console.log(templateManager)
                    if (
                        templateManager.templateEditor.allTemplates[templateManager.templateEditor.id].user == (user.uid || user.id)
                    ) templateManager.editorMode()
                    break;
                }
            }
            break;
        } case "/create": {
            const interval = setInterval(() => {
                if (checkStudioLoadingStatus && reloadCCListForTut) {
                    clearInterval(interval);
                    checkStudioLoadingStatus();
                    reloadCCListForTut();
                }
            }, 1)
            break;
        } case "/public_index": {
            add2Element("banner_btn", '/create', 'href')
            jQuery("#banner_btn").text("Make A Video");
            break;
        } case "/account": {
            loadSettings(user);
            break;
        } case "/dashboard": {
            if (user.role) {
                if (user.role != "student") jQuery(`#${user.role}-stuff`).show();
            } else jQuery(`#personal-stuff`).show();
            jQuery("#loadFTUserFeeds").text('load more');
            jQuery("#loadFTUserFeeds_all").text('load all of the flashthemes user feed');
            loadFTUserFeeds();
            break;
        } case "/movies": {
            refreshMovieList();
            break;
        } case "/go_full": {
            jQuery(document).ready(function() {
                studio_data.flashvars.apiserver = window.location.origin + '/';
                if (enable_full_screen) {
        
                    if (!true) {
                        jQuery('#studio_container').css('top', '0px');
                    }
                    jQuery('#studio_container').show();
                    jQuery('.site-footer').hide();
                    jQuery('#studioBlock').css('height', '1800px');
        
                    if (false) {
                        checkCopyMovie(`javascript:proceedWithFullscreenStudio('${JSON.stringify(user)}', 'isJson')`, '');
                    } else if (false) {
                        checkEditMovie('');
                    } else {
                        proceedWithFullscreenStudio(user);
                    }
        
                    jQuery(window).on('resize', function() {
                        ajust_studio();
                    });
                    jQuery(window).on('studio_resized', function() {
                        if (show_cc_ad) {
                            _ccad.refreshThumbs();
                        }
                    });
        
                    if (studioApiReady) {
                        var api = studioApi(jQuery('#studio_holder'));
                        api.bindStudioEvents();
                    }
                    jQuery('.ga-importer').prependTo(jQuery('#studio_container'));
                } else setTimeout(() => {
                    jQuery('#studioBlock').flash(studio_data);
                }, 1);
                // Video Tutorial
                videoTutorial = new VideoTutorial(jQuery("#video-tutorial"));
            })
            // restore studio when upsell overlay hidden
            .on('hidden', '#upsell-modal', function(e) {
                if (jQuery(e.target).attr('id') == 'upsell-modal') {
                    restoreStudio();
                }
            })
            .on('studioApiReady', function() {
                var api = studioApi(jQuery('#studio_holder'));
                api.bindStudioEvents();
            })
            break;
        } case "/player": {
            break;
        } case "/user": {
            loadUserContent(user);
            break;
        }
        case "/forgotpassword":
        case "/login":
        case "/public_signup": {
            location.href = '/dashboard';
            break;
        }
        case "/cc_browser": 
        case "/cc":  {
            loadCC(user);
            break;
        }
    }
    var CCStandaloneBannerAdUI = CCStandaloneBannerAdUI || {}
    jQuery.extend(CCStandaloneBannerAdUI, {
        actionshopSWF: "/static/tommy/2011/animation/actionshop.swf",
        apiserver: window.location.origin + "/",
        clientThemePath: "/static/tommy/2011/<client_theme>",
        userId: user.uid || user.id
    });
    jQuery.post(`/api/getUserSWFFiles?userId=${user.uid || user.id}`, files => {
        for (const file of files) {
            jQuery("#FlashGamePlayer_swfFilesDropdown").show();
            jQuery("#FlashGamePlayer_swfFilesAll").append(`<li><a href="javascript:FlashGameSetup('${file.url}');">${file.id}</a></li>`);
        }
    })
    jQuery.post("/api/check4SavedUserInfo", {
        displayName: user.displayName || user.name,
        email: user.email,
        role: user.role,
        admin: user.admin,
        uid: user.uid || user.id
    }, () => {
        jQuery.post(`/api/fetchAPIKeys?uid=${user.uid || user.id}`, (d) => {
            const json = JSON.parse(d);
            add2Element('freeconvert-key', json.freeConvertKey, 'value');
            add2Element('topmediaai-key', json.topMediaAIKey, 'value');
            if (!user.role || user.role == "teacher") showElement('isAccountAdmin');
        })
    });
}
function userSignup(email, password, name) {
    signupComplete = true;
    displayName = name;
    auth.createUserWithEmailAndPassword(email, password).catch(e => {
        console.log(e);
        jQuery("#signup-processing").hide();
        jQuery("#error-message").text(e.message);
    });
}
function userLogin(email, password) {
    loginComplete = true;
    auth.signInWithEmailAndPassword(email, password).catch(e => {
        console.log(e);
        processing = false;
        formErrorMessage(e.message);
        jQuery('#btn-login').text(buttonText);
    });
}
function userLogout() {
    switch (window.location.pathname) {
        case "/public_index": {
            add2Element("banner_btn", "/public_signup", 'href');
            jQuery("#banner_btn").text("Sign Up Now");
            break;
        }
    }
    jQuery.post("/api/getSession", json => {
        if (json.data && json.data.loggedIn && json.data.current_uid) logout();
        else {
            auth.signOut().then(logout).catch(e => {
                console.log(e);
                displayFeedback(1 + e.message);
            });
        }
    });
    if (localStorage.getItem("u_info_school")) {
        hideElement('isAccountAdmin');
        localStorage.removeItem("u_info_school");
        logout();
    }
}
function hideElement(id) {
    if (document.getElementById(id)) document.getElementById(id).style.display='none';
}
function showElement(id) {
    if (document.getElementById(id)) document.getElementById(id).style.display='block';
}
function add2Element(id, text, type) {
    if (document.getElementById(id)) document.getElementById(id)[type] = text;
}
function createImgElement(id, url, text) {
    add2Element(id, url, "src");
    add2Element(id, text, "alt");
}
function loadUserContent(userData) {
    if (window.location.pathname == "/user") {
        $.post("/api/getAllUsers", (d) => {
            const json = JSON.parse(d);
            const meta = json.find(i => i.id == params.get("id"));
            if (meta) {
                add2Element('user-name', meta.name, 'innerHTML');
                add2Element('user-link', meta.name, 'innerHTML');
                add2Element('user-link', `/user?id=${params.get("id")}`, 'href')
                document.title = `${meta.name} On Nexus`;
                $.getJSON(`/movieList?uid=${params.get("id")}`, (d) => {
                    let json;
                    if (userData && hasPermission('publicvids') && params.get("id") == userData.uid) json = d;
                    else json = d.filter(i => i.published == "1");
                    if (!params.get("filename") || params.get("filename") != "user-videos") {
                        let htmls = "";
                        for (let i = 0; i < 7; i++) {
                            if (json[i]) htmls += `<div class="col-sm-6 col-md-4"><div class="profile-video"><div class="video-container">
                            <a class="video-thumbnail" href="${window.location.origin}/player?movieId=${json[i].id}">
                                <div class="vthumb vthumb-300">
                                    <div class="vthumb-clip"><div class="vthumb-clip-inner"><span class="valign"></span><img src="/movie_thumbs/${json[i].id}.png" alt="${json[i].title}"/></div></div>
                                </div>
                            </a>
                            <div class="video-desc">
                                <a class="title" href="${window.location.origin}/player?movieId=${json[i].id}" title="${json[i].title}">${json[i].title}</a>
                                <span class="duration">${json[i].durationString}</span>
                                </span>
                            </div></div></div></div>`;
                            else if (i == 7) {
                                add2Element('more', `${window.location.origin}/user?id=${params.get("id")}&filename=user-videos`, 'href');
                                jQuery("#more").show();
                            }
                        }
                        jQuery("#profileVideos").html(htmls);
                        if (json.length == 0) add2Element('profileVideos', '<center>No Videos</center>', 'innerHTML');
                    } else {
                        var C = 0;
                        function loadRows() {
                            let c = C; 
                            C += 12;
                            for (; c < C; c++) {
                                if (c > json.length - 1) {
                                    jQuery("#load_more").hide();
                                    break;
                                }
                                jQuery("#userVideos").append(`<div class="col-sm-6 col-md-4"><div class="profile-video"><div class="video-container">
                                <a class="video-thumbnail" href="${window.location.origin}/player?movieId=${json[c].id}">
                                    <div class="vthumb vthumb-300">
                                        <div class="vthumb-clip"><div class="vthumb-clip-inner"><span class="valign"></span><img src="/movie_thumbs/${json[c].id}.png" alt="${json[c].title}"/></div></div>
                                    </div>
                                </a>
                                <div class="video-desc">
                                    <a class="title" href="${window.location.origin}/player?movieId=${json[c].id}" title="${json[c].title}">${json[c].title}</a>
                                    <span class="duration">${json[c].durationString}</span>
                                    </span>
                                </div></div></div></div>`);
                            }
                        }
                        jQuery("#load_more").click(() => loadRows());
                        loadRows();
                        add2Element('video-count', json.length, 'innerHTML');
                    }
                });
            }
        });
    }
}
function downloadMyStuff() {
    try {
        jQuery("#stuff-downloading-overlay").modal({
            keyboard: false, 
            backdrop: "static"
        });
        $.post('/api/fetchMyStuff', {
            displayName: userData.displayName,
            uid: userData.uid,
            email: userData.email
        }, (d) => {
            const json = JSON.parse(d);
            jQuery("#stuff-downloading-overlay").modal('hide');
            if (json.success) {
                window.location.href = json.fileUrl;
            } else displayFeedback(1 + json.error);
        });
    } catch (e) {
        console.log(e);
        displayFeedback(1 + e);
    }
}
function uploadMyStuff() {
    try {
        jQuery("#stuff-uploading-overlay").modal({
            keyboard: false, 
            backdrop: "static"
        });
        var b = new FormData();
        b.append("import", document.getElementById('stuff-upload').files[0]);
        b.append("userId", userData.uid);
        $.ajax({
            url: "/api/uploadMyStuff",
            method: "POST",
            data: b,
            processData: false,
            contentType: false,
            dataType: "json"
        }).done((d) => {
            jQuery("#stuff-uploading-overlay").modal('hide');
            if (d.success) {
                displayFeedback(0 + d.msg);
                switch (window.location.pathname) {
                    case "/movies": {
                        refreshMovieList();
                        break;
                    }
                }
            } else displayFeedback(1 + d.error);
        });
    } catch (e) {
        console.log(e);
        displayFeedback(1 + e);
    }
}