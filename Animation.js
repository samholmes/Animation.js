/*
  Animation.js 0.1.3 - Copyright (c) 2010 Sam Holmes
  
  Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
  and GPL (http://www.opensource.org/licenses/gpl-3.0.html) licenses.
*/

//Give IE indexOf for arrays
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj) {
        for(var i=0, len=this.length; i<len; ++i) {
            if(this[i]==obj) {
                return i;
            }
        }
        return -1;
    };
}

//Animation constructor
function Animation(options) {
	options = options || {};
	
  this.currentTime = 0;
  this.duration = 0;
  this.playing = false;
  this.frames = [];
  this.loop = options.loop || false;
  this.rate = options.rate || 1;
  this.begin = options.begin || null;
  this.timeupdate = options.timeupdate || null;
  this.end = options.end || null;
  this.extra = options.extra || [];
  
  ////////// addFrame //////////
  this.addFrame = function(callback, duration) {
    var extra = [].slice.apply(arguments, [2, arguments.length]);
    this.frames.push({
      callback:callback, // A function to be executed whenever this frame's currentTime changes
      position:this.duration, // Millisecond starting position in the entire animation
      duration:duration, // Millisecond duration of this frame
      currentTime:0, // Represents the number of millisecond progress it's made 
      extra:extra // Extra paramaters to pass to this frame's callback
    });
    this.duration += duration;
  };

  // Add frames from options
  if (typeof options.frames == 'object')
  {
  	for (var i=0; i < options.frames.length; ++i)
	  {
	  	var frame = options.frames[i];
	  	this.addFrame.apply(this, [frame.callback, frame.duration].concat(frame.extra));
	  }
  }
  
  ////////// removeFrame //////////
  this.removeFrame = function(index) {
    var frameDuration = this.frames[index].duration;
    
    this.frames.splice(index, 1); // Remove frame from this animation
    
    for (var i=index, len=this.frames.length; i<len; ++i) // Loop through frames following the removed one
      this.frames[i].position -= frameDuration; // Subtract the duration of the removed frame from frames' positions
      
    this.duration -= frameDuration; // Subtract the duration from the this animation's duration
  };
  
  ////////// play //////////
  this.play = function(time) {
    if (!this.playing)
    {
    	// If time argument was passed, begin animation from it.
      if (typeof time != 'undefined')
        this.scrub(time);
      // Reset animation to the begining if at the end and playback is forward
      else if (this.currentTime >= this.duration && this.rate > 0)
        this.scrub(0);
      // Reset animation to the end if at the begining and playback is backward
      else if (this.currentTime <= 0 && this.rate < 0)
        this.scrub(this.duration);
      
      // Start animation
      Animation.animations.push(this);
      this.playing = true;
      
      // Trigger begin callback
	    if (typeof this.begin == 'function')
	    	this.begin();
    }
  };
  
  ////////// pause //////////
  this.pause = function() {
    var index = Animation.animations.indexOf(this);
    Animation.animations.splice(index, 1);
    this.playing = false;
    
  	// Trigger end callback
    if (typeof this.end == 'function')
    	this.end();
  };
  
  ////////// stop //////////
  this.stop = function() {
    this.pause();
    this.scrub(0);
  };
  
  ////////// scrub //////////
  this.scrub = function(time) {
    time = +time || 0; // Make sure time is a number
    time = time > this.duration // Make sure time isn't larger than the animation duration or less than 0
      ? this.duration 
      : time < 0
        ? 0
        : time;
    
    if (time < this.currentTime) // Position is before the current time
    {
      // Reverse loop order (backwards)
      for (var i=this.frames.length-1; i>=0; --i)
      {
        var animationFrame = this.frames[i];
        
        if (time <= animationFrame.position)
        {
          if (animationFrame.currentTime != 0)
          {
            animationFrame.currentTime = 0;
            animationFrame.callback.apply(animationFrame, [0].concat(animationFrame.extra));
          }
        }
        else
        {
          animationFrame.currentTime = time-animationFrame.position;
          animationFrame.callback.apply(animationFrame, [animationFrame.currentTime/animationFrame.duration].concat(animationFrame.extra));
          break;
        }
      }
    }
    else // Position is after or the same as the current time
    {
       // Continue normal order (forwards)
      for (var i=0, len=this.frames.length; i<len; ++i)
      {
        var animationFrame = this.frames[i];
        
        if (time > animationFrame.position+animationFrame.duration)
        {
          if (animationFrame.currentTime != animationFrame.duration)
          {
            animationFrame.currentTime = animationFrame.duration;
            animationFrame.callback.apply(animationFrame, [1].concat(animationFrame.extra));
          }
        }
        else
        {
          animationFrame.currentTime = time-animationFrame.position;
          animationFrame.callback.apply(animationFrame, [animationFrame.currentTime/animationFrame.duration].concat(animationFrame.extra));
          break;
        }
      }
    }
    
    this.currentTime = time;
    
    // Trigger timeupdate callback
    if (typeof this.timeupdate == 'function')
      this.timeupdate();
  };
}

//Animation properties
Animation.animations = [];
Animation.lastInterval = +new Date();

