import { Given, When, Then } from '@cucumber/cucumber';
import { ctx, setInputValue, startGameWithState, clickBoardCell, flushPlaceSymbol, patchGameState, snapshotState } from './world';

// Scenario: Player wins with a horizontal row
// (uses shared: aGameIsInProgressAndItIsAlicesTurn → see bottom)
// (uses shared: theGameDetectsWinningCondition, theGameAnnouncesAliceWon, theGameEnds → shared.steps.ts)

Given('Alice has already placed two X symbols in the same row', function () {
    patchGameState({
        board: ['X', 'X', '', 'O', '', '', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 2;
});

When('Alice places a third X in that row', function () {
    clickBoardCell(2);
    flushPlaceSymbol({
        board: ['X', 'X', 'X', 'O', '', '', '', '', ''],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
});

// Scenario: Player wins with a vertical column
// (uses shared: aGameIsInProgressAndItIsBobsTurn → see bottom)
// (uses shared: theGameDetectsWinningCondition, theGameAnnouncesBobWon, theGameEnds → shared.steps.ts)

Given('Bob has already placed two O symbols in the same column', function () {
    patchGameState({
        board: ['X', 'O', 'X', '', 'O', '', '', '', ''],
        currentPlayer: 'O',
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 7;
});

When('Bob places a third O in that column', function () {
    clickBoardCell(7);
    flushPlaceSymbol({
        board: ['X', 'O', 'X', '', 'O', '', '', 'O', ''],
        currentPlayer: null,
        winner: 'O',
        draw: false,
        winningCells: [1, 4, 7],
    });
});

// Scenario: Player wins with a diagonal from top-left to bottom-right
// (uses shared: aGameIsInProgressAndItIsAlicesTurn → see bottom)
// (uses shared: theGameDetectsWinningCondition, theGameAnnouncesAliceWon, theGameEnds → shared.steps.ts)

Given('Alice has already placed two X symbols diagonally from top-left to bottom-right', function () {
    patchGameState({
        board: ['X', 'O', '', '', 'X', '', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 8;
});

When('Alice places a third X on that diagonal', function () {
    clickBoardCell(8);
    flushPlaceSymbol({
        board: ['X', 'O', '', '', 'X', '', '', '', 'X'],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 4, 8],
    });
});

// Scenario: Player wins with a diagonal from top-right to bottom-left
// (uses shared: aGameIsInProgressAndItIsBobsTurn → see bottom)
// (uses shared: theGameDetectsWinningCondition, theGameAnnouncesBobWon, theGameEnds → shared.steps.ts)

Given('Bob has already placed two O symbols diagonally from top-right to bottom-left', function () {
    patchGameState({
        board: ['X', '', 'O', '', 'O', '', '', '', 'X'],
        currentPlayer: 'O',
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 6;
});

When('Bob places a third O on that diagonal', function () {
    clickBoardCell(6);
    flushPlaceSymbol({
        board: ['X', '', 'O', '', 'O', '', 'O', '', 'X'],
        currentPlayer: null,
        winner: 'O',
        draw: false,
        winningCells: [2, 4, 6],
    });
});

// Scenario: No false positive winner detection
// (uses shared: aGameIsInProgress → shared.steps.ts, aPlayerPlacesASymbol → shared.steps.ts)
// (uses shared: theGameContinues → shared.steps.ts)

Given('no player has three symbols aligned in a row, column, or diagonal', function () {
    patchGameState({
        board: ['X', 'O', 'X', '', 'O', '', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 3;
});

Then('the game does not announce a winner', function () {
    if (ctx.lastGameState?.winner !== null) {
        throw new Error('Expected no winner announcement');
    }
});

// Scenario: Game stops accepting moves after a winner is announced
// (uses shared: aPlayerClicksOnAnyCell → shared.steps.ts)
// (uses shared: noSymbolIsPlaced, theGameStateDoesNotChange → shared.steps.ts)

Given('the game has ended and Alice has been announced as the winner', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
    ctx.lastSelectedCellIndex = 5;
    ctx.expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

// ── Shared steps (used by multiple scenarios above) ───────────────────────────

Given(/^a game is in progress and it is Alice's turn \(X\)$/, function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({ currentPlayer: 'X', winner: null, draw: false });
});

Given(/^a game is in progress and it is Bob's turn \(O\)$/, function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({ currentPlayer: 'O', winner: null, draw: false });
});

Then('the game detects a winning condition', function () {
    if (!ctx.lastGameState?.winner) {
        throw new Error('Expected a winning condition to be detected');
    }
});

Then('the game announces that Alice has won', function () {
    if (ctx.lastGameState?.winner !== 'X') {
        throw new Error('Expected Alice to be announced as winner');
    }
});

Then('the game announces that Bob has won', function () {
    if (ctx.lastGameState?.winner !== 'O') {
        throw new Error('Expected Bob to be announced as winner');
    }
});
