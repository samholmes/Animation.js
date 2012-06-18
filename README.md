# Animation.js

Animation.js is a simple, lightweight and powerful, javascript animation engine. It uses a global animation loop for all animations while keeping track of interval times. This makes it CPU friendly and allows it to handle many simultaneous animations wonderfully.

## Setup

To set up Animation.js, all you need to do is include the Animation.js or Animation.min.js files into your HTML document:

	<head>
		<script type='text/javascript' src='/lib/Animation.min.js'></script>
	</head>

That's all you need to do to set it up.

## Using Animation.js

Every animation is an instance of the Animation object.

	var animation = new Animation();

Each animation is made up of a series of 'frames'. A frame is sequential segment within an animation. It has a callback function and duration.
When the animation is playing, it calls a frame's callback function continuously until the frame's duration ends. Then, the animation moves on
to the next frame. If there is no more frames, the animation stops. To add a frame to your animation, you call the addFrame method on your
animation object: 

	animation.addFrame(function(t){
		// Animation code here
	}, 2000);

The addFrame method takes two arguments:

1. The first argument is the callback function. A frame's callback function requires one parameter, *t*. This parameter will hold the position 
in *time* when the function is called. A value of 0 (zero) represents the beginning of the frame, and 1 (one) represents the end of the frame.
2. The second argument is the duration in milliseconds.

The meat of your animation is within these frame callbacks. Here's an example of an animation from start to finish:

	var animation = new Animation();
	
	animation.addFrame(function(t){
		document.title = 100 * t + '%';
	}, 2000);
	
	animation.play();

This will animation the page's title with the text going from "0%" to "100%" in two seconds (2000 milliseconds). 
You can add as many frames to your animation as you wish.

### Playback Controls

Every animation object comes with great playback methods.

- play() : Begins the animation
- pause() : Stops the animation
- stop() : Stops the animation and then sets it back to the beginning.
- scrub(p) : Allows you to move to a specific position in time in milliseconds (p) in the animation.

### Animation Properties

Every animation has the following set of properties:

- duration : The length of the animation in milliseconds.
- currentTime : The current time of the frame in milliseconds.
- playing : Boolean as to whether the animation is playing or not (do not manually set this).
- loop : If set to true, the animation will loop continuously.
- rate : The rate of playback. 1 is normal, -1 is reverse, 2 is twice the rate, .5 is half, etc. Default is 1.
- frames : An array of all the frame objects within the animation.

### Animation Callbacks

- begin : A function that is executed whenever animation begins.
- timeupdate : A function that is executed for every moment of playback, even across frames.
- end : A function that is executed when the animation ends or is paused/stopped.

### Frames

You add frames to the animation object using the **addFrame** method.
Each frame gets an index starting at 0 (zero). 
You can also remove frames using the **removeFrame** method while passing the **index** of the frame you wish to remove.

Within frame callbacks *this* references the current frame object. It's properties are:

- duration : The length of the frame in milliseconds.
- currentTime: The current time of the frame in milliseconds.
- position : When the frame starts in the animation in milliseconds.
- callback : The callback function.
- extra : An array of extra user-defined values.

### Extra

Any extra parameters you pass to the addFrame function will be tossed into the *extra* array. 
This extra array will be availabled as parameters for the *callback*.

	var elem = document.getElementById('foo');
	
	animation.addFrame(function(t, startX, startY){
		elem.style.left = startX + 100*t + 'px';
		elem.style.top = startY + 200*t + 'px';
	}, 2000, elem.offsetLeft, elem.offsetTop);

You can also access and modify the extra array within the callback via *this.extra*.

### Easings

All easing functions are contained withing **Animation.ease**. You can view the source to see which easings Animation.js supports natively.
You can also add you're own custom easings to this namespaces, possibly creating another namespace withing it like *Animation.ease.myCustomEases*.

Here's an example on how you use easings in Animation.js:

	var animation = new Animation();
	
	animation.addFrame(function(t){
		var e = Animation.ease.bounceInOut(t);
		
		document.title = 100*e + 'px';
	}, 2000);
	
	animation.play();

Every easing function excepts only one argument, the time (0 to 1). It then returns the time modified according to easing.

## Closing

Animation.js is an extremely powerful animation engine. 
The great thing about Animation.js is that you can do multiple things within frames, and have multiple easings for each frame!
You can also add multiple frames to your animation for those more complex animations.
Defining your animation with these powerful fundamentals wouldn't be complete without awesome playback controls!

## Feedback and Support

This is just the begin for Animation.js. Any feedback provided would be greatly appreciated, so hit up the issues section on github.

Also, if you like my work, tips and donations are appreciated. :)

[![PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SJCCMHKZLMSX2&lc=US&item_name=Animation%2ejs&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted)  
[<img src="https://en.bitcoin.it/w/images/en/c/c4/BC_Logotype_Reverse.png" height='18'>](bitcoin:1NCqKqpQoioFQkqRpEsZk8bVFmuEjqY2y5) 1NCqKqpQoioFQkqRpEsZk8bVFmuEjqY2y5
