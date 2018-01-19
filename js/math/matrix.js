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
var sudoku = sudoku || {};
sudoku.implementation = sudoku.implementation || {};
sudoku.implementation.math = sudoku.implementation.math || {};
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

  /**
   * Iterates on row and column, determining the square.
   * 
   * colCallback must be provided. It is called _DIMENSION**2 times, whenever we
   * enter a new cell. It's called with arguments ('row,col,square,value'). If
   * colCallback returns true, this function will exit.
   * 
   * rowCallback is optional. It is called _DIMENSION times, called with
   * argument ('row'). If rowCallback returns true, this function will exit.
   */
  function _iterateRowCol(colCallback, rowCallback) {
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
      _iterateRowCol(function(row, col, square) {
        _data[row][col] = constructorArgument;
      });
    } else if (constructorArgument instanceof Array) {
      /*
       * Populate data using the M x M array. There will be problems if the
       * dimensions are anything else.
       */
      _iterateRowCol(function(row, col, square) {
        _data[row][col] = constructorArgument[row][col];
      });
    } else if (constructorArgument instanceof self.constructor) {
      /*
       * Populate data using an existing matrix.
       */
      _iterateRowCol(function(row, col, square) {
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
  /*
   * Construct
   */

  _construct();
  self.clone = clone;
  self.get = get;

  self.data = _data;
};