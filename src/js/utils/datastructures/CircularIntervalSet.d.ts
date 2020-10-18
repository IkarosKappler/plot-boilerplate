/**
 * A circular interval set.
 *
 * @author   Ikaros Kappler
 * @date     2020-10-02
 * @modified 2020-10-18 Ported to Typescript from vanilla JS.
 * @version  1.0.0
 **/
declare class CircularIntervalSet {
    /**
     * @member {number} start
     * @memberof CircularIntervalSet
     * @type {number}
     * @instance
     */
    private start;
    /**
     * @member {number} end
     * @memberof CircularIntervalSet
     * @type {number}
     * @instance
     */
    private end;
    /**
     * @member {Array<Array<number>>} intervals
     * @memberof CircularIntervalSet
     * @type {Array<Array<number>>}
     * @instance
     */
    intervals: Array<Array<number>>;
    /**
     * Create a new CircularIntervalSet with the given lower and upperBound (start and end).
     *
     * The intervals inside lower and upper bound will initially be added to this set (full range).
     *
     * @param {number} start
     * @param {number} end
     * @method clear
     * @instance
     * @memberof CircularIntervalSet
     * @return {void}
     **/
    constructor(start: number, end: number);
    /**
     * Clear this set (will be empty after this operation).
     *
     * @method clear
     * @instance
     * @memberof CircularIntervalSet
     * @return {void}
     **/
    clear(): void;
    /**
     * Intersect all sub intervalls with the given range (must be inside bounds).
     *
     * @param {number} start
     * @param {number} end
     * @method intersect
     * @instance
     * @memberof CircularIntervalSet
     * @return {void}
     **/
    intersect(start: number, end: number): void;
    /**
     * Convert this set to a human readable string.
     *
     * @method toString
     * @instance
     * @memberof CircularIntervalSet
     * @return {string}
     **/
    toString(): string;
}
