/*
 **********************************************************************
 *  File   : user_grid.js
 *  Author : peach
 *  Date   : 13 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */

var sudoku = sudoku || {};
sudoku.implementation = sudoku.implementation || {};
sudoku.implementation.grid = sudoku.implementation.grid || {};
sudoku.implementation.grid.userGrid = function() {

  /*
   * Private Functions
   */

  function _getGrid(gridId) {
    var grid = document.getElementById(gridId);
    if (!grid || !grid.classList.contains(sudoku.implementation.grid.constants.CLASS_SUDOKUGRID)) {
      console.error('No valid grid by name "' + gridId + '"');
      return;
    }
    return grid;
  }

  /*
   * Public Functions
   */

  function drawInputGrid(gridId, wrappingDivElementId) {

    // Draw the grid,
    sudoku.implementation.grid.drawer.drawGrid(gridId, wrappingDivElementId);

    // Return if it didnt work.
    var grid = _getGrid(gridId);
    if (!grid) {
      return;
    }

    // For each row
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        sudoku.implementation.grid.manipulation.createTextBox(gridId, i, j);
      }
    }
  }

  function clearInputGridValues(gridId) {
    var grid = _getGrid(gridId);
    if (!grid) {
      return;
    }

    // For each row and column, write values.
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        sudoku.implementation.grid.manipulation.writeTextBox(gridId, i, j, '');
      }
    }
  }

  function getInputGridValues(gridId) {
    var grid = _getGrid(gridId);
    if (!grid) {
      return;
    }

    // For each row and column, read values.
    var result = [];
    for (var i = 0; i < 9; i++) {
      result.push([]);
      for (var j = 0; j < 9; j++) {
        // Get the value
        var value = sudoku.implementation.grid.manipulation.readTextBox(gridId, i, j);

        // Make sure we're doing it right.
        if (value === null) {
          return;
        }

        // Cast blank, zero, or non- values to null.
        value = value || null;

        // append the result.
        result[i].push(value);
      }
    }
    return result;
  }

  function setInputGridValues(gridId, numberArray) {
    var grid = _getGrid(gridId);
    if (!grid) {
      return;
    }

    // For each row and column, write values.
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        sudoku.implementation.grid.manipulation.writeTextBox(gridId, i, j, numberArray[i][j]);
      }
    }
  }

  function removeGrid(gridId) {
    var grid = _getGrid(gridId);
    if (!grid) {
      return;
    }

    grid.parentElement.removeChild(grid);
  }

  return {
    clearInputGridValues : clearInputGridValues,
    drawInputGrid : drawInputGrid,
    getInputGridValues : getInputGridValues,
    setInputGridValues : setInputGridValues,
    removeGrid : removeGrid,
  }

}();