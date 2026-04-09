import { Given, When, Then } from '@cucumber/cucumber';
import { ctx, setInputValue, startGameWithState, snapshotState } from './world';

// Scenario: Highlight winning horizontal row
// (uses shared: theGameDisplaysTheFinalBoard → see bottom)

Given(/^a game has been won by Alice \(X\) with three symbols in the same row$/, function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
    ctx.expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

Then('the three cells in the winning row are highlighted', function () {
    if (JSON.stringify(ctx.lastGameState?.winningCells ?? []) !== JSON.stringify(ctx.expectedHighlightedCells)) {
        throw new Error('Expected winning row to be highlighted');
    }
});

// Scenario: Highlight winning vertical column
// (uses shared: theGameDisplaysTheFinalBoard → see bottom)

Given(/^a game has been won by Bob \(O\) with three symbols in the same column$/, function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'O', 'X', '', 'O', '', '', 'O', 'X'],
        currentPlayer: null,
        winner: 'O',
        draw: false,
        winningCells: [1, 4, 7],
    });
    ctx.expectedHighlightedCells = [1, 4, 7];
    snapshotState();
});

Then('the three cells in the winning column are highlighted', function () {
    if (JSON.stringify(ctx.lastGameState?.winningCells ?? []) !== JSON.stringify(ctx.expectedHighlightedCells)) {
        throw new Error('Expected winning column to be highlighted');
    }
});

// Scenario: Highlight winning diagonal from top-left to bottom-right
// (uses shared: theGameDisplaysTheFinalBoard → see bottom)
// (uses shared: theThreeCellsOnTheDiagonalAreHighlighted → see bottom)

Given(/^a game has been won by Alice \(X\) with three symbols on a diagonal from top-left to bottom-right$/, function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'O', '', '', 'X', '', '', '', 'X'],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 4, 8],
    });
    ctx.expectedHighlightedCells = [0, 4, 8];
    snapshotState();
});

// Scenario: Highlight winning diagonal from top-right to bottom-left
// (uses shared: theGameDisplaysTheFinalBoard → see bottom)
// (uses shared: theThreeCellsOnTheDiagonalAreHighlighted → see bottom)

Given(/^a game has been won by Bob \(O\) with three symbols on a diagonal from top-right to bottom-left$/, function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', '', 'O', '', 'O', '', 'O', '', 'X'],
        currentPlayer: null,
        winner: 'O',
        draw: false,
        winningCells: [2, 4, 6],
    });
    ctx.expectedHighlightedCells = [2, 4, 6];
    snapshotState();
});

// Scenario: Only the winning combination is highlighted
// (uses shared: theBoardIsDisplayed → see bottom)

Given('a game has been won', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
    ctx.expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

Then('only the three cells that form the winning combination are highlighted', function () {
    if (JSON.stringify(ctx.lastGameState?.winningCells ?? []) !== JSON.stringify(ctx.expectedHighlightedCells)) {
        throw new Error('Expected only winning combination cells to be highlighted');
    }
});

Then('all other cells are not highlighted', function () {
    if ((ctx.lastGameState?.winningCells.length ?? 0) !== 3) {
        throw new Error('Expected exactly three highlighted cells');
    }
});

// Scenario: No highlight when there is no winner
// (uses shared: theBoardIsDisplayed → see bottom, noCellsAreHighlighted → shared.steps.ts)

Given('a game is in progress or has ended in a draw', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
        currentPlayer: null,
        winner: null,
        draw: true,
        winningCells: [],
    });
    ctx.expectedHighlightedCells = [];
    snapshotState();
});

// Scenario: Highlight remains visible after game ends

Given('a game has been won and the winning combination is highlighted', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
    ctx.expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

When('players view the board after the game has ended', function () {
    ctx.fixture.detectChanges();
});

Then('the highlight remains visible', function () {
    if (!ctx.previousGameState || !ctx.lastGameState) {
        throw new Error('Expected state snapshots to compare highlights');
    }

    if (JSON.stringify(ctx.lastGameState.winningCells) !== JSON.stringify(ctx.previousGameState.winningCells)) {
        throw new Error('Expected highlight to remain visible');
    }
});

Then('the highlighted cells do not change', function () {
    if (!ctx.previousGameState || !ctx.lastGameState) {
        throw new Error('Expected state snapshots to compare highlights');
    }

    if (JSON.stringify(ctx.lastGameState.winningCells) !== JSON.stringify(ctx.previousGameState.winningCells)) {
        throw new Error('Expected highlighted cells to remain unchanged');
    }
});

// ── Shared steps (used by multiple scenarios above) ───────────────────────────

When('the game displays the final board', function () {
    ctx.fixture.detectChanges();
});

When('the board is displayed', function () {
    ctx.fixture.detectChanges();
});

Then('the three cells on the diagonal are highlighted', function () {
    if (JSON.stringify(ctx.lastGameState?.winningCells ?? []) !== JSON.stringify(ctx.expectedHighlightedCells)) {
        throw new Error('Expected winning diagonal to be highlighted');
    }
});
