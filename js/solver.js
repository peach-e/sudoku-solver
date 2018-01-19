/*
 **********************************************************************
 *  File   : solver.js
 *  Author : peach
 *  Date   : 18 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */

var sudoku = sudoku || {};
sudoku.solver = sudoku.solver = function() {
  /**
   * Class factory for creating a solver instance.
   * 
   * @class
   */
  return {
    /**
     * The solver class is constructed with an [MxN] array of input values that
     * have either sudoku inputs or null.
     * 
     * If validation is successful, an object is created and returned.
     * 
     * @param inputData
     *          {sudoku.math.Matrix} The initial data that is used to form the
     *          solution matrix. Unknown values should be set to null.
     * @param excludeNumberCallback
     *          {function} The callback is called when a number is excluded from
     *          a specific spot, passing back (number, row, col) as arguments.
     * @param solveNumberCallback
     *          {function} The callback is called when a number is solved in a
     *          specifc spot, passing back (number, row, col) as arguments.
     * @return solver {Object} A solver object, which has methods next() and
     *         getSolutionMatrix().
     */
    create : sudoku.implementation.solver.algorithm.create,
  };
}();