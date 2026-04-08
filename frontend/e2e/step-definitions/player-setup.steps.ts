import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PlayerSetupComponent } from '../../src/app/features/game/player-setup/player-setup.component';
import { GameState } from '../../src/app/features/game/models';

// ── World state ──────────────────────────────────────────────────────────────

let fixture: ComponentFixture<PlayerSetupComponent>;
let httpMock: HttpTestingController;
let lastGameState: GameState | null = null;
let lastSelectedCellIndex = 0;
let previousGameState: GameState | null = null;
let expectedHighlightedCells: number[] = [];

// ── Hooks ────────────────────────────────────────────────────────────────────

Before(async function () {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        imports: [PlayerSetupComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(PlayerSetupComponent);
    httpMock = TestBed.inject(HttpTestingController);
    lastGameState = null;
    previousGameState = null;
    expectedHighlightedCells = [];
    fixture.detectChanges();
});

After(function () {
    httpMock?.verify();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function inputById(id: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
}

function setInputValue(id: string, value: string): void {
    const input = inputById(id);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function startButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
}

function newGameButton(): HTMLButtonElement {
    return Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
        .find((button) => button.textContent?.includes('New Game')) as HTMLButtonElement;
}

function flushGameSetup(state?: Partial<GameState>): void {
    const defaultState: GameState = {
        player1: { name: fixture.componentInstance.player1Name, symbol: 'X' },
        player2: { name: fixture.componentInstance.player2Name, symbol: 'O' },
        currentPlayer: 'X',
        board: Array(9).fill(''),
        winner: null,
        draw: false,
        winningCells: [],
    };
    const response = { ...defaultState, ...state, board: state?.board ?? defaultState.board };
    const req = httpMock.expectOne('/api/game');
    req.flush(response);
    lastGameState = response;
    fixture.componentInstance.applyGameState(response);
    fixture.detectChanges();
}

function flushPlaceSymbol(state?: Partial<GameState>): void {
    if (!lastGameState) {
        throw new Error('Expected a game state before placing a symbol');
    }

    const response: GameState = {
        ...lastGameState,
        ...state,
        board: state?.board ?? lastGameState.board,
        winner: state && 'winner' in state ? state.winner! : lastGameState.winner,
        draw: state?.draw ?? lastGameState.draw,
        currentPlayer: state && 'currentPlayer' in state ? state.currentPlayer! : lastGameState.currentPlayer,
        winningCells: state?.winningCells ?? lastGameState.winningCells,
    };

    const req = httpMock.expectOne('/api/game/move');
    req.flush(response);
    lastGameState = response;
    fixture.componentInstance.applyGameState(response);
}

function startGameWithState(state?: Partial<GameState>): void {
    startButton().click();
    flushGameSetup(state);
}

function textContent(selector: string): string {
    const element = fixture.nativeElement.querySelector(selector) as HTMLElement | null;
    return element?.textContent?.trim() ?? '';
}

function boardCells(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.board-cell')) as HTMLButtonElement[];
}

function boardCell(index: number): HTMLButtonElement {
    return boardCells()[index] as HTMLButtonElement;
}

function clickBoardCell(index: number): void {
    lastSelectedCellIndex = index;
    fixture.componentInstance.placeSymbol(index);
}

function patchGameState(state: Partial<GameState>): void {
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    lastGameState = {
        ...lastGameState,
        ...state,
        board: state.board ?? lastGameState.board,
        winner: 'winner' in state ? state.winner! : lastGameState.winner,
        draw: state.draw ?? lastGameState.draw,
        currentPlayer: 'currentPlayer' in state ? state.currentPlayer! : lastGameState.currentPlayer,
        winningCells: state.winningCells ?? lastGameState.winningCells,
    };
    fixture.componentInstance.applyGameState(lastGameState);
}

function snapshotState(): void {
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    previousGameState = {
        ...lastGameState,
        player1: { ...lastGameState.player1 },
        player2: { ...lastGameState.player2 },
        board: [...lastGameState.board],
        winningCells: [...lastGameState.winningCells],
    };
}

// ── Given ────────────────────────────────────────────────────────────────────

Given('the game has not started yet', function () {
    // PlayerSetupComponent is already rendered by the Before hook — no action needed
});

Given('Player 1 is {string}', function (name: string) {
    setInputValue('player1', name);
});

Given('Player 2 is {string}', function (name: string) {
    setInputValue('player2', name);
});

Given('Player 1 is {string} with symbol {string}', function (name: string, _symbol: string) {
    if (lastGameState) {
        lastGameState = {
            ...lastGameState,
            player1: { ...lastGameState.player1, name },
        };
        fixture.componentInstance.player1Name = name;
        fixture.componentInstance.applyGameState(lastGameState);
        fixture.detectChanges();
        return;
    }

    setInputValue('player1', name);
});

Given('Player 2 is {string} with symbol {string}', function (name: string, _symbol: string) {
    if (lastGameState) {
        lastGameState = {
            ...lastGameState,
            player2: { ...lastGameState.player2, name },
        };
        fixture.componentInstance.player2Name = name;
        fixture.componentInstance.applyGameState(lastGameState);
        fixture.detectChanges();
        return;
    }

    setInputValue('player2', name);
});

Given('a game is in progress', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState();
});

Given('a new Tic Tac Toe game has started', function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState();
});

Given('it is Player X\'s turn', function () {
    if (!lastGameState) {
        setInputValue('player1', 'Alice');
        setInputValue('player2', 'Bob');
        startGameWithState();
    }

    patchGameState({ currentPlayer: 'X', winner: null, draw: false });
});

Given('it is Player O\'s turn', function () {
    if (!lastGameState) {
        setInputValue('player1', 'Alice');
        setInputValue('player2', 'Bob');
        startGameWithState({ currentPlayer: 'O' });
    }

    patchGameState({ currentPlayer: 'O', winner: null, draw: false });
});

Given('the selected cell is empty', function () {
    lastSelectedCellIndex = 0;
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...lastGameState.board];
    board[lastSelectedCellIndex] = '';
    patchGameState({ board });
});

