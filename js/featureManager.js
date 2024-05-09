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

function FeatureManager() {
	this.buttons = null;
	this.contents = null;
	this.holderObj = null;
	this.disabled = false;
	this.id = null;
	this.current = null;
	
	this.slideshowInterval = null;
	this.slideshowDelay = 10000;
	
	this.manageChange = function(i,step) {
		switch(step) {
			case 1:
				if (!this.disabled && i!=this.current) {
					this.stopSlideshow();
					this.buttons[i].className = this.buttons[i].origClass + " button-selected";
					this.buttons[this.current].className = this.buttons[this.current].origClass;
					this.sets[i].style.display = "block";
					this.sets[this.current].style.display = "none";
					this.disabled = true;
					var o = this;
					//alert("step1");
					aMgr.addAnimation(this.contents[this.current], 'alpha', 0, 0, -100, -1, 0, false, 100, 0, function(){o.manageChange(i,2);}, this.id);
				}
			break;
			case 2:
				this.contents[this.current].style.display = "none";
				aMgr.setAlpha(this.contents[this.current],100);
				aMgr.setAlpha(this.contents[i],0);
				this.contents[i].style.display = "block";
				//this.contents[i].style.left = this.contents[i].offsetWidth + "px";
				aMgr.setAlpha(this.contents[i],100);
				var o = this;
				aMgr.addAnimation(this.contents[i], 'move-horizontal', -35, 0, -35, 1, 0, false, this.contents[i].offsetLeft, 0, function(){o.manageChange(i,3);}, this.id);
			break;
			case 3:
				this.current = i;
				this.disabled = false;
				this.startSlideshow();
			break;
		}
	}
	
	this.startSlideshow = function() {
		var o = this;
		this.slideshowInterval = setInterval(function(){o.launchNext();},this.slideshowDelay);
	}
	
	this.stopSlideshow = function() {
		clearInterval(this.slideshowInterval);
	}
	
	this.launchNext = function() {
		if (this.current == this.contents.length - 1) {
			var i = 0;
		}
		else var i = this.current + 1;
		this.manageChange(i,1);
	}
	
	this.initialize = function(id) {
		this.id = id;
		this.holderObj = document.getElementById(id+'_Holder');
		this.contents = new Array();
		for (var i=0; i<this.holderObj.childNodes.length; i++) {
			var obj = this.holderObj.childNodes[i];
			if (obj.tagName == "DIV") {
				this.contents.push(obj);
			}
		}
		this.buttons = new Array();
		for (var i=0; i<this.contents.length; i++) {
			var obj = document.getElementById(id+'_Button_'+(i+1));
			obj.featureManager = this;
			obj.index = i;
			obj.origClass = obj.className;
			obj.onclick = function() {
				this.featureManager.manageChange(this.index,1);
			}
			this.buttons.push(obj);
		}
		this.sets = new Array();
		for (var i=0; i<this.contents.length; i++) {
			var obj = document.getElementById(id+'_ButtonSet_'+(i+1));
			this.sets.push(obj);
		}
		
		this.current = 0;
		this.buttons[this.current].className = this.buttons[this.current].origClass + " button-selected";
		
		this.startSlideshow();
	}
}

}
/*
     FILE ARCHIVED ON 15:36:15 Feb 07, 2012 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 13:26:16 Apr 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.576
  exclusion.robots: 0.069
  exclusion.robots.policy: 0.059
  cdx.remote: 0.051
  esindex: 0.008
  LoadShardBlock: 107.849 (3)
  PetaboxLoader3.datanode: 71.757 (4)
  PetaboxLoader3.resolve: 189.977 (2)
  load_resource: 181.714
*/