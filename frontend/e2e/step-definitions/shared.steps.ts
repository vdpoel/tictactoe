import { Given, When, Then } from '@cucumber/cucumber';
import { ctx, setInputValue, startGameWithState, clickBoardCell, flushPlaceSymbol, newGameButton, flushGameSetup, patchGameState } from './world';

// ── Steps used in two or more feature files ───────────────────────────────────

// Used by: turn-display, place-symbol, winner-detection, draw-detection, new-game

Given('a game is in progress', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState();
});

// Used by: turn-display, place-symbol

Given('it is Player X\'s turn', function () {
    if (!ctx.lastGameState) {
        setInputValue('player1', 'Alice');
        setInputValue('player2', 'Bob');
        startGameWithState();
    }

    patchGameState({ currentPlayer: 'X', winner: null, draw: false });
});

Given('it is Player O\'s turn', function () {
    if (!ctx.lastGameState) {
        setInputValue('player1', 'Alice');
        setInputValue('player2', 'Bob');
        startGameWithState({ currentPlayer: 'O' });
    }

    patchGameState({ currentPlayer: 'O', winner: null, draw: false });
});

// Used by: player-setup (When), new-game (Given)

When('the game screen is displayed', function () {
    if (!ctx.lastGameState) {
        setInputValue('player1', 'Alice');
        setInputValue('player2', 'Bob');
        startGameWithState();
    }

    ctx.fixture.detectChanges();
});

// Used by: player-setup, new-game

When('the player clicks the {string} button', function (buttonName: string) {
    if (buttonName !== 'New Game') {
        throw new Error(`Unsupported button: ${buttonName}`);
    }

    newGameButton().click();
    flushGameSetup();
});

// Used by: winner-detection, draw-detection

When('a player clicks on any cell', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    flushPlaceSymbol();
});

When('a player places a symbol', function () {
    clickBoardCell(ctx.lastSelectedCellIndex);
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const symbol = ctx.lastGameState.currentPlayer ?? 'X';
    const board = [...ctx.lastGameState.board];
    board[ctx.lastSelectedCellIndex] = symbol;
    flushPlaceSymbol({ board, currentPlayer: symbol === 'X' ? 'O' : 'X', winner: null, draw: false });
});

// Used by: player-setup, new-game

Then('the board is cleared', function () {
    const cells = Array.from(ctx.fixture.nativeElement.querySelectorAll('.board-cell')) as HTMLElement[];
    if (cells.length !== 9) {
        throw new Error(`Expected 9 board cells, got ${cells.length}`);
    }

    const hasMarks = cells.some((cell) => cell.textContent?.trim());
    if (hasMarks) {
        throw new Error('Expected the board to be cleared');
    }
});

// Used by: winner-detection, draw-detection

Then('the game ends', function () {
    if (ctx.lastGameState?.currentPlayer !== null) {
        throw new Error('Expected game to end with no current player');
    }
});

Then('no symbol is placed', function () {
    if (!ctx.previousGameState || !ctx.lastGameState) {
        throw new Error('Expected game state snapshots to compare');
    }

    if (JSON.stringify(ctx.lastGameState.board) !== JSON.stringify(ctx.previousGameState.board)) {
        throw new Error('Expected board to remain unchanged');
    }
});

Then('the game state does not change', function () {
    if (!ctx.previousGameState || !ctx.lastGameState) {
        throw new Error('Expected game state snapshots to compare');
    }

    if (JSON.stringify(ctx.lastGameState) !== JSON.stringify(ctx.previousGameState)) {
        throw new Error('Expected full game state to remain unchanged');
    }
});

Then('the game continues', function () {
    if (!ctx.lastGameState || ctx.lastGameState.currentPlayer === null || ctx.lastGameState.draw || ctx.lastGameState.winner !== null) {
        throw new Error('Expected game to continue after move');
    }
});

// Used by: highlight-winning-combination, new-game

Then('no cells are highlighted', function () {
    if ((ctx.lastGameState?.winningCells.length ?? 0) !== 0) {
        throw new Error('Expected no highlighted cells');
    }
});
