/**
 * UNFINISHED
 *
 * @author   Ikaros Kappler
 * @date     2021-01-03
 * @version  0.0.1
 **/


import { Bounds } from "../../Bounds";
import { CubicBezierCurve } from "../../CubicBezierCurve";
import { Polygon } from "../../Polygon";
import { Vertex } from "../../Vertex";
import { XYCoords, XYDimension, SVGSerializable } from "../../interfaces";


/**
 * @classdesc A helper class for basic SVG drawing operations. This class should
 * be compatible to the default 'draw' class.
 *
 * @requires CubicBzierCurvce
 * @requires Polygon
 * @requires SVGSerializable
 * @requires Vertex
 * @requires XYCoords
 */
export class drawutilssvg {

    svgNode:SVGElement;
    
    scale:Vertex;

    offset:Vertex;

    fillShapes:boolean;

    canvasSize:XYDimension;
    
    viewport:Bounds;
    
    /**
     * The constructor.
     *
     * @constructor
     * @name drawutilssvg
     * @param {SVGElement} svgNode - The SVG node to use.
     * @param {boolean} fillShapes - Indicates if the constructed drawutils should fill all drawn shapes (if possible).
     **/
    constructor( svgNode:SVGElement, canvasSize:XYDimension, viewport:Bounds, fillShapes:boolean ) {
	this.svgNode = svgNode;
	this.offset = new Vertex( 0, 0 );
	this.scale = new Vertex( 1, 1 );
	this.fillShapes = fillShapes;
	this.canvasSize = canvasSize;
	this.viewport = viewport;

	// console.log('viewport', viewport );
	this.svgNode.setAttribute('viewBox', `${this.viewport.min.x} ${this.viewport.min.y} ${this.viewport.width} ${this.viewport.height}`);
	this.svgNode.setAttribute('width', `${this.canvasSize.width}` );
	this.svgNode.setAttribute('height', `${this.canvasSize.height}` );
    };

    private createNode( name:string ) : SVGElement {
	// const node : HTMLElement = document.createElement(name);
	const node : SVGElement = document.createElementNS("http://www.w3.org/2000/svg", name);
	this.svgNode.appendChild( node );
	return node;
    };

    /**
     * Called before each draw cycle.
     * This is required for compatibility with other draw classes in the library.
     **/
    beginDrawCycle() {
	// NOOP
    };


    // private _x2rel(x:number) : number { return (this.scale.x*x+this.offset.x)/this.gl.canvas.width*2.0-1.0; };
    // private _y2rel(y:number) : number { return (this.scale.y*y+this.offset.y)/this.gl.canvas.height*2.0-1.0; };

    private _x(x:number) : number { return this.offset.x + this.scale.x * x; }
    private _y(y:number) : number { return this.offset.y + this.scale.y * y; }

