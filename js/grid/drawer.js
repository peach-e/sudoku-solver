/*
 **********************************************************************
 *  File   : drawer.js
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
sudoku.implementation.grid.drawer = function() {

  function drawGrid(gridId, wrappingDivElementId) {
    if (!gridId) {
      console.error('Missing Grid ID');
      return;
    }

    if (!wrappingDivElementId) {
      console.error('Missing Wrapping Div Element ID')
      return;
    }

    var wrappingDivElement = document.getElementById(wrappingDivElementId);
    if (!wrappingDivElement) {
      console.error('Wrapping DIV element doesn\'t exist!')
      return;
    }

    if (wrappingDivElement.tagName != 'DIV') {
      console.error('Trying to build sudoku grid inside a non-div element');
      return;
    }

    // Create the table.
    var table = document.createElement('table');
    table.classList.add(sudoku.implementation.grid.constants.CLASS_SUDOKUGRID);
    table.id = gridId;

    // Create rows.
    for (var i = 0; i < 9; i++) {
      var row = document.createElement('tr');

      for (var j = 0; j < 9; j++) {
        var cell = document.createElement('td');

        // Apply the top/bottom cell boundary as applicable.
        switch (i) {
        case 0:
        case 3:
        case 6:
          cell.classList.add(sudoku.implementation.grid.constants.CLASS_TOP_SQUARE_BOUNDARY);
          break;
        case 8:
          cell.classList.add(sudoku.implementation.grid.constants.CLASS_BOTTOM_SQUARE_BOUNDARY);
        }
        // Apply the left/right cell boundary as applicable.
        switch (j) {
        case 0:
        case 3:
        case 6:
          cell.classList.add(sudoku.implementation.grid.constants.CLASS_LEFT_SQUARE_BOUNDARY);
          break;
        case 8:
          cell.classList.add(sudoku.implementation.grid.constants.CLASS_RIGHT_SQUARE_BOUNDARY);
        }

        row.appendChild(cell);
      }

      table.appendChild(row);
    }

    wrappingDivElement.appendChild(table);
  }

  return {
    drawGrid : drawGrid
  };

}();