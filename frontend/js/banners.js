var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

function openMovieModal(movieUrl, movieHeading) {
        jQuery("#movie_cont").modal({
            containerCss: {height: "0px", width:"760px", left:"40%", margin:"0px auto 0px -280px", border:"0px"},
	    overlay: (20),
            onOpen: function (dialog) {
                dialog.overlay.fadeIn(1, function () {
                dialog.container.slideDown(1, function () {
                    dialog.data.show();
                    jQuery(".modalCloseImg").hide();
                    openYT(movieUrl, movieHeading);
                });
                });
            },
            onClose: function (dialog) {
                dialog.data.fadeOut(1, function () {
                    dialog.container.slideUp(1, function () {
                    dialog.overlay.fadeOut(1, function () {
                    jQuery.modal.close();
                    closeYT();
                    });
                });
                });
            }
            });
}
function openYT(movie,heading) {
	$("#movie_inner").html('<object width="555" height="348" class="l"><param name="movie" value="'+movie+'"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="'+movie+'" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="555" height="348"></embed></object>');
	$("#movie_heading").html(heading);
	$("#fbIframe").hide();
}
function closeYT() {
        jQuery("#movie_inner").html("");
	$("#fbIframe").show(); 
}

}
/*
     FILE ARCHIVED ON 19:48:00 Feb 09, 2011 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 13:25:21 Apr 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 1.029
  exclusion.robots: 0.144
  exclusion.robots.policy: 0.128
  cdx.remote: 0.074
  esindex: 0.011
  LoadShardBlock: 83.611 (3)
  PetaboxLoader3.datanode: 97.313 (4)
  PetaboxLoader3.resolve: 77.476 (2)
  load_resource: 105.094
*/