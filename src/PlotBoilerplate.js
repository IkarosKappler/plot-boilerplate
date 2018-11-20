/**
 * The main class of the PlotBoilerplate.
 *
 * @author   Ikaros Kappler
 * @date     2018-10-23
 * @modified 2018-11-19 Added multi-select and multi-drag.
 * @version  1.0.1
 **/


(function(_context) {
    "use strict";

    
    const DEFAULT_CANVAS_WIDTH = 1024;
    const DEFAULT_CANVAS_HEIGHT = 768;


    // +---------------------------------------------------------------------------------
    // | A helper function to trigger fake click events.
    // +----------------------------
    var triggerClickEvent = function(element) {
	element.dispatchEvent( new MouseEvent('click', {
	    view: window,
	    bubbles: true,
	    cancelable: true
	} ) );
    };


    // +---------------------------------------------------------------------------------
    // | A wrapper class for draggable items (mostly vertices).
    // +----------------------------
    (function(_context) {
	var Draggable = function( item, type ) {
	    this.item = item;
	    this.type = type;
	    this.vindex = null;
	    this.pindex = null;
	    this.cindex = null;
	};
	Draggable.VERTEX = 'vertex';
	Draggable.prototype.isVertex = function() { return this.type == Draggable.VERTEX; };
	Draggable.prototype.setVIndex = function(vindex) { this.vindex = vindex; return this; };

	_context.Draggable = Draggable;
    })(_context);
    

    // +---------------------------------------------------------------------------------
    // | Initialize everything.
    // +----------------------------
    var PlotBoilerplate = function( config ) {
	// +---------------------------------------------------------------------------------
	// | A global config that's attached to the dat.gui control interface.
	// +-------------------------------
	this.config = {
	    fullSize              : true,
	    fitToParent           : true,
	    scaleX                : 1.0,
	    scaleY                : 1.0,
	    backgroundColor       : '#ffffff',
	    rebuild               : function() { rebuild(); },
	    loadImage             : function() { var elem = document.getElementById('file');
						 elem.setAttribute('data-type','image-upload');
						 triggerClickEvent(elem);
					       },
	    saveFile              : function() { saveFile(); }
	};


	// +---------------------------------------------------------------------------------
	// | Object members.
	// +-------------------------------
	this.canvas              = document.getElementById('my-canvas'); 
	this.ctx                 = this.canvas.getContext('2d');
	this.draw                = new drawutils(this.ctx,false);
	this.fill                = new drawutils(this.ctx,true);
	this.image               = null; // An image.
	this.imageBuffer         = null; // A canvas to read the pixel data from.
	this.canvasSize          = { width : DEFAULT_CANVAS_WIDTH, height : DEFAULT_CANVAS_HEIGHT };

	this.vertices            = [];

	this.selectPolygon       = null;
	this.draggedElements     = [];

	this.drawables           = [];

	// A square
	// var tmpPoly = new Polygon( [ {x:-100,y:-100},{x:100,y:-100},{x:100,y:100},{x:-100,y:100} ] );

	var _self = this;
	PlotBoilerplate.prototype.initDrawableObjects = function() {
	    var radius = Math.min(_self.canvasSize.width,_self.canvasSize.height)/3;
	    //draw.circle( {x:0,y:0}, radius, '#000000' );
	    var fract = 0.5;
	    // Make a circular connected path
	    var bpath = [];
	    bpath[0] = [ new Vertex( 0, -radius ),
			 new Vertex( radius, 0 ),
			 new Vertex( radius*fract, -radius ),
			 new Vertex( radius*fract, 0 ) ];
	    bpath[1] = [ bpath[0][1], // new Vertex( radius, 0  ),
			 new Vertex( 0, radius ),
			 new Vertex( radius, radius*fract ),
			 new Vertex( 0, radius*fract ) ];
	    bpath[2] = [ bpath[1][1], // new Vertex( 0, radius ),
			 new Vertex( -radius, 0 ),
			 new Vertex( -radius*fract, radius ),
			 new Vertex( -radius*fract, 0 ) ];
	    bpath[3] = [ bpath[2][1], // new Vertex( -radius, 0 ),
			 bpath[0][0], // new Vertex( 0, -radius ),
			 new Vertex( -radius, -radius*fract ),
			 new Vertex( 0, -radius*fract )
		       ];

	    // Construct
	    this.vertices = [];
	    var path = BezierPath.fromArray( bpath );
	    path.adjustCircular = true;
	    this.drawables.push( path );

	    for( var i in bpath ) {
		this.vertices.push( bpath[i][0] );
		this.vertices.push( bpath[i][1] );
		this.vertices.push( bpath[i][2] );
		this.vertices.push( bpath[i][3] );

		
		(function(cindex) {
		     bpath[cindex][0].listeners.addDragListener( function(e) {
			 //console.log('start handle moved');
			 bpath[cindex][0].addXY( -e.params.dragAmount.x, -e.params.dragAmount.y );
			 path.moveCurvePoint( cindex*1, 
							    path.START_POINT,            // obtain handle length?
							    e.params.dragAmount           // update arc lengths
							);
		    } );
		    bpath[cindex][2].listeners.addDragListener( function(e) {
			//console.log('start handle moved');
			path.adjustPredecessorControlPoint( cindex*1, 
							    true,            // obtain handle length?
							    true            // update arc lengths
							);
		    } );
		    bpath[cindex][3].listeners.addDragListener( function(e) {
			//console.log('end handle moved'); console.log(cindex);
			var b = path.adjustSuccessorControlPoint( cindex*1, 
							    true,            // obtain handle length?
							    true            // update arc lengths
								);
			console.log(b);
		    } );
		})(i);
		
	    }
	    

	    var squareSize = 32;
	    var squareVerts = [ new Vertex(-squareSize,-squareSize), new Vertex(squareSize,-squareSize), new Vertex(squareSize,squareSize), new Vertex(-squareSize,squareSize) ];
	    var square = new Polygon( squareVerts );
	    this.drawables.push( square );
	    for( var i in squareVerts )
		this.vertices.push( squareVerts[i] );
	};
	
	
	// +---------------------------------------------------------------------------------
	// | The re-drawing function.
	// +-------------------------------
	PlotBoilerplate.prototype.redraw = function() {	    
	    // Note that the image might have an alpha channel. Clear the scene first.
	    this.ctx.fillStyle = this.config.backgroundColor; 
	    this.ctx.fillRect(0,0,this.canvasSize.width,this.canvasSize.height);

	    // Draw the background image?
	    if( _self.image ) {
		if( _self.config.fitImage ) {
		    _self.ctx.drawImage(_self.image,0,0,_self.image.width,_self.image.height,0,0,_self.canvasSize.width,_self.canvasSize.height);
		} else {
		    _self.ctx.drawImage(_self.image,0,0);
		}
	    }

	    var radius = Math.min(_self.canvasSize.width,_self.canvasSize.height)/3;
	    _self.draw.circle( {x:0,y:0}, radius, '#000000' );

	    // Draw all vertices (as small squares)
	    for( var i in this.vertices ) 
		this.draw.squareHandle( this.vertices[i], 5, this.vertices[i].attr.isSelected ? 'rgba(192,128,0)' : 'rgb(0,128,192)' );

	    // Draw drawables
	    for( var i in this.drawables ) {
		var d = this.drawables[i];
		if( d instanceof BezierPath ) {
		    for( var c in d.bezierCurves ) {
			this.draw.cubicBezier( d.bezierCurves[c].startPoint, d.bezierCurves[c].endPoint, d.bezierCurves[c].startControlPoint, d.bezierCurves[c].endControlPoint, '#00a822' );
			this.draw.handleLine( d.bezierCurves[c].startPoint, d.bezierCurves[c].startControlPoint );
			this.draw.handleLine( d.bezierCurves[c].endPoint, d.bezierCurves[c].endControlPoint );
		    }
		} else if( d instanceof Polygon ) {
		    this.draw.polygon( d, '#0022a8' );
		} else {
		    console.error( 'Cannot draw object. Unknown class ' + d.constructor.name + '.' );
		}
	    }

	    // Draw select polygon?
	    if( this.selectPolygon != null && this.selectPolygon.vertices.length > 0 ) {
		console.log('Drawing selectPolygon',this.selectPolygon.vertices.length,'vertices');
		this.draw.polygon( this.selectPolygon, '#888888' );
		this.draw.crosshair( this.selectPolygon.vertices[0], 3, '#008888' );
	    }
	}; // END redraw
	
	
	// +---------------------------------------------------------------------------------
	// | Handle a dropped image: initially draw the image (to fill the background).
	// +-------------------------------
	var handleImage = function(e) {
	    var validImageTypes = "image/gif,image/jpeg,image/jpg,image/gif,image/png";
	    if( validImageTypes.indexOf(e.target.files[0].type) == -1 ) {
		if( !window.confirm('This seems not to be an image ('+e.target.files[0].type+'). Continue?') )
		    return;
	    }	    
	    var reader = new FileReader();
	    reader.onload = function(event) {
		this.image = new Image();
		this.image.onload = function() {
		    // Create image buffer
		    var imageBuffer    = document.createElement('canvas');
		    imageBuffer.width  = this.image.width;
		    imageBuffer.height = this.image.height;
		    imageBuffer.getContext('2d').drawImage(this.image, 0, 0, this.image.width, image.height);
		    alert( 'Sorry, not yet implemented.' );
		    //redraw();
		}
		this.image.src = event.target.result;
	    }
	    reader.readAsDataURL(e.target.files[0]);     
	}


	// +---------------------------------------------------------------------------------
	// | Clear the selection.
	// |
	// | @param redraw:boolean Indicates if the redraw function should be triggered.
	// |
	// | @return this for chaining.
	// +-------------------------------
	PlotBoilerplate.prototype.clearSelection = function( redraw ) {
	    for( var i in this.vertices ) 
		this.vertices[i].attr.isSelected = false;
	    if( redraw )
		this.redraw();
	    return this;
	};

	
	// +---------------------------------------------------------------------------------
	// | Decide which file type should be handled:
	// |  - image for the background or
	// |  - JSON (for the point set)
	// +-------------------------------
	var handleFile = function(e) {
	    var type = document.getElementById('file').getAttribute('data-type');
	    if( type == 'image-upload' ) {
		handleImage(e);
	    } else {
		console.warn('Unrecognized upload type: ' + type );
	    }   
	}
	document.getElementById( 'file' ).addEventListener('change', handleFile );
	

	// +---------------------------------------------------------------------------------
	// | Just a generic save-file dialog.
	// +-------------------------------
	var saveFile = function() {
	    // See documentation for FileSaver.js for usage.
	    //    https://github.com/eligrey/FileSaver.js
	    var blob = new Blob(["Hello, world!\nSorry, exporting SVGs is not yet implemented."], {type: "text/plain;charset=utf-8"});
	    saveAs(blob, "helloworld.txt");
	};
	
	
	// +---------------------------------------------------------------------------------
	// | The rebuild function just evaluates the input and
	// |  - triangulate the point set?
	// |  - build the voronoi diagram?
	// +-------------------------------
	var rebuild = function() {
	    // ...
	};


	// +---------------------------------------------------------------------------------
	// | This function resizes the canvas to the required settings (toggles fullscreen).
	// +-------------------------------
	PlotBoilerplate.prototype.resizeCanvas = function() {
	    var _setSize = function(w,h) {
		_self.ctx.canvas.width  = w;
		_self.ctx.canvas.height = h;		
		_self.canvas.width      = w;
		_self.canvas.height     = h;		
		_self.canvasSize.width  = w;
		_self.canvasSize.height = h;

		_self.draw.offset.x = _self.fill.offset.x = w/2;
		_self.draw.offset.y = _self.fill.offset.y = h/2;
	    };
	    if( _self.config.fullSize && !_self.config.fitToParent ) {
		// Set editor size
		var width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		_setSize( width, height );
	    } else if( _self.config.fitToParent ) {
		// Set editor size
		var width  = _self.canvas.parentNode.clientWidth - 2; // 1px border
		var height = _self.canvas.parentNode.clientHeight - 2; // 1px border
		_setSize( width, height );
	    } else {
                _setSize( DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT );
	    }
	    _self.redraw();
	};
	_context.addEventListener( 'resize', this.resizeCanvas );
	this.resizeCanvas();


	// +---------------------------------------------------------------------------------
	// | Add all vertices inside the polygon to the current selection.
	// | 
	// | @param polygon:Polygon The polygonal selection area.
	// +-------------------------------
	PlotBoilerplate.prototype.selectVerticesInPolygon = function( polygon ) {
	    for( var i in this.vertices ) {
		console.log('polygon contains vert ',i,polygon.containsVert(this.vertices[i]));
		if( polygon.containsVert(this.vertices[i]) ) 
		    this.vertices[i].attr.isSelected = true;
	    }
	};
	
	
	// +---------------------------------------------------------------------------------
        // | Locates the point (index) at the passed position. Using an internal tolerance of 7 pixels.
	// |
	// | The result is an object { type : 'bpath', pindex, cindex, pid }
	// |
        // | Returns false if no point is near the passed position.
        // +-------------------------------
        var locatePointNear = function( point ) {
            var tolerance = 7;
	    // var point = { x : x, y : y };
	    // Search in vertices
	    for( var vindex in _self.vertices ) {
		var vert = _self.vertices[vindex];
		if( vert.distance(point) < tolerance ) {
		    // console.log( 'vertex found.' );
		    return new Draggable( vert, Draggable.VERTEX ).setVIndex(vindex); // { type : 'vertex', vindex : vindex };
		}
	    }
	    
	    // Search in paths
	    /*
	    for( var pindex = 0; pindex < paths.length; pindex++ ) {
		var path = paths[pindex];
		for( var cindex = 0; cindex < path.bezierCurves.length; cindex++ ) {
		    var curve = path.bezierCurves[cindex];
		    let p = curve.startControlPoint;
                    let dist = p.distance(point); // Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.START_CONTROL_POINT };
		    p = curve.endControlPoint;
                    dist = p.distance(point); // Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.END_CONTROL_POINT };
		    p = curve.startPoint;
                    dist = p.distance(point); // Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.START_POINT };
		    p = curve.endPoint;
                    dist = p.distance(point); // Math.sqrt( Math.pow(x-p.x,2) + Math.pow(y-p.y,2) );
                    if( dist <= tolerance )
			return { type : 'bpath', pindex : pindex, cindex : cindex, pid : curve.END_POINT };
		}
            }
	    */
            return false;
        }


	// +---------------------------------------------------------------------------------
	// | Handle left-click and tap event.
	// |
	// | @param x:Number The tap X position on the canvas.
	// | @param y:Number The tap Y position on the canvas.
	// +-------------------------------
	function handleTap(x,y) {
	    if( _self.selectPolygon != null ) { // keyHandler.isDown('shift')
		var vert = transformMousePosition(x, y);
		_self.selectPolygon.vertices.push( vert );
		_self.redraw();
	    }
	}

	// +---------------------------------------------------------------------------------
	// | Transform the given x-y-(mouse-)point to coordinates. 
	// +-------------------------------
	var transformMousePosition = function( x, y ) {
	    //return { x : x/_self.draw.scale.x-_self.draw.offset.x, y : y/_self.draw.scale.y-_self.draw.offset.y };
	    return { x : (x-_self.draw.offset.x)/_self.draw.scale.x, y : (y-_self.draw.offset.y)/_self.draw.scale.y };
	};

	// +---------------------------------------------------------------------------------
	// | Install a mouse handler on the canvas.
	// +-------------------------------
	new MouseHandler(this.canvas)
	    .down( function(e) {
		if( e.which != 1 )
		    return; // Only react on left mouse
		var p = locatePointNear( transformMousePosition(e.params.pos.x, e.params.pos.y) );
		console.log( p );
		if( !p ) return;
		// Drag all selected elements?
		if( p.type == 'vertex' && _self.vertices[p.vindex].attr.isSelected ) {
		    // Multi drag
		    for( var i in _self.vertices ) {
			if( _self.vertices[i].attr.isSelected ) {
			    // console.log( 'vertex is about to be dragged', _self.vertices[i] );
			    _self.draggedElements.push( new Draggable( _self.vertices[i], Draggable.VERTEX ).setVIndex(i) );
			    _self.vertices[i].listeners.fireDragStartEvent( e );
			}
		    }
		} else {
		    // Single drag
		    _self.draggedElements.push( p );
		    if( p.type == 'bpath' )
			_self.paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragStartEvent( e );
		    else if( p.type == 'vertex' )
			_self.vertices[p.vindex].listeners.fireDragStartEvent( e );
		}
		_self.redraw();
	    } )
	    .drag( function(e) {
		// Convert drag amount by scaling
		// Warning: this possibly invalidates the dragEvent for other listeners!
		//          Rethink the solution when other features are added.
		e.params.dragAmount.x /= _self.draw.scale.x;
		e.params.dragAmount.y /= _self.draw.scale.y;
		if( keyHandler.isDown('ctrl') ) {
		    _self.draw.offset.add( e.params.dragAmount );
		    _self.fill.offset.set( _self.draw.offset );
		    _self.redraw();
		} else {
		    for( var i in _self.draggedElements ) {
			var p = _self.draggedElements[i];
			// console.log( 'i', i, 'pid', p.pid, 'pindex', p.pindex, 'cindex', p.cindex );
			if( p.type == 'bpath' ) {
			    _self.paths[p.pindex].moveCurvePoint( p.cindex, p.pid, e.params.dragAmount );
			    _self.paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragEvent( e );
			} else if( p.type == 'vertex' ) {
			    _self.vertices[p.vindex].add( e.params.dragAmount );
			    _self.vertices[p.vindex].listeners.fireDragEvent( e );
			}
		    }
		}
		_self.redraw();
	    } )
	    .up( function(e) {
		if( e.which != 1 )
		    return; // Only react on left mouse;
		if( !e.params.wasDragged )
		    handleTap( e.params.pos.x, e.params.pos.y );
		for( var i in _self.draggedElements ) {
		    var p = _self.draggedElements[i];
		    // console.log( 'i', i, 'pid', p.pid, 'pindex', p.pindex, 'cindex', p.cindex );
		    if( p.type == 'bpath' ) {
			_self.paths[p.pindex].bezierCurves[p.cindex].getPointByID(p.pid).listeners.fireDragEndEvent( e );
		    } else if( p.type == 'vertex' ) {
			_self.vertices[p.vindex].listeners.fireDragEndEvent( e );
		    }
		}
		_self.draggedElements = [];
		_self.redraw();
	    } )
	/*
	    .move( function(e) {
		var vert = transformMousePosition(e.params.pos.x, e.params.pos.y);
		console.log( 'mouse position inside poly?', vert, tmpPoly.containsVert(vert) );
	    } )
	*/
	;

	// Install key handler
	var keyHandler = new KeyHandler( { trackAll : true } )
	    .down('enter',function() { console.log('ENTER was hit.'); } )
	    .press('enter',function() { console.log('ENTER was pressed.'); } )
	    .up('enter',function() { console.log('ENTER was released.'); } )

	    .down('escape',function() {
		console.log('ESCAPE was hit.');
		_self.clearSelection(true); } )

	    .down('shift',function() {
		console.log('SHIFT was hit.');
		_self.selectPolygon = new Polygon();
		_self.redraw(); } )
	    .up('shift',function() {
		console.log('SHIFT was released.');
		// Find and select vertices in the drawn area
		if( _self.selectPolygon == null )
		    return;
		_self.selectVerticesInPolygon( _self.selectPolygon );
		_self.selectPolygon = null;
		_self.redraw(); } )

	    .down('ctrl',function() { console.log('CTRL was hit.'); } )
	    .up('ctrl',function() { console.log('CTRL was released.'); } )

	    .down('e',function() { console.log('e was hit. shift is pressed?',keyHandler.isDown('shift')); } ) 

	    .up('windows',function() { console.log('windows was released.'); } )
	;
	
	
	// Initialize the dialog
	window.dialog = new overlayDialog('dialog-wrapper');
	// window.dialog.show( 'Inhalt', 'Test' );

	this.initDrawableObjects();
	
	// Init	
	this.redraw();

	// Gain focus
	this.canvas.focus();
	
    }; // END construcor 'PlotBoilerplate'

    _context.PlotBoilerplate = PlotBoilerplate;
    
})(window); 





