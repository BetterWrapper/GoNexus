var previewPlayerTempData = "";
    function newAnimation() {
        window.location = "/studio"
    }
    function savePreviewData(A) {
        previewPlayerTempData = A
    }
    function retrievePreviewPlayerData() {
        var A = previewPlayerTempData;
        previewPlayerTempData = "";
        return A
    }
    var sceneNum;
    function getSceneNum(A) {
        sceneNum = A
    }
    function scenePreview() {
        $("Player").onExternalPreviewScenePreview(sceneNum)
    }
    function callSceneNum() {
        $("Player").onExternalPreviewCallSceneNum(sceneNum)
    }
    var STUDIO_MIN_WIDTH = 960;
    var STUDIO_MIN_HEIGHT = 640;
    var resize_studio = true;
    var show_cc_ad = false;
    function ajust_studio() {
        if (!resize_studio) {
            return
        }
        var B = (show_cc_ad ? 135 : 0);
        var C = Math.max(jQuery(window).width(), STUDIO_MIN_WIDTH + B);
        jQuery("#studio_container").width(C);
        jQuery("#studio_holder").width(C - B);
        var A = jQuery(window).height() - (jQuery("div.header").length > 0 ? 80 : 0);
        A = Math.max(A, STUDIO_MIN_HEIGHT);
        jQuery("#studio_container").height(A);
        jQuery(window).trigger("studio_resized")
    }
    function previewSceen() {
        if (!resize_studio) {
            return false
        }
        resize_studio = false;
        jQuery("#studio_container").width(1).height(1);
        jQuery("body").removeClass("full_screen_studio").addClass("preview_player")
    }
    function showCCBrowser() {
        previewSceen();
        jQuery("body").addClass("ccbrowser");
        jQuery("#ccbrowserdiv").css("visibility", "visible");
        if (typeof pageTracker != "undefined" && pageTracker) {
            pageTracker._trackPageview("/pageTracker/ccbrowser/open")
        }
        Gallery.fetchModel("*");
        return false
    }
    function hideCCBrowser() {
        jQuery("body").removeClass("ccbrowser");
        jQuery("#ccbrowserdiv").css("visibility", "hidden");
        if (typeof pageTracker != "undefined" && pageTracker) {
            pageTracker._trackPageview("/pageTracker/ccbrowser/close")
        }
        restoreStudio();
        return false
    }
    function restoreStudio() {
        resize_studio = true;
        jQuery("body").removeClass("preview_player").addClass("full_screen_studio");
        ajust_studio()
    }
    ;