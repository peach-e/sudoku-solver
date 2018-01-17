/*
 **********************************************************************
 *  File   : main.js
 *  Author : peach
 *  Date   : 13 January 2018
 *
 *  This file is licensed under the GNU General Public License v3.0
 *  Copyright (C) 2018  Eric Peach
 **********************************************************************
 */
var BUTTON_BEGIN_ID = 'user-input-submit';
var BUTTON_RETURN_ID = 'return-to-input';
var BUTTON_ADVANCE_STEP_ID = 'advance-step';
var BUTTON_SOLVE_ALL_ID = 'solve-all';

sudoku.program.setup();

document.getElementById(BUTTON_BEGIN_ID).addEventListener('click',
    sudoku.program.enterSolveMode);
document.getElementById(BUTTON_RETURN_ID).addEventListener('click',
    sudoku.program.enterDataInputMode);
document.getElementById(BUTTON_ADVANCE_STEP_ID).addEventListener('click',
    sudoku.program.next);
document.getElementById(BUTTON_SOLVE_ALL_ID).addEventListener('click',
    sudoku.program.solveAll);