//Animation interval
Animation.intervalId = setInterval(function() {
  var animations = [].concat(Animation.animations); // Copy the array, rather than reference it
  var now = +new Date();
  
  for (var i=0, len=animations.length; i<len; ++i)
  {
    var animation = animations[i];
    if (animation.playing)
    {
      var time = animation.currentTime + (now-Animation.lastInterval)*animation.rate;
      if (animation.loop)
        if (time > animation.duration)
          animation.scrub(time-animation.duration);
        else if (animation.rate < 0 && time < 0)
          animation.scrub(time+animation.duration);
        else
          animation.scrub(time);
      else
      {
        animation.scrub(time);
        if (time >= animation.duration || (animation.rate < 0 && time <= 0))
          animation.pause();
      }
    }
  }
  Animation.lastInterval = now;
}, 30);

//Animation easing functions
Animation.ease = {
  def: 'quadOut',
  swing: function (t) {
    return Animation.ease[Animation.ease.def](t);
  },
  quadIn: function (t) {
    return t*t;
  },
  quadOut: function (t) {
    return -1*t*(t-2);
  },
  quadInOut: function (t) {
    if ((t*=2) < 1) return .5*t*t;
    return -.5 * ((--t)*(t-2) - 1);
  },
  cubicIn: function (t) {
    return t*t*t;
  },
  cubicOut: function (t) {
    return ((t-=1)*t*t + 1);
  },
  cubicInOut: function (t) {
    if ((t*=2) < 1) return .5*t*t*t;
    return .5*((t-=2)*t*t + 2);
  },
  quartIn: function (t) {
    return t*t*t*t;
  },
  quartOut: function (t) {
    return -1 * ((t-=1)*t*t*t - 1);
  },
  quartInOut: function (t) {
    if ((t*=2) < 1) return .5*t*t*t*t;
    return -.5 * ((t-=2)*t*t*t - 2);
  },
  quintIn: function (t) {
    return t*t*t*t*t;
  },
  quintOut: function (t) {
    return ((t-=1)*t*t*t*t + 1);
  },
  quintInOut: function (t) {
    if ((t*=2) < 1) return .5*t*t*t*t*t;
    return .5*((t-=2)*t*t*t*t + 2);
  },
  sineIn: function (t) {
    return -1 * Math.cos(t * (Math.PI/2)) + 1;
  },
  sineOut: function (t) {
    return Math.sin(t * (Math.PI/2));
  },
  sineInOut: function (t) {
    return -.5 * (Math.cos(Math.PI*t) - 1);
  },
  expoIn: function (t) {
    return (t==0) ? 0 : Math.pow(2, 10 * (t - 1));
  },
  expoOut: function (t) {
    return (t==0) ? 1 : (-Math.pow(2, -10 * t) + 1);
  },
  expoInOut: function (t) {
    if (t==0) return 0;
    if (t==1) return 1;
    if ((t*=2) < 1) return .5 * Math.pow(2, 10 * (t - 1));
    return .5 * (-Math.pow(2, -10 * --t) + 2);
  },
  circIn: function (t) {
    return -1 * (Math.sqrt(1 - t*t) - 1);
  },
  circOut: function (t) {
    return Math.sqrt(1 - (t-=1)*t);
  },
  circInOut: function (t) {
    if ((t*=2) < 1) return -.5 * (Math.sqrt(1 - t*t) - 1);
    return .5 * (Math.sqrt(1 - (t-=2)*t) + 1);
  },
  elasticIn: function (t) {
    var s=1.70158;var p=0;var a=1;
    if (t==0) return 0;
    if (t==1) return 1;
    if (!p) p=.3;
    if (a < Math.abs(1)) { a=1; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin(1);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
  },
  elasticOut: function (t) {
    var s=1.70158;var p=0;var a=1;
    if (t==0) return 0;
    if (t==1) return 1;
    if (!p) p=.3;
    if (a < Math.abs(1)) { a=1; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin(1);
    return a*Math.pow(2,-10*t) * Math.sin( (t*1-s)*(2*Math.PI)/p ) + 1;
  },
  elasticInOut: function (t) {
    var s=1.70158;var p=0;var a=1;
    if (t==0) return 0;
    if ((t*=2)==2) return 1;
    if (!p) p=(.3*1.5);
    if (a < Math.abs(1)) { a=1; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin(1);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p )*.5 + 1;
  },
  backIn: function (t, s) {
    if (s == undefined) s = 1.70158;
    return t*t*((s+1)*t - s);
  },
  backOut: function (t, s) {
    if (s == undefined) s = 1.70158;
    return ((t-=1)*t*((s+1)*t + s) + 1);
  },
  backInOut: function (t, s) {
    if (s == undefined) s = 1.70158; 
    if ((t*=2) < 1) return .5*(t*t*(((s*=(1.525))+1)*t - s));
    return .5*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
  },
  bounceIn: function (t) {
    return 1 - Animation.ease.bounceOut(1-t);
  },
  bounceOut: function (t) {
    if (t < (1/2.75)) {
      return (7.5625*t*t);
    } else if (t < (2/2.75)) {
      return (7.5625*(t-=(1.5/2.75))*t + .75);
    } else if (t < (2.5/2.75)) {
      return (7.5625*(t-=(2.25/2.75))*t + .9375);
    } else {
      return (7.5625*(t-=(2.625/2.75))*t + .984375);
    }
  },
  bounceInOut: function (t) {
    if (t < .5) return Animation.ease.bounceIn (t*2) * .5;
    return Animation.ease.bounceOut(t*2-1) * .5 + .5;
  }
};