/**
 * @classdesc A line consists of two vertices a and b.<br>
 * <br>
 * This is some refactored code from my 'Morley Triangle' test<br>
 *   https://github.com/IkarosKappler/morleys-trisector-theorem
 *
 * @requires Vertex
 *
 * @author   Ikaros Kappler
 * @date     2016-03-12
 * @modified 2018-12-05 Refactored the code from the morley-triangle script.
 * @modified 2019-03-20 Added JSDoc tags.
 * @modified 2019-04-28 Fixed a bug in the Line.sub( Vertex ) function (was not working).
 * @modified 2019-09-02 Added the Line.add( Vertex ) function.
 * @modified 2019-09-02 Added the Line.denominator( Line ) function.
 * @modified 2019-09-02 Added the Line.colinear( Line ) function.
 * @modified 2019-09-02 Fixed an error in the Line.intersection( Line ) function (class Point was renamed to Vertex).
 * @modified 2019-12-15 Added the Line.moveTo(Vertex) function.
 * @modified 2020-03-16 The Line.angle(Line) parameter is now optional. The baseline (x-axis) will be used if not defined.
 * @modified 2020-03-23 Ported to Typescript from JS.
 * @version  2.1.2
 *
 * @file Line
 * @public
 **/
var Line = /** @class */ (function () {
    /**
     * Creates an instance of Line.
     *
     * @constructor
     * @name Line
     * @param {Vertex} a The line's first point.
     * @param {Vertex} b The line's second point.
     **/
    function Line(a, b) {
        this.a = a;
        this.b = b;
    }
    /**
     * Get the length of this line.
     *
     * @method length
     * @instance
     * @memberof Line
     **/
    Line.prototype.length = function () {
        return Math.sqrt(Math.pow(this.b.x - this.a.x, 2) + Math.pow(this.b.y - this.a.y, 2));
    };
    ;
    /**
     * Set the length of this vector to the given amount. This only works if this
     * vector is not a null vector.
     *
     * @method setLength
     * @param {number} length - The desired length.
     * @memberof Line
     * @return {Line} this (for chaining)
     **/
    Line.prototype.setLength = function (length) {
        return this.scale(length / this.length());
    };
    ;
    /**
     * Substract the given vertex from this line's end points.
     *
     * @method sub
     * @param {Vertex} amount The amount (x,y) to substract.
     * @return {Line} this
     * @instance
     * @memberof Line
     **/
    Line.prototype.sub = function (amount) {
        this.a.sub(amount);
        this.b.sub(amount);
        return this;
    };
    ;
    /**
     * Add the given vertex from this line's end points.
     *
     * @method add
     * @param {Vertex} amount The amount (x,y) to add.
     * @return {Line} this
     * @instance
     * @memberof Line
     **/
    Line.prototype.add = function (amount) {
        this.a.add(amount);
        this.b.add(amount);
        return this;
    };
    ;
    /**
     * Normalize this line (set to length 1).
     *
     * @method normalize
     * @return {Line} this
     * @instance
     * @memberof Line
     **/
    Line.prototype.normalize = function () {
        this.b.set(this.a.x + (this.b.x - this.a.x) / this.length(), this.a.y + (this.b.y - this.a.y) / this.length());
        return this;
    };
    ;
    /**
     * Scale this line by the given factor.
     *
     * @method scale
     * @param {number} factor The factor for scaling (1.0 means no scale).
     * @return {Line} this
     * @instance
     * @memberof Line
     **/
    Line.prototype.scale = function (factor) {
        this.b.set(this.a.x + (this.b.x - this.a.x) * factor, this.a.y + (this.b.y - this.a.y) * factor);
        return this;
    };
    ;
    /**
     * Move this line to a new location.
     *
     * @method moveTo
     * @param {Vertex} newA - The new desired location of 'a'. Vertex 'b' will be moved, too.
     * @return {Line} this
     * @instance
     * @memberof Line
     **/
    Line.prototype.moveTo = function (newA) {
        var diff = this.a.difference(newA);
        this.a.add(diff);
        this.b.add(diff);
        return this;
    };
    ;
    /**
     * Get the angle between this and the passed line (in radians).
     *
     * @method angle
     * @param {Line} [line] - (optional) The line to calculate the angle to. If null the baseline (x-axis) will be used.
     * @return {number} this
     * @instance
     * @memberof Line
     **/
    Line.prototype.angle = function (line) {
        if (typeof line == 'undefined')
            line = new Line(new Vertex(0, 0), new Vertex(100, 0));
        // Compute the angle from x axis and the return the difference :)
        var v0 = this.b.clone().sub(this.a);
        var v1 = line.b.clone().sub(line.a);
        // Thank you, Javascript, for this second atan function. No additional math is needed here!
        // The result might be negative, but isn't it usually nicer to determine angles in positive values only?
        return Math.atan2(v1.x, v1.y) - Math.atan2(v0.x, v0.y);
    };
    ;
    /**
     * Get line point at position t in [0 ... 1]:<br>
     * <pre>[P(0)]=[A]--------------------[P(t)]------[B]=[P(1)]</pre><br>
     * <br>
     * The counterpart of this function is Line.getClosestT(Vertex).
     *
     * @method vertAt
     * @param {number} t The position scalar.
     * @return {Vertex} The vertex a position t.
     * @instance
     * @memberof Line
     **/
    Line.prototype.vertAt = function (t) {
        return new Vertex(this.a.x + (this.b.x - this.a.x) * t, this.a.y + (this.b.y - this.a.y) * t);
    };
    ;
    /**
     * Get the intersection if this line and the specified line.
     *
     * @method intersection
     * @param {Line} line The second line.
     * @return {Vertex} The intersection (may lie outside the end-points).
     * @instance
     * @memberof Line
     **/
    Line.prototype.intersection = function (line) {
        var denominator = this.denominator(line);
        if (denominator == 0)
            return null;
        var a = this.a.y - line.a.y;
        var b = this.a.x - line.a.x;
        var numerator1 = ((line.b.x - line.a.x) * a) - ((line.b.y - line.a.y) * b);
        var numerator2 = ((this.b.x - this.a.x) * a) - ((this.b.y - this.a.y) * b);
        a = numerator1 / denominator; // NaN if parallel lines
        b = numerator2 / denominator;
        // if we cast these lines infinitely in both directions, they intersect here:
        return new Vertex(this.a.x + (a * (this.b.x - this.a.x)), this.a.y + (a * (this.b.y - this.a.y)));
    };
    ;
    /**
     * Get the denominator of this and the given line.
     *
     * If the denominator is zero (or close to zero) both line are co-linear.
     *
     * @param {Line} line
     * @return {Number}
     **/
    Line.prototype.denominator = function (line) {
        // http://jsfiddle.net/justin_c_rounds/Gd2S2/
        return ((line.b.y - line.a.y) * (this.b.x - this.a.x)) - ((line.b.x - line.a.x) * (this.b.y - this.a.y));
    };
    ;
    /**
     * Checks if this and the given line are co-linear.
     *
     * The constant Vertex.EPSILON is used for tolerance.
     *
     * @param {Line} line
     * @return true if both lines are co-linear.
     */
    Line.prototype.colinear = function (line) {
        return Math.abs(this.denominator(line)) < Vertex.EPSILON;
    };
    ;
    /**
     * Get the closest position T from this line to the specified point.
     *
     * The counterpart for this function is Line.vertAt(Number).
     *
     * @method getClosestT
     * @param {Vertex} p The point (vertex) to measre the distance to.
     * @return {number} The line position t of minimal distance to p.
     * @instance
     * @memberof Line
     **/
    Line.prototype.getClosestT = function (p) {
        var l2 = Line.util.dist2(this.a, this.b);
        if (l2 === 0)
            return 0;
        var t = ((p.x - this.a.x) * (this.b.x - this.a.x) + (p.y - this.a.y) * (this.b.y - this.a.y)) / l2;
        // Wrap to [0,1]?
        // t = Math.max(0, Math.min(1, t));
        return t;
    };
    ;
    /**
     * The the minimal distance between this line and the specified point.
     *
     * @method pointDistance
     * @param {Vertex} p The point (vertex) to measre the distance to.
     * @return {number} The absolute minimal distance.
     * @instance
     * @memberof Line
     **/
    Line.prototype.pointDistance = function (p) {
        // Taken From:
        // https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
        function dist2(v, w) {
            return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
        }
        // p - point
        // v - start point of segment
        // w - end point of segment
        function distToSegmentSquared(p, v, w) {
            //var l2 = dist2(v, w);
            //if( l2 === 0 ) return dist2(p, v);
            //var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
            //t = Math.max(0, Math.min(1, t));
            return dist2(p, this.vertAt(this.getClosestLineT(p))); // dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]);
        }
        // p - point
        // v - start point of segment
        // w - end point of segment
        //function distToSegment (p, v, w) {
        //    return Math.sqrt(distToSegmentSquared(p, v, w));
        //}
        return Math.sqrt(distToSegmentSquared(p, this.a, this.b));
    };
    /**
     * Create a deep clone of this line.
     *
     * @method clone
     * @return {Line} A copy if this line.
     * @instance
     * @memberof Line
     **/
    Line.prototype.clone = function () {
        return new Line(this.a.clone(), this.b.clone());
    };
    ;
    /**
     * Create an SVG representation of this line.
     *
     * @method toSVGString
     * @param {options} p - A set of options, like the 'classname' to use
     *                      for the line object.
     * @return {string} The SVG string representing this line.
     * @instance
     * @memberof Line
     **/
    Line.prototype.toSVGString = function (options) {
        options = options || {};
        var buffer = [];
        buffer.push('<line');
        if (options.className)
            buffer.push(' class="' + options.className + '"');
        buffer.push(' x1="' + this.a.x + '"');
        buffer.push(' y1="' + this.a.y + '"');
        buffer.push(' x2="' + this.b.x + '"');
        buffer.push(' y2="' + this.b.y + '"');
        buffer.push(' />');
        return buffer.join('');
    };
    ;
    /**
     * Create a string representation of this line.
     *
     * @method totring
     * @return {string} The string representing this line.
     * @instance
     * @memberof Line
     **/
    Line.prototype.toString = function () {
        return "{ a : " + this.a.toString() + ", b : " + this.b.toString() + " }";
    };
    ;
    /**
     * @private
     **/
    Line.util = {
        dist2: function (v, w) {
            return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
        }
    };
    return Line;
}());