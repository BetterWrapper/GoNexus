function AnimationManager() {
	this.delay = 13; // Delay after each animation 'frame'
	this.timeout = 0; // Animation timeout
	this.list = new Array(); // List of animation objects (described below)
	this.nameOnIndex = new Array(); // Array describing on which index is animation with set name
	
	this.behaviour = new Array(); // Array with scripted behaviours
	this.behaviour['background-vertical'] = function(s_index, manager) {
		manager.list[s_index].obj.style.backgroundPosition = "0px "+manager.list[s_index].current+"px";
	}
	this.behaviour['background-horizontal'] = function(s_index, manager) {
		manager.list[s_index].obj.style.backgroundPosition = manager.list[s_index].current+"px 0px";
	}
	this.behaviour['move-vertical'] = function(s_index, manager) {
		manager.list[s_index].obj.style.top = manager.list[s_index].current+"px";
	}
	this.behaviour['move-horizontal'] = function(s_index, manager) {
		manager.list[s_index].obj.style.left = manager.list[s_index].current+"px";
	}
	this.behaviour['alpha'] = function(s_index, manager) {
		manager.setAlpha(manager.list[s_index].obj, manager.list[s_index].current);
	}
	this.behaviour['width'] = function(s_index, manager) {
		manager.list[s_index].obj.style.width = manager.list[s_index].current+"px";
	}
	this.behaviour['height'] = function(s_index, manager) {
		manager.list[s_index].obj.style.height = manager.list[s_index].current+"px";	
	}
	
	this.standardBehaviour = function(s_index) { // Function which are launched before every non-standard animation
		var obj;
		var val;
		obj = this.list[s_index].obj;
		this.list[s_index].current += this.list[s_index].speed;
		if (this.list[s_index].growing) {
			if (this.list[s_index].current >= this.list[s_index].endAt) this.list[s_index].current = this.list[s_index].endAt;
		}
		else {
			if (this.list[s_index].current <= this.list[s_index].endAt) this.list[s_index].current = this.list[s_index].endAt;
		}

		this.list[s_index].acceleration += this.list[s_index].accelerationChange;
		this.list[s_index].speed += this.list[s_index].acceleration;
		if (this.list[s_index].speed >= this.list[s_index].maxSpeed) {
			this.list[s_index].acceleration = 0;
			this.list[s_index].speed = this.list[s_index].maxSpeed;
		}
		if (this.list[s_index].speed <= this.list[s_index].minSpeed) {
			this.list[s_index].acceleration = 0;
			this.list[s_index].speed = this.list[s_index].minSpeed;
		}
		this.list[s_index].current = Math.round(this.list[s_index].current);
	}
	
	this.setAlpha = function(s_obj, s_alpha) { // Function sets opacity to an object (special treatment for IE6 PNGs)
		if (IE6 || IE7) {
			if (s_obj.isIE6PNG) s_obj.parentNode.style.filter = "alpha(opacity="+s_alpha+")";
			else s_obj.style.filter = "alpha(opacity="+s_alpha+")";
		}
		s_obj.style.opacity = s_alpha / 100;
	}
	
	// Function adds new element to animation objects list
	this.addAnimation = function(s_obj, s_type, s_speed, s_max_speed, s_min_speed, s_acceleration, s_acceleration_change, s_growing, s_current, s_endat, s_onfinish, s_name) {
		var newAnim = new Object();
		newAnim.obj = s_obj; // Object which will be animated
		newAnim.type = s_type; // Type of animation (non-standard behaviour)
		newAnim.speed = s_speed; // Speed of animation (that is not delay! this is how many property of s_obj will change in each frame!)
		newAnim.maxSpeed = s_max_speed; // Maximal value of speed
		newAnim.minSpeed = s_min_speed; // Minimal value of speed
		newAnim.acceleration = s_acceleration; // Acceleration - how much will animation speed change in each frame
		newAnim.accelerationChange = s_acceleration_change; // How much acceleration will change in each frame
		newAnim.growing = s_growing; // Indicatior whether change animation when current >= endat or current <= endat
		newAnim.current = s_current; // Current of value of animated property
		newAnim.endAt = s_endat; // Border-value of animation, when reached animation ends
		newAnim.onFinish = s_onfinish; // Function triggered when border-value is reached
		newAnim.name = s_name; // Name, identifier of animation (used when deleteing animation by name)
		this.list.push(newAnim);
		this.nameOnIndex[s_name]=this.list.length-1;
	}
	
	this.deleteAnimationByName = function(s_name) {
		var index = this.nameOnIndex[s_name];
		if (index!=undefined) this.deleteAnimation(this.nameOnIndex[s_name]);
	}
	
	this.deleteAnimation = function(s_index) {
		this.nameOnIndex[this.list[s_index].name]=undefined;
		this.list.splice(s_index,1);
		var j = this.list.length;
		var name;
		for (var i=0; i<j; i++) {
			if (i<this.list.length) {
				name = this.list[i].name;
				this.nameOnIndex[name] = i;
			}
			else break;
		}
	}
	
	this.isAnimation = function(s_name) {
		if (this.nameOnIndex[s_name]==undefined) return false;
		else return true;
	}
	
	this.animate = function() { // This is the function which in fact 'pushes' timeline further and further...
		var j = this.list.length;
		var anim;
		var val;
		for (var i=0; i<j; i++) {
			anim = this.list[i];
			this.standardBehaviour(i);
			this.behaviour[anim.type](i, this);
			if (this.list[i].current==this.list[i].endAt) {
				if (anim.onFinish != null) anim.onFinish();
				this.deleteAnimation(i);
				i--; j--;
			}
		}
	}
	var extra = this;
	this.timeout = window.setInterval(function() { extra.animate(); },extra.delay);
}