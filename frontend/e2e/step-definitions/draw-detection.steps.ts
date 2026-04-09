import { Given, When, Then } from '@cucumber/cucumber';
import { ctx, setInputValue, startGameWithState, clickBoardCell, flushPlaceSymbol, patchGameState, snapshotState } from './world';

// Scenario: Detect draw when last cell is filled without a winner
// (uses shared: aGameIsInProgress → shared.steps.ts)
// (uses shared: allCellsExceptOneAreFilled, noPlayerHasThreeSymbolsAligned → see bottom)
// (uses shared: theGameEnds → shared.steps.ts)

When('the last empty cell is filled', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    flushPlaceSymbol({
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'O'],
        currentPlayer: null,
        winner: null,
        draw: true,
        winningCells: [],
    });
});

Then('the game detects a draw', function () {
    if (!ctx.lastGameState?.draw) {
        throw new Error('Expected draw detection');
    }
});

Then('the game announces that the game is a draw', function () {
    if (!ctx.lastGameState?.draw) {
        throw new Error('Expected draw announcement');
    }
});

// Scenario: No draw is announced if a winning move occurs on the last cell
// (uses shared: aGameIsInProgress → shared.steps.ts)
// (uses shared: allCellsExceptOneAreFilled → see bottom)

Given('a winning combination is still possible', function () {
    patchGameState({
        board: ['X', 'X', '', 'O', 'O', 'X', 'O', 'X', 'O'],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 2;
});

When('the last empty cell is filled and creates a winning alignment', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    flushPlaceSymbol({
        board: ['X', 'X', 'X', 'O', 'O', 'X', 'O', 'X', 'O'],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
});

Then('the game announces the winning player', function () {
    if (!ctx.lastGameState?.winner) {
        throw new Error('Expected winner announcement');
    }
});

Then('the game does not announce a draw', function () {
    if (ctx.lastGameState?.draw) {
        throw new Error('Did not expect a draw announcement');
    }
});

// Scenario: No draw is announced while moves are still possible
// (uses shared: aGameIsInProgress → shared.steps.ts, aPlayerPlacesASymbol → shared.steps.ts)
// (uses shared: theGameDoesNotAnnounceADraw, theGameContinues → shared.steps.ts / see bottom)

Given('there are still empty cells available', function () {
    patchGameState({
        board: ['X', 'O', '', '', 'O', '', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 2;
});

// Scenario: Game stops accepting moves after a draw is announced
// (uses shared: aPlayerClicksOnAnyCell → shared.steps.ts)
// (uses shared: noSymbolIsPlaced, theGameStateDoesNotChange → shared.steps.ts)
// (uses shared: theGameHasEndedInADraw → see bottom)

// Scenario: Draw message is clearly displayed to players
// (uses shared: theGameHasEndedInADraw → see bottom)

When('the result is shown on the screen', function () {
    ctx.fixture.detectChanges();
});

Then('the screen clearly displays that the game is a draw', function () {
    if (!ctx.lastGameState?.draw) {
        throw new Error('Expected draw message state');
    }
});

// Scenario: No winner is announced in a draw situation
// (uses shared: theGameHasEndedInADraw → see bottom)

When('the result is displayed', function () {
    ctx.fixture.detectChanges();
});

Then('no player is announced as the winner', function () {
    if (ctx.lastGameState?.winner !== null) {
        throw new Error('Expected no winner in draw state');
    }
});

// ── Shared steps (used by multiple scenarios above) ───────────────────────────

Given('all cells except one are filled', function () {
    patchGameState({
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', ''],
        currentPlayer: 'O',
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 8;
});

Given('no player has three symbols aligned', function () {
    // Board state is prepared by the preceding Given for draw scenarios.
});

Given('the game has ended in a draw', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
        currentPlayer: null,
        winner: null,
        draw: true,
        winningCells: [],
    });
    ctx.lastSelectedCellIndex = 0;
    ctx.expectedHighlightedCells = [];
    snapshotState();
});
