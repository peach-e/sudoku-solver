/*
 **********************************************************************
 *  File   : ArrayCombinations.js
 *  Author : peach
 *  Date   : 13 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */

var sudoku = sudoku || {};
sudoku.combinations = function() {

  function getCombinations(arr, r) {
    var result = {};
    result.combinations = [];
    result.warnings = [];

    if (!arr || !arr.length) {
      warnings.push('Parameter \'arr\' must be an array of finite length!');
    }

    if (!(r > 0 && r <= arr.length)) {
      warnings
          .push('Parameter \'r\' must be an integer between 1 and the length of \'arr\'!');
    }

    if (result.warnings.length) {
      return result;
    }

    result.combinations = _combinate(arr, r);

    return result;
  }

  function _combinate(arr, r) {
    var combinations = [];

    // Retain leftmost elmeent.
    for (var i = 0; i < arr.length - r + 1; i++) {
      var result = [ arr[i] ];

      if (r > 1) {
        // Combinate the remaining elements in the array, and join each
        // combination onto
        // the first one, appending the result to
        _combinate(arr.slice(i + 1), r - 1).forEach(
            function(remainingCombination) {
              return combinations.push(result.concat(remainingCombination));
            });
      } else {
        combinations.push(result);
      }
    }

    return combinations;
  }

  return {
    /**
     * Gets all possible combinations where 'r' elements are selected from array
     * 'arr'.
     * 
     * @param arr
     *          {array} An array, of length N.
     * @param r
     *          {int} Number of elements to select from arr.
     * @return result {Object} The resulting object.
     * @return result.combinations {Array[]} Array of arrays containing the
     *         combinations of elements.
     * @return result.warnings {Array} Potential list of warnings if the
     *         function encounters problems.
     */
    getCombinations : getCombinations
  };
}();