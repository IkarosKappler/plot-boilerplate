/**
 * @classdesc A triangle class for triangulations.
 *
 * The class was written for a Delaunay trinagulation demo so it might 
 * contain some strange and unexpected functions.
 *
 * @requires Vertex
 * 
 * Inspired by Delaunay at Travellermap
 *   http://www.travellermap.com/tmp/delaunay.htm
 *
 * @author    Ikaros Kappler
 * @date_init 2012-10-17 (Wrote a first version of this in that year).
 * @date      2018-04-03 (Refactored the code into a new class).
 * @modified  2018-04-28 Added some documentation.
 * @modified  2019-09-11 Added the scaleToCentroid(Number) function (used by the walking triangle demo).
 * @modified  2019-09-12 Added beautiful JSDoc compliable comments.
 * @modified  2019-11-07 Added to toSVG(options) function to make Triangles renderable as SVG.
 * @version   2.0.4
 *
 * @file Triangle
 * @public
 **/


(function(_context) {

    /**
     * An epsilon for comparison.
     * This should be the same epsilon as in Vertex.
     *
     * @private
     **/
    var EPSILON = 1.0e-6;


    /**
     * The constructor.
     * 
     * @param {Vertex} a - The first vertex of the triangle.
     * @param {Vertex} b - The second vertex of the triangle.
     * @param {Vertex} c - The third vertex of the triangle.
     **/
    var Triangle = function( a, b, c )	{
	this.a = a;
	this.b = b;
	this.c = c;

	this.calcCircumcircle();
	
    }

    /**
     * Get the centroid of this triangle.
     *
     * The centroid is the average midpoint for each side.
     *
     * @return {Vertex} The centroid
     **/
    Triangle.prototype.getCentroid = function() {
	return new Vertex( (this.a.x + this.b.x + this.c.x)/3,
			   (this.a.y + this.b.y + this.c.y)/3
			 );
    };



    /**
     * Scale the triangle towards its centroid.
     *
     * @param {Number} - The scale factor to use. This can be any scalar.
     * @return {Triangle} this for chaining
     */
    Triangle.prototype.scaleToCentroid = function( factor ) {
	let centroid = this.getCentroid();
	this.a.scale( factor, centroid );
	this.b.scale( factor, centroid );
	this.c.scale( factor, centroid );
	return this;
    };
    
    

    /**
     * Get the circumcircle of this triangle.
     *
     * The circumcircle is that unique circle on which all three
     * vertices of this triangle are located on.
     *
     * @return {Object} - { center:Vertex, radius:float }
     */
    Triangle.prototype.getCircumcircle = function() {
	if( !this.center || !this.radius ) 
	    this.calcCircumcircle();
	return { center : this.center.clone(), radius : this.radius };
    };



    /**
     * Check if this triangle and the passed triangle share an
     * adjacent edge.
     *
     * For edge-checking Vertex.equals is used which uses an
     * an epsilon for comparison.
     *
     * @param {Triangle} tri - The second triangle to check adjacency with.
     *
     * @return {boolean} - True if this and the passed triangle have at least one common edge.
     */
    Triangle.prototype.isAdjacent = function( tri ) {
	var a = this.a.equals(tri.a) || this.a.equals(tri.b) || this.a.equals(tri.c);
	var b = this.b.equals(tri.a) || this.b.equals(tri.b) || this.b.equals(tri.c);
	var c = this.c.equals(tri.a) || this.c.equals(tri.b) || this.c.equals(tri.c);
	return (a&&b) || (a&&c) || (b&&c);
    };


    
    /**
     * Get that vertex of this triangle (a,b,c) that is not vert1 nor vert2 of 
     * the passed two.
     *
     * @param {Vertex} vert1 - The first vertex.
     * @param {Vertex} vert2 - The second vertex.
     * @return Vertex - The third vertex of this triangle that makes up the whole triangle with vert1 and vert2.
     */
    Triangle.prototype.getThirdVertex = function( vert1, vert2 ) {
	if( this.a.equals(vert1) && this.b.equals(vert2) || this.a.equals(vert2) && this.b.equals(vert1) ) return this.c;
	if( this.b.equals(vert1) && this.c.equals(vert2) || this.b.equals(vert2) && this.c.equals(vert1) ) return this.a;
	//if( this.c.equals(vert1) && this.a.equals(vert2) || this.c.equals(vert2) && this.a.equals(vert1) )
	return this.b;
    };


    /**
     * Re-compute the circumcircle of this triangle (if the vertices
     * have changed).
     *
     * The circumcenter and radius are stored in this.center and
     * this radius. There is a third result: radius_squared.
     *
     * @return void
     */
    Triangle.prototype.calcCircumcircle = function() {
	// From
	//    http://www.exaflop.org/docs/cgafaq/cga1.html

	var A = this.b.x - this.a.x; 
	var B = this.b.y - this.a.y; 
	var C = this.c.x - this.a.x; 
	var D = this.c.y - this.a.y; 

	var E = A*(this.a.x + this.b.x) + B*(this.a.y + this.b.y); 
	var F = C*(this.a.x + this.c.x) + D*(this.a.y + this.c.y); 

	var G = 2.0*(A*(this.c.y - this.b.y)-B*(this.c.x - this.b.x)); 
	
	var dx, dy;
	
	if( Math.abs(G) < EPSILON ) {
	    // Collinear - find extremes and use the midpoint		
	    var bounds = this.bounds();
	    this.center = new Vertex( ( bounds.xMin + bounds.xMax ) / 2, ( bounds.yMin + bounds.yMax ) / 2 );

	    dx = this.center.x - bounds.xMin;
	    dy = this.center.y - bounds.yMin;
	} else {
	    var cx = (D*E - B*F) / G; 
	    var cy = (A*F - C*E) / G;

	    this.center = new Vertex( cx, cy );

	    dx = this.center.x - this.a.x;
	    dy = this.center.y - this.a.y;
	}

	this.radius_squared = dx * dx + dy * dy;
	this.radius = Math.sqrt( this.radius_squared );
    }; // END calcCircumcircle



    /**
     * Check if the passed vertex is inside this triangle's
     * circumcircle.
     *
     * @param {Vertex} v - The vertex to check.
     * @return boolean
     */
    Triangle.prototype.inCircumcircle = function( v ) {
	var dx = this.center.x - v.x;
	var dy = this.center.y - v.y;
	var dist_squared = dx * dx + dy * dy;

	return ( dist_squared <= this.radius_squared );
	
    }; // inCircumcircle



    /**
     * Get the rectangular bounds for this triangle.
     *
     * @return {Object} - { xMin:float, xMax:float, yMin:float, yMax:float, width:float, height:float }
     */
    Triangle.prototype.bounds = function() {
	function max3( a, b, c ) { return ( a >= b && a >= c ) ? a : ( b >= a && b >= c ) ? b : c; }
	function min3( a, b, c ) { return ( a <= b && a <= c ) ? a : ( b <= a && b <= c ) ? b : c; }
	var minx = min3( this.a.x, this.b.x, this.c.x );
	var miny = min3( this.a.y, this.b.y, this.c.y );
	var maxx = max3( this.a.x, this.b.x, this.c.x );
	var maxy = max3( this.a.y, this.b.y, this.c.y );
	return { xMin : minx, yMin : miny, xMax : maxx, yMax : maxy, width : maxx-minx, height : maxy-miny };
    };


    /**
     * Get the determinant of this triangle.
     *
     * @return {Number} - The determinant (float).
     */
    Triangle.prototype.determinant = function() {
	return this.b.x*this.b.y* 0.5 * ( - this.b.x*this.a.y - this.a.x*this.b.y - this.b.x*this.c.y + this.c.x*this.a.y + this.a.x*this.c.y );
    };

    
    /**
     * Checks if the passed vertex (p) is inside this triangle.
     *
     * Note: matrix determinants rock.
     *
     * @param {Vertex} p - The vertex to check.
     * @return {boolean}
     */
    Triangle.prototype.containsPoint = function( p ) {
	//
	// Point-in-Triangle test found at
	//   http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-2d-triangle
	//
	function pointIsInTriangle( px, py, p0x, p0y, p1x, p1y, p2x, p2y ) {
	    
	    var area = 1/2*(-p1y*p2x + p0y*(-p1x + p2x) + p0x*(p1y - p2y) + p1x*p2y);

	    var s = 1/(2*area)*(p0y*p2x - p0x*p2y + (p2y - p0y)*px + (p0x - p2x)*py);
	    var t = 1/(2*area)*(p0x*p1y - p0y*p1x + (p0y - p1y)*px + (p1x - p0x)*py);

	    return s > 0 && t > 0 && (1-s-t) > 0;
	};

	return pointIsInTriangle( p.x, p.y, this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y );
    };


    
    /**
     * Converts this triangle into a human-readable string.
     *
     * @return {string}
     */
    Triangle.prototype.toString = function() {
	return '{ a : ' + this.a.toString () + ', b : ' + this.b.toString() + ', c : ' + this.c.toString() + '}';
    };


    /**
     * Create an SVG representation of this triangle.
     *
     * @method toSVGString
     * @param {object=} options - An optional set of options, like 'className'.
     * @return {string} The SVG string.
     * @instance
     * @memberof Polygon
     **/
    Triangle.prototype.toSVGString = function( options ) {
	options = options || {};
	var buffer = [];
	buffer.push( '<path' );
	if( options.className )
	    buffer.push( ' class="' + options.className + '"' );
	buffer.push( ' d="' );
	var vertices = [ this.a, this.b, this.c ];
	if( vertices.length > 0 ) {
	    buffer.push( 'M ' );
	    buffer.push( vertices[0].x )
	    buffer.push( ' ' );
	    buffer.push( vertices[0].y );
	    for( var i = 1; i < vertices.length; i++ ) {
		buffer.push( ' L ' );
		buffer.push( vertices[i].x )
		buffer.push( ' ' );
		buffer.push( vertices[i].y );
	    }
	    //if( !this.isOpen ) {
		buffer.push( ' Z' );
	    //}
	}
	buffer.push( '" />' );
	return buffer.join('');
    };

    _context.Triangle = Triangle;
    // END Triangle

})( window ? window : module.export );