    /**
     * Draw the line between the given two points with the specified (CSS-) color.
     *
     * @method line
     * @param {Vertex} zA - The start point of the line.
     * @param {Vertex} zB - The end point of the line.
     * @param {string} color - Any valid CSS color string.
     * @param {number=1} lineWidth? - [optional] The line's width.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    line( zA:Vertex, zB:Vertex, color:string, lineWidth?:number ) {
	// NOT YET IMPLEMENTED
	const line : SVGElement = this.createNode('line');
	line.setAttribute('x1', `${this._x(zA.x)}` );
	line.setAttribute('y1', `${this._y(zA.y)}` );
	line.setAttribute('x2', `${this._x(zB.x)}` );
	line.setAttribute('y2', `${this._y(zB.y)}` );
	if( this.fillShapes )
	    line.setAttribute('fill', color);
	else 
	    line.setAttribute('stroke', color);
	line.setAttribute('stroke-width', `${lineWidth || 1}`);
	// console.log('line', line);
    };


    /**
     * Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method arrow
     * @param {Vertex} zA - The start point of the arrow-line.
     * @param {Vertex} zB - The end point of the arrow-line.
     * @param {string} color - Any valid CSS color string.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    arrow( zA:Vertex, zB:Vertex, color:string ) {
	// NOT YET IMPLEMENTED
	const lineWidth :number = 1;
	const path : SVGElement = this.createNode('path');
	// line.setAttribute('x1', `${this._x(zA.x)}` );
	// line.setAttribute('y1', `${this._y(zA.y)}` );
	// line.setAttribute('x2', `${this._x(zB.x)}` );
	// line.setAttribute('y2', `${this._y(zB.y)}` );
	// if( this.fillShapes )
	//     line.setAttribute('fill', color);
	// else 
	//     line.setAttribute('stroke', color);
	// line.setAttribute('stroke-width', `${lineWidth || 1}`);

	var headlen:number = 8;   // length of head in pixels
	// var vertices = PlotBoilerplate.utils.buildArrowHead( zA, zB, headlen, this.scale.x, this.scale.y );
	// var vertices : Array<Vertex> = Vertex.utils.buildArrowHead( zA, zB, headlen, this.scale.x, this.scale.y );
	
	// this.ctx.save();
	// this.ctx.beginPath();
	var vertices : Array<Vertex> = Vertex.utils.buildArrowHead( zA, zB, headlen, this.scale.x, this.scale.y );

	const d : Array<string|number> = [
	    'M', this._x(zA.x), this._y(zA.y)
	];
	// this.ctx.moveTo( this.offset.x+zA.x*this.scale.x, this.offset.y+zA.y*this.scale.y );
	for( var i = 0; i <= vertices.length; i++ ) {
	    // this.ctx.lineTo( this.offset.x+vertices[i].x, this.offset.y+vertices[i].y );
	    d.push( this._x(vertices[i%vertices.length].x) );
	    d.push( this._y(vertices[i%vertices.length].y) );
	}
	// this.ctx.lineTo( this.offset.x+vertices[0].x, this.offset.y+vertices[0].y );
	// this.ctx.lineWidth = 1;
	// this._fillOrDraw( color );
	// this.ctx.restore();

	if( this.fillShapes ) 
	    path.setAttribute('fill', color);
	else
	    path.setAttribute('stroke', color);
	path.setAttribute('stroke-width', `${lineWidth || 1}`);
	
	path.setAttribute( 'd', d.join(' ') );
    };


    /**
     * Draw an image at the given position with the given size.<br>
     * <br>
     * Note: SVG images may have resizing issues at the moment.Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method image
     * @param {Image} image - The image object to draw.
     * @param {Vertex} position - The position to draw the the upper left corner at.
     * @param {Vertex} size - The x/y-size to draw the image with.
     * @return {void}
     * @instance
     * @memberof drawutils
     **/
    image( image:HTMLImageElement, position:Vertex, size:Vertex ) {
	// NOT YET IMPLEMENTED
    };

    
    // +---------------------------------------------------------------------------------
    // | This is the final helper function for drawing and filling stuff. It is not
    // | intended to be used from the outside.
    // |
    // | When in draw mode it draws the current shape.
    // | When in fill mode it fills the current shape.
    // |
    // | This function is usually only called internally.
    // |
    // | @param color A stroke/fill color to use.
    // +-------------------------------
    //_fillOrDraw( color:string ) {
	// NOT YET IMPLEMENTED
    //};


