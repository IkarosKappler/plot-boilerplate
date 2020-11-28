"use strict";
/**
 * @author   Ikaros Kappler
 * @date     2019-01-30
 * @modified 2019-03-23 Added JSDoc tags.
 * @modified 2020-03-25 Ported this class from vanilla-JS to Typescript.
 * @version 1.0.2
 *
 * @file PBImage
 * @fileoverview As native Image objects have only a position and with
 *               and height thei are not suitable for UI dragging interfaces.
 * @public
 **/
Object.defineProperty(exports, "__esModule", { value: true });
exports.PBImage = void 0;
/**
 * @classdesc A wrapper for image objects. Has an upper left and a lower right corner point.
 *
 * @requires Vertex
 * @requires SVGSerializable
 */
var PBImage = /** @class */ (function () {
    /**
     * The constructor.
     *
     * @constructor
     * @name PBImage
     * @param {Image} image - The actual image.
     * @param {Vertex} upperLeft - The upper left corner.
     * @param {Vertex} lowerRight - The lower right corner.
     **/
    function PBImage(image, upperLeft, lowerRight) {
        /**
         * Required to generate proper CSS classes and other class related IDs.
         **/
        this.className = "PBImage";
        this.image = image;
        this.upperLeft = upperLeft;
        this.lowerRight = lowerRight;
    }
    ;
    // Implement SVGSerializable
    /**
     * Convert this vertex to SVG code.
     *
     * @method toSVGString
     * @param {object=} options - An optional set of options, like 'className'.
     * @return {string} A string representing the SVG code for this vertex.
     * @instance
     * @memberof PBImage
     **/
    PBImage.prototype.toSVGString = function (options) {
        console.warn("PBImage is not yet SVG serializable. Returning empty SVG string.");
        return "";
    };
    ;
    return PBImage;
}());
exports.PBImage = PBImage;
//# sourceMappingURL=PBImage.js.map