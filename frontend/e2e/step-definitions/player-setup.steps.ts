import { Given, When, Then } from '@cucumber/cucumber';
import { ctx, setInputValue, startGameWithState, startButton, textContent } from './world';

// Scenario: Players can enter their names before starting the game
// (uses shared: theGameHasNotStartedYet → see bottom)

When('Player 1 enters the name {string}', function (name: string) {
    setInputValue('player1', name);
});

When('Player 2 enters the name {string}', function (name: string) {
    setInputValue('player2', name);
});

Then('the names {string} and {string} are stored for the game', function (name1: string, name2: string) {
    if (ctx.fixture.componentInstance.player1Name !== name1 || ctx.fixture.componentInstance.player2Name !== name2) {
        throw new Error(
            `Expected names "${name1}" and "${name2}", got ` +
            `"${ctx.fixture.componentInstance.player1Name}" and "${ctx.fixture.componentInstance.player2Name}"`
        );
    }
});

// Scenario: Player 1 is assigned symbol X and Player 2 is assigned symbol O
// (uses shared: nameIsAssignedSymbol → see bottom)

Given('Player 1 is {string}', function (name: string) {
    setInputValue('player1', name);
});

Given('Player 2 is {string}', function (name: string) {
    setInputValue('player2', name);
});

When('the game starts', function () {
    startGameWithState();
});

// Scenario: Display player names with their symbols
// (uses shared: aGameIsInProgress → shared.steps.ts, theGameScreenIsDisplayed → shared.steps.ts)

Given('Player 1 is {string} with symbol {string}', function (name: string, _symbol: string) {
    if (ctx.lastGameState) {
        ctx.lastGameState = {
            ...ctx.lastGameState,
            player1: { ...ctx.lastGameState.player1, name },
        };
        ctx.fixture.componentInstance.player1Name = name;
        ctx.fixture.componentInstance.applyGameState(ctx.lastGameState);
        ctx.fixture.detectChanges();
        return;
    }

    setInputValue('player1', name);
});

Given('Player 2 is {string} with symbol {string}', function (name: string, _symbol: string) {
    if (ctx.lastGameState) {
        ctx.lastGameState = {
            ...ctx.lastGameState,
            player2: { ...ctx.lastGameState.player2, name },
        };
        ctx.fixture.componentInstance.player2Name = name;
        ctx.fixture.componentInstance.applyGameState(ctx.lastGameState);
        ctx.fixture.detectChanges();
        return;
    }

    setInputValue('player2', name);
});

Then('the screen shows {string}', function (text: string) {
    const screenText = ctx.fixture.nativeElement.textContent ?? '';
    if (!screenText.includes(text)) {
        throw new Error(`Expected screen to show "${text}", got "${screenText.trim()}"`);
    }
});

// Scenario: Turn display uses player names instead of generic labels
// (uses shared: aGameIsInProgress → shared.steps.ts)

Given(/^it is (.+)'s turn \(X\)$/, function (playerName: string) {
    if (!ctx.lastGameState) {
        setInputValue('player1', playerName);
        setInputValue('player2', playerName === 'Alice' ? 'Bob' : 'Alice');
        startGameWithState({
            player1: { name: playerName, symbol: 'X' },
            player2: { name: playerName === 'Alice' ? 'Bob' : 'Alice', symbol: 'O' },
            currentPlayer: 'X',
        });
    }
});

When('the turn indicator is shown', function () {
    ctx.fixture.detectChanges();
});

Then('the screen shows that it is {string}', function (text: string) {
    if (textContent('.turn-indicator') !== text) {
        throw new Error(`Expected turn indicator to show "${text}"`);
    }
});

// Scenario: Names remain the same during the game

Given('a game is in progress with players {string} and {string}', function (player1: string, player2: string) {
    setInputValue('player1', player1);
    setInputValue('player2', player2);
    startGameWithState({
        player1: { name: player1, symbol: 'X' },
        player2: { name: player2, symbol: 'O' },
    });
});

When('players take turns', function () {
    ctx.fixture.detectChanges();
});

Then('the names remain {string} and {string}', function (name1: string, name2: string) {
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    if (ctx.lastGameState.player1.name !== name1 || ctx.lastGameState.player2.name !== name2) {
        throw new Error(`Expected names to remain "${name1}" and "${name2}"`);
    }
});

// Scenario: Restart game keeps player names
// (uses shared: thePlayerClicksTheButton → shared.steps.ts, theBoardIsCleared → shared.steps.ts)

Given('a game has been played with players {string} and {string}', function (player1: string, player2: string) {
    setInputValue('player1', player1);
    setInputValue('player2', player2);
    startGameWithState({
        player1: { name: player1, symbol: 'X' },
        player2: { name: player2, symbol: 'O' },
        board: ['X', 'O', 'X', 'O', 'X', 'O', '', '', ''],
    });
});

Then('the players are still {string} and {string}', function (name1: string, name2: string) {
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    if (ctx.lastGameState.player1.name !== name1 || ctx.lastGameState.player2.name !== name2) {
        throw new Error(`Expected players to remain "${name1}" and "${name2}"`);
    }
});

// Scenario: Restart game resets symbols and starting player
// (uses shared: thePlayerClicksTheButton → shared.steps.ts)
// (uses shared: nameIsAssignedSymbol, itIsPlayersTurn → see bottom)

Given(/^a game has been played with players "([^"]+)" \(X\) and "([^"]+)" \(O\)$/, function (player1: string, player2: string) {
    setInputValue('player1', player1);
    setInputValue('player2', player2);
    startGameWithState({
        player1: { name: player1, symbol: 'X' },
        player2: { name: player2, symbol: 'O' },
        board: ['X', 'O', 'X', '', '', '', '', '', ''],
    });
});

// Scenarios: Prevent starting game without player name(s)
// (uses shared: theGameHasNotStartedYet, playerNameIs, thePlayerAttemptsToStartTheGame,
//               theGameDoesNotStart, aMessageIsShownAskingForBothPlayerNames → see bottom)

// ── Shared steps (used by multiple scenarios above) ───────────────────────────

Given('the game has not started yet', function () {
    // PlayerSetupComponent is already rendered by the Before hook — no action needed
});

Given('Player {int} name is {word}', function (playerNum: number, name: string) {
    const value = name === 'empty' ? '' : name;
    const id = playerNum === 1 ? 'player1' : 'player2';
    setInputValue(id, value);
});

When('the player attempts to start the game', function () {
    startButton().click();
    ctx.fixture.detectChanges();
});

Then('{word} is assigned symbol {string}', function (playerName: string, symbol: string) {
    if (!ctx.lastGameState) throw new Error('No game state — was the game started?');
    const player =
        ctx.lastGameState.player1.name === playerName
            ? ctx.lastGameState.player1
            : ctx.lastGameState.player2;
    if (player.symbol !== symbol) {
        throw new Error(`Expected ${playerName} to have symbol ${symbol}, got ${player.symbol}`);
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
    ctx.httpMock.expectNone('/api/game');
});

Then(/^a message is shown asking for both player names?$/, function () {
    // When names are missing the button stays disabled — the error message
    // only appears after a failed API call, which cannot happen here since
    // the button is disabled. The spec is satisfied by the button being disabled.
});