    /**
     * Draw the given (cubic) bézier curve.
     *
     * @method cubicBezier
     * @param {Vertex} startPoint - The start point of the cubic Bézier curve
     * @param {Vertex} endPoint   - The end point the cubic Bézier curve.
     * @param {Vertex} startControlPoint - The start control point the cubic Bézier curve.
     * @param {Vertex} endControlPoint   - The end control point the cubic Bézier curve.
     * @param {string} color - The CSS color to draw the curve with.
     * @param {number} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    cubicBezier( startPoint:Vertex, endPoint:Vertex, startControlPoint:Vertex, endControlPoint:Vertex, color:string, lineWidth?:number ) {
	// NOT YET IMPLEMENTED
	if( startPoint instanceof CubicBezierCurve ) {
	    this.cubicBezier( startPoint.startPoint, startPoint.endPoint, startPoint.startControlPoint, startPoint.endControlPoint, color, lineWidth );
	    return;
	}
	const path : SVGElement = this.createNode('path');
	
	// Draw curve
	//this.ctx.save();
	//this.ctx.beginPath();
	// this.ctx.moveTo( this.offset.x+startPoint.x*this.scale.x, this.offset.y+startPoint.y*this.scale.y );
	const d : Array<string|number> = [
	    'M', this._x(startPoint.x), this._y(startPoint.y),
	    'C', this._x(startControlPoint.x), this._y(startControlPoint.y), this._x(endControlPoint.x), this._y(endControlPoint.y), this._x(endPoint.x), this._y(endPoint.y)
	];
	// this.ctx.bezierCurveTo( this.offset.x+startControlPoint.x*this.scale.x, this.offset.y+startControlPoint.y*this.scale.y,
	//			this.offset.x+endControlPoint.x*this.scale.x, this.offset.y+endControlPoint.y*this.scale.y,
	//			this.offset.x+endPoint.x*this.scale.x, this.offset.y+endPoint.y*this.scale.y );
	//this.ctx.closePath();
	//this.ctx.lineWidth = lineWidth || 2;

	if( this.fillShapes ) 
	    path.setAttribute('fill', color);
	else
	    path.setAttribute('stroke', color);
	path.setAttribute('stroke-width', `${lineWidth || 1}`);	
	path.setAttribute( 'd', d.join(' ') );	
    };


    /**
     * Draw the given (cubic) Bézier path.
     *
     * The given path must be an array with n*3+1 vertices, where n is the number of
     * curves in the path:
     * <pre> [ point1, point1_startControl, point2_endControl, point2, point2_startControl, point3_endControl, point3, ... pointN_endControl, pointN ]</pre> 
     *
     * @method cubicBezierPath
     * @param {Vertex[]} path - The cubic bezier path as described above.
     * @param {string} color - The CSS colot to draw the path with.
     * @param {number=1} lineWidth - (optional) The line width to use.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    cubicBezierPath( path:Array<Vertex>, color:string, lineWidth?:number ) {
	// NOT YET IMPLEMENTED
	if( !path || path.length == 0 )
	    return;

	const pathNode : SVGElement = this.createNode('path');
	
	// Draw curve
	//this.ctx.save();
	//this.ctx.beginPath();
	// this.ctx.moveTo( this.offset.x+startPoint.x*this.scale.x, this.offset.y+startPoint.y*this.scale.y );
	const d : Array<string|number> = [
	    'M', this._x(path[0].x), this._y(path[0].y)
	    // 'C', this._x(startControlPoint.x), this._y(startControlPoint.y), this._x(endControlPoint.x), this._y(endControlPoint.y), this._x(endPoint.x), this._y(endPoint.y), t
	    
	];
	
	// Draw curve path
	// this.ctx.save();
	// this.ctx.beginPath();
	var // curve:any,
	startPoint:Vertex,
	endPoint:Vertex,
	startControlPoint:Vertex,
	endControlPoint:Vertex;
	// this.ctx.moveTo( this.offset.x+path[0].x*this.scale.x, this.offset.y+path[0].y*this.scale.y );
	for( var i = 1; i < path.length; i+=3 ) {
	    startControlPoint = path[i];
	    endControlPoint = path[i+1];
	    endPoint = path[i+2];
	    /* this.ctx.bezierCurveTo( this.offset.x+startControlPoint.x*this.scale.x, this.offset.y+startControlPoint.y*this.scale.y,
				    this.offset.x+endControlPoint.x*this.scale.x, this.offset.y+endControlPoint.y*this.scale.y,
				    this.offset.x+endPoint.x*this.scale.x, this.offset.y+endPoint.y*this.scale.y );
	    */
	    d.push( 'C', this._x(startControlPoint.x), this._y(startControlPoint.y), this._x(endControlPoint.x), this._y(endControlPoint.y), this._x(endPoint.x), this._y(endPoint.y) );
	    
	}
	// this.ctx.closePath();
	// this.ctx.lineWidth = 1;
	// this._fillOrDraw( color );
	// this.ctx.restore();

	if( this.fillShapes ) 
	    pathNode.setAttribute('fill', color);
	else
	    pathNode.setAttribute('stroke', color);
	pathNode.setAttribute('stroke-width', `${lineWidth || 1}`);	
	pathNode.setAttribute( 'd', d.join(' ') );
    };


    /**
     * Draw the given handle and handle point (used to draw interactive Bézier curves).
     *
     * The colors for this are fixed and cannot be specified.
     *
     * @method handle
     * @param {Vertex} startPoint - The start of the handle.
     * @param {Vertex} endPoint - The end point of the handle.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    handle( startPoint:Vertex, endPoint:Vertex ) { 
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw the given handle cubic Bézier curve handle lines.
     *
     * The colors for this are fixed and cannot be specified.
     *
     * @method cubicBezierCurveHandleLines
     * @param {CubicBezierCurve} curve - The curve.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    cubicBezierCurveHandleLines( curve:CubicBezierCurve ) {
	// NOT YET IMPLEMENTED
    };

    
    /**
     * Draw a handle line (with a light grey).
     *
     * @method handleLine
     * @param {Vertex} startPoint - The start point to draw the handle at.
     * @param {Vertex} endPoint - The end point to draw the handle at.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    handleLine( startPoint:Vertex, endPoint:Vertex ) {
	// NOT YET IMPLEMENTED
    };


    
    /**
     * Draw a 1x1 dot with the specified (CSS-) color.
     *
     * @method dot
     * @param {Vertex} p - The position to draw the dot at.
     * @param {string} color - The CSS color to draw the dot with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    dot( p:Vertex, color:string ) {
	// NOT YET IMPLEMENTED
    };

    
    /**
     * Draw the given point with the specified (CSS-) color and radius 3.
     *
     * @method point
     * @param {Vertex} p - The position to draw the point at.
     * @param {string} color - The CSS color to draw the point with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    point( p:Vertex, color:string ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw a circle with the specified (CSS-) color and radius.<br>
     * <br>
     * Note that if the x- and y- scales are different the result will be an ellipse rather than a circle.
     *
     * @method circle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    circle( center:Vertex, radius:number, color:string ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw a circular arc (section of a circle) with the given CSS color.
     *
     * @method circleArc
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {number} startAngle - The angle to start at.
     * @param {number} endAngle - The angle to end at.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    circleArc( center:Vertex, radius:number, startAngle:number, endAngle:number, color:string, lineWidth?:number ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw an ellipse with the specified (CSS-) color and thw two radii.
     *
     * @method ellipse
     * @param {Vertex} center - The center of the ellipse.
     * @param {number} radiusX - The radius of the ellipse.
     * @param {number} radiusY - The radius of the ellipse.
     * @param {string} color - The CSS color to draw the ellipse with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    ellipse( center:Vertex, radiusX:number, radiusY:number, color:string ) {
	// NOT YET IMPLEMENTED
    };   


    /**
     * Draw square at the given center, size and with the specified (CSS-) color.<br>
     * <br>
     * Note that if the x-scale and the y-scale are different the result will be a rectangle rather than a square.
     *
     * @method square
     * @param {Vertex} center - The center of the square.
     * @param {Vertex} size - The size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    square( center:Vertex, size:number, color:string ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw a grid of horizontal and vertical lines with the given (CSS-) color.
     *
     * @method grid
     * @param {Vertex} center - The center of the grid.
     * @param {number} width - The total width of the grid (width/2 each to the left and to the right).
     * @param {number} height - The total height of the grid (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal grid size.
     * @param {number} sizeY - The vertical grid size.
     * @param {string} color - The CSS color to draw the grid with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    grid( center:Vertex, width:number, height:number, sizeX:number, sizeY:number, color:string ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw a raster of crosshairs in the given grid.<br>
     *
     * This works analogue to the grid() function
     *
     * @method raster
     * @param {Vertex} center - The center of the raster.
     * @param {number} width - The total width of the raster (width/2 each to the left and to the right).
     * @param {number} height - The total height of the raster (height/2 each to the top and to the bottom).
     * @param {number} sizeX - The horizontal raster size.
     * @param {number} sizeY - The vertical raster size.
     * @param {string} color - The CSS color to draw the raster with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    raster( center:Vertex, width:number, height:number, sizeX:number, sizeY:number, color:string ) {
	// NOT YET IMPLEMENTED
    };
    

    /**
     * Draw a diamond handle (square rotated by 45°) with the given CSS color.
     *
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped diamonds.
     *
     * @method diamondHandle
     * @param {Vertex} center - The center of the diamond.
     * @param {Vertex} size - The x/y-size of the diamond.
     * @param {string} color - The CSS color to draw the diamond with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    diamondHandle( center:Vertex, size:number, color:string ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw a square handle with the given CSS color.<br>
     * <br>
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped squares.
     *
     * @method squareHandle
     * @param {Vertex} center - The center of the square.
     * @param {Vertex} size - The x/y-size of the square.
     * @param {string} color - The CSS color to draw the square with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    squareHandle( center:Vertex, size:number, color:string ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw a circle handle with the given CSS color.<br>
     * <br>
     * It is an inherent featur of the handle functions that the drawn elements are not scaled and not
     * distorted. So even if the user zooms in or changes the aspect ratio, the handles will be drawn
     * as even shaped circles.
     *
     * @method circleHandle
     * @param {Vertex} center - The center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {string} color - The CSS color to draw the circle with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    circleHandle( center:Vertex, size:number, color:string ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw a crosshair with given radius and color at the given position.<br>
     * <br>
     * Note that the crosshair radius will not be affected by scaling.
     *
     * @method crosshair
     * @param {XYCoords} center - The center of the crosshair.
     * @param {number} radius - The radius of the crosshair.
     * @param {string} color - The CSS color to draw the crosshair with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    crosshair( center:XYCoords, radius:number, color:string ) {
	// NOT YET IMPLEMENTED	
    };


    /**
     * Draw a polygon.
     *
     * @method polygon
     * @param {Polygon} polygon - The polygon to draw.
     * @param {string} color - The CSS color to draw the polygon with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    polygon( polygon:Polygon, color:string, lineWidth?:number ) {	
	// NOT YET IMPLEMENTED
    };


    /**
     * Draw a polygon line (alternative function to the polygon).
     *
     * @method polyline
     * @param {Vertex[]} vertices - The polygon vertices to draw.
     * @param {boolan}   isOpen   - If true the polyline will not be closed at its end.
     * @param {string}   color    - The CSS color to draw the polygon with.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    polyline( vertices:Array<Vertex>, isOpen:boolean, color:string ) {
	// NOT YET IMPLEMENTED
    };

    text( text:string, x:number, y:number, options?:{color?:string}) {
     	   // NOT YET IMPLEMENTED
    };
    

    /**
     * Draw a non-scaling text label at the given position.
     *
     * @method label
     * @param {string} text - The text to draw.
     * @param {number} x - The x-position to draw the text at.
     * @param {number} y - The y-position to draw the text at.
     * @param {number=} rotation - The (aoptional) rotation in radians.
     * @return {void}
     * @instance
     * @memberof drawutils
     */
    // +---------------------------------------------------------------------------------
    // | Draw a non-scaling text label at the given position.
    // +-------------------------------
    label( text:string, x:number, y:number, rotation:number ) {
	// NOT YET IMPLEMENTED
    };


    /**
     * Due to gl compatibility there is a generic 'clear' function required
     * to avoid accessing the context object itself directly.
     *
     * This function just fills the whole canvas with a single color.
     *
     * @param {string} color - The color to clear with.
     **/
    clear( color:string ) {
	// NOT YET IMPLEMENTED
    };

    
}
