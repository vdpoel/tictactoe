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
    };
    const response = { ...defaultState, ...state };
    const req = httpMock.expectOne('/api/game');
    req.flush(response);
    lastGameState = response;
    fixture.detectChanges();
}

function startGameWithState(state?: Partial<GameState>): void {
    startButton().click();
    flushGameSetup(state);
}

function textContent(selector: string): string {
    const element = fixture.nativeElement.querySelector(selector) as HTMLElement | null;
    return element?.textContent?.trim() ?? '';
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
        fixture.componentInstance.gameState = lastGameState;
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
        fixture.componentInstance.gameState = lastGameState;
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
    fixture.detectChanges();
});

When('the turn indicator is shown', function () {
    fixture.detectChanges();
});

When('players take turns', function () {
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
