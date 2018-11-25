/**
 * Moved some draw functions to this wrapper.
 *
 * @require Vertex
 *
 * @author   Ikaros Kappler
 * @date     2018-04-22
 * @modified 2018-08-16 Added the curve() function to draw cubic bézier curves.
 * @modified 2018-10-23 Recognizing the offset param in the circle() function.
 * @version  1.0.2
 **/

(function(_context) {
    "use strict";

    // +---------------------------------------------------------------------------------
    // | The constructor.
    // |
    // | @param context:Context2D The canvas context to draw on.
    // | @param fillShapes:boolean Indicates if shapes should be filled or not.
    // +-------------------------------
    _context.drawutils = function( context, fillShapes ) {
	this.ctx = context;
	this.offset = new Vertex( 0, 0 );
	this.scale = new Vertex( 1, 1 );
	this.fillShapes = fillShapes;
    };

    // +---------------------------------------------------------------------------------
    // | Draw the given line (between the two points) with the specified (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.line = function( zA, zB, color ) {
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.moveTo( this.offset.x+zA.x*this.scale.x, this.offset.y+zA.y*this.scale.y );
	this.ctx.lineTo( this.offset.x+zB.x*this.scale.x, this.offset.y+zB.y*this.scale.y );
	this.ctx.strokeStyle = color;
	this.ctx.lineWidth = 1;
	this.ctx.stroke();
	this.ctx.restore();
    };


    _context.drawutils.prototype._fillOrDraw = function( color ) {
	if( this.fillShapes ) {
	    this.ctx.fillStyle = color;
	    this.ctx.fill();
	} else {
	    this.ctx.strokeStyle = color;
	    this.ctx.stroke();
	}
    };

    
    // +---------------------------------------------------------------------------------
    // | Draw the given (cubic) bézier curve.
    // +-------------------------------
    _context.drawutils.prototype.cubicBezier = function( startPoint, endPoint, startControlPoint, endControlPoint, color ) {
	if( startPoint instanceof CubicBezierCurve ) {
	    this.cubicBezier( startPoint.startPoint, startPoint.endPoint, startPoint.startControlPoint, startPoint.endControlPoint, endPoint );
	    return;
	}
	// Draw curve
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.moveTo( this.offset.x+startPoint.x*this.scale.x, this.offset.y+startPoint.y*this.scale.y );
	this.ctx.bezierCurveTo( this.offset.x+startControlPoint.x*this.scale.x, this.offset.y+startControlPoint.y*this.scale.y,
				this.offset.x+endControlPoint.x*this.scale.x, this.offset.y+endControlPoint.y*this.scale.y,
				this.offset.x+endPoint.x*this.scale.x, this.offset.y+endPoint.y*this.scale.y );
	this.ctx.lineWidth = 2;
	this._fillOrDraw( color );
	this.ctx.restore();
    };


    // +---------------------------------------------------------------------------------
    // | Draw the given (cubic) bézier curve.
    // +-------------------------------
    _context.drawutils.prototype.handle = function( startPoint, endPoint ) { 
	// Draw handles
	// (No need to save and restore here)
	// this.ctx.lineWidth = 1;
	//console.log( 'baa', startPoint.attr.bezierAutoAdjust );
	this.point( startPoint, 'rgb(0,32,192)' );
	this.square( endPoint, 5, 'rgba(0,128,192,0.5)' );
    };


    // +---------------------------------------------------------------------------------
    // | Draw the given (cubic) bézier curve.
    // +-------------------------------
    _context.drawutils.prototype.cubicBezierCurveHandleLines = function( curve ) {
	// Draw handle lines
	this.cubicBezierHandleLines( curve.startPoint, curve.endPoint, curve.startControlPoint, curve.endControlPoint );
    };

    
    // +---------------------------------------------------------------------------------
    // | Draw the given (cubic) bézier curve.
    // +-------------------------------
    
    _context.drawutils.prototype.handleLine = function( startPoint, endPoint ) {
	// Draw handle lines
	this.line( startPoint, endPoint, 'rgb(192,192,192)' );	
    };

    
    // +---------------------------------------------------------------------------------
    // | Fill the given point with the specified (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.point = function( p, color ) {
	var radius = 3;
	this.ctx.beginPath();
	this.ctx.arc( this.offset.x+p.x*this.scale.x, this.offset.y+p.y*this.scale.y, radius, 0, 2 * Math.PI, false );
	this.ctx.closePath();
	this._fillOrDraw( color );
    };


    // +---------------------------------------------------------------------------------
    // | Draw a circle with the given (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.circle = function( center, radius, color ) {
	this.ctx.beginPath();
	// this.ctx.arc( this.offset.x + center.x*this.scale.x, this.offset.y + center.y*this.scale.y, radius, 0, Math.PI*2 );
	this.ctx.ellipse( this.offset.x + center.x*this.scale.x, this.offset.y + center.y*this.scale.y, radius*this.scale.x, radius*this.scale.y, 0.0, 0.0, Math.PI*2 );
	this.ctx.closePath();
	this._fillOrDraw( color );
    };   

    
    // +---------------------------------------------------------------------------------
    // | Fill a square with the given (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.square = function( center, size, color ) {
	this.ctx.beginPath();
	this.ctx.rect( this.offset.x+(center.x-size/2.0)*this.scale.x, this.offset.y+(center.y-size/2.0)*this.scale.y, size*this.scale.x, size*this.scale.y );
	this.ctx.closePath();
	this._fillOrDraw( color );
    };

    
    // +---------------------------------------------------------------------------------
    // | Fill a square with the given (CSS-) color.
    // +-------------------------------
    _context.drawutils.prototype.squareHandle = function( center, size, color ) {
	this.ctx.beginPath();
	this.ctx.rect( this.offset.x+center.x*this.scale.x-size/2.0, this.offset.y+center.y*this.scale.y-size/2.0, size, size );
	this.ctx.closePath();
	this._fillOrDraw( color );
    };


    // +---------------------------------------------------------------------------------
    // | Draw a crosshair with given radius and color at the given position.
    // +-------------------------------
    _context.drawutils.prototype.crosshair = function( center, radius, color ) {
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.moveTo( this.offset.x+center.x*this.scale.x-radius, this.offset.y+center.y*this.scale.y );
	this.ctx.lineTo( this.offset.x+center.x*this.scale.x+radius, this.offset.y+center.y*this.scale.y );
	this.ctx.moveTo( this.offset.x+center.x*this.scale.x, this.offset.y+center.y*this.scale.y-radius );
	this.ctx.lineTo( this.offset.x+center.x*this.scale.x, this.offset.y+center.y*this.scale.y+radius );
	this.ctx.strokeStyle = color;
	this.ctx.lineWidth = 0.5;
	this.ctx.stroke();
	this.ctx.closePath();
	this.ctx.restore();
    };

    // +---------------------------------------------------------------------------------
    // | Draw a text at the given position.
    // +-------------------------------
    _context.drawutils.prototype.polygon = function( polygon, color ) {
	if( polygon.vertices.length <= 1 )
	    return;
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.setLineDash([3, 5]);
	this.ctx.lineWidth = 1.0;
	this.ctx.moveTo( this.offset.x + polygon.vertices[0].x*this.scale.x, this.offset.y + polygon.vertices[0].y*this.scale.y );
	for( var i = 0; i < polygon.vertices.length; i++ ) {
	    this.ctx.lineTo( this.offset.x + polygon.vertices[i].x*this.scale.x, this.offset.y + polygon.vertices[i].y*this.scale.y );
	}
	if( !polygon.isOpen && polygon.vertices.length > 2 )
	    this.ctx.closePath();
	this._fillOrDraw( color );
	this.ctx.setLineDash([]);
	this.ctx.restore();
    };
    
    // +---------------------------------------------------------------------------------
    // | Draw a text at the given position.
    // +-------------------------------
    _context.drawutils.prototype.string = function( text, x, y ) {
	if( this.fillShapes ) {
	    this.ctx.fillStyle = 'black';
	    this.ctx.fillText( text, x, y );
	} else {
	    this.ctx.strokeStyle = 'black';
	    this.ctx.strokeText( text, x, y, );
	}
    };
    
    
})(window ? window : module.export );
