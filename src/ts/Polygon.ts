/**
 * @classdesc A polygon class.
 *
 * @requires Vertex
 * 
 * @author   Ikaros Kappler
 * @date     2018-04-14
 * @modified 2018-11-17 Added the containsVert function.
 * @modified 2018-12-04 Added the toSVGString function.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2019-10-25 Added the scale function.
 * @modified 2019-11-06 JSDoc update.
 * @modified 2019-11-07 Added toCubicBezierPath(number) function.
 * @modified 2019-11-22 Added the rotate(number,Vertex) function.
 * @modified 2020-03-24 Ported this class from vanilla-JS to Typescript.
 * @modified 2020-10-30 Added the `addVert` function.
 * @version 1.2.0
 *
 * @file Polygon
 * @public
 **/

import { BezierPath } from "./BezierPath";
import { Vertex } from "./Vertex";
import { XYCoords, SVGSerializable} from "./interfaces";


export class Polygon implements SVGSerializable {


    /**
     * Required to generate proper CSS classes and other class related IDs.
     **/
    readonly className : string = "Polygon";

    
    /** 
     * @member {Array<Vertex>} 
     * @memberof Polygon
     * @type {Array<Vertex>}
     * @instance
     */
    vertices:Array<Vertex>;


    /** 
     * @member {boolean} 
     * @memberof Polygon
     * @type {boolean}
     * @instance
     */
    isOpen:boolean;
    
    
    /**
     * The constructor.
     *
     * @constructor
     * @name Polygon
     * @param {Vertex[]} vertices - An array of 2d vertices that shape the polygon.
     * @param {boolean} isOpen - Indicates if the polygon should be rendered as an open or closed shape.
     **/
    constructor( vertices?:Array<Vertex>, isOpen?:boolean ) {
	if( typeof vertices == 'undefined' )
	    vertices = [];
	this.vertices = vertices;
	this.isOpen = isOpen;
    };


    /**
     * Add a vertex to the end of the `vertices` array.
     *
     * @method addVert
     * @param {Vertex} vert - The vertex to add.
     * @instance
     * @memberof Polygon
     **/
    addVertex( vert:Vertex ) : void {
	this.vertices.push( vert );
    };


