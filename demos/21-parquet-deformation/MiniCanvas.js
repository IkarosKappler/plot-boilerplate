
(function() {

    const MiniCanvas = function( canvas, vertCount, onVertexChange ) {
	this.pb = new PlotBoilerplate( { canvas : canvas,
					 fitToParent : true,
					 rasterScaleX : 0.5,
					 rasterScaleY : 0.5,
					 backgroundColor : 'rgba(255,255,255,0.75)'
				       } );
	this.polyLine = [];
	this.onVertexChange = onVertexChange;
	var _self = this;
	this.pb.config.postDraw = function() {
	    // console.log('postdraw', _self.polyLine);
	    _self.pb.draw.polyline( _self.polyLine, 'rgb(0,128,192)', 1.0 );
	};

	// Initialize single line for later interpolation
	var bounds = this.pb.viewport();
	var paddingFrac = 0.1;
	this.polyLine = [
	    new Vertex( -bounds.width*(1.0-paddingFrac)*0.5, 0 ),
	    new Vertex(  bounds.width*(1.0-paddingFrac)*0.5, 0 )
	];
    
	this.setVertCount( vertCount );
    };

    MiniCanvas.prototype.setVertCount = function( n ) {
	var bounds = this.pb.viewport();
	var paddingFrac = 0.1;
	// Clear old vertices
	for( var i = 0; i < this.polyLine.length; i++ ) {
	    this.pb.remove( this.polyLine[i] );
	    this.polyLine[i].listeners.removeDragListener( this.onVertexChange );
	}

	// Add new polyline vertices to pb and add listeners
	this.polyLine = polyLineUtils.interpolate( this.polyLine, n );
	for( var i = 0; i < this.polyLine.length; i++ ) {
	    var vert = this.polyLine[i];
	    vert.attr.draggable = i > 0 && i+1 < n;
	    this.pb.add( vert );
	    vert.listeners.addDragListener( this.onVertexChange );
	}
	
	this.pb.redraw();
    };

    MiniCanvas.prototype.getPolyLine = function() {
	return this.polyLine;
    };

    window.MiniCanvas = MiniCanvas;
})();
