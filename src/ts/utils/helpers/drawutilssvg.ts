/**
 * Draws elements into an SVG node.
 *
 * @author   Ikaros Kappler
 * @date     2021-01-03
 * @modified 2021-01-24 Fixed the `fillShapes` attribute in the copyInstance function.
 * @modified 2021-01-26 Changed the `isPrimary` (default true) attribute to `isSecondary` (default false).
 * @version  0.2.1
 **/


import { Bounds } from "../../Bounds";
import { CircleSector } from "../../CircleSector";
import { CubicBezierCurve } from "../../CubicBezierCurve";
import { Polygon } from "../../Polygon";
import { Vertex } from "../../Vertex";
import { DrawConfig, DrawLib, DrawSettings, XYCoords, XYDimension, SVGPathParams, SVGSerializable, UID } from "../../interfaces";


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
export class drawutilssvg implements DrawLib<void|SVGElement> {

    /**
     * @member {SVGElement}
     * @memberof drawutilssvg
     * @instance
     */
    svgNode : SVGElement;

    /**
     * The root elements container <g> in the svgNode.
     */
    private gNode : SVGElement;

    /**
     * @member {Vertex}
     * @memberof drawutilssvg
     * @instance
     */
    scale:Vertex;

    /**
     * @member {Vertex}
     * @memberof drawutilssvg
     * @instance
     */
    offset:Vertex;

    /**
     * @member {boolean}
     * @memberof drawutilssvg
     * @instance
     */
    fillShapes:boolean;

    /**
     * @member {XYDimension}
     * @memberof drawutilssvg
     * @instance
     */
    canvasSize:XYDimension;

    /**
     * The current drawable-ID. This can be any unique ID identifying the following drawn element.
     *
     * @member {UID|undefined}
     * @memberof drawutilssvg
     * @instance
     */  
    private curId : UID | undefined;

    /**
     * The current drawable-classname.
     */
    private curClassName : string | undefined;
    
    /**
     * The SVG element cache. On clear() all elements are kept for possible re-use on next draw cycle.
     */
    private cache : Map<UID,SVGElement>;

    /**
     * Indicates if this library is the primary or seconday instance (draw an fill share the same DOM nodes).
     */
    private isSecondary : boolean;

    
    /**
     * The constructor.
     *
     * @constructor
     * @name drawutilssvg
     * @param {SVGElement} svgNode - The SVG node to use.
     * @param {XYCoords} offset - The draw offset to use.
     * @param {XYCoords} scale - The scale factors to use.
     * @param {XYDimension} canvasSize - The initial canvas size (use setSize to change).
     * @param {boolean} fillShapes - Indicates if the constructed drawutils should fill all drawn shapes (if possible).
     * @param {DrawConfig} drawConfig - The default draw config to use for CSS fallback styles.
     * @param {boolean=} isSecondary - (optional) Indicates if this is the primary or secondary instance. Only primary instances manage child nodes.
     * @param {SVGElement=} gNode - (optional) Primary and seconday instances share the same &lt;g> node.
     **/
    constructor( svgNode:SVGElement,
		 offset:XYCoords,
		 scale:XYCoords,
		 canvasSize:XYDimension,
		 fillShapes:boolean,
		 drawConfig:DrawConfig,
		 isSecondary?:boolean,
		 gNode?:SVGElement,
	       ) {
	this.svgNode = svgNode;
	this.offset = new Vertex( 0, 0 ).set(offset);
	this.scale = new Vertex( 1, 1 ).set(scale);
	this.fillShapes = fillShapes;
	this.isSecondary = isSecondary;
	
	this.cache = new Map<UID,SVGElement>();
	this.setSize( canvasSize );
	if( isSecondary ) {
	    this.gNode = gNode;
	} else {
	    this.addStyleDefs( drawConfig );
	    this.gNode = this.createSVGNode('g');
	    this.svgNode.appendChild( this.gNode );
	} 
    };