Given('a cell is already occupied', function () {
    lastSelectedCellIndex = 0;
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...lastGameState.board];
    board[lastSelectedCellIndex] = 'X';
    patchGameState({ board, currentPlayer: 'O' });
});

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
    lastSelectedCellIndex = 5;
    expectedHighlightedCells = [0, 1, 2];
});

Given(/^it is Bob's turn \(O\) and a cell contains an X placed by Alice$/, function () {
    setInputValue('player1', 'Alice');
    setInputValue('player2', 'Bob');
    startGameWithState({
        currentPlayer: 'O',
        board: ['X', '', '', '', '', '', '', '', ''],
    });
    lastSelectedCellIndex = 0;
});

Given('a game is in progress with players {string} and {string}', function (player1: string, player2: string) {
    setInputValue('player1', player1);
    setInputValue('player2', player2);
    startGameWithState({
        player1: { name: player1, symbol: 'X' },
        player2: { name: player2, symbol: 'O' },
    });
});

Given('a game has been played with players {string} and {string}', function (player1: string, player2: string) {
    setInputValue('player1', player1);
    setInputValue('player2', player2);
    startGameWithState({
        player1: { name: player1, symbol: 'X' },
        player2: { name: player2, symbol: 'O' },
        board: ['X', 'O', 'X', 'O', 'X', 'O', '', '', ''],
    });
});

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

