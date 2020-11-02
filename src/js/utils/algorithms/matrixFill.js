"use strict";
/**
 * An equivalent of lodash.array_fill(...).
 *
 * @author Ikaros Kappler
 * @date 2020-10-23
 * @version 1.0.0
 **/
Object.defineProperty(exports, "__esModule", { value: true });
var arrayFill_1 = require("./arrayFill");
exports.matrixFill = function (countA, countB, initialValue) {
    var arr = Array(countA);
    for (var i = 0; i < countA; i++) {
        arr[i] = arrayFill_1.arrayFill(countB, initialValue);
    }
    return arr;
};
//# sourceMappingURL=matrixFill.js.map