    private addStyleDefs( drawConfig ) {
	const nodeDef : SVGElement = this.createSVGNode('def');
	const nodeStyle : HTMLStyleElement = document.createElement('style');
	nodeDef.appendChild(nodeStyle);
	this.svgNode.appendChild(nodeDef);

	// Which default styles to add? -> All from the DrawConfig.
	// Compare with DrawConfig interface
	const keys = {
	    'polygon' : 'Polygon',
	    'triangle' : 'Triangle',
	    'ellipse' : 'Ellipse',
	    'circle' : 'Circle',
	    'circleSector' : 'CircleSector',
	    'vertex' : 'Vertex',
	    'line' : 'Line',
	    'vector' : 'Vector',
	    'image' : 'Image'
	};
	// Question: why isn't this working if the svgNode is created dynamically? (nodeStyle.sheet is null)
	/* 
	for( var k in keys ) {
	    const className : string = keys[k];
	    const drawSettings : DrawSettings = drawConfig[k];
	    if( drawSettings ) { 
		nodeStyle.sheet.insertRule(`.${className} { fill : none; stroke: ${drawSettings.color}; line-width: ${drawSettings.lineWidth}px }`);
	    }
	    } */
	// Ugly fix: insert rules using innerHtml :/
	const rules = [];
	for( var k in keys ) {
	    const className : string = keys[k];
	    const drawSettings : DrawSettings = drawConfig[k];
	    rules.push(`.${className} { fill : none; stroke: ${drawSettings.color}; line-width: ${drawSettings.lineWidth}px }`);
	}
	nodeStyle.innerHTML = rules.join("\n");
    };


    private findElement( key:UID, nodeName:string ) : SVGElement | undefined {
	var node : SVGElement = this.cache.get(key);
	if( node && node.nodeName.toUpperCase() === nodeName.toUpperCase() ) {
	    this.cache.delete(key);
	    return node;
	}
	return null;
    }

    /**
     * Create a new DOM node [SVG] in the SVG namespace. 
     */
    private createSVGNode( name:string ) : SVGElement {
	return document.createElementNS("http://www.w3.org/2000/svg", name);
    };
    
    /**
     * Make a new SVG node (or recycle an old one) with the given node name (circle, path, line, rect, ...).
     *
     * @method makeNode
     * @private
     * @instance
     * @memberof drawutilssvg
     * @param {string} name - The node name.
     * @return {SVGElement} The new node, which is not yet added to any document.
     */
    private makeNode( name:string ) : SVGElement {
	// Try to find node in current DOM cache.
	// Unique node keys are strictly necessary.

	// Try to recycle an old element from cache.
	var node : SVGElement | undefined = this.findElement(this.curId, name); //this.createSVGNode(name);
	if( !node ) {
	    // If no such old elements exists (key not found, tag name not matching),
	    // then create a new one.
	    node = this.createSVGNode(name);
	}
	return node;
    };

        
    /**
     * This is the final helper function for drawing and filling stuff and binding new
     * nodes to the SVG document.
     * It is not intended to be used from the outside.
     *
     * When in draw mode it draws the current shape.
     * When in fill mode it fills the current shape.
     *
     * This function is usually only called internally.
     *
     * @method _bindFillDraw
     * @private
     * @instance
     * @memberof drawutilssvg
     * @param {SVGElement} node - The node to draw/fill and bind.
     * @param {string} className - The class name(s) to use.
     * @param {string} color - A stroke/fill color to use.
     * @param {number=1} lineWidth - (optional) A line width to use for drawing (default is 1).
     * @return {SVGElement} The node itself (for chaining).
     */
    private _bindFillDraw( node, className:string, color:string, lineWidth?:number ) : SVGElement {
	if( this.curClassName ) {
	    node.setAttribute('class', `${this.curClassName} ${className}`);
	} else {
	    node.setAttribute('class', className );
	}
	node.setAttribute('fill', this.fillShapes ? color : 'none' ); 
	node.setAttribute('stroke', this.fillShapes ? 'none' : color );
	node.setAttribute('stroke-width', `${lineWidth || 1}`);
	if( this.curId ) {
	    node.setAttribute('id',  `${this.curId}`); // Maybe React-style 'key' would be better?
	}
	if( !node.parentNode ) {
	    // Attach to DOM only if not already attached
	    this.gNode.appendChild( node );
	}
	return node;
    };
    

