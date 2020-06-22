window.addEventListener(
    'load',
    function() {
	// All config params are optional.
	var pb = new PlotBoilerplate(
	    { canvas                : document.getElementById('my-canvas'),					    
	      fullSize              : true,
	      fitToParent           : true,		      
	      enableMouse           : true,
	      enableKeys            : true
	    }
        );

        // +---------------------------------------------------------------------------------
	// | Draw the bark beetle tunnels.
	// +-------------------------------
	pb.config.postDraw = function() {
	    new BarkBeetles( pb, line );
	};

	// +---------------------------------------------------------------------------------
	// | Create a random vertex inside the canvas viewport.
	// +-------------------------------
	var randomVertex = function() {
	    //return new Vertex( Math.random()*pb.canvasSize.width/3,
	    //		   Math.random()*pb.canvasSize.height/3
	    //		 );
	    return new Vertex( Math.random()*pb.canvasSize.width*0.5 - pb.canvasSize.width/2*0.5,
			       Math.random()*pb.canvasSize.height*0.5 - pb.canvasSize.height/2*0.5
			     );
	};
	
	// +---------------------------------------------------------------------------------
	// | Add some interactive elements: a line and a point.
	// +-------------------------------
	var line = new Line( randomVertex(), randomVertex() );
	pb.add( line );

	function newPerp( line ) {
	    var point = randomVertex();
	    pb.add( point );

	    // +---------------------------------------------------------------------------------
	    // | Add the perpendicular and the intersection point (not selectable
	    // | nor draggable). 
	    // +-------------------------------
	    var perpendicular = new Line( randomVertex(), randomVertex() );
	    perpendicular.a.attr.selectable = perpendicular.a.attr.draggable = false;
	    perpendicular.b.attr.selectable = perpendicular.b.attr.draggable = false;
	    pb.add( perpendicular );
	    var intersection = randomVertex();
	    intersection.attr.selectable = perpendicular.a.attr.draggable = false;
	    pb.add( intersection );


	    // +---------------------------------------------------------------------------------
	    // | Compute the position of the intersection and the perpendicular on
	    // | each vertex change.
	    // +-------------------------------
	    var update = function() {
		// console.log('update');
		intersection.set( line.vertAt(line.getClosestT(point)) );
		perpendicular.a.set( point );
		perpendicular.b.set( intersection );
		pb.redraw();
	    };
	    line.a.listeners.addDragListener( function() { update(); } );
	    line.b.listeners.addDragListener( function() { update(); } );
	    point.listeners.addDragListener( function() { update(); } );
	    update();
	}
	for( var i = 0; i < 7; i++ ) {
	    newPerp(line);
	}
    } );	
