import { Given, When, Then } from '@cucumber/cucumber';
import { ctx, setInputValue, startGameWithState, clickBoardCell, flushPlaceSymbol, patchGameState, gameBoardInstance } from './world';

// Scenario: Display Player X symbol after clicking an empty cell
// (uses shared: aGameIsInProgress → shared.steps.ts, itIsPlayerXsTurn → shared.steps.ts)
// (uses shared: theSelectedCellIsEmpty → see bottom)

When('Player X clicks on the cell', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...ctx.lastGameState.board];
    board[ctx.lastSelectedCellIndex] = 'X';
    flushPlaceSymbol({ board, currentPlayer: 'O' });
});

Then('the cell should immediately display an {string}', function (symbol: string) {
    if (ctx.lastGameState?.board[ctx.lastSelectedCellIndex] !== symbol) {
        throw new Error(`Expected selected cell to show ${symbol}`);
    }
});

// Scenario: Display Player O symbol after clicking an empty cell
// (uses shared: aGameIsInProgress → shared.steps.ts, itIsPlayerOsTurn → shared.steps.ts)
// (uses shared: theSelectedCellIsEmpty → see bottom)

When('Player O clicks on the cell', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...ctx.lastGameState.board];
    board[ctx.lastSelectedCellIndex] = 'O';
    flushPlaceSymbol({ board, currentPlayer: 'X' });
});

// Scenario: Prevent overwriting a filled cell
// (uses shared: aGameIsInProgress → shared.steps.ts)

Given('a cell is already occupied', function () {
    ctx.lastSelectedCellIndex = 0;
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...ctx.lastGameState.board];
    board[ctx.lastSelectedCellIndex] = 'X';
    patchGameState({ board, currentPlayer: 'O' });
});

When('a player clicks on the occupied cell', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    flushPlaceSymbol();
});

Then('the cell content should not change', function () {
    if (ctx.lastGameState?.board[ctx.lastSelectedCellIndex] !== 'X') {
        throw new Error('Expected occupied cell to remain X');
    }
});

// Scenario: Only one symbol appears per click
// (uses shared: aGameIsInProgress → shared.steps.ts, itIsPlayerXsTurn → shared.steps.ts)
// (uses shared: theSelectedCellIsEmpty → see bottom)

Then('only one {string} should appear in that cell', function (symbol: string) {
    if (ctx.lastGameState?.board[ctx.lastSelectedCellIndex] !== symbol) {
        throw new Error(`Expected selected cell to contain exactly ${symbol}`);
    }
});

// Scenario: No delay in symbol display
// (uses shared: aGameIsInProgress → shared.steps.ts, itIsPlayerOsTurn → shared.steps.ts)
// (uses shared: theSelectedCellIsEmpty → see bottom)

Then('the symbol should appear without noticeable delay', function () {
    if (!ctx.lastGameState?.board[ctx.lastSelectedCellIndex]) {
        throw new Error('Expected symbol to be visible in the selected cell');
    }
});

// Scenario: No symbol appears after the game has ended
// (uses shared: aPlayerClicksOnAnyCell → shared.steps.ts)

Given('the game has ended', function () {
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
});

Then('no symbol should be added to the board', function () {
    if (ctx.lastGameState?.board[5] !== '') {
        throw new Error('Expected no additional symbol to be added after the game ended');
    }
});

// Scenario: Player cannot place a symbol on a cell occupied by X

Given(/^it is Bob's turn \(O\) and a cell contains an X placed by Alice$/, function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        currentPlayer: 'O',
        board: ['X', '', '', '', '', '', '', '', ''],
    });
    ctx.lastSelectedCellIndex = 0;
});

When('Bob clicks on that occupied cell', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    flushPlaceSymbol();
});

Then('no symbol is placed, the X remains in the cell and it stays Bob\'s turn', function () {
    if (ctx.lastGameState?.board[0] !== 'X') {
        throw new Error('Expected the existing X to remain in the occupied cell');
    }

    if (gameBoardInstance().currentPlayerName() !== 'Bob' || !gameBoardInstance().showTurnIndicator()) {
        throw new Error('Expected it to remain Bob\'s turn');
    }
});

// Scenario: Server rejects a move when the board already shows a winning combination

Given('the board already shows X winning in the top row but currentPlayer is still set to X', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        currentPlayer: 'X',  // stale — game should already be over
        winner: 'X',
        winningCells: [0, 1, 2],
    });
    ctx.lastSelectedCellIndex = 5;
});

When('a player attempts to place a symbol in an empty cell', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    flushPlaceSymbol({
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
});

Then('the move is rejected, X remains the winner and the game is over', function () {
    if (ctx.lastGameState?.board[5] !== '') {
        throw new Error('Expected empty cell to remain empty after rejected move');
    }
    if (ctx.lastGameState?.winner !== 'X') {
        throw new Error('Expected X to remain the winner');
    }
    if (ctx.lastGameState?.currentPlayer !== null) {
        throw new Error('Expected game to be over (no current player)');
    }
});

// ── Shared steps (used by multiple scenarios above) ───────────────────────────

Given('the selected cell is empty', function () {
    ctx.lastSelectedCellIndex = 0;
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...ctx.lastGameState.board];
    board[ctx.lastSelectedCellIndex] = '';
    patchGameState({ board });
});