    /**
     * Sets the size and view box of the document. Call this if canvas size changes.
     *
     * @method setSize
     * @instance
     * @memberof drawutilssvg
     * @param {XYDimension} canvasSize - The new canvas size.
     */
    setSize( canvasSize:XYDimension ) {
	this.canvasSize = canvasSize;
	this.svgNode.setAttribute('viewBox', `0 0 ${this.canvasSize.width} ${this.canvasSize.height}`);
	this.svgNode.setAttribute('width', `${this.canvasSize.width}` );
	this.svgNode.setAttribute('height', `${this.canvasSize.height}` );
    };
    

    /**
     * Creates a 'shallow' (non deep) copy of this instance. This implies
     * that under the hood the same gl context and gl program will be used.
     */
    copyInstance( fillShapes:boolean ) : drawutilssvg {
	var copy : drawutilssvg = new drawutilssvg(
	    this.svgNode,
	    this.offset,
	    this.scale,
	    this.canvasSize,
	    fillShapes,
	    null, // no DrawConfig
	    true, // isSecondary
	    this.gNode
	);
	return copy;
    };

    /**
     * This method shouled be called each time the currently drawn `Drawable` changes.
     * It is used by some libraries for identifying elemente on re-renders.
     * 
     * @name setCurrentId
     * @method 
     * @param {UID} uid - A UID identifying the currently drawn element(s).
     * @instance
     * @memberof drawutilssvg
     **/
    setCurrentId( uid : UID|undefined ) : void {
	this.curId = uid;
    };

    /**
     * This method shouled be called each time the currently drawn `Drawable` changes.
     * Determine the class name for further usage here.
     * 
     * @name setCurrentClassName
     * @method 
     * @param {string} className - A class name for further custom use cases.
     * @instance
     * @memberof drawutilssvg
     **/
    setCurrentClassName( className : string|undefined ) : void {
	this.curClassName = className;
    };

    /**
     * Called before each draw cycle.
     * This is required for compatibility with other draw classes in the library.
     *
     * @name beginDrawCycle
     * @method
     * @param {UID=} uid - (optional) A UID identifying the currently drawn element(s).
     * @instance
     * @memberof drawutilssvg
     **/
    beginDrawCycle( renderTime:number ) {
	// Clear non-recycable elements from last draw cycle.
	this.cache.clear();
    };

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
     * @memberof drawutilssvg
     **/
    line( zA:Vertex, zB:Vertex, color:string, lineWidth?:number ) : SVGElement {
	const line : SVGElement = this.makeNode('line');
	line.setAttribute('x1', `${this._x(zA.x)}` );
	line.setAttribute('y1', `${this._y(zA.y)}` );
	line.setAttribute('x2', `${this._x(zB.x)}` );
	line.setAttribute('y2', `${this._y(zB.y)}` );

	return this._bindFillDraw( line, 'line', color, lineWidth || 1 );
    };


