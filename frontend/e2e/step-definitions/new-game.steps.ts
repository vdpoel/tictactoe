import { Given, When, Then } from '@cucumber/cucumber';
import { ctx, setInputValue, startGameWithState, newGameButton, snapshotState } from './world';

// Scenario: New Game button is visible
// (uses shared: theGameScreenIsDisplayed → shared.steps.ts)

When('the player looks at the interface', function () {
    ctx.fixture.detectChanges();
});

Then('a {string} button is visible', function (buttonLabel: string) {
    const button = newGameButton();
    if (!button || button.textContent?.trim() !== buttonLabel) {
        throw new Error(`Expected ${buttonLabel} button to be visible`);
    }
});

// Scenario: Start a new game after clicking the New Game button
// (uses shared: aGameHasBeenPlayed → see bottom)
// (uses shared: thePlayerClicksTheButton → shared.steps.ts, theBoardIsCleared → shared.steps.ts)

Then('all cells are empty', function () {
    if (!ctx.lastGameState || ctx.lastGameState.board.some((cell) => cell !== '')) {
        throw new Error('Expected all board cells to be empty');
    }
});

Then('the game is reset to its initial state', function () {
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state');
    }

    if (ctx.lastGameState.currentPlayer !== 'X' || ctx.lastGameState.winner !== null || ctx.lastGameState.draw) {
        throw new Error('Expected game to be reset to initial state');
    }
});

// Scenario: Reset turn to starting player
// (uses shared: aGameHasBeenPlayed → see bottom)
// (uses shared: thePlayerClicksTheButton → shared.steps.ts)

Then('Player X starts the new game', function () {
    if (ctx.lastGameState?.currentPlayer !== 'X') {
        throw new Error('Expected Player X to start the new game');
    }
});

// Scenario: Clear winner or draw message on new game

Given('the previous game has ended with a winner or a draw', function () {
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

Then('any winner or draw message is removed', function () {
    if (!ctx.lastGameState || ctx.lastGameState.winner !== null || ctx.lastGameState.draw) {
        throw new Error('Expected winner/draw message to be removed');
    }
});

Then('no result is displayed', function () {
    if (ctx.fixture.componentInstance.winnerName || ctx.lastGameState?.draw) {
        throw new Error('Expected no result to be displayed');
    }
});

// Scenario: Remove highlighted winning combination on new game
// (uses shared: noCellsAreHighlighted → shared.steps.ts)

Given('the previous game had a winning combination highlighted', function () {
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

// Scenario: New Game button works during an ongoing game
// (uses shared: aGameIsInProgress → shared.steps.ts)
// (uses shared: thePlayerClicksTheButton → shared.steps.ts, theBoardIsCleared → shared.steps.ts)

Then('the current game is stopped', function () {
    if (!ctx.lastGameState || ctx.lastGameState.currentPlayer !== 'X') {
        throw new Error('Expected current game to be replaced by a fresh game');
    }
});

Then('a new game starts immediately', function () {
    if (!ctx.lastGameState || ctx.lastGameState.currentPlayer !== 'X' || ctx.lastGameState.board.some((cell) => cell !== '')) {
        throw new Error('Expected a new game to start immediately');
    }
});

// ── Shared steps (used by multiple scenarios above) ───────────────────────────

Given('a game has been played', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'O', 'X', 'O', 'X', 'O', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
        winningCells: [],
    });
});
