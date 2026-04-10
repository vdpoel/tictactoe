import { ComponentFixture } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { PlayerSetupComponent } from '../../src/app/features/game/player-setup/player-setup.component';
import { GameBoardComponent } from '../../src/app/features/game/game-board/game-board.component';
import { GameState } from '../../src/app/features/game/models';

// ── Shared world state ────────────────────────────────────────────────────────

export const ctx: {
    fixture: ComponentFixture<PlayerSetupComponent>;
    httpMock: HttpTestingController;
    lastGameState: GameState | null;
    lastSelectedCellIndex: number;
    previousGameState: GameState | null;
    expectedHighlightedCells: number[];
} = {} as never;

// ── Helpers ───────────────────────────────────────────────────────────────────

export function gameBoardInstance(): GameBoardComponent {
    const el = ctx.fixture.debugElement.query(By.directive(GameBoardComponent));
    if (!el) {
        throw new Error('GameBoardComponent not found — has the game started?');
    }
    return el.componentInstance as GameBoardComponent;
}

export function inputById(id: string): HTMLInputElement {
    return ctx.fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
}

export function setInputValue(id: string, value: string): void {
    const input = inputById(id);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    ctx.fixture.detectChanges();
}

export function startButton(): HTMLButtonElement {
    return ctx.fixture.nativeElement.querySelector('button') as HTMLButtonElement;
}

export function newGameButton(): HTMLButtonElement {
    return Array.from(ctx.fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
        .find((button) => button.textContent?.includes('New Game')) as HTMLButtonElement;
}

export function flushGameSetup(state?: Partial<GameState>): void {
    const defaultState: GameState = {
        player1: { name: ctx.fixture.componentInstance.player1Name, symbol: 'X' },
        player2: { name: ctx.fixture.componentInstance.player2Name, symbol: 'O' },
        currentPlayer: 'X',
        board: Array(9).fill(''),
        winner: null,
        draw: false,
        winningCells: [],
    };
    const response = { ...defaultState, ...state, board: state?.board ?? defaultState.board };
    const req = ctx.httpMock.expectOne('/api/game');
    req.flush(response);
    ctx.lastGameState = response;
    ctx.fixture.detectChanges();
}

export function flushPlaceSymbol(state?: Partial<GameState>): void {
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state before placing a symbol');
    }

    const response: GameState = {
        ...ctx.lastGameState,
        ...state,
        board: state?.board ?? ctx.lastGameState.board,
        winner: state && 'winner' in state ? state.winner! : ctx.lastGameState.winner,
        draw: state?.draw ?? ctx.lastGameState.draw,
        currentPlayer: state && 'currentPlayer' in state ? state.currentPlayer! : ctx.lastGameState.currentPlayer,
        winningCells: state?.winningCells ?? ctx.lastGameState.winningCells,
    };

    const req = ctx.httpMock.expectOne('/api/game/move');
    req.flush(response);
    ctx.lastGameState = response;
}

export function startGameWithState(state?: Partial<GameState>): void {
    startButton().click();
    flushGameSetup(state);
}

export function textContent(selector: string): string {
    const element = ctx.fixture.nativeElement.querySelector(selector) as HTMLElement | null;
    return element?.textContent?.trim() ?? '';
}

export function boardCells(): HTMLButtonElement[] {
    return Array.from(ctx.fixture.nativeElement.querySelectorAll('.board-cell')) as HTMLButtonElement[];
}

export function boardCell(index: number): HTMLButtonElement {
    return boardCells()[index] as HTMLButtonElement;
}

export function clickBoardCell(index: number): void {
    ctx.lastSelectedCellIndex = index;
    gameBoardInstance().placeSymbol(index);
}

export function patchGameState(state: Partial<GameState>): void {
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    ctx.lastGameState = {
        ...ctx.lastGameState,
        ...state,
        board: state.board ?? ctx.lastGameState.board,
        winner: 'winner' in state ? state.winner! : ctx.lastGameState.winner,
        draw: state.draw ?? ctx.lastGameState.draw,
        currentPlayer: 'currentPlayer' in state ? state.currentPlayer! : ctx.lastGameState.currentPlayer,
        winningCells: state.winningCells ?? ctx.lastGameState.winningCells,
    };
    gameBoardInstance().applyGameState(ctx.lastGameState);
}

export function snapshotState(): void {
    if (!ctx.lastGameState) {
        throw new Error('Expected a game state to exist');
    }

    ctx.previousGameState = {
        ...ctx.lastGameState,
        player1: { ...ctx.lastGameState.player1 },
        player2: { ...ctx.lastGameState.player2 },
        board: [...ctx.lastGameState.board],
        winningCells: [...ctx.lastGameState.winningCells],
    };
}