    /**
     * Draw a line and an arrow at the end (zB) of the given line with the specified (CSS-) color.
     *
     * @method arrow
     * @param {Vertex} zA - The start point of the arrow-line.
     * @param {Vertex} zB - The end point of the arrow-line.
     * @param {string} color - Any valid CSS color string.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     **/
    arrow( zA:Vertex, zB:Vertex, color:string, lineWidth?:number ) : SVGElement {
	const node : SVGElement = this.makeNode('path');
	var headlen:number = 8;   // length of head in pixels
	var vertices : Array<Vertex> = Vertex.utils.buildArrowHead( zA, zB, headlen, this.scale.x, this.scale.y );
	const d : Array<string|number> = [
	    'M', this._x(zA.x), this._y(zA.y)
	];
	for( var i = 0; i <= vertices.length; i++ ) {
	    d.push( 'L' );
	    // Note: only use offset here (the vertices are already scaled)
	    d.push( this.offset.x + vertices[i%vertices.length].x );
	    d.push( this.offset.y + vertices[i%vertices.length].y );
	}	
	node.setAttribute( 'd', d.join(' ') );
	return this._bindFillDraw( node, 'arrow', color, lineWidth || 1 );
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
     * @memberof drawutilssvg
     **/
    image( image:HTMLImageElement, position:Vertex, size:Vertex ) {
	const node : SVGElement = this.makeNode('image');

	// We need to re-adjust the image if it was not yet fully loaded before.
	const setImageSize = (image) => {
	    if( image.naturalWidth ) {
		const ratioX = size.x/image.naturalWidth;
		const ratioY = size.y/image.naturalHeight;
		node.setAttribute('width', `${image.naturalWidth*this.scale.x}`);
		node.setAttribute('height', `${image.naturalHeight*this.scale.y}`);
		node.setAttribute('display', null); // Dislay when loaded
		node.setAttribute('transform', `translate(${this._x(position.x)} ${this._y(position.y)}) scale(${(ratioX)} ${(ratioY)})` );
	    }
	    
	};
	image.addEventListener('load', (event) => { setImageSize(image); } );
		
	// Safari has a transform-origin bug.
	// Use x=0, y=0 and translate/scale instead (see above)
	node.setAttribute('x', `${0}`);
	node.setAttribute('y', `${0}`);
	node.setAttribute('display', 'none'); // Hide before loaded
	setImageSize( image );
	node.setAttribute('href', image.src );
	return this._bindFillDraw( node, 'image', null, null );
    };


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
     * @memberof drawutilssvg
     */
    cubicBezier( startPoint:Vertex, endPoint:Vertex, startControlPoint:Vertex, endControlPoint:Vertex, color:string, lineWidth?:number ) : SVGElement {
	if( startPoint instanceof CubicBezierCurve ) {
	    return this.cubicBezier( startPoint.startPoint, startPoint.endPoint, startPoint.startControlPoint, startPoint.endControlPoint, color, lineWidth );
	}
	const node : SVGElement = this.makeNode('path');	
	// Draw curve
	const d : Array<string|number> = [
	    'M', this._x(startPoint.x), this._y(startPoint.y),
	    'C', this._x(startControlPoint.x), this._y(startControlPoint.y), this._x(endControlPoint.x), this._y(endControlPoint.y), this._x(endPoint.x), this._y(endPoint.y)
	];
	node.setAttribute( 'd', d.join(' ') );
	return this._bindFillDraw( node, 'cubierBezier', color, lineWidth );
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
     * @memberof drawutilssvg
     */
    cubicBezierPath( path:Array<Vertex>, color:string, lineWidth?:number ) : SVGElement {
	
	const node: SVGElement = this.makeNode('path');
	if( !path || path.length == 0 )
	    return node;
	
	// Draw curve
	const d : Array<string|number> = [
	    'M', this._x(path[0].x), this._y(path[0].y)	    
	];
	
	// Draw curve path
	var 
	startPoint:Vertex,
	endPoint:Vertex,
	startControlPoint:Vertex,
	endControlPoint:Vertex;
	for( var i = 1; i < path.length; i+=3 ) {
	    startControlPoint = path[i];
	    endControlPoint = path[i+1];
	    endPoint = path[i+2];
	    d.push( 'C', this._x(startControlPoint.x), this._y(startControlPoint.y), this._x(endControlPoint.x), this._y(endControlPoint.y), this._x(endPoint.x), this._y(endPoint.y) );
	    
	}	
	node.setAttribute( 'd', d.join(' ') );
	return this._bindFillDraw( node, 'cubicBezierPath', color, lineWidth || 1 );
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
     * @memberof drawutilssvg
     */
    handle( startPoint:Vertex, endPoint:Vertex ) : void {
	// TODO: redefine methods like these into an abstract class?
	this.point( startPoint, 'rgb(0,32,192)' );
	this.square( endPoint, 5, 'rgba(0,128,192,0.5)' );
    };

    
    /**
     * Draw a handle line (with a light grey).
     *
     * @method handleLine
     * @param {Vertex} startPoint - The start point to draw the handle at.
     * @param {Vertex} endPoint - The end point to draw the handle at.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    handleLine( startPoint:Vertex, endPoint:Vertex ): void  {
	this.line( startPoint, endPoint, 'rgb(192,192,192)' );	
    };


    
    /**
     * Draw a 1x1 dot with the specified (CSS-) color.
     *
     * @method dot
     * @param {Vertex} p - The position to draw the dot at.
     * @param {string} color - The CSS color to draw the dot with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    dot( p:Vertex, color:string ) {
	const node : SVGElement = this.makeNode('line');	
	const d : Array<string|number> = [
	    'M', this._x(p.x), this._y(p.y),
	    'L', this._x(p.x+1), this._y(p.y+1)
	];
	return this._bindFillDraw( node, 'dot', color, 1 );
    };

    
    /**
     * Draw the given point with the specified (CSS-) color and radius 3.
     *
     * @method point
     * @param {Vertex} p - The position to draw the point at.
     * @param {string} color - The CSS color to draw the point with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    point( p:Vertex, color:string ) {
	var radius:number = 3;
	const node : SVGElement = this.makeNode('circle');	
	node.setAttribute('cx', `${this._x(p.x)}` );
	node.setAttribute('cy', `${this._y(p.y)}` );
	node.setAttribute('r', `${radius}` );
	return this._bindFillDraw( node, 'point', color, 1 );
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
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    circle( center:Vertex, radius:number, color:string, lineWidth?:number ) {
	const node : SVGElement = this.makeNode('circle');	
	node.setAttribute( 'cx', `${this._x(center.x)}` );
	node.setAttribute( 'cy', `${this._y(center.y)}` );
	node.setAttribute( 'r', `${radius * this.scale.x}` ); // y?
	
	return this._bindFillDraw( node, 'circle', color, lineWidth || 1 );
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
     * @memberof drawutilssvg
     */
    circleArc( center:Vertex, radius:number, startAngle:number, endAngle:number, color:string, lineWidth?:number ) {
	const node : SVGElement = this.makeNode('path');	
	const arcData : SVGPathParams =
	    CircleSector.circleSectorUtils.describeSVGArc(
		this._x(center.x),
		this._y(center.y),
		radius*this.scale.x, // y?
		startAngle, endAngle
	    );
	node.setAttribute('d', arcData.join(' ') );
	return this._bindFillDraw( node, 'circleArc', color, lineWidth || 1 );
    };


    /**
     * Draw an ellipse with the specified (CSS-) color and thw two radii.
     *
     * @method ellipse
     * @param {Vertex} center - The center of the ellipse.
     * @param {number} radiusX - The radius of the ellipse.
     * @param {number} radiusY - The radius of the ellipse.
     * @param {string} color - The CSS color to draw the ellipse with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    ellipse( center:Vertex, radiusX:number, radiusY:number, color:string, lineWidth?:number ) {
	const node : SVGElement = this.makeNode('ellipse');	
	node.setAttribute( 'cx', `${this._x(center.x)}` );
	node.setAttribute( 'cy', `${this._y(center.y)}` );
	node.setAttribute( 'rx', `${radiusX * this.scale.x}` );
	node.setAttribute( 'ry', `${radiusY * this.scale.y}` );
	
	return this._bindFillDraw( node, 'ellipse', color, lineWidth || 1 );
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
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    square( center:Vertex, size:number, color:string, lineWidth?:number ) {	
	const node : SVGElement = this.makeNode('rectangle');	
	node.setAttribute( 'x', `${this._x(center.x-size/2.0)}` );
	node.setAttribute( 'y', `${this._y(center.y-size/2.0)}` );
	node.setAttribute( 'width', `${size * this.scale.x}` );
	node.setAttribute( 'height', `${size * this.scale.y}` );
	
	return this._bindFillDraw( node, 'square', color, lineWidth || 1 );
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
     * @memberof drawutilssvg
     */
    grid( center:Vertex, width:number, height:number, sizeX:number, sizeY:number, color:string ) {
	const node : SVGElement = this.makeNode('path');
	const d : SVGPathParams = [
	];

	var yMin : number = -Math.ceil((height*0.5)/sizeY)*sizeY;
	var yMax : number = height/2;
	for( var x = -Math.ceil((width*0.5)/sizeX)*sizeX; x < width/2; x+=sizeX ) {
	    d.push( 'M', this._x(center.x+x), this._y(center.y+yMin) );
	    d.push( 'L', this._x(center.x+x), this._y(center.y+yMax) );
	}

	var xMin : number = -Math.ceil((width*0.5)/sizeX)*sizeX;
	var xMax : number = width/2;
	for( var y = -Math.ceil((height*0.5)/sizeY)*sizeY; y < height/2; y+=sizeY ) {
	    d.push( 'M', this._x(center.x+xMin), this._y(center.y+y) );
	    d.push( 'L', this._x(center.x+xMax), this._y(center.y+y) );
	}
	node.setAttribute( 'd', d.join(' ') );
	return this._bindFillDraw( node, 'grid', color, 1 );
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
     * @memberof drawutilssvg
     */
    raster( center:Vertex, width:number, height:number, sizeX:number, sizeY:number, color:string ) {	
	const node : SVGElement = this.makeNode('path');
	const d : SVGPathParams = [
	];
	
	var cx : number = 0, cy : number = 0;
	for( var x = -Math.ceil((width*0.5)/sizeX)*sizeX; x < width/2; x+=sizeX ) {
	    cx++;
	    for( var y = -Math.ceil((height*0.5)/sizeY)*sizeY; y < height/2; y+=sizeY ) {
		if( cx == 1 ) cy++;
		// Draw a crosshair
		d.push( 'M', this._x(center.x+x)-4, this._y(center.y+y) );
		d.push( 'L', this._x(center.x+x)+4, this._y(center.y+y) );

		d.push( 'M', this._x(center.x+x), this._y(center.y+y)-4 );
		d.push( 'L', this._x(center.x+x), this._y(center.y+y)+4 );
	    }
	}
	node.setAttribute( 'd', d.join(' ') );
	
	return this._bindFillDraw( node, 'raster', color, 1 );
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
     * @memberof drawutilssvg
     */
    diamondHandle( center:Vertex, size:number, color:string ) {
	const node : SVGElement = this.makeNode('path');	
	const d : SVGPathParams = [
	    'M', this._x(center.x) - size/2.0, this._y(center.y),
	    'L', this._x(center.x), this._y(center.y) - size/2.0,
	    'L', this._x(center.x) + size/2.0, this._y(center.y),
	    'L', this._x(center.x), this._y(center.y) + size/2.0,
	    'Z'
	];	;
	node.setAttribute('d', d.join(' '));
	return this._bindFillDraw( node, 'diamondHandle', color, 1 );
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
     * @memberof drawutilssvg
     */
    squareHandle( center:Vertex, size:number, color:string ) {
	const node : SVGElement = this.makeNode('rect');	
	node.setAttribute('x', `${this._x(center.x)-size/2.0}`);
	node.setAttribute('y', `${this._y(center.y)-size/2.0}`);
	node.setAttribute('width', `${size}`);
	node.setAttribute('height', `${size}`);
	return this._bindFillDraw( node, 'squareHandle', color, 1 );
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
     * @memberof drawutilssvg
     */
    circleHandle( center:Vertex, radius:number, color:string ) {
	radius = radius || 3;
	
	const node : SVGElement = this.makeNode('circle');	
	node.setAttribute('cx', `${this._x(center.x)}`);
	node.setAttribute('cy', `${this._y(center.y)}`);
	node.setAttribute('r', `${radius}`);
	return this._bindFillDraw( node, 'circleHandle', color, 1 );
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
     * @memberof drawutilssvg
     */
    crosshair( center:XYCoords, radius:number, color:string ) {
	const node : SVGElement = this.makeNode('path');
	const d : SVGPathParams = [
	    'M', this._x(center.x)-radius, this._y(center.y),
	    'L', this._x(center.x)+radius, this._y(center.y),
	    'M', this._x(center.x), this._y(center.y)-radius,
	    'L', this._x(center.x), this._y(center.y)+radius
	];
	node.setAttribute('d', d.join(' ') );
	return this._bindFillDraw( node, 'crosshair', color, 0.5 );
    };


    /**
     * Draw a polygon.
     *
     * @method polygon
     * @param {Polygon} polygon - The polygon to draw.
     * @param {string} color - The CSS color to draw the polygon with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    polygon( polygon:Polygon, color:string, lineWidth?:number ) : SVGElement {	
	return this.polyline( polygon.vertices, polygon.isOpen, color, lineWidth );
    };


    /**
     * Draw a polygon line (alternative function to the polygon).
     *
     * @method polyline
     * @param {Vertex[]} vertices - The polygon vertices to draw.
     * @param {boolan}   isOpen   - If true the polyline will not be closed at its end.
     * @param {string}   color    - The CSS color to draw the polygon with.
     * @param {number=} lineWidth - (optional) The line width to use; default is 1.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    polyline( vertices:Array<Vertex>, isOpen:boolean, color:string, lineWidth?:number ) : SVGElement  {
	const node : SVGElement = this.makeNode('path');
	if( vertices.length == 0 )
	    return node;
	// Draw curve
	const d : Array<string|number> = [
	    'M', this._x(vertices[0].x), this._y(vertices[0].y)
	];
	var n = vertices.length;
	for( var i = 1; i < n; i++ ) {
	    d.push('L', this._x(vertices[i].x), this._y(vertices[i].y) );
	}
	if( !isOpen )
	    d.push('Z');	
	node.setAttribute( 'd', d.join(' ') );
	return this._bindFillDraw( node, 'polyline', color, lineWidth || 1 );
    };

    
    /**
     * Draw a text label at the given relative position.
     *
     * @method label
     * @param {string} text - The text to draw.
     * @param {number} x - The x-position to draw the text at.
     * @param {number} y - The y-position to draw the text at.
     * @param {number=} rotation - The (optional) rotation in radians.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    text( text:string, x:number, y:number, options?:{color?:string}) {
	options = options || {};
	const color:string = options.color || 'black';
	
	const node : SVGElement = this.makeNode('text');
	node.setAttribute('x', `${this._x(x)}`);
	node.setAttribute('y', `${this._x(y)}`);
	node.innerHTML = text;
	return this._bindFillDraw( node, 'text', color, 1 );
    };
    

    /**
     * Draw a non-scaling text label at the given position.
     *
     * @method label
     * @param {string} text - The text to draw.
     * @param {number} x - The x-position to draw the text at.
     * @param {number} y - The y-position to draw the text at.
     * @param {number=} rotation - The (optional) rotation in radians.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     */
    // +---------------------------------------------------------------------------------
    // | Draw a non-scaling text label at the given position.
    // +-------------------------------
    label( text:string, x:number, y:number, rotation:number ) {
	const node : SVGElement = this.makeNode('text');
	// For some strange reason SVG rotation transforms use degrees instead of radians
	node.setAttribute('transform', `translate(${this.offset.x},${this.offset.y}), rotate(${rotation/Math.PI*180})` );
	node.innerHTML = text;
	return this._bindFillDraw( node, 'label', 'black', null );
    };


    /**
     * Due to gl compatibility there is a generic 'clear' function required
     * to avoid accessing the context object itself directly.
     *
     * This function just fills the whole canvas with a single color.
     *
     * @param {string} color - The color to clear with.
     * @return {void}
     * @instance
     * @memberof drawutilssvg
     **/
    clear( color:string ) {
	// If this isn't the primary handler then do not remove anything here.
	// The primary handler will do that (no double work).
	if( this.isSecondary ) {
	    return;
	}
	// Clearing an SVG is equivalent to removing all its child elements.
	for( var i = 0; i < this.gNode.childNodes.length; i++ ) {
	    // Hide all nodes here. Don't throw them away.
	    // We can probably re-use them in the next draw cycle.
	    var child : SVGElement = (this.gNode.childNodes[i] as SVGElement);
	    this.cache.set( child.getAttribute('id'), child );
	}
	this.removeAllChildNodes();
	
	// Add a covering rect with the given background color
	this.curId = 'background';
	const node : SVGElement = this.makeNode('rect');
	// For some strange reason SVG rotation transforms use degrees instead of radians
	// Note that the background does not scale with the zoom level (always covers full element)
	node.setAttribute( 'x', '0' );
	node.setAttribute( 'y', '0' );
	node.setAttribute( 'width', `${this.canvasSize.width}` );
	node.setAttribute( 'height', `${this.canvasSize.height}` );

	// Bind this special element into the document
	this._bindFillDraw( node, this.curId, null, null );
	node.setAttribute( 'fill', typeof color === "undefined" ? 'none' : color );

	return node;
    };

    /**
     * A private helper function to clear all SVG nodes from the &gt;g> node.
     *
     * @private
     */
    private removeAllChildNodes() {
	while( this.gNode.firstChild ) {
	    this.gNode.removeChild(this.gNode.lastChild);
	}
    };
    
}
