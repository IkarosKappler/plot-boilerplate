# Plotting boilerplate
For Javascript and canvas with 2d-context.

![Current demo](screenshot-20181209_0.png "Current demo")

![Plotting the Feigenbaum bifurcation](screenshot-20181209_3_feigenbaum.png "Plotting the Feigenbaum bifurcation")


[Live Demo](https://www.int2byte.de/public/plot-boilerplate/main-dist.html "Live Demo")

## Install webpack
This will install the npm-webpack package for you from the package.json file.
~~~~
 $ npm install
~~~~


## Run webpack
This will generate the ./dist/plot-boilerplate.min.js file for you
from the sources code files in ./src/*.
~~~~
 $ npm run webpack
~~~~

## The HTML file
For details see main-dist.html:
~~~~html
    <canvas id="my-canvas">Your browser does not support the canvas tag.</canvas>

    <div class="info monospace">
      [<span id="cx">-</span>,<span id="cy">-</span>]
    </div>
~~~~


## Initialize the canvas
~~~~javascript
 var bp = new PlotBoilerplate( { canvas                : document.getElementById('my-canvas'),					    
			       	 fullSize              : true,
				 fitToParent           : true,
				 scaleX                : 1.0,
				 scaleY                : 1.0,
				 rasterGrid            : true,
				 backgroundColor       : '#ffffff',
				 preDraw               : function() { console.log('before drawing.'); },
				 postDraw              : function() { console.log('after drawing.'); }
				} );
~~~~					  


## Usage
 * [SHIFT] + [Click] : Select/Deselect vertex
 * [Y] + [Click]: Toggle Bézier auto-adjustment
 * [ALT] + [Mousedown] + [Drag] : Pan the area
 * [Mousewheel-up] : Zoom in
 * [Mousewheel-down] : Zoom out


### Todos
* Make strokes configurable (color, width, style).
* Add pad/phone support.
* Implement optional canvas zoom.
* Implement optional canvas rotation.
* Make Bézier Curves dividable.
* Implement snap-to-grid.
* Add logarithmic reduction of the grid (too many grid points when zoom gets too small, too few when zoom gets too high).
* Make ellipses rotatable.
* Write better viewport/viewbox export. Some viewers do not understand the current format. Refactor BoundingBox2 for this?
* Add arcs?
* Add a flag indicating if the resize handler should really always re-center the draw offset.


### Changelog
* 2018-12-09
  * Minimal zoom is now 0.01.
  * Added Grid.utils.baseLog(Nnumber,Number) and Grid.utils.mapRasterScale(Number,Number).
  * Bézier control points are not selectable any more.
  * Basic SVG export works now.
  * Added toSVGString to VEllipse class.
  * Added to SVGString to Polygon class.
  * Added a Line class.
  * Changed Bézier control points rendering.
  * Added a demo plot: main-feigenbaum.html.
* 2018-12-06
  * Changed the CTRL key to the ALT key (for panning).
  * Fixed a translate an scale issue in the SVG builder.
  * The constructor's config-param is in use now.
* 2018-12-05
  * Added the Vertex.sub(x,y) function.
  * Added the Line class.
  * Moved the demo code (Line, Polygon, Bezier, Circle) to the index.js file.
  * Expanded the Vertex.add(...) function. Now add(number,number) and add(Vertex) are allowed.
* 2018-12-04
  * Added a simple SVGBuilder.
* 2018-11-30
  * Added the mouse position display.
* 2018-11-28
  * Extended the VertexAttr class (extended the event params by the affected vertex).
  * Added BezierPath.locateCurveBy*Point(Vertex) functions.
  * Added the mousewheel listener to the MouseHandler.
  * Added mousewheel zoom.
  * Added the VEllipse (vertex-ellipse) class and ellipse drawing.
  * Added the Grid class.
  * Added the grid() function to the draw class.
* 2018-11-27
  * Added an attribute model to the VertexAttr class.
  * Changing bezier path points with holding down 'y'+click is now possible (bezier-autoadjust).
  * Added a new function to the draw class: diamondHandle.
* 2018-11-20
  * Bézier curve does now auto adjust when dragging path points and control points.
  * BezierPath implementation now support circular paths.
  * Fixed some issues in the dat.gui interface configuration. Axis independent scaling works now.
* 2018-11-19
  * Re-animated the CubicBezierCurve class and the BezierPath class.
  * Added multi-select and multi-drag option.
  * Made elements selectable (with holding SHIFT).
  * Added panning (move the canvas origin by pressing CTRL and drag).
  * Implemented zoom into dat.gui interface.
* 2018-11-17
  * Added the Polygon class.
  * Added npm/webpack for compiling and code minification.
* 2018-11-11
  * Added a simple KeyHandler for receiving key events.
* 2018-11-10
  * Renamed the js/ direcotory to src/.
* 2018-11-09
  * Refactored the main script to a class.
* 2018-10-31
  * Added the Vertex class from an older project.
  * Added the VertexAttr class (not yet in use).
  * Added the VertexListeners class (not yet in use).
  * Added the MouseListener from an older project.
  * Can drag vertices around now.
* 2018-10-23
  * Init.
  

### Dependencies
* HTML5 Canvas


### Used Libraries
* dat.gui
* Color.js
* FileSaver.js
* SGV-arcto to Canvas-arc transform from https://github.com/canvg/canvg by Gabe Lerner
   