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

function showMessage(text) {
	$("#messageContainer").html(text);
	$("#messageContainer").slideDown('fast');
	clearTimeout(msgTimeout);
	msgTimeout=setTimeout("hideMessage()",2000);	
}
function hideMessage(){
	$("#messageContainer").hide();
}
function stopAudioFile(){
	try {
	    getFlashMovie("hiddenplay").stopAudio();
	    isPlaying = false;
	}catch(e){}

}
function soundStarted() {
	$("#readButton").html("<span class=\"l pl5 lh16\">Stop</span><span class=\"l pl5 pt4\"><span class=\"l lh16 spriteClass stop_button\"></span></span>");
	isPlaying = true;
}
function selectLang(thelang,voiceDiv) {
 	tabTemplate(thelang);
        if (voiceDiv) {
            $("#voiceContainer").scrollTo($("#"+voiceDiv+"_label"),400);
        } else {
            $("#voiceContainer").scrollTo($("#labelForLang_"+thelang),400);
        }
}
function activateVoiceTab(thelang) {
	$("#voicelist_"+thelang).show();
    $("#voicetab_"+thelang+" span.l").css("border","1px solid #FFCC00");
}
function deactivateVoiceTab(thelang) {

	$("#voicetab_"+thelang).css("background","#EDEDED");
	$("#voicetab_"+thelang).css("border-right","1px");
	$("#voicetab_"+thelang).css("width","22px");
	$("#voicetab_"+thelang+" span.l").css("border","1px solid #EEE");
}
//Init On Token
function showInterfaceByToken(thelang,voiceID) {
	$("#synthesisBlock").show();
	$("#synthesisHead").show();
	$("#voiceContainer").show();
	$(".voicelistlabel").removeClass("active");
	$("#"+getVoiceNameById(voiceID).replace(' ','_')+"_label").addClass("active");
	currentVoiceName = getVoiceNameById(voiceID);
	currentVoice = voiceID;

}
function tabTemplate(thelang)
{
	if(currentLang != thelang)
	{
	    var ar = ['gb','ro','fr','pl','de','us','cy','es','es_us'];
	    for(var l in ar){
	        deactivateVoiceTab(ar[l]);
	    }
    activateVoiceTab(thelang);
	currentLang = thelang;
	}
}
function showVoiceListByLang(thelang,audioact) {	
	tabTemplate(thelang);
	if(thelang != "cu")
	{
		$("#synthesisBlock").show();
		$("#synthesisHead").show();
		$("#voiceContainer").show();
		
		$("#"+getLangDelegate(thelang)+"_label").click();
		$("#voiceContainer").scrollTo($("#labelForLang_"+thelang),400);
		$('#fbIframe').show();
		
		$("#customVoiceList").hide();
		$("#voicetab_cu").show();
	}
	else
	{
		$("#synthesisBlock").hide();
		$("#synthesisHead").hide();
		$("#voiceContainer").hide();
		
		$('#fbIframe').hide(); 
		
		$("#customVoiceList").show();
		$("#voicetab_cu").hide(); 
	}
	if(audioact) {
	    stopAudioFile();
	    hideToken();
	}
	checkSize();
	
}
function getPid() {return vid2PidMap[getVoice()];}
function getHref() {return vid2PidHref[getVoice()];}
function getVoice() {return currentVoice;}
function getVoiceID() {	return currentVoiceName;}
function getVoiceNameById(voiceID) {return voicesData[voiceID];}

function selectVoice(vid,vname,hideBuy,hideOnline) {
	currentVoiceName = vname;
	currentVoice = vid;
  $("#pop_voice").html(vname.replace("_", " "));
	$("#selectedVoice").val(vid);
	hideToken();
	switchText();
	if(!isMobile()) {
	    //$("#voice_ta").focus();
	}
	$(".voicelistlabel").removeClass("active");
	$("#"+vname.replace(' ','_')+"_label").addClass("active");

	if (hideBuy || hideOnline) {
		if(hideBuy && hideOnline) {
			$('#btn_home_nagraj').hide();
			$('#btn_home_kupteraz').hide();
			$('#btn_home_pobierztrial').show();
			$('#btn_home_contact').show();
		} else if (hideBuy) {
			$('#btn_home_kupteraz').hide();
			$('#btn_home_pobierztrial').show();
			$('#btn_home_nagraj').hide();
			$('#btn_home_contact').hide();
		} else {
			$('#btn_home_kupteraz').hide();
			$('#btn_home_pobierztrial').show();
			$('#btn_home_nagraj').hide();
			$('#btn_home_contact').hide();
		}
	} else {
		$('#btn_home_nagraj').hide();
		$('#btn_home_kupteraz').hide();
		$('#btn_home_pobierztrial').show();
		$('#btn_home_contact').hide();
	}

}
function isStandardText() {   
    t = $('#voice_ta').val();
	for(var i=0;i<voicesTexts.length;i++) {
		if(voicesTexts[i] == t)
		return true;
	}
	return false;
}
function checkIfTextWasModyfied() {
	tatext = $('#voice_ta').val()||0;
	if(!tatext||isStandardText()) return false;
	else return true;
}
function removeDefaultText() {
	if(isStandardText()) $('#voice_ta').val("");
	checkSize();
	
}
function switchText() {
  
    if (!checkIfTextWasModyfied()) {
    	$('#voice_ta').val(voicesTexts[getVoice()]);
    	if(getVoice() != 5)  {
    	    $('#btn_home_kupteraz').unbind("click");
    	    $('#btn_home_kupteraz').bind("click",function(){eval(getHref())});
    	} else {
    	    $('#btn_home_kupteraz').unbind("click");
    	    $('#btn_home_kupteraz').bind("click",function(){voicePopup()});	
    	}					
    }
    stopAudioFile();
    checkSize();  
	
}
function checkSize() {
	if(text = $('#voice_ta').val()) {
	    size = text.length;
		
		//Standard Text
		if(isStandardText()){ $('#charCont').hide()}
		else {$('#charCont').show()}
		
		//IF is playing
		if(isPlaying) hideToken();
		
		if(size > 250 ) {   
			$('#charCounter').html("<span class='red b '>"+size+"</span>");
		} else {
			$('#charCounter').html(size);	
		}
	} else {
	    $('#charCont').hide();
	}
	

}
function hideToken() {
	if(isTokenVisible) {
	    $('#shareIt').hide();
      $('#improveIt').hide();
	    if(isStandardText()) $('#charCont').hide();
	    else if(isStandardText()) $('#charCont').hide();
	    isTokenVisible = false;
	}
}
function et(a){
	track('Buttons', 'Click', 'ivona.home.'+a);
}


}
/*
     FILE ARCHIVED ON 05:47:51 Sep 02, 2011 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 13:25:21 Apr 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.662
  exclusion.robots: 0.081
  exclusion.robots.policy: 0.07
  cdx.remote: 0.061
  esindex: 0.01
  LoadShardBlock: 61.665 (3)
  PetaboxLoader3.datanode: 67.214 (4)
  load_resource: 83.713
  PetaboxLoader3.resolve: 51.659
*/