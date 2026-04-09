import { Given, When, Then } from '@cucumber/cucumber';
import { ctx, setInputValue, startGameWithState, clickBoardCell, flushPlaceSymbol, patchGameState } from './world';

// Scenario: Show Player X turn at the start of a new game
// (uses shared: theGameBoardIsDisplayed → see bottom)

Given('a new Tic Tac Toe game has started', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState();
});

Then('the screen should show that it is Player X\'s turn', function () {
    if (ctx.fixture.componentInstance.currentPlayerName !== 'Alice' || !ctx.fixture.componentInstance.showTurnIndicator) {
        throw new Error(`Expected the X player turn to be shown, got "${ctx.fixture.componentInstance.currentPlayerName}"`);
    }
});

// Scenario: Switch turn display after Player X makes a move
// (uses shared: aGameIsInProgress → shared.steps.ts, itIsPlayerXsTurn → shared.steps.ts)

When('Player X places a mark on an empty cell', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...ctx.lastGameState.board];
    board[ctx.lastSelectedCellIndex] = 'X';
    flushPlaceSymbol({ board, currentPlayer: 'O' });
});

Then('the screen should show that it is Player O\'s turn', function () {
    if (ctx.fixture.componentInstance.currentPlayerName !== 'Bob' || !ctx.fixture.componentInstance.showTurnIndicator) {
        throw new Error(`Expected the O player turn to be shown, got "${ctx.fixture.componentInstance.currentPlayerName}"`);
    }
});

// Scenario: Switch turn display after Player O makes a move
// (uses shared: aGameIsInProgress → shared.steps.ts, itIsPlayerOsTurn → shared.steps.ts)

When('Player O places a mark on an empty cell', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...ctx.lastGameState.board];
    board[ctx.lastSelectedCellIndex] = 'O';
    flushPlaceSymbol({ board, currentPlayer: 'X' });
});

// Scenario: Keep current turn visible during the game
// (uses shared: aGameIsInProgress → shared.steps.ts)

When('the players look at the game screen', function () {
    ctx.fixture.detectChanges();
});

Then('the current player\'s turn should be visible', function () {
    if (!ctx.fixture.componentInstance.showTurnIndicator || !ctx.fixture.componentInstance.currentPlayerName) {
        throw new Error('Expected the turn indicator to be visible');
    }
});

// Scenario: Do not show the next turn after the game is won
// (uses shared: aGameIsInProgress → shared.steps.ts, itIsPlayerXsTurn → shared.steps.ts)
// (uses shared: theScreenShouldShowThatItIsPlayerXsTurn → see bottom)

When('Player X places a mark on an empty cell and wins the game', function () {
    patchGameState({
        currentPlayer: 'X',
        board: ['X', 'X', '', 'O', 'O', '', '', '', ''],
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 2;
    clickBoardCell(ctx.lastSelectedCellIndex);
    flushPlaceSymbol({
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
});

Then('the screen should show that Player X has won', function () {
    if (ctx.fixture.componentInstance.winnerName !== 'Alice') {
        throw new Error('Expected a winner message for Player X');
    }
});

Then('the screen should not show that it is Player O\'s turn', function () {
    if (ctx.fixture.componentInstance.showTurnIndicator || ctx.fixture.componentInstance.currentPlayerName === 'Bob') {
        throw new Error('Did not expect Player O turn text after the game was won');
    }
});

// Scenario: Do not show the next turn after the game ends in a draw
// (uses shared: aGameIsInProgress → shared.steps.ts, itIsPlayerOsTurn → shared.steps.ts)

When('Player O places a mark on the last empty cell', function () {
    patchGameState({
        currentPlayer: 'O',
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', ''],
        winner: null,
        draw: false,
    });
    ctx.lastSelectedCellIndex = 8;
    clickBoardCell(ctx.lastSelectedCellIndex);
    flushPlaceSymbol({
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'O'],
        currentPlayer: null,
        winner: null,
        draw: true,
        winningCells: [],
    });
});

When('the game ends in a draw', function () {
    // The draw state is already established by the previous move step.
});

Then('the screen should show that the game is a draw', function () {
    if (!ctx.lastGameState?.draw) {
        throw new Error('Expected a draw message');
    }
});

Then('the screen should not show that it is Player X\'s turn', function () {
    if (ctx.fixture.componentInstance.showTurnIndicator || ctx.fixture.componentInstance.currentPlayerName === 'Alice') {
        throw new Error('Did not expect Player X turn text after the draw');
    }
});

// ── Shared steps (used by multiple scenarios above) ───────────────────────────

When('the game board is displayed', function () {
    ctx.fixture.detectChanges();
});