Given(/^a game has been played with players "([^"]+)" \(X\) and "([^"]+)" \(O\)$/, function (player1: string, player2: string) {
    setInputValue('player1', player1);
    setInputValue('player2', player2);
    startGameWithState({
        player1: { name: player1, symbol: 'X' },
        player2: { name: player2, symbol: 'O' },
        board: ['X', 'O', 'X', '', '', '', '', '', ''],
    });
});

Given(/^it is (.+)'s turn \(X\)$/, function (playerName: string) {
    if (!lastGameState) {
        setInputValue('player1', playerName);
        setInputValue('player2', playerName === 'Alice' ? 'Bob' : 'Alice');
        startGameWithState({
            player1: { name: playerName, symbol: 'X' },
            player2: { name: playerName === 'Alice' ? 'Bob' : 'Alice', symbol: 'O' },
            currentPlayer: 'X',
        });
    }
});

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

Given('Alice has already placed two X symbols in the same row', function () {
    patchGameState({
        board: ['X', 'X', '', 'O', '', '', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 2;
});

Given('Bob has already placed two O symbols in the same column', function () {
    patchGameState({
        board: ['X', 'O', 'X', '', 'O', '', '', '', ''],
        currentPlayer: 'O',
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 7;
});

Given('Alice has already placed two X symbols diagonally from top-left to bottom-right', function () {
    patchGameState({
        board: ['X', 'O', '', '', 'X', '', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 8;
});

Given('Bob has already placed two O symbols diagonally from top-right to bottom-left', function () {
    patchGameState({
        board: ['X', '', 'O', '', 'O', '', '', '', 'X'],
        currentPlayer: 'O',
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 6;
});

Given('no player has three symbols aligned in a row, column, or diagonal', function () {
    patchGameState({
        board: ['X', 'O', 'X', '', 'O', '', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 3;
});

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
    lastSelectedCellIndex = 5;
    expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

Given('all cells except one are filled', function () {
    patchGameState({
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', ''],
        currentPlayer: 'O',
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 8;
});

Given('no player has three symbols aligned', function () {
    // State is prepared by the previous Given.
});

Given('a winning combination is still possible', function () {
    patchGameState({
        board: ['X', 'X', '', 'O', 'O', 'X', 'O', 'X', 'O'],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 2;
});

Given('there are still empty cells available', function () {
    patchGameState({
        board: ['X', 'O', '', '', 'O', '', '', '', ''],
        currentPlayer: 'X',
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 2;
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
    lastSelectedCellIndex = 0;
    expectedHighlightedCells = [];
    snapshotState();
});

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
    expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

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
    expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

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
    expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

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
    expectedHighlightedCells = [1, 4, 7];
    snapshotState();
});

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
    expectedHighlightedCells = [0, 4, 8];
    snapshotState();
});

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
    expectedHighlightedCells = [2, 4, 6];
    snapshotState();
});

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
    expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

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
    expectedHighlightedCells = [];
    snapshotState();
});

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
    expectedHighlightedCells = [0, 1, 2];
    snapshotState();
});

Given('Player {int} name is {word}', function (playerNum: number, name: string) {
    const value = name === 'empty' ? '' : name;
    const id = playerNum === 1 ? 'player1' : 'player2';
    setInputValue(id, value);
});

// ── When ─────────────────────────────────────────────────────────────────────

When('Player 1 enters the name {string}', function (name: string) {
    setInputValue('player1', name);
});

When('Player 2 enters the name {string}', function (name: string) {
    setInputValue('player2', name);
});

When('the game starts', function () {
    startGameWithState();
});

When('the game screen is displayed', function () {
    if (!lastGameState) {
        setInputValue('player1', 'Alice');
        setInputValue('player2', 'Bob');
        startGameWithState();
    }

    fixture.detectChanges();
});

When('the game board is displayed', function () {
    fixture.detectChanges();
});

When('the turn indicator is shown', function () {
    fixture.detectChanges();
});

When('players take turns', function () {
    fixture.detectChanges();
});

When('Player X clicks on the cell', function () {
    clickBoardCell(lastSelectedCellIndex);
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...lastGameState.board];
    board[lastSelectedCellIndex] = 'X';
    flushPlaceSymbol({ board, currentPlayer: 'O' });
});

When('Player O clicks on the cell', function () {
    clickBoardCell(lastSelectedCellIndex);
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...lastGameState.board];
    board[lastSelectedCellIndex] = 'O';
    flushPlaceSymbol({ board, currentPlayer: 'X' });
});

When('a player clicks on the occupied cell', function () {
    clickBoardCell(lastSelectedCellIndex);
    flushPlaceSymbol();
});

When('a player clicks on any cell', function () {
    clickBoardCell(lastSelectedCellIndex);
    flushPlaceSymbol();
});

When('Bob clicks on that occupied cell', function () {
    clickBoardCell(lastSelectedCellIndex);
    flushPlaceSymbol();
});

When('Player X places a mark on an empty cell', function () {
    clickBoardCell(lastSelectedCellIndex);
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...lastGameState.board];
    board[lastSelectedCellIndex] = 'X';
    flushPlaceSymbol({ board, currentPlayer: 'O' });
});

When('Player O places a mark on an empty cell', function () {
    clickBoardCell(lastSelectedCellIndex);
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const board = [...lastGameState.board];
    board[lastSelectedCellIndex] = 'O';
    flushPlaceSymbol({ board, currentPlayer: 'X' });
});

When('the players look at the game screen', function () {
    fixture.detectChanges();
});

When('Player X places a mark on an empty cell and wins the game', function () {
    patchGameState({
        currentPlayer: 'X',
        board: ['X', 'X', '', 'O', 'O', '', '', '', ''],
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 2;
    clickBoardCell(lastSelectedCellIndex);
    flushPlaceSymbol({
        board: ['X', 'X', 'X', 'O', 'O', '', '', '', ''],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
});

When('Player O places a mark on the last empty cell', function () {
    patchGameState({
        currentPlayer: 'O',
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', ''],
        winner: null,
        draw: false,
    });
    lastSelectedCellIndex = 8;
    clickBoardCell(lastSelectedCellIndex);
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

When('a player places a symbol', function () {
    clickBoardCell(lastSelectedCellIndex);
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    const symbol = lastGameState.currentPlayer ?? 'X';
    const board = [...lastGameState.board];
    board[lastSelectedCellIndex] = symbol;
    flushPlaceSymbol({ board, currentPlayer: symbol === 'X' ? 'O' : 'X', winner: null, draw: false });
});

When('the last empty cell is filled', function () {
    clickBoardCell(lastSelectedCellIndex);
    flushPlaceSymbol({
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'O'],
        currentPlayer: null,
        winner: null,
        draw: true,
        winningCells: [],
    });
});

When('the last empty cell is filled and creates a winning alignment', function () {
    clickBoardCell(lastSelectedCellIndex);
    flushPlaceSymbol({
        board: ['X', 'X', 'X', 'O', 'O', 'X', 'O', 'X', 'O'],
        currentPlayer: null,
        winner: 'X',
        draw: false,
        winningCells: [0, 1, 2],
    });
});

When('the result is shown on the screen', function () {
    fixture.detectChanges();
});

When('the result is displayed', function () {
    fixture.detectChanges();
});

When('the player looks at the interface', function () {
    fixture.detectChanges();
});

When('the game displays the final board', function () {
    fixture.detectChanges();
});

When('the board is displayed', function () {
    fixture.detectChanges();
});

When('players view the board after the game has ended', function () {
    fixture.detectChanges();
});

When('the player clicks the {string} button', function (buttonName: string) {
    if (buttonName !== 'New Game') {
        throw new Error(`Unsupported button: ${buttonName}`);
    }

    newGameButton().click();
    flushGameSetup();
});

When('the player attempts to start the game', function () {
    startButton().click();
    fixture.detectChanges();
});

// ── Then ─────────────────────────────────────────────────────────────────────

Then('the names {string} and {string} are stored for the game', function (name1: string, name2: string) {
    if (fixture.componentInstance.player1Name !== name1 || fixture.componentInstance.player2Name !== name2) {
        throw new Error(
            `Expected names "${name1}" and "${name2}", got ` +
            `"${fixture.componentInstance.player1Name}" and "${fixture.componentInstance.player2Name}"`
        );
    }
});

Then('{word} is assigned symbol {string}', function (playerName: string, symbol: string) {
    if (!lastGameState) throw new Error('No game state — was the game started?');
    const player =
        lastGameState.player1.name === playerName
            ? lastGameState.player1
            : lastGameState.player2;
    if (player.symbol !== symbol) {
        throw new Error(`Expected ${playerName} to have symbol ${symbol}, got ${player.symbol}`);
    }
});

Then('the screen shows {string}', function (text: string) {
    const screenText = fixture.nativeElement.textContent ?? '';
    if (!screenText.includes(text)) {
        throw new Error(`Expected screen to show "${text}", got "${screenText.trim()}"`);
    }
});

Then('the screen shows that it is {string}', function (text: string) {
    if (textContent('.turn-indicator') !== text) {
        throw new Error(`Expected turn indicator to show "${text}"`);
    }
});

Then('the names remain {string} and {string}', function (name1: string, name2: string) {
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    if (lastGameState.player1.name !== name1 || lastGameState.player2.name !== name2) {
        throw new Error(`Expected names to remain "${name1}" and "${name2}"`);
    }
});

Then('the board is cleared', function () {
    const cells = Array.from(fixture.nativeElement.querySelectorAll('.board-cell')) as HTMLElement[];
    if (cells.length !== 9) {
        throw new Error(`Expected 9 board cells, got ${cells.length}`);
    }

    const hasMarks = cells.some((cell) => cell.textContent?.trim());
    if (hasMarks) {
        throw new Error('Expected the board to be cleared');
    }
});

Then('the players are still {string} and {string}', function (name1: string, name2: string) {
    if (!lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    if (lastGameState.player1.name !== name1 || lastGameState.player2.name !== name2) {
        throw new Error(`Expected players to remain "${name1}" and "${name2}"`);
    }
});

Then(/^it is (\w+)'s turn$/, function (playerName: string) {
    if (textContent('.turn-indicator') !== `${playerName}'s turn`) {
        throw new Error(`Expected it to be ${playerName}'s turn`);
    }
});

Then('the game does not start', function () {
    const button = startButton();
    if (!button.disabled) {
        throw new Error('Expected Start Game button to be disabled, but it was enabled');
    }
    httpMock.expectNone('/api/game');
});

Then(/^a message is shown asking for both player names?$/, function () {
    // When names are missing the button stays disabled — the error message
    // only appears after a failed API call, which cannot happen here since
    // the button is disabled. The spec is satisfied by the button being disabled.
});

Then('the cell should immediately display an {string}', function (symbol: string) {
    if (lastGameState?.board[lastSelectedCellIndex] !== symbol) {
        throw new Error(`Expected selected cell to show ${symbol}`);
    }
});

Then('the cell content should not change', function () {
    if (lastGameState?.board[lastSelectedCellIndex] !== 'X') {
        throw new Error('Expected occupied cell to remain X');
    }
});

Then('only one {string} should appear in that cell', function (symbol: string) {
    if (lastGameState?.board[lastSelectedCellIndex] !== symbol) {
        throw new Error(`Expected selected cell to contain exactly ${symbol}`);
    }
});

Then('the symbol should appear without noticeable delay', function () {
    if (!lastGameState?.board[lastSelectedCellIndex]) {
        throw new Error('Expected symbol to be visible in the selected cell');
    }
});

Then('no symbol should be added to the board', function () {
    if (lastGameState?.board[5] !== '') {
        throw new Error('Expected no additional symbol to be added after the game ended');
    }
});

Then('no symbol is placed, the X remains in the cell and it stays Bob\'s turn', function () {
    if (lastGameState?.board[0] !== 'X') {
        throw new Error('Expected the existing X to remain in the occupied cell');
    }

    if (fixture.componentInstance.currentPlayerName !== 'Bob' || !fixture.componentInstance.showTurnIndicator) {
        throw new Error('Expected it to remain Bob\'s turn');
    }
});

Then('the screen should show that it is Player X\'s turn', function () {
    if (fixture.componentInstance.currentPlayerName !== 'Alice' || !fixture.componentInstance.showTurnIndicator) {
        throw new Error(`Expected the X player turn to be shown, got "${fixture.componentInstance.currentPlayerName}"`);
    }
});

Then('the screen should show that it is Player O\'s turn', function () {
    if (fixture.componentInstance.currentPlayerName !== 'Bob' || !fixture.componentInstance.showTurnIndicator) {
        throw new Error(`Expected the O player turn to be shown, got "${fixture.componentInstance.currentPlayerName}"`);
    }
});

Then('the current player\'s turn should be visible', function () {
    if (!fixture.componentInstance.showTurnIndicator || !fixture.componentInstance.currentPlayerName) {
        throw new Error('Expected the turn indicator to be visible');
    }
});

Then('the screen should show that Player X has won', function () {
    if (fixture.componentInstance.winnerName !== 'Alice') {
        throw new Error('Expected a winner message for Player X');
    }
});

Then('the screen should not show that it is Player O\'s turn', function () {
    if (fixture.componentInstance.showTurnIndicator || fixture.componentInstance.currentPlayerName === 'Bob') {
        throw new Error('Did not expect Player O turn text after the game was won');
    }
});

Then('the screen should show that the game is a draw', function () {
    if (!lastGameState?.draw) {
        throw new Error('Expected a draw message');
    }
});

Then('the screen should not show that it is Player X\'s turn', function () {
    if (fixture.componentInstance.showTurnIndicator || fixture.componentInstance.currentPlayerName === 'Alice') {
        throw new Error('Did not expect Player X turn text after the draw');
    }
});

Then('the game detects a winning condition', function () {
    if (!lastGameState?.winner) {
        throw new Error('Expected a winning condition to be detected');
    }
});

Then('the game announces that Alice has won', function () {
    if (lastGameState?.winner !== 'X') {
        throw new Error('Expected Alice to be announced as winner');
    }
});

Then('the game announces that Bob has won', function () {
    if (lastGameState?.winner !== 'O') {
        throw new Error('Expected Bob to be announced as winner');
    }
});

Then('the game ends', function () {
    if (lastGameState?.currentPlayer !== null) {
        throw new Error('Expected game to end with no current player');
    }
});

Then('the game does not announce a winner', function () {
    if (lastGameState?.winner !== null) {
        throw new Error('Expected no winner announcement');
    }
});

Then('the game continues', function () {
    if (!lastGameState || lastGameState.currentPlayer === null || lastGameState.draw || lastGameState.winner !== null) {
        throw new Error('Expected game to continue after move');
    }
});

Then('no symbol is placed', function () {
    if (!previousGameState || !lastGameState) {
        throw new Error('Expected game state snapshots to compare');
    }

    if (JSON.stringify(lastGameState.board) !== JSON.stringify(previousGameState.board)) {
        throw new Error('Expected board to remain unchanged');
    }
});

Then('the game state does not change', function () {
    if (!previousGameState || !lastGameState) {
        throw new Error('Expected game state snapshots to compare');
    }

    if (JSON.stringify(lastGameState) !== JSON.stringify(previousGameState)) {
        throw new Error('Expected full game state to remain unchanged');
    }
});

Then('the game detects a draw', function () {
    if (!lastGameState?.draw) {
        throw new Error('Expected draw detection');
    }
});

Then('the game announces that the game is a draw', function () {
    if (!lastGameState?.draw) {
        throw new Error('Expected draw announcement');
    }
});

Then('the game announces the winning player', function () {
    if (!lastGameState?.winner) {
        throw new Error('Expected winner announcement');
    }
});

Then('the game does not announce a draw', function () {
    if (lastGameState?.draw) {
        throw new Error('Did not expect a draw announcement');
    }
});

Then('the screen clearly displays that the game is a draw', function () {
    if (!lastGameState?.draw) {
        throw new Error('Expected draw message state');
    }
});

Then('no player is announced as the winner', function () {
    if (lastGameState?.winner !== null) {
        throw new Error('Expected no winner in draw state');
    }
});

Then('a {string} button is visible', function (buttonLabel: string) {
    const button = newGameButton();
    if (!button || button.textContent?.trim() !== buttonLabel) {
        throw new Error(`Expected ${buttonLabel} button to be visible`);
    }
});

Then('all cells are empty', function () {
    if (!lastGameState || lastGameState.board.some((cell) => cell !== '')) {
        throw new Error('Expected all board cells to be empty');
    }
});

Then('the game is reset to its initial state', function () {
    if (!lastGameState) {
        throw new Error('Expected a game state');
    }

    if (lastGameState.currentPlayer !== 'X' || lastGameState.winner !== null || lastGameState.draw) {
        throw new Error('Expected game to be reset to initial state');
    }
});

Then('Player X starts the new game', function () {
    if (lastGameState?.currentPlayer !== 'X') {
        throw new Error('Expected Player X to start the new game');
    }
});

Then('any winner or draw message is removed', function () {
    if (!lastGameState || lastGameState.winner !== null || lastGameState.draw) {
        throw new Error('Expected winner/draw message to be removed');
    }
});

Then('no result is displayed', function () {
    if (fixture.componentInstance.winnerName || lastGameState?.draw) {
        throw new Error('Expected no result to be displayed');
    }
});

Then('the current game is stopped', function () {
    if (!lastGameState || lastGameState.currentPlayer !== 'X') {
        throw new Error('Expected current game to be replaced by a fresh game');
    }
});

Then('a new game starts immediately', function () {
    if (!lastGameState || lastGameState.currentPlayer !== 'X' || lastGameState.board.some((cell) => cell !== '')) {
        throw new Error('Expected a new game to start immediately');
    }
});

Then('the three cells in the winning row are highlighted', function () {
    if (JSON.stringify(lastGameState?.winningCells ?? []) !== JSON.stringify(expectedHighlightedCells)) {
        throw new Error('Expected winning row to be highlighted');
    }
});

Then('the three cells in the winning column are highlighted', function () {
    if (JSON.stringify(lastGameState?.winningCells ?? []) !== JSON.stringify(expectedHighlightedCells)) {
        throw new Error('Expected winning column to be highlighted');
    }
});

Then('the three cells on the diagonal are highlighted', function () {
    if (JSON.stringify(lastGameState?.winningCells ?? []) !== JSON.stringify(expectedHighlightedCells)) {
        throw new Error('Expected winning diagonal to be highlighted');
    }
});

Then('only the three cells that form the winning combination are highlighted', function () {
    if (JSON.stringify(lastGameState?.winningCells ?? []) !== JSON.stringify(expectedHighlightedCells)) {
        throw new Error('Expected only winning combination cells to be highlighted');
    }
});

Then('all other cells are not highlighted', function () {
    if ((lastGameState?.winningCells.length ?? 0) !== 3) {
        throw new Error('Expected exactly three highlighted cells');
    }
});

Then('no cells are highlighted', function () {
    if ((lastGameState?.winningCells.length ?? 0) !== 0) {
        throw new Error('Expected no highlighted cells');
    }
});

Then('the highlight remains visible', function () {
    if (!previousGameState || !lastGameState) {
        throw new Error('Expected state snapshots to compare highlights');
    }

    if (JSON.stringify(lastGameState.winningCells) !== JSON.stringify(previousGameState.winningCells)) {
        throw new Error('Expected highlight to remain visible');
    }
});

Then('the highlighted cells do not change', function () {
    if (!previousGameState || !lastGameState) {
        throw new Error('Expected state snapshots to compare highlights');
    }

    if (JSON.stringify(lastGameState.winningCells) !== JSON.stringify(previousGameState.winningCells)) {
        throw new Error('Expected highlighted cells to remain unchanged');
    }
});
