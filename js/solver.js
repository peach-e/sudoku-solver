/*
 **********************************************************************
 *  File   : solver.js
 *  Author : peach
 *  Date   : 13 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */

// MATRIX CONVENTIONS
// -------------------------
// All matrices are assumed to be 9 x 9, organized by [Row, Col]. The
// exclusion matrix also has a zeroth dimension NUMBER, which ranges from
// 0 to 8 to contain exclusion matrices for 1 - 9.
//
// For example, to find whether number 4 is excluded from the top-center row
// and column, you would search
//
// _exclusionMatrix[3][0][4].
//
// Sometimes squares are directly referenced. Squares are addressed according to
// the convention:
//
// +---+---+---+
// | 0 | 1 | 2 |
// +---+---+---+
// | 3 | 4 | 5 |
// +---+---+---+
// | 6 | 7 | 8 |
// +---+---+---+
//
// So the number in row/col [0][4] would be at the top of square 1.
//
var esp = {};
var sudoku = sudoku || {};
sudoku.solver = function() {
  function create(inputData, excludeNumberCallback, solveNumberCallback) {

    var solver = {};

    /*
     * Private Attributes
     */
    var _solutionMatrix = _cloneSolutionMatrix(inputData);

    // Exclusion matrix is [number][row][col], and each value is 0 if not
    // excluded and 1 if excluded.
    var _exclusionMatrix = _getEmptyExclusionMatrix();
    var _excludeNumberCallback = excludeNumberCallback
        || _defaultExcludeNumberCallback;
    var _solveNumberCallback = solveNumberCallback
        || _defaultSolveNumberCallback;
    var _solutionInProgress = 0;

    // **********************************
    // PUBLIC METHODS
    // **********************************

    /**
     * Returns the current matrix of solved values.
     */
    solver.getMatrixValues = function() {
      return _cloneSolutionMatrix(_solutionMatrix);
    }

    /**
     * Advances to the next stage of solution.
     */
    solver.next = function() {
      // Make sure we didn't make a mistake
      _validate();

      var changeBit = 0;

      // Iterators we keep using.
      var iRow = 0;
      var iCol = 0;

      // STARTUP -----------------------------------
      // Exclude all initial numbers in the solution matrix if we're next'ing
      // for the first time.
      if (!_solutionInProgress) {
        for (iRow = 0; iRow < 9; iRow++) {
          for (iCol = 0; iCol < 9; iCol++) {
            var value = _solutionMatrix[iRow][iCol];

            // Filter out the null values.
            if (!value) {
              continue;
            }
            _excludeNewNumber(value, iRow, iCol);
          }
        }
        _solutionInProgress = 1;
        changeBit = 1;
        return changeBit;
      }

      // For each number, look for solutions.
      for (numberToSolve = 1; numberToSolve <= 9; numberToSolve++) {

        // Get the possibilities (the compliments of the exclusion matrix at the
        // present number). Sort them into array of hashes for easy processing.

        possibilityMatrix = _invertExclusionMatrix(_exclusionMatrix[numberToSolve - 1]);
        var possibilities = _getOccurrancesInMatrix(possibilityMatrix, true);

        /*
         * Go through each possibility and look for reasons to accept it or
         * exclude others.
         */
        for (var iPos = 0; iPos < possibilities.length; iPos++) {
          var possibility = possibilities[iPos];
          var row = possibility.row;
          var col = possibility.col;
          var square = possibility.square;

          // Get filtered possibilities.
          var possibilitiesInRow = possibilities.filter(function(p) {
            return p.row == row;
          });
          var possibilitiesInCol = possibilities.filter(function(p) {
            return p.col == col;
          });

          var possibilitiesInSquare = possibilities.filter(function(p) {
            return p.square == square;
          });

          // Check 1
          // ------------------------
          // If any of these are length 1, then the possibility is unique in the
          // row or column, and we identify it as a solution.
          var isUniqueInRow = possibilitiesInRow.length === 1;
          var isUniqueInCol = possibilitiesInCol.length === 1;
          var isUniqueInSquare = possibilitiesInSquare.length === 1;

          var isSolution = isUniqueInRow || isUniqueInCol || isUniqueInSquare;
          if (isSolution) {
            _solveNumber(numberToSolve, row, col);
            changeBit = 1;
            return changeBit;
          }

          // Check 2
          // ------------------------
          // For a single number,
          // If 2 or more possiblities share a row and a square:
          // ...and they happen to be the only options in the square
          // ......(unique on square), then exclude the rest of the row.
          // ...and they are the only options on the row (unique on row),
          // ......exclude the rest of the square.
          // Note: Check 3 does the same thing for column & square.
          var possibilitiesInRowAndSquare = possibilitiesInRow.filter(function(
              p) {
            return p.square == square;
          });

          // Unique in square if number of (Row U Square) == (Square).
          isUniqueInSquare = (possibilitiesInRowAndSquare.length == possibilitiesInSquare.length);

          // If they are unique in square, exclude the rest of the row.
          // "We need a 7 _somewhere_ in this square, and the only options are
          // on this row, so we'll
          // exclude all the other spots on the row cause the 7 can't be there."
          if (isUniqueInSquare) {
            // Exclude the rest of the row.
            _excludeRowOrColumn(1, numberToSolve, row,
                possibilitiesInRowAndSquare);
          }

          // Unique in row if Number of (Row U Square) == (Row).
          isUniqueInRow = (possibilitiesInRowAndSquare.length == possibilitiesInRow.length);
          // Exclude the rest of the square.
          if (isUniqueInRow) {
            _excludeSquare(numberToSolve, row, col, possibilitiesInRowAndSquare);
          }

          // Check 3
          // ------------------------
          // Identical to Check 2 but checks column instead of row.
          var possibilitiesInColAndSquare = possibilitiesInCol.filter(function(
              p) {
            return p.square == square;
          });

          // Unique in square if N(Col U Square) == N(Square).
          isUniqueInSquare = (possibilitiesInColAndSquare.length == possibilitiesInSquare.length);
          if (isUniqueInSquare) {
            _excludeRowOrColumn(0, numberToSolve, col,
                possibilitiesInColAndSquare);
          }

          // Unique in column if N(Col U Square) == N(Col).
          isUniqueInCol = (possibilitiesInColAndSquare.length == possibilitiesInCol.length);

          // Exclude the rest of the square.
          if (isUniqueInCol) {
            _excludeSquare(numberToSolve, row, col, possibilitiesInColAndSquare);
          }
        }// End Iterating through possibilities for a single number.

        // Check 4
        // ------------------------
        // For this number, if we can identify any spot where
        // all the other numbers _aren't_, then we know the
        // number has to be in that spot.
        //
        // This is called the inverse elimination principle.
        var inverseEliminationResult = _inverseEliminate(numberToSolve);

        // If there are numbers found, then we assign them to the spot!
        var eliminationSurvivors = _getOccurrancesInMatrix(
            inverseEliminationResult, 1);
        if (eliminationSurvivors.length) {
          var row = eliminationSurvivors[0].row;
          var col = eliminationSurvivors[0].col;
          _solveNumber(numberToSolve, row, col);
          changeBit = 1;
          return changeBit;
        }
      }// End iterating through numbers.

      // Check 5
      // ------------------------
      // If we get down here and still haven't found anything, it's time to
      // break out the set theory to expose a few more exclusions. This is
      // computationally expensive but only necessary once or twice on hard
      // puzzles.

      // ExclusionResults is an array of objects where each object has 'number',
      // 'row' and 'col'.
      var exclusionResults = _combineExclusionMatrices();
      exclusionResults.forEach(function(e) {
        _excludeCell(e.number, e.row, e.col);
        changeBit = 1;
      });
      return changeBit;
    }

    // **********************************
    // PRIVATE METHODS
    // **********************************

    /**
     * clones the solution matrix so we don't tweak the input data and people
     * don't tweak our output data.
     */
    function _cloneSolutionMatrix(inputMatrix) {
      var result = [];
      for (var i = 0; i < 9; i++) {
        var row = [];
        for (var j = 0; j < 9; j++) {
          var value = Number(inputMatrix[i][j]);
          value = value || null;
          row.push(value);
        }
        result.push(row);
      }
      return result;
    }

    /**
     * Combines exclusion matrices to yield new number exclusions.
     */
    // My Theorem:
    // On a single row, tile or square, let there be M numbers (N in (n0, n1,
    // ... nM)
    // who all have exactly the same M possibilities (P in (p0, p1, ... pM).
    // Then you can safely exclude all _other_ numbers !N from P.
    //
    // That just means that if you have two spots, and you know that both
    // of them have to be either a 3 or a 4, and neither the 3 or 4 can be
    // anywhere else, then you can exclude all other numbers from those spots.
    //
    // This can be abstracted to 3 numbers && 3 spots, or more, but 2 is most
    // common. (Actually, ONE is the most common but we've covered that one
    // already).
    function _combineExclusionMatrices() {
      var results = [];

      // Iterate over 2 choices up to 8.
      var candidateNumbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
      var combinations = [];
      for (let r = 2; r < 8; r++) {

        // If we have already discovered an exclusion zone from this exercise,
        // exit the loop and solve the puzzle with more traditional means.
        if (results.length) {
          return results;
        }

        // The possible ways of combining r numbers from 1 to 9.
        var comparableSets = sudoku.combinations.getCombinations(
            candidateNumbers, r).combinations;
        for (var iSet = 0; iSet < comparableSets.length; iSet++) {

          // The numbers that actually get compared (like "1,2,5").
          var numbersToCompare = comparableSets[iSet];

          // The numbers that weren't chosen.
          var numbersNotChosen = candidateNumbers.filter(function(num) {
            return (numbersToCompare.indexOf(num) < 0);
          });

          // I pick one number to compare its exclusion matrix
          // against the others.
          // Which one I pick isn't important, because I'm only
          // interested in places where they ALL match.
          var chosenNumber = numbersToCompare[0];
          var alternateNumbers = numbersToCompare.slice(1);

          var discrepencyResult = _getEmptyGrid(9, 9);
          for ( var iAlternate in alternateNumbers) {
            alternateNumber = alternateNumbers[iAlternate];

            var a = _exclusionMatrix[chosenNumber - 1];
            var b = _exclusionMatrix[alternateNumber - 1];

            var discrepency = _exclusion_XOR_exclusion(a, b);
            discrepencyResult = _exclusion_OR_exclusion(discrepency,
                discrepencyResult);
          }

          // So now, this big discrepencyResult matrix should contain a list of
          // ALL the places across all the numbersToCompare where the
          // possibilities didn't completely coincide.
          //
          // What we do now is check each possibility for our chosen number. As
          // long as it doesn't share all of(row, column, square) with a
          // discrepency, it should be safe to exclude all numbersNotChosen from
          // that spot.
          var chosenNumberExclusionMatrix = _exclusionMatrix[chosenNumber - 1];
          var chosenNumberPossibilityMatrix = _invertExclusionMatrix(chosenNumberExclusionMatrix);
          var chosenPossibilities = _getOccurrancesInMatrix(
              chosenNumberPossibilityMatrix, true);

          // Get a list of all the spots where discrepencies were found.
          var discrepencyAreas = _getOccurrancesInMatrix(discrepencyResult,
              true);

          discrepencyAreas.forEach(function(e) {
            debugRowCol(e.row, e.col);

          });

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
        }
      }

      return results;
    }

    /**
     * Default method when excluding a number.
     */
    function _defaultExcludeNumberCallback(number, row, column) {
      console.log('Excluding number "' + number + '" from row "' + row
          + '" and column "' + column + '".');
    }

    /**
     * Default method when solving a number.
     */
    function _defaultSolveNumberCallback(number, row, column) {
      console.log('Resolved Number "' + number + '" at row "' + row
          + '" and column "' + column + '".');
    }

    /**
     * Excludes a single cell at a specific number by: (a) updating the
     * exclusion matrix for that number, and (b) calling the callback for that
     * number and cell.
     */
    function _excludeCell(number, row, col) {
      _exclusionMatrix[number - 1][row][col] = 1;
      _excludeNumberCallback(number, row, col);
    }

    /**
     * Given a number known to be in a certain spot, update all the exclusion
     * matrices to exclude the location, and update the number's exclusion
     * matrix to eliminate other spots in the same row and column.
     */
    function _excludeNewNumber(number, row, col) {
      // Eliminate the location.
      for (var iNumber = 1; iNumber <= 9; iNumber++) {
        _excludeCell(iNumber, row, col);
      }

      // Exclude the row, column and square from that numbers' matrix.
      _excludeRowOrColumn(1, number, row, []);
      _excludeRowOrColumn(0, number, col, []);
      _excludeSquare(number, row, col, []);
    }

    /**
     * Excludes the whole row or column (rowOrCol), skipping any exceptions,
     * from the given number's matrix. To exclude the row, 'selectRow' must be
     * true. Otherwise, the column is excluded. Exceptions should be an array of
     * occurrances where the keys are 'row', 'col' and 'square'. If you're
     * excluding a whole row, any cells where the column matches the column in
     * an exception, it will be skipped.
     */
    function _excludeRowOrColumn(selectRow, number, rowOrCol, exceptions) {
      var hasExceptions = (exceptions && exceptions.length);
      var exceptionHash = {};
      if (hasExceptions) {
        exceptions.forEach(function(e) {
          // If excluding row, exceptions must live on the same row for us to
          // ignore their columns.
          if (selectRow) {
            if (e.row !== rowOrCol)
              return;
          } else {
            if (e.col !== rowOrCol)
              return;
          }

          var key = selectRow ? e.col : e.row;
          exceptionHash[key] = 1;
        });
      }

      for (var i = 0; i < 9; i++) {
        // Skip if this iteration is excepted.
        if (exceptionHash[i]) {
          continue;
        }

        // Eliminate the number at that row and column.
        var row;
        var col;
        if (selectRow) {
          row = rowOrCol;
          col = i;
        } else {
          row = i;
          col = rowOrCol;
        }
        _excludeCell(number, row, col);
      }
    }

    /**
     * Excludes the square where the given row and column points. Exceptions are
     * an arry of objects that have keys 'row', 'col' and 'square'.
     */
    function _excludeSquare(number, row, col, exceptions) {

      // Filter the exceptions for the presence in the same square.
      var hasExceptions = (exceptions && exceptions.length);
      var squareBounds = _getSquareBounds(row, col);

      var minRow = squareBounds[0];
      var maxRow = squareBounds[1];
      var minCol = squareBounds[2];
      var maxCol = squareBounds[3];

      for (var iRow = minRow; iRow <= maxRow; iRow++) {
        for (var iCol = minCol; iCol <= maxCol; iCol++) {

          var skipExcludedCell = 0;
          exceptions.forEach(function(e) {
            if (e.row === iRow && e.col === iCol) {
              skipExcludedCell = 1;
            }
          });

          if (skipExcludedCell)
            continue;

          _excludeCell(number, iRow, iCol);
        }
      }
    }

    /**
     * Given 2 exclusion matrices (both 9x9), performs an OR operation where
     * each cell is 1 if either inputs are 1.
     */
    function _exclusion_OR_exclusion(a, b) {
      var result = _getEmptyGrid(9, 9);
      for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
          // cast to boolean just to be safe.
          var aCell = a[i][j] > 0 ? true : false;
          var bCell = b[i][j] > 0 ? true : false;
          result[i][j] = (aCell || bCell);
        }
      }

      return result;
    }

    /**
     * Given 2 exclusion matrices (both 9x9), performs an exclusive-or operation
     * where each cell is 1 if both inputs match and 0 if they don't.
     */
    function _exclusion_XOR_exclusion(a, b) {
      var result = _getEmptyGrid(9, 9);
      for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
          // cast to boolean just to be safe.
          var aCell = a[i][j] > 0 ? true : false;
          var bCell = b[i][j] > 0 ? true : false;
          result[i][j] = ((aCell && !bCell) || (!aCell && bCell));
        }
      }

      return result;
    }

    /**
     * Generates an empty exclusion matrix. Dimensions are [D x M x N] where D
     * is the digit, M is the row and N is the column.
     */
    function _getEmptyExclusionMatrix() {
      var result = [];
      for (var i = 0; i < 9; i++) {
        result.push(_getEmptyGrid(9, 9));
      }
      return result;
    }

    /**
     * Generates an empty grid (M x N).
     */
    function _getEmptyGrid(M, N) {
      var result = [];
      for (let i = 0; i < M; i++) {
        result.push([]);
        for (let j = 0; j < N; j++) {
          result[i].push(0);
        }
      }
      return result;
    }

    /**
     * Gets the occurrances of a value in an MxM matrix. All occurrances are
     * returned as an array of hashes where each occurrance has row, col and
     * Square. The Square convention follows the convention discussed at the
     * top.
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

    /*
     * Gets the bounds for a square. Returns bounds like this: [minRow, maxRow,
     * minCol, maxCol]
     */
    function _getSquareBounds(row, col) {
      var minRow;
      var maxRow;
      var minCol;
      var maxCol;

      // Find Row bounds.
      if (row < 3) {
        minRow = 0;
        maxRow = 2;
      } else if (row < 6) {
        minRow = 3;
        maxRow = 5;
      } else {
        minRow = 6;
        maxRow = 8;
      }

      // Find Column bounds.
      if (col < 3) {
        minCol = 0;
        maxCol = 2;
      } else if (col < 6) {
        minCol = 3;
        maxCol = 5;
      } else {
        minCol = 6;
        maxCol = 8;
      }

      return [ minRow, maxRow, minCol, maxCol ];
    }

    /*
     * Gets the square for the specified row and column.
     */
    function _getSquareForRowColumn(row, col) {
      var rGroup = Math.floor(row / 3);
      var cGroup = Math.floor(col / 3);
      var result = rGroup * 3 + cGroup;
      return result;
    }

    /**
     * Uses inverse elimination principle to find spots where the number has to
     * be because all the other numbers can't be there.
     * 
     * Returns an MxM matrix of 1's and zeros where 1's indicate all others have
     * excluded The present number.
     */
    function _inverseEliminate(numberToSolve) {
      var result = [];
      for (var row = 0; row < 9; row++) {
        result.push([]);
        for (var col = 0; col < 9; col++) {
          var excludedByAll = 1;
          for (var number = 1; number <= 9; number++) {
            // Whether or not this row/col is excluded by this number.
            var excludedByNumber = _exclusionMatrix[number - 1][row][col];

            // If we're on the current number, we must pointedly NOT be excluded
            // at this site.
            // Otherwise, we expect an exclusion.
            if (number === numberToSolve) {
              excludedByAll = excludedByAll && !excludedByNumber;
            } else {
              excludedByAll = excludedByAll && excludedByNumber;
            }

            if (!excludedByAll) {
              break;
            }
          }
          result[row][col] = excludedByAll ? 1 : 0;
        }
      }
      return result;
    }

    /**
     * Inverts an exclusionMatrix matrix ([M x N])
     */
    function _invertExclusionMatrix(matrix) {
      var result = matrix.map(function(row) {
        return row.map(function(cell) {
          return cell ? 0 : 1;
        });
      });
      return result;
    }

    /**
     * Strict Uniqueness for a number requires it to be the only one of its
     * value in the same row, column AND square.
     */
    function _isStrictlyUnique(matrix, number, row, col) {
      var occurrancesOfNumber = _getOccurrancesInMatrix(matrix, number);
      var square = _getSquareForRowColumn(row, col);

      // Unique in row if number of occurrances in row is 1.
      var isUniqueInRow = occurrancesOfNumber.filter(function(o) {
        return o.row == row;
      }).length === 1;

      // Unique in col if number of occurrances in col is 1.
      var isUniqueInCol = occurrancesOfNumber.filter(function(o) {
        return o.col == col;
      }).length === 1;

      // Unique in square if number of occurrances in square is 1.
      var isUniqueInSquare = occurrancesOfNumber.filter(function(o) {
        return o.square == square;
      }).length === 1;

      var result = isUniqueInRow && isUniqueInCol && isUniqueInSquare;
      return result;
    }

    /**
     * When a number has been determined to be in a certain spot, we solve it!
     */
    function _solveNumber(number, row, col) {
      // Update the solution matrix.
      _solutionMatrix[row][col] = number;

      // Update the exclusion matrix.
      _excludeNewNumber(number, row, col);

      // Call the solve callback.
      _solveNumberCallback(number, row, col);

    }
    /*
     * Makes sure the input data is valid. If it's not, abort construction.
     */
    function _validate() {
      for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
          var number = _solutionMatrix[row][col];
          if (number) {
            var isValid = _isStrictlyUnique(_solutionMatrix, number, row, col);
            if (!isValid) {
              throw "Invalid solution found in Matrix, near number '" + number
                  + "' in row '" + (row + 1) + "' and column '" + (col + 1)
                  + "'.";
            }
          }
        }
      }
    }

    _validate();

    // For Me
    esp.solver = solver;
    esp.solutionMatrix = _solutionMatrix;
    esp.exclusionMatrix = _exclusionMatrix;
    esp.excludeNumberCallback = _excludeNumberCallback;
    esp.solveNumberCallback = _solveNumberCallback;

    return solver;
  }

  return {
    /**
     * Returns an instance of the Solver class (if successful). Otherwise
     * returns null. The solver class is constructed with an [MxN] array of
     * input values that have either sudoku inputs or null.
     * 
     * If validation is successful, an object is created and returned.
     */
    create : create,
  };
}();