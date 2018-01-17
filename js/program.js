/*
 **********************************************************************
 *  File   : program.js
 *  Author : peach
 *  Date   : 13 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */

var sudoku = sudoku || {};
sudoku.program = function() {

  // Element IDs.
  var _initializationFormId = 'initialization-dashboard';
  var _solverDashboardId = 'solver-dashboard';
  var _userInputWrapperId = 'user-input-wrapper';
  var _userInputGridId = 'user-input-grid';

  var wrapperIds = {
    VIEW_TOTAL : 'view-total-wrapper',
    VIEW_1 : 'view-1-wrapper',
    VIEW_2 : 'view-2-wrapper',
    VIEW_3 : 'view-3-wrapper',
    VIEW_4 : 'view-4-wrapper',
    VIEW_5 : 'view-5-wrapper',
    VIEW_6 : 'view-6-wrapper',
    VIEW_7 : 'view-7-wrapper',
    VIEW_8 : 'view-8-wrapper',
    VIEW_9 : 'view-9-wrapper',
  };

  var gridIds = {
    VIEW_TOTAL : 'view-total-grid',
    VIEW_1 : 'view-1-grid',
    VIEW_2 : 'view-2-grid',
    VIEW_3 : 'view-3-grid',
    VIEW_4 : 'view-4-grid',
    VIEW_5 : 'view-5-grid',
    VIEW_6 : 'view-6-grid',
    VIEW_7 : 'view-7-grid',
    VIEW_8 : 'view-8-grid',
    VIEW_9 : 'view-9-grid',
  };

  // State Variables
  var _solver = null;

  /*
   * Private Methods
   */

  /**
   * Draws the solution grids into the specified wrappers.
   */
  function _drawSolutionGrids() {
    // Draw the Total View Grid.
    sudoku.grid.drawer.drawGrid(gridIds.VIEW_TOTAL, wrapperIds.VIEW_TOTAL);

    // Draw the rest of 'em.
    for (var i = 1; i <= 9; i++) {
      var viewKey = "VIEW_" + i;
      var gridId = gridIds[viewKey];
      var wrapperId = wrapperIds[viewKey];
      sudoku.grid.drawer.drawGrid(gridId, wrapperId);
    }
  }

  /**
   * Called by the solver when a number has been determined to be exclued from a
   * certain spot.
   */
  function _excludeNumber(number, row, col) {
    var gridId = gridIds["VIEW_" + number];
    sudoku.grid.manipulation.setCellColor(gridId, row, col, '#FF7777');
  }

  /**
   * Takes the current view of the solution grid and updates the values.
   */
  function _initializeSolutionGrid() {

    var vals = _solver.getMatrixValues();

    for (var row = 0; row < 9; row++) {
      for (var col = 0; col < 9; col++) {
        var val = vals[row][col];
        _solveNumber(val, row, col);
      }
    }
  }
  /**
   * Removes solution grids.
   */
  function _removeSolutionGrids() {
    // Remove the Total View Grid.
    var grid = document.getElementById(gridIds.VIEW_TOTAL);
    if (grid) {
      grid.parentElement.removeChild(grid);
    }
    // Remove the rest of 'em.
    for (var i = 1; i <= 9; i++) {
      var viewKey = "VIEW_" + i;
      var gridId = gridIds[viewKey];
      grid = document.getElementById(gridId);
      if (grid) {
        grid.parentElement.removeChild(grid);
      }
    }
  }

  /**
   * Called by the solver when a number has been guarenteed to be in a certain
   * spot.
   */
  function _solveNumber(number, row, col) {
    var gridId = gridIds.VIEW_TOTAL;
    sudoku.grid.manipulation.setCellValue(gridId, row, col, number);
  }

  /*
   * Public Methods
   */
  function enterDataInputMode() {

    // Disable the solver
    _solver = null;
    _removeSolutionGrids();

    // Hide the solver area.
    document.getElementById(_solverDashboardId).style.display = "none";
    document.getElementById(_initializationFormId).style.display = '';

    // If the user input grid still exists, keep it. Otherwise,
    // Draw a new one.
    if (!document.getElementById(_userInputGridId)) {
      sudoku.UserGrid.drawGrid(_userInputGridId, _userInputWrapperId);
    }
  }

  function enterSolveMode() {
    // Get the data.
    var userInputData = sudoku.UserGrid.getInputValues(_userInputGridId);

    // #############
    // ############# MOCKED DATA!
    // #############
    // userInputData = _mockout_data();

    // Attempt to create the solver with the data.

    try {
      _solver = sudoku.solver.create(userInputData, _excludeNumber,
          _solveNumber);
    } catch (e) {
      // On fail, show alert and cancel the mode switch.
      console.error(e);
      alert(e);
      return;
    }

    // If the solver was created successfully, switch to mode 2
    // Hide the data input area.
    document.getElementById(_initializationFormId).style.display = "none";
    document.getElementById(_solverDashboardId).style.display = '';

    // Draw the grids.
    _drawSolutionGrids();

    // Initialize the solution grid.
    _initializeSolutionGrid();
  }

  function next() {
    if (_solver === null) {
      return;
    }

    var stillWorking = _solver.next();
    if (!stillWorking) {
      alert('The solver is out of ideas!');
    }
  }

  function setup() {
    enterDataInputMode();
  }

  function solveAll() {
    if (_solver === null) {
      return;
    }

    var repeat = window.setInterval(function() {
      working = _solver.next();
      if (!working) {
        window.clearInterval(repeat);
      }
    }, 50);
  }

  return {
    /**
     * Allows user to enter data for a sudoku puzzle.
     */
    enterDataInputMode : enterDataInputMode,

    /**
     * Retrieves data from the input, builds a solver object, and solves the
     * problem.
     */
    enterSolveMode : enterSolveMode,

    /**
     * Advances the solver to the next stop point. A stop point is where either:
     * A number has been filled in, or A set of numbers have completed one
     * iteration.
     */
    next : next,

    /**
     * Initializes the program with its constants and so forth. Hides and shows
     * the view as required.
     */
    setup : setup,

    /**
     * Solves the puzzle as well as possible by repeatedly calling 'next()'
     * until there's nothing left to do.
     */
    solveAll : solveAll,
  };
}();

function _mockout_data() {
  return [ [ 2, null, null, null, null, null, null, null, null, ],
      [ null, 6, null, 7, 8, null, 9, null, null, ],
      [ null, 8, null, null, null, 9, 4, null, null, ],
      [ null, null, null, null, null, null, null, null, null, ],
      [ null, null, null, null, null, null, null, null, null, ],
      [ null, null, null, null, null, null, null, null, null, ],
      [ null, null, null, null, null, null, null, null, null, ],
      [ null, null, null, null, null, null, null, null, null, ],
      [ null, null, null, null, null, null, null, null, null, ], ];
}
