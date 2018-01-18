/*
 **********************************************************************
 *  File   : CrossNumberExclusion.js
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
sudoku.CrossNumberExclusion = function() {

  /*
   * Public Methods
   */

  function combineExclusionMatrices() {
    var results = [];

    // Iterate over 2 choices up to 8.
    var candidateNumbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    var combinations = [];
    for (let r = 2; r < 8; r++) {

      /*
       * If we have already discovered an exclusion zone from this exercise,
       * exit the loop and solve the puzzle with more traditional means.
       */
      if (results.length) {
        return results;
      }

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
        var discrepencyMatrix = _getEmptyGrid(9, 9);

        // Build up the discrepency matrix by diffing our first number's
        // exclusion matrix with all the others in the set.
        for ( var iAlternate in alternateNumbers) {
          alternateNumber = alternateNumbers[iAlternate];

          var a = _exclusionMatrix[chosenNumber - 1];
          var b = _exclusionMatrix[alternateNumber - 1];

          var discrepencyAB = _exclusion_XOR_exclusion(a, b);
          discrepencyMatrix = _exclusion_OR_exclusion(discrepencyAB,
              discrepencyMatrix);
        }

        // On my chosen number, I now go through each possibility.
        // As long as:
        // ..(1) there is a row, column or square where there are no
        // ......discrepencies, and
        // ..(2) the number of possibilities along that row, column or square
        // ......equals our number of chosen numbers (r), then
        // it should be safe to exclude all numbersNotChosen from those spots.
        var chosenNumberExclusionMatrix = _exclusionMatrix[chosenNumber - 1];
        var chosenNumberPossibilityMatrix = _invertExclusionMatrix(chosenNumberExclusionMatrix);

        /*
         * Get lists of all possibilities and discrepencies to check.
         */
        var possibilities = _getOccurrancesInMatrix(
            chosenNumberPossibilityMatrix, true);
        var discrepencies = _getOccurrancesInMatrix(discrepencyMatrix, true);

        /*
         * For each possibility, look for an opportunity to perform the
         * exclusion.
         */

        for (var iPoss = 0; iPoss < possibilities.length; iPoss++) {
          var possibility = possibilities[iPoss];
          var row = possibility.row;
          var col = possibility.col;
          var square = possibility.square;

          /*
           * Determine if we can exclude this spot on the basis that there are
           * viable spots along the same row.
           */
          var excludableAongRow = _isDirectionExcludable(possibilities,
              discrepencies, 'row', row);

        }
        var excludableAlongRow = _getExcludablePossibilities(possibilities,
            discrepencies, 'row');

        // Now check each possibility and determine if the numbersNotChosen
        // can be excluded.
        chosenPossibilities.forEach(function(poss) {
          // Possibility must not coincide with a discrepency, or share
          // all of row, column, square blocked off.
          var rowConflicts = 0;
          var columnConflicts = 0;
          var squareConflicts = 0;
          for (var iDis = 0; iDis < discrepencyAreas.length; iDis++) {
            disc = discrepencyAreas[iDis];

            rowConflicts += (disc.row == poss.row) ? 1 : 0;
            columnConflicts += (disc.col == poss.col) ? 1 : 0;
            squareConflicts += (disc.square == poss.square) ? 1 : 0;
          }

          // If all three conflicts appear, this possibility is indeterminate
          // and no assumptions can be made.
          if (rowConflicts && columnConflicts && squareConflicts) {
            return;
          }

          // If we get here, we have satisfied the theorem with our set of
          // possibilities and chosen numbers. Add all the other numbers
          // to our 'to-exclude' list at this site.
          numbersNotChosen.forEach(function(numberToExclude) {
            results.push({
              number : numberToExclude,
              row : poss.row,
              col : poss.col,
            });
          });
        });
      }// End iterating on combinations of r numbers.
    }// End iterating on r

    return results;
  }

  /*
   * Private Methods
   */

  /**
   * Iterates over the array (arr) of objects. Counts how many of the objects
   * contain the value 'val' at key 'key'.
   */
  function _countAlongKey(arr, key, val) {
    return arr.filter(function(a) {
      return (a[key] == val);
    }).length;
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
        _getCombinations(arr.slice(i + 1), r - 1).forEach(
            function(remainingCombination) {
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
   * TODO: Refactor this into the matrix object when the time comes. Gets the
   * occurrances of a value in an MxM matrix. All occurrances are returned as an
   * array of hashes where each occurrance has row, col and Square. The Square
   * convention follows the convention discussed at the top.
   */
  function _getOccurrancesInMatrix(matrix, soughtValue) {
    var occurrances = [];
    for (var row = 0; row < 9; row++) {
      for (var col = 0; col < 9; col++) {
        var value = matrix[row][col];
        if (value != soughtValue)
          continue;
        var square = _getSquareForRowColumn(row, col);
        occurrances.push({
          row : row,
          col : col,
          square : square
        });
      }
    }
    return occurrances;
  }

  /**
   * Given a list of possibilities and a list of discrepencies, determine
   * whether there are possibilities that exist along the specified direction
   * (row, column, square), at the specified coordinate, where there are also no
   * discrepencies.
   * 
   * Returns true if the given direction can be excluded
   */
  function _isDirectionExcludable(possibilities, discrepencies, direction) {
    var result = [];

    possibilities.forEach(function(poss) {
      var nPossibilities = 0;
      var nDiscrepencies = 0;

      // Look along row.
      nPossibilities = countAlongKey(possibilities, 'row', poss.row);
      nDiscrepencies = countAlongKey(discrepencies, 'row', poss.row);

      // If number of possibilities equals number of number with zero
      // issues,
      //
      if (nPossibilities === r && nDiscrepencies === 0) {

      }

    });
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