# A Javascript Plotting Boilerplate
For plotting visual 2D data with Javascript and canvas (in 2d-context).

This started as a simple collection of useful functions I repetively used for
visualizing 2D stuff on HTML canvas. Basic features are
 * Adding elements like vertices, lines, vectors, polygons, ellipses, images
 * Javascript based cofiguration of the canvas behavior (fullsize, interaction, raster)
 * Mouse interaction (zoom, pan, drag elements)
 * Keyboard interaction
 * Touch interaction (phone, tablet)



## The HTML file
For a full example see main-dist.html:
~~~html
    <canvas id="my-canvas">Your browser does not support the canvas tag.</canvas>

    <div class="info monospace">
      [<span id="cx">-</span>,<span id="cy">-</span>]
    </div>
~~~
The 'info' block is just for displaying the current mouse/touch coordinates.


## The javascript
~~~javascript
    var pb = new PlotBoilerplate( {
        canvas			: document.getElementById('my-canvas'),
     	fullSize              	: true
     } );
~~~


## Add elements to your canvas
~~~javascript
   // Create two points:
   //   The origin is at the visual center by default.
   var pointA = new Vertex( -100, -100 );
   var pointB = new Vertex( 100, 100 );
   pb.add( new Line(pointA,pointB) );

   // When point A is moved by the user
   //   then move point B in the opposite direction
   pointA.listeners.addDragListener( function(e) {
   	pointB.sub( e.params.dragAmount );
	pb.redraw();
   } );
   
   // and when point B is moved
   //   then move point A
   pointB.listeners.addDragListener( function(e) {
   	pointA.sub( e.params.dragAmount );
	pb.redraw();
   } );
~~~
<a class="btn btn-link" href="https://plotboilerplate.io/repo/demos/simple/main-simpledemo.html" title="And the simple demo is here">And the simple demo is here</a>

![Simple Demo](screenshots/screenshot-20190220_3_simpledemo.png "The simple demo")




## Examples and screenshots
![Current demo](screenshots/screenshot-20181209_0.png "Current demo")

<a class="btn btn-link" href="https://plotboilerplate.io/repo/main-dist.html" title="See the demo">See the demo</a>

### Feigenbaum bifurcation (logistic map)
![Plotting the Feigenbaum bifurcation](screenshots/screenshot-20181212_3_feigenbaum.png "Plotting the Feigenbaum bifurcation")
![Plotting the Feigenbaum bifurcation](screenshots/screenshot-20190223_0_feigenbaum.png "Plotting the Feigenbaum bifurcation")