    /**
     * Check if the given vertex is inside this polygon.<br>
     * <br>
     * Ray-casting algorithm found at<br>
     *    https://stackoverflow.com/questions/22521982/check-if-point-inside-a-polygon
     *
     * @method containsVert
     * @param {Vertex} vert - The vertex to check. The new x-component.
     * @return {boolean} True if the passed vertex is inside this polygon. The polygon is considered closed.
     * @instance
     * @memberof Polygon
     **/
    containsVert( vert:Vertex ) : boolean {
	//    // ray-casting algorithm based on
	//    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	var inside : boolean = false;
	for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
            let xi : number = this.vertices[i].x, yi : number = this.vertices[i].y;
            let xj : number = this.vertices[j].x, yj : number = this.vertices[j].y;
    
            var intersect : boolean = ((yi > vert.y) != (yj > vert.y))
		&& (vert.x < (xj - xi) * (vert.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
	}
	return inside;
    };



    /**
     * Scale the polygon relative to the given center.
     *
     * @method scale
     * @param {number} factor - The scale factor.
     * @param {Vertex} center - The center of scaling.
     * @return {Polygon} this, for chaining.
     * @instance
     * @memberof Polygon
     **/
    scale( factor:number, center:Vertex ) : Polygon {
	for( var i in this.vertices ) {
	    if( typeof this.vertices[i].scale == 'function' ) 
		this.vertices[i].scale( factor, center );
	    else
		console.log( 'There seems to be a null vertex!', this.vertices[i] );
	}
	return this;
    };


    /**
     * Rotatee the polygon around the given center.
     *
     * @method rotate
     * @param {number} angle  - The rotation angle.
     * @param {Vertex} center - The center of rotation.
     * @return {Polygon} this, for chaining.
     * @instance
     * @memberof Polygon
     **/
    rotate( angle:number, center:Vertex ) : Polygon {
	for( var i in this.vertices ) {
	    this.vertices[i].rotate( angle, center );
	}
	return this;
    };


    /**
     * Convert this polygon to a sequence of quadratic Bézier curves.<br>
     * <br>
     * The first vertex in the returned array is the start point.<br>
     * The following sequence are pairs of control-point-and-end-point:
     * <pre>startPoint, controlPoint0, pathPoint1, controlPoint1, pathPoint2, controlPoint2, ..., endPoint</pre>
     *
     * @method toQuadraticBezierData
     * @return {Vertex[]}  An array of 2d vertices that shape the quadratic Bézier curve.
     * @instance
     * @memberof Polygon
     **/
    toQuadraticBezierData() : Array<Vertex> {
	if( this.vertices.length < 3 )
	    return [];
	var qbezier : Array<Vertex> = [];
	var cc0 : Vertex = this.vertices[0]; 
	var cc1 : Vertex = this.vertices[1]; 
	var edgeCenter : Vertex = new Vertex( cc0.x + (cc1.x-cc0.x)/2,
					      cc0.y + (cc1.y-cc0.y)/2 );
	qbezier.push( edgeCenter );
	var limit = this.isOpen ? this.vertices.length : this.vertices.length+1;
	for( var t = 1; t < limit; t++ ) {  
	    cc0 = this.vertices[ t%this.vertices.length ];
	    cc1 = this.vertices[ (t+1)%this.vertices.length ];
	    var edgeCenter : Vertex = new Vertex( cc0.x + (cc1.x-cc0.x)/2,
						  cc0.y + (cc1.y-cc0.y)/2 );
	    qbezier.push( cc0 );
	    qbezier.push( edgeCenter );
	    cc0 = cc1;
	}
	return qbezier;
    };


    /**
     * Convert this polygon to a quadratic bezier curve, represented as an SVG data string.
     *
     * @method toQuadraticBezierSVGString
     * @return {string} The 'd' part for an SVG 'path' element.
     * @instance
     * @memberof Polygon
     **/
    toQuadraticBezierSVGString() : string {
	var qdata : Array<Vertex> = this.toQuadraticBezierData();
	if( qdata.length == 0 )
	    return "";
	var buffer = [ 'M ' + qdata[0].x+' '+qdata[0].y ];
	for( var i = 1; i < qdata.length; i+=2 ) {
	    buffer.push( 'Q ' + qdata[i].x+' '+qdata[i].y + ', ' + qdata[i+1].x+' '+qdata[i+1].y );
	}
	return buffer.join(' ');
    };


    
    /**
     * Convert this polygon to a sequence of cubic Bézier curves.<br>
     * <br>
     * The first vertex in the returned array is the start point.<br>
     * The following sequence are triplets of (first-control-point, secnond-control-point, end-point):<br>
     * <pre>startPoint, controlPoint0_0, controlPoint1_1, pathPoint1, controlPoint1_0, controlPoint1_1, ..., endPoint</pre>
     *
     * @method toCubicBezierData
     * @param {number=} threshold - An optional threshold (default=1.0) how strong the curve segments 
     *                              should over-/under-drive. Should be between 0.0 and 1.0 for best 
     *                              results but other values are allowed.
     * @return {Vertex[]}  An array of 2d vertices that shape the cubic Bézier curve.
     * @instance
     * @memberof Polygon
     **/
    toCubicBezierData( threshold:number|undefined ) : Array<Vertex> {
	if( typeof threshold == 'undefined' )
	    threshold = 1.0;
	
	if( this.vertices.length < 3 )
	    return [];
	var cbezier : Array<Vertex> = [];
	var a : Vertex = this.vertices[0]; 
	var b : Vertex = this.vertices[1]; 
	var edgeCenter = new Vertex( a.x + (b.x-a.x)/2,   a.y + (b.y-a.y)/2 );
	cbezier.push( edgeCenter );
	
	var limit : number = this.isOpen ? this.vertices.length-1 : this.vertices.length;
	for( var t = 0; t < limit; t++ ) {
	    var a = this.vertices[ t%this.vertices.length ];
	    var b = this.vertices[ (t+1)%this.vertices.length ];
	    var c = this.vertices[ (t+2)%this.vertices.length ];

	    var aCenter : Vertex = new Vertex( a.x + (b.x-a.x)/2,   a.y + (b.y-a.y)/2 );
	    var bCenter : Vertex = new Vertex( b.x + (c.x-b.x)/2,   b.y + (c.y-b.y)/2 );
	    
	    var a2 : Vertex = new Vertex( aCenter.x + (b.x-aCenter.x)*threshold, aCenter.y + (b.y-aCenter.y)*threshold );
	    var b0 : Vertex = new Vertex( bCenter.x + (b.x-bCenter.x)*threshold, bCenter.y + (b.y-bCenter.y)*threshold );

	    cbezier.push( a2 );
	    cbezier.push( b0 );
	    cbezier.push( bCenter );
	    
	}
	return cbezier;
	
    };


    
    /**
     * Convert this polygon to a cubic bezier curve, represented as an SVG data string.
     *
     * @method toCubicBezierSVGString
     * @return {string} The 'd' part for an SVG 'path' element.
     * @instance
     * @memberof Polygon
     **/
    toCubicBezierSVGString( threshold:number ) : string {
	var qdata : Array<Vertex> = this.toCubicBezierData( threshold );
	if( qdata.length == 0 )
	    return "";
	var buffer = [ 'M ' + qdata[0].x+' '+qdata[0].y ];
	for( var i = 1; i < qdata.length; i+=3 ) {
	    buffer.push( 'C ' + qdata[i].x+' '+qdata[i].y + ', ' + qdata[i+1].x+' '+qdata[i+1].y + ', ' + qdata[i+2].x + ' ' + qdata[i+2].y );
	}
	return buffer.join(' ');
    };

    

    /**
     * Convert this polygon to a cubic bezier path instance.
     *
     * @method toCubicBezierPath
     * @param {number} threshold - The threshold, usually from 0.0 to 1.0.
     * @return {BezierPath}      - A bezier path instance.
     * @instance
     * @memberof Polygon
     **/
    toCubicBezierPath( threshold:number ) : BezierPath {
	var qdata : Array<Vertex> = this.toCubicBezierData( threshold );
	// Conver the linear path vertices to a two-dimensional path array
	var pathdata : Array<Array<Vertex>> = [];
	for( var i = 0; i+3 < qdata.length; i+=3 ) {
	    pathdata.push( [ qdata[i], qdata[i+3], qdata[i+1], qdata[i+2] ] );
	}
	return BezierPath.fromArray( pathdata );
    };

 
    /**
     * Create an SVG representation of this polygon.
     *
     * @method toSVGString
     * @param {object=} options - An optional set of options, like 'className'.
     * @return {string} The SVG string.
     * @instance
     * @memberof Polygon
     **/
    toSVGString( options:{ className? : string }|undefined ) : string {
	options = options || {};
	var buffer : Array<string> = [];
	buffer.push( '<path' );
	if( options.className )
	    buffer.push( ' class="' + options.className + '"' );
	buffer.push( ' d="' );
	if( this.vertices.length > 0 ) {
	    buffer.push( 'M ' );
	    buffer.push( this.vertices[0].x.toString() )
	    buffer.push( ' ' );
	    buffer.push( this.vertices[0].y.toString() );
	    for( var i = 1; i < this.vertices.length; i++ ) {
		buffer.push( ' L ' );
		buffer.push( this.vertices[i].x.toString() )
		buffer.push( ' ' );
		buffer.push( this.vertices[i].y.toString() );
	    }
	    if( !this.isOpen ) {
		buffer.push( ' Z' );
	    }
	}
	buffer.push( '" />' );
	return buffer.join('');
    };
    
}
