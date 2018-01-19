/*
 **********************************************************************
 *  File   : manipulation.js
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
sudoku.implementation.grid.manipulation = function() {

  /*
   * Private Methods
   */

  function _getGrid(gridId) {
    var grid = document.getElementById(gridId);
    if (!grid
        || !grid.classList
            .contains(sudoku.implementation.grid.constants.CLASS_SUDOKUGRID)) {
      console.error('No valid grid by name "' + gridId + '"');
      return;
    }
    return grid;
  }

  function _getCell(grid, row, col) {
    var cell = grid.childNodes[row].childNodes[col]
    if (!cell) {
      console.error('Invalid row or column.');
    }
    return cell;
  }

  /*
   * Public Methods
   */

  function getCellColor(gridId, row, col) {
    var grid = _getGrid(gridId);
    var cell = _getCell(grid, row, col);

    if (!grid || !cell) {
      return;
    }

    return cell.style.backgroundColor;
  }

  function setCellColor(gridId, row, col, color) {
    var grid = _getGrid(gridId);
    var cell = _getCell(grid, row, col);

    if (!grid || !cell) {
      return;
    }

    cell.style.backgroundColor = color;
  }

  function getCellValue(gridId, row, col) {
    var grid = _getGrid(gridId);
    var cell = _getCell(grid, row, col);

    if (!grid || !cell) {
      return;
    }

    return cell.innerHTML;
  }

  function setCellValue(gridId, row, col, value) {
    var grid = _getGrid(gridId);
    var cell = _getCell(grid, row, col);

    if (!grid || !cell) {
      return;
    }

    cell.innerHTML = value;
  }

  function createTextBox(gridId, row, col) {
    var grid = _getGrid(gridId);
    var cell = _getCell(grid, row, col);

    if (!grid || !cell) {
      return;
    }

    cell.innerHTML = "<input type=\"text\" size=\"2\">";
  }

  function readTextBox(gridId, row, col) {
    var grid = _getGrid(gridId);
    var cell = _getCell(grid, row, col);

    if (!grid || !cell) {
      return;
    }

    if (!cell.hasChildNodes() || cell.childNodes[0].tagName != 'INPUT') {
      console.warn('Cell does not have a text box.');
      return;
    }

    return cell.childNodes[0].value;
  }

  function writeTextBox(gridId, row, col, message) {
    var grid = _getGrid(gridId);
    var cell = _getCell(grid, row, col);

    if (!grid || !cell) {
      return;
    }

    if (!cell.hasChildNodes() || cell.childNodes[0].tagName != 'INPUT') {
      console.warn('Cell does not have a text box.');
      return;
    }

    cell.childNodes[0].value = message;
  }

  return {
    /**
     * Determine color of cell.
     * 
     * @param gridId
     *          The ID for the grid to operate on.
     * @param row
     *          The specified Row
     * @param col
     *          The Specified Column.
     * @return {string} result CSS color value.
     */
    getCellColor : getCellColor,

    /**
     * Assigns color of cell. Color should be literal ("red") or hex
     * ("#FF0000").
     * 
     * @param gridId
     *          The ID for the grid to operate on.
     * @param row
     *          The specified Row
     * @param col
     *          The Specified Column.
     * @param color
     *          CSS Hex Value or string.
     */
    setCellColor : setCellColor,

    /**
     * Retrieves value of cell.
     * 
     * @param gridId
     *          The ID for the grid to operate on.
     * @param row
     *          The specified Row
     * @param col
     *          The Specified Column.
     * @return result A single digit
     */
    getCellValue : getCellValue,

    /**
     * Sets value of cell.
     * 
     * @param gridId
     *          The ID for the grid to operate on.
     * @param row
     *          The specified Row
     * @param col
     *          The Specified Column.
     */
    setCellValue : setCellValue,

    /**
     * When user input is required, adds a text box.
     * 
     * @param gridId
     *          The ID for the grid to operate on.
     * @param row
     *          The specified Row
     * @param col
     *          The Specified Column.
     */
    createTextBox : createTextBox,

    /**
     * Reads value of text box.
     * 
     * @param gridId
     *          The ID for the grid to operate on.
     * @param row
     *          The specified Row
     * @param col
     *          The Specified Column.
     * @return result {integer} A single digit
     */
    readTextBox : readTextBox,

    /**
     * Writes to the value of a text box in a grid.
     * 
     * @param gridId
     *          The ID for the grid to operate on.
     * @param row
     *          The specified Row
     * @param col
     *          The Specified Column.
     * @param message
     *          The message to write to the box.
     */
    writeTextBox : writeTextBox,
  };

}();