[For a detailed description of this plot see my Feigenbaum-plot mini-project](https://github.com/IkarosKappler/feigenbaum-plot "Feigenbaum bifurcation diagram")

<a class="btn btn-link" href="https://plotboilerplate.io/repo/demos/feigenbaum/main-feigenbaum.html" title="See the demo">See the demo</a>

[And here is a tiny article about it](http://www.polygon-berlin.de/deterministisches-chaos "Article about deterministic chaos")


### Perpendiducular point-to-line-distance demo

![Perpendiducular point-to-line distance](screenshots/screenshot-20190220_2_line-to-point.png "Perpendiducular point-to-line distance")

<a class="btn btn-link" href="https://plotboilerplate.io/repo/demos/line-point-distance/main-line-point-distance.html" title="See the demo">See the demo</a>


### Random-scripture demo

![Random-scripture demo](screenshots/screenshot-20190117-0-random-scripture.png "Random-scripture demo")

<a class="btn btn-link" href="https://plotboilerplate.io/repo/demo/random-scripture/main-randomscripture.html" title="See the demo">See the demo</a>


### Vector field test (still in development)

![Vectorfield test](screenshots/screenshot-20190220_1_vectorfield.png "Vectorfield test demo (still in development)")

<a class="btn btn-link" href="https://plotboilerplate.io/repo/demo/vectorfield/main-vectorfield.html" title="See the demo">See the demo</a>



## Parameters during initialization
~~~javascript
 var pb = new PlotBoilerplate(
     {  // HTMLElement
     	//   Your canvas element in the DOM (required).
     	canvas			: document.getElementById('my-canvas'),

	// boolean
	//   If set to true the canvas will gain full window size.
      	fullSize              	: true,

	// boolean
	//   If set to true the canvas will gain the size of its parent
	//   container.
	// @overrides fullSize
	fitToParent           	: true,

	// float
	//   The initial zoom. Default is 1.0.
	scaleX                	: 1.0,
	scaleY                	: 1.0,

	// If set to true the background grid will be drawn rastered.
	rasterGrid              : true,

	// float
	//    The exponential limit for wrapping down the grid.
	//    (2.0 means: halve the grid each 2.0*n zoom step).
	rasterAdjustFactor    	: 2.0,

	// Draw a crosshair at (0,0).
	drawOrigin              : false,

	// boolean
	//   When set to true then the origin of the XY plane will
	//   be re-adjusted automatically (see the params
	//    offsetAdjust{X,Y}Percent for more).
	autoAdjustOffset      	: true,
	// float
	//   The x- and y- fallback position for the origin after
	//   resizing the canvas.
	offsetAdjustXPercent  	: 50,
	offsetAdjustYPercent  	: 50,

	// int
	//   The canvas size fallback if no automatic resizing
	//   is switched on.
	defaultCanvasWidth    	: 1024,
	defaultCanvasHeight   	: 768,

	// float
	//   Two scaling factors (width and height) upon the canvas size.
	//   In combination with cssScale{X,Y} this can be used to obtain
	//   sub pixel resolutions for retina displays.
	canvasWidthFactor     	: 1.0,
	canvasHeightFactor    	: 1.0,

	// float
	//   Visually resize the canvas using CSS transforms (scale).
	cssScaleX	       	: 1.0,
	cssScaleY	       	: 1.0,

	// boolean
	//   If set to true only cssScaleX applies for both dimensions.
	cssUniformScale         : true,

	// string
	//   A background color (CSS string) for the canvas.
	backgroundColor       	: '#ffffff',

	// boolean
	//   Switch auto-redrawing on resize on/off (some applications
	//   might want to prevent automatic redrawing to avoid data
	//   loss from the drae buffer).
	redrawOnResize        	: true,

	// boolean
	//   Indicates if Bézier curve handles should be drawn (used for
	//   editors, no required in pure visualizations).
	drawBezierHandleLines 	: true,

	// boolean
	//   Indicates if Bézier curve handle points should be drawn.
	drawBezierHandlePoints 	: true,

	// function
	//   A callback function that will be triggered just before the draw
	//   function starts.
	preDraw               	: function() { console.log('before drawing.'); },

	// function
	//   A callback function that will be triggered right after the drawing
	//   process finished.
	postDraw              	: function() { console.log('after drawing.'); },

	// boolean
	//   Indicates if the application should handle mouse events for you.
	enableMouse           	: true,

	// boolean
	//   Indicates if the application should handle touch events for you.
	enableTouch           	: true,

	// boolean
	//   Indicates if the application should handle key events for you.
	enableKeys            	: true
  } );
~~~					  

## Events
The Vertex class has basic drag event support:
~~~javascript
   var vert = new Vertex(100,100);
   vert.listeners.addDragListener( function(e) {
   // e is of type Event.
   // You are encouraged to use the values in the object e.params
   console.log( 'vertex was dragged by: ',
   		'x='+e.params.dragAmount.x,
		'y='+e.params.dragAmount.y );
	} );
~~~


### The e.params object
~~~javascript
   {
      // The canvas that fired the event.
      element : [HTMLElement],
      
      // The event name.
      //   Default: 'drag'
      name : string,

      // The current drag position.
      pos : { x : Number, y : Number },

      // A mouse button indicator (if mouse event).
      //    0=left, 1=middle, 2=right
      button : Number,

      // A flag indicating if event comes from left mouse button.
      leftButton : boolean,

      // A flag indicating if event comes from middle mouse button.
      middleButton : boolean,

      // A flag indicating if event comes from right mouse button.
      rightButton : boolean,

      // A mouse-down-position: position where the dragging
      //   started. This will not change during one drag process.
      mouseDownPos : { x : Number, y : Number },

      // The most recent draw position (position before
      //   current drag step).
      draggedFrom : mouseDragPos,

      // True if this is a drag event (nothing else possible at the moment).
      wasDragged : boolean,

      // The x-y-amount of the current drag step.
      //   This is the difference between the recent drag step
      //   and the actual drag position.
      dragAmount : { x : Number, y : Number }
   }
~~~




## Usage
 * [SHIFT] + [Click] : Select/Deselect vertex
 * [Y] + [Click]: Toggle Bézier auto-adjustment for clicked bézier path point
 * [ALT or CTRL] + [Mousedown] + [Drag] : Pan the area
 * [Mousewheel-up] : Zoom in
 * [Mousewheel-down] : Zoom out


## Re-compile the package

The package is compiled with webpack. See the webpack.config.js file.

### Install webpack
This will install the npm-webpack package with the required dependencies
for you from the package.json file.
~~~bash
 $ npm install
~~~


### Run webpack
This will generate the ./dist/plot-boilerplate.min.js file for you
from the sources code files in ./src/*.
~~~bash
 $ npm run webpack
~~~


## Todos
 * Make strokes configurable (color, width, style).
 * Make Bézier Curves dividable (by double click?).
 * Implement snap-to-grid.
 * Make ellipses rotatable.
 * Write better viewport/viewbox export. Some viewers do not understand the current format. Refactor BoundingBox2 for this?
 * Add arcs?
 * Add image flipping.
 * Add Images to the SVGBuiler.
 * Move the helper function PlotBoilerplate.utils.buildArrowHead to the Vector class. It belongs there.
 * Add image/svg support (adding SVG images).
 



## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>iOS Safari |
| --------- | --------- | --------- | --------- |
| IE11 & Edge| latest    | latest    | latest    |
  



### Dependencies
* HTML5 Canvas


### Used Libraries
* dat.gui
* Color.js
* FileSaver.js
* SGV-arcto to Canvas-arc transform from [canvg](https://github.com/canvg/canvg "canvg") by Gabe Lerner
* [Touchy.js](https://github.com/jairajs89/Touchy.js "Touchy.js") by [jairajs89](https://github.com/jairajs89 "jairajs89") 



## Known bugs
 * BezierPath counstructor (from an older implementation) fails. This needs to be refactored.
 * SVG resizing does not work in Firefox (aspect ratio is always kept, even if clip box changes). Please use PNGs until this is fixed.
 * Currently no more known. Please report bugs.





