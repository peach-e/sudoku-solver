/*
 **********************************************************************
 *  File   : grid.js
 *  Author : peach
 *  Date   : 18 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */

var sudoku = sudoku || {};
sudoku.grid = sudoku.grid = function() {

  /**
   * Performs grid operations like reading and writing numbers to the grid,
   * taking user input, and setting colors.
   * 
   * @class
   */
  return {

    /**
     * Draws a styled Sudoku Grid inside the specified DIV element.
     * 
     * @param gridId
     *          {string} the ID to give the new grid.
     * @param wrappingDivElementId
     *          {node} The ID of the wrapping DIV element to place the grid.
     */
    drawGrid : sudoku.implementation.grid.drawer.drawGrid,

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
    getCellColor : sudoku.implementation.grid.manipulation.getCellColor,

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
    setCellColor : sudoku.implementation.grid.manipulation.setCellColor,

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
    getCellValue : sudoku.implementation.grid.manipulation.getCellValue,

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
    setCellValue : sudoku.implementation.grid.manipulation.setCellValue,

    /**
     * Clears an input grid of its values in each text box.
     * 
     * @param gridId
     *          The ID of the grid to write to.
     */
    clearInputGridValues : sudoku.implementation.grid.userGrid.clearInputGridValues,

    /**
     * Draws a Sudoku Grid inside the specified DIV element with text fields
     * where numbers can be written.
     * 
     * @param gridId
     *          {string} the ID to give the new grid.wrappingDivElementId
     * @param wrappingDivElementId
     *          {node} The ID of the wrapping DIV element to place the grid.
     */
    drawInputGrid : sudoku.implementation.grid.userGrid.drawInputGrid,

    /**
     * Reads a textbox grid into an array.
     * 
     * @param gridId
     *          {string} the ID of grid to read info from.
     */
    getInputGridValues : sudoku.implementation.grid.userGrid.getInputGridValues,

    /**
     * Writes a 9x9 array into a textbox grid.
     * 
     * @param gridId
     *          The ID of the grid to write to.
     * @param numberArray
     *          The array of numbers to populate.
     */
    setInputGridValues : sudoku.implementation.grid.userGrid.setInputGridValues,

    /**
     * Removes a grid with the specified gridId.
     * 
     * @param gridId
     *          {string} the ID of grid to get rid of.
     */
    removeGrid : sudoku.implementation.grid.userGrid.removeGrid,

  }
}();