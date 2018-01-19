/*
 **********************************************************************
 *  File   : matrix.js
 *  Author : peach
 *  Date   : 16 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */
// MATRIX CONVENTIONS
// -------------------------
// All matrices are assumed to be 9 x 9, organized by [Row, Col].
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
// So the number in row/col 0,4 would be at the top of square 1.
//
var sudoku = sudoku || {};
sudoku.implementation = sudoku.implementation || {};
sudoku.implementation.math = sudoku.implementation.math || {};

/**
 * Matrix for sudoku math operations.
 * 
 * @class
 */
sudoku.implementation.math.Matrix = function(constructorArgument) {
  // -------------------------
  // CONVENTION
  // -------------------------
  // Refer to self as 'self' to avoid having to pass 'this' to all the member
  // functions.
  var self = this;

  /*
   * Constants
   */

  var _DIMENSION = 9;
  var _errors = {
    initialization : 'MatrixInitializationError'
  };

  /*
   * Private Members
   */
  //
  // Matrix where values are stored. Initialize to empty array.
  //
  var _data = function() {
    var d = new Array(_DIMENSION);
    for (var i = 0; i < _DIMENSION; i++) {
      d[i] = new Array(_DIMENSION);
    }
    return d;
  }();

  /*
   * Public Methods
   */

  /**
   * Clones the matrix.
   */
  function clone() {
    return new this.constructor(this);
  }

  /**
   * Gets a value from the data block.
   */
  function get(row, col) {
    return _data[row][col];
  }

  /**
   * Get list of occurrances of soughtValue.
   */
  function getOccurrancesOfValue(soughtValue) {
    var occurrances = [];

    // Iterate over every row and column searching for value.

    iterateOverRowAndColumn(function(row, col, square, value) {
      if (value === soughtValue) {
        occurrances.push({
          row : row,
          col : col,
          square : square
        });
      }
    });

    return occurrances;
  }

  /**
   * Strict Uniqueness for a number requires it to be the only one of its value
   * in the same row, column AND square.
   */
  function isStrictlyUnique(row, col) {
    // Number at that spot.
    var number = get(row, col);

    // The specific square associated with 'row/col'.
    var square = _getSquareForRowColumn(row, col);

    // Occurrances
    var occurrancesOfNumber = getOccurrancesOfValue(number);

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
   * Iterates on row and column, determining the square.
   */
  function iterateOverRowAndColumn(colCallback, rowCallback) {
    rowCallback = rowCallback || function() {
    };

    // Iterate over row.
    for (var row = 0; row < _DIMENSION; row++) {

      // Call row callback and break if it returns true.
      if (rowCallback(row)) {
        return;
      }

      for (var col = 0; col < _DIMENSION; col++) {
        var square = _getSquareForRowColumn(row, col);
        // Call column callback and break if it returns true;
        if (colCallback(row, col, square, _data[row][col])) {
          return;
        }
      }
    }
  }

  /*
   * Private Methods
   */

  /**
   * Gets the square for the specified row and column.
   */
  function _getSquareForRowColumn(row, col) {
    var rGroup = Math.floor(row / 3);
    var cGroup = Math.floor(col / 3);
    var result = rGroup * 3 + cGroup;
    return result;
  }

  /*
   * Construct
   */

  /**
   * Initialize the object by copying the data from constructor arg into the
   * data object. How we do this depends on the type of data passed in.
   */
  function _construct() {
    // If constructor argument is blank, default to null.
    if (constructorArgument === undefined) {
      constructorArgument = null;
    }

    // Assemble the data differently depending on the type of constructor arg
    // given.
    if (typeof (constructorArgument) === 'number' || constructorArgument === null) {
      /*
       * Populate data with a single value.
       */
      iterateOverRowAndColumn(function(row, col, square) {
        _data[row][col] = constructorArgument;
      });
    } else if (constructorArgument instanceof Array) {
      /*
       * Populate data using the M x M array. There will be problems if the
       * dimensions are anything else.
       */
      iterateOverRowAndColumn(function(row, col, square) {
        _data[row][col] = constructorArgument[row][col];
      });
    } else if (constructorArgument instanceof self.constructor) {
      /*
       * Populate data using an existing matrix.
       */
      iterateOverRowAndColumn(function(row, col, square) {
        _data[row][col] = constructorArgument.get(row, col);
      });
    } else {
      // Throw because we don't know what this is.
      var e = new Error(
          'Unknown Matrix constructor argument. Use a 9x9 array of arrays, a single number, or another Matrix instance.');
      e.invalidArgument = constructorArgument;
      e.name = _constants.initialization;

      throw e;
    }
  }

  _construct();

  // ==================================================
  // ==================================================

  /**
   * Creates a duplicate of the current matrix.
   */
  self.clone = clone;

  /**
   * Retrievs a value from the matrix.
   * 
   * @param row
   *          The row to get value.
   * @param col
   *          The col to get the value.
   * @example
   * 
   * var val = m.get(4,5);
   */
  self.get = get;

  /**
   * Gets the occurrances of a value in the matrix. Occurrances are returned as
   * an array of hashes where each occurrance has row, col and square.
   * 
   * @param value
   *          The value to seek.
   * @return occurrances an array of occurrances in matrix. Has keys
   *         'row','col','square'.
   */
  self.getOccurrancesOfValue = getOccurrancesOfValue;

  /**
   * Checks to see if the number at the specified location is the only one of
   * its kind on the same row, column and square.
   * 
   * @param row
   *          The row where the number is located
   * @param col
   *          The column where the number is located
   * @return result True if the number is the only one in the union of ( row,
   *         column AND square).
   */
  self.isStrictlyUnique = isStrictlyUnique;

  /**
   * Iterates on row and column, calling provided callbacks at each row and
   * cell.
   * 
   * colCallback must be provided. It is called _DIMENSION**2 times, whenever we
   * enter a new cell. It's called with arguments ('row,col,square,value'). If
   * colCallback returns true, this function will exit.
   * 
   * rowCallback is optional. It is called _DIMENSION times, called with
   * argument ('row'). If rowCallback returns true, this function will exit.
   * 
   * @param colCallback
   *          callback to call with (row,col,square,value) at each cell.
   * @param rowCallback
   *          callback to call on each row (passing 'row'), if specified.
   */
  self.iterateOverRowAndColumn = iterateOverRowAndColumn;

  self.data = _data;
};