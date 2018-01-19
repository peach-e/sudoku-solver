/*
 **********************************************************************
 *  File   : cross_number_exclusion.js
 *  Author : peach
 *  Date   : 15 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */

// ##========================================================##
// ||                       THEOREM                          ||
// ##========================================================##
// On a single row, tile or square, let there be M numbers
// (N in (n0, n1,... nM)
//
// who all have exactly the same M possibilities
// (P in (p0, p1, ... pM).
//
// Then you can safely exclude all _other_ numbers !N from P.
//
// That just means that if you have two spots, and you know that
// both of them have to be either a 3 or a 4, and neither the 3 or 4 can be
// anywhere else, then you can exclude all other numbers from those spots.
//
// For Clarification:
// The theorem requires that the M possibilities shared
// between the M numbers on a row/col/square are also the ONLY possibilities
// for each of the numbers on that row/col/square.
//
// This can be abstracted to 3 numbers && 3 spots, or more, but 2 is most
// common. (Actually, ONE is the most common but we've covered that one
// already).
//
var sudoku = sudoku || {};
sudoku.implementation = sudoku.implementation || {};
sudoku.implementation.solver = sudoku.implementation.solver || {};
sudoku.implementation.solver.crossNumberExclusion = function() {

  /*
   * Public Methods
   */

  function combineExclusionMatrices(exclusionMatrix) {

    // Iterate over 2 choices up to 8.
    var candidateNumbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    var combinations = [];
    for (let r = 2; r < 8; r++) {

      /*
       * Get all possible combinations of choosing r numbers from 1 to 9.
       * Iterate over each combination.
       */
      var comparableSets = _getCombinations(candidateNumbers, r);
      for (var iSet = 0; iSet < comparableSets.length; iSet++) {

        /**
         * The numbers that actually get compared (like "1,2,5").
         */
        var numbersToCompare = comparableSets[iSet];

        /*
         * The numbers that weren't chosen (like "3,4,6,7,8,9").
         */
        var numbersNotChosen = candidateNumbers.filter(function(num) {
          return (numbersToCompare.indexOf(num) < 0);
        });

        /*
         * I pick one number to compare its exclusion matrix against the others.
         * Which one I pick isn't important, because I'm only interested in
         * places where they ALL match.
         */
        var chosenNumber = numbersToCompare[0];
        var alternateNumbers = numbersToCompare.slice(1);

        /*
         * The discrepency matrix consists of ones and zeros, and is used to
         * track where one of the selected numbers may have had a possibility
         * but another number did not. If my chosen numbers have possibilities
         * along a given row, column or square, those numbers and possibilities
         * satisfy the theorem if and only if there are no discrepencies on that
         * same row/column/square.
         */
        var discrepencyMatrix = new sudoku.math.Matrix(0);

        // Build up the discrepency matrix by diffing our first number's
        // exclusion matrix with all the others in the set.
        for ( var iAlternate in alternateNumbers) {
          alternateNumber = alternateNumbers[iAlternate];

          var a = exclusionMatrix[chosenNumber - 1];
          var b = exclusionMatrix[alternateNumber - 1];

          var discrepencyAB = a.XOR_with(b);
          discrepencyMatrix = discrepencyMatrix.OR_with(discrepencyAB);
        }

        // On my chosen number, I now go through each possibility.
        // As long as:
        // ..(1) there is a row, column or square where there are no
        // ......discrepencies, and
        // ..(2) the number of possibilities along that row, column or square
        // ......equals our number of chosen numbers (r), then
        // it should be safe to exclude all numbersNotChosen from those spots.
        var chosenNumberExclusionMatrix = exclusionMatrix[chosenNumber - 1];
        var chosenNumberPossibilityMatrix = chosenNumberExclusionMatrix.booleanCompliment();

        /*
         * Get lists of all possibilities and discrepencies to check.
         */
        var possibilities = chosenNumberPossibilityMatrix.getOccurrancesOfValue(1);
        var discrepencies = discrepencyMatrix.getOccurrancesOfValue(1);

        /*
         * For each possibility, look for an opportunity to perform the
         * exclusion.
         */

        for (var iPoss = 0; iPoss < possibilities.length; iPoss++) {
          var excludeArray;
          var newNumbersToExclude = 0;
          var possibility = possibilities[iPoss];
          var row = possibility.row;
          var col = possibility.col;
          var square = possibility.square;

          /**
           * -------------------- EXCLUSION BY ROW --------------------
           * 
           * Determine if we can exclude this spot on the basis that there are
           * as many viable spots along the same ROW as there are numbers. If it
           * turns out we can, map each of the numbersNotChosen to each
           * possibility and return that object as the result of this whole
           * operation.
           */
          var possibilitiesOnRow = _filterOnKey(possibilities, 'row', row);
          var discrepenciesOnRow = _filterOnKey(discrepencies, 'row', row);

          if (possibilitiesOnRow.length === r && discrepenciesOnRow.length === 0) {
            // Get our numbers to exclude.
            excludeArray = _getExcludeObjectArray(numbersNotChosen, possibilitiesOnRow);

            // Only return if the numbers to exclude aren't already excluded
            // there.
            newNumbersToExclude = _doesExcludeArrayHaveNewData(excludeArray, exclusionMatrix);
            if (newNumbersToExclude) {
              return excludeArray;
            }
          }

          /**
           * -------------------- EXCLUSION BY COL --------------------
           */
          var possibilitiesOnCol = _filterOnKey(possibilities, 'col', col);
          var discrepenciesOnCol = _filterOnKey(discrepencies, 'col', col);

          if (possibilitiesOnCol.length === r && discrepenciesOnCol.length === 0) {
            excludeArray = _getExcludeObjectArray(numbersNotChosen, possibilitiesOnCol);
            newNumbersToExclude = _doesExcludeArrayHaveNewData(excludeArray, exclusionMatrix);
            if (newNumbersToExclude) {
              return excludeArray;
            }
          }

          /**
           * -------------------- EXCLUSION BY SQUARE --------------------
           */
          var possibilitiesOnSquare = _filterOnKey(possibilities, 'square', square);
          var discrepenciesOnSquare = _filterOnKey(discrepencies, 'square', square);

          if (possibilitiesOnSquare.length === r && discrepenciesOnSquare.length === 0) {
            excludeArray = _getExcludeObjectArray(numbersNotChosen, possibilitiesOnSquare);
            newNumbersToExclude = _doesExcludeArrayHaveNewData(excludeArray, exclusionMatrix);
            if (newNumbersToExclude) {
              return excludeArray;
            }
          }

          /*
           * If we get down here, try a different possibility, then a different
           * combination of numbers, then a different number of numbers.
           */
        }// End iterating on the first number's possibilities
      }// End iterating on combinations of r numbers.
    }// End iterating on r

    // If we get here, this operation did not find anything. Return empty array.
    return [];
  }

  /*
   * Private Methods
   */

  function _doesExcludeArrayHaveNewData(excludeArray, exclusionMatrix) {
    var result = 0;
    for (var i = 0; i < excludeArray.length; i++) {
      var row = excludeArray[i].row;
      var col = excludeArray[i].col;
      var number = excludeArray[i].number;

      if (!exclusionMatrix[number - 1].get(row, col)) {
        result = 1;
        break;
      }
    }
    return result;
  }

  /**
   * Iterates over the array (arr) of objects. Counts how many of the objects
   * contain the value 'val' at key 'key'.
   */
  function _filterOnKey(arr, key, val) {
    return arr.filter(function(a) {
      return (a[key] == val);
    });
  }

  /**
   * Gets all possible N_C_r combinations of array, where 'r' elements are
   * selected from array 'arr'.
   * 
   * @private
   * @param arr
   *          {array} An array, of length N.
   * @param r
   *          {int} Number of elements to select from arr.
   * @return result - Array of arrays containing the combinations of elements.
   */
  function _getCombinations(arr, r) {
    var combinations = [];

    if (!arr || !arr.length) {
      throw 'Parameter \'arr\' must be an array of finite length!';
    }

    if (!(r > 0 && r <= arr.length)) {
      throw 'Parameter \'r\' must be an integer between 1 and the length of \'arr\'!';
    }

    // Retain leftmost elmeent.
    for (var i = 0; i < arr.length - r + 1; i++) {
      var result = [ arr[i] ];

      if (r > 1) {
        /*
         * Get combinations for the the remaining elements in the array, and
         * join each combination onto the first one as a new result.
         */
        _getCombinations(arr.slice(i + 1), r - 1).forEach(function(remainingCombination) {
          return combinations.push(result.concat(remainingCombination));
        });
      } else {
        /*
         * If r==1, then the single member of result is all there is.
         */
        combinations.push(result);
      }
    }
    return combinations;
  }

  /**
   * Given a list of possibilities and a list of numbers, this function maps
   * each number to each position and returns a list of objects with keys
   * (number, row, col).
   */
  function _getExcludeObjectArray(numbers, possibilities) {
    var result = [];
    possibilities.forEach(function(poss) {
      numbers.forEach(function(num) {
        var obj = {
          number : num,
          row : poss.row,
          col : poss.col
        };
        result.push(obj);
      });
    });
    return result;
  }

  return {
    /**
     * Given a stack of exclusion matrices (one for each number), perform
     * cross-number exclusion to discover new exclusions for each number.
     * 
     * Pre-Condition: - The exclusion matrix has been solved as throoughly as
     * possible using traditional means.
     * 
     * Post-Condition: - If possible, some set of numbers will be excluded from
     * key cells along a single row, column or square.
     * 
     * @param exclusionMatrix -
     *          The completed Exclusion Matrix.
     * @return results - Array of objects where each object has 'number', 'row'
     *         and 'col'. Each result can be excluded at that location for that
     *         number. Note: The input exclusionMatrix is not modified by this
     *         function.
     */
    combineExclusionMatrices : combineExclusionMatrices,
  };

}();