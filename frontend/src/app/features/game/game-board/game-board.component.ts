import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { Subject, finalize, takeUntil, timeout } from 'rxjs';
import { GameService } from '../game.service';
import { GameState } from '../models';

@Component({
    selector: 'app-game-board',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [],
    template: `
        <section class="game-screen">
            <div class="player-summary">
                <p class="player-chip">{{ gameState.player1.name }} ({{ gameState.player1.symbol }})</p>
                <p class="player-chip">{{ gameState.player2.name }} ({{ gameState.player2.symbol }})</p>
            </div>

            @if (showTurnIndicator) {
                <p class="turn-indicator">{{ currentPlayerName }}'s turn</p>
            }

            @if (winnerName) {
                <p class="result-indicator">{{ winnerName }} has won</p>
            }

            @if (gameState.draw) {
                <p class="result-indicator">The game is a draw</p>
            }

            <div class="board" aria-label="Game board">
                @for (cell of gameState.board; track $index) {
                    <button
                        type="button"
                        class="board-cell"
                        [class.winning-cell]="isWinningCell($index)"
                        [attr.data-cell-index]="$index"
                        [attr.aria-label]="'Board cell ' + ($index + 1)"
                        [disabled]="moveInProgress || setupInProgress"
                        (click)="placeSymbol($index)">
                        {{ cell }}
                    </button>
                }
            </div>

            @if (errorMessage) {
                <p class="error" role="alert">{{ errorMessage }}</p>
            }

            <button type="button" class="secondary" [disabled]="setupInProgress" (click)="restartGame()">New Game</button>
        </section>
    `,
    styleUrl: './game-board.component.scss',
})
export class GameBoardComponent implements OnChanges, OnDestroy {
    private readonly gameService = inject(GameService);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly cancelMoveRequests$ = new Subject<void>();
    private setupRequestId = 0;

    @Input({ required: true }) initialState!: GameState;

    gameState!: GameState;
    errorMessage = '';
    moveInProgress = false;
    setupInProgress = false;
    currentPlayerName = '';
    winnerName = '';
    showTurnIndicator = false;

    ngOnChanges(): void {
        this.applyGameState(this.initialState);
    }

    ngOnDestroy(): void {
        this.cancelMoveRequests$.complete();
    }

    placeSymbol(cellIndex: number): void {
        if (this.moveInProgress || this.setupInProgress) {
            return;
        }

        this.errorMessage = '';
        this.moveInProgress = true;
        this.cdr.markForCheck();

        this.gameService.placeSymbol(this.gameState, cellIndex)
            .pipe(timeout(8000), takeUntil(this.cancelMoveRequests$), finalize(() => {
                this.moveInProgress = false;
                this.cdr.markForCheck();
            }))
            .subscribe({
                next: (state) => {
                    this.applyGameState(state);
                },
                error: (err) => {
                    this.errorMessage = err.error?.message ?? 'Failed to place symbol. The move request timed out or could not reach the server.';
                    this.cdr.markForCheck();
                },
            });
    }

    restartGame(): void {
        const player1 = this.gameState.player1.name;
        const player2 = this.gameState.player2.name;

        this.cancelMoveRequests$.next();
        this.errorMessage = '';
        this.moveInProgress = false;
        this.setupInProgress = true;
        const requestId = ++this.setupRequestId;

        this.applyGameState(this.createInitialGameState(player1, player2));

        this.gameService.setupGame(player1, player2)
            .pipe(timeout(8000), finalize(() => {
                if (requestId === this.setupRequestId) {
                    this.setupInProgress = false;
                    this.cdr.markForCheck();
                }
            }))
            .subscribe({
                next: (state) => {
                    if (requestId !== this.setupRequestId) {
                        return;
                    }
                    this.applyGameState(state);
                },
                error: (err) => {
                    if (requestId !== this.setupRequestId) {
                        return;
                    }
                    this.errorMessage = err.error?.message ?? 'Failed to start the game. The request timed out or could not reach the server.';
                    this.cdr.markForCheck();
                },
            });
    }

    isWinningCell(index: number): boolean {
        return this.gameState.winningCells.includes(index);
    }

    applyGameState(state: GameState): void {
        const normalizedState: GameState = {
            ...state,
            winningCells: Array.isArray(state.winningCells) ? state.winningCells : [],
        };
        this.gameState = normalizedState;
        this.currentPlayerName = normalizedState.currentPlayer === 'X'
            ? normalizedState.player1.name
            : normalizedState.currentPlayer === 'O'
                ? normalizedState.player2.name
                : '';
        this.winnerName = normalizedState.winner === 'X'
            ? normalizedState.player1.name
            : normalizedState.winner === 'O'
                ? normalizedState.player2.name
                : '';
        this.showTurnIndicator = !normalizedState.winner && !normalizedState.draw && !!normalizedState.currentPlayer;
        this.cdr.markForCheck();
    }

    private createInitialGameState(player1Name: string, player2Name: string): GameState {
        return {
            player1: { name: player1Name, symbol: 'X' },
            player2: { name: player2Name, symbol: 'O' },
            currentPlayer: 'X',
            board: ['', '', '', '', '', '', '', '', ''],
            winner: null,
            draw: false,
            winningCells: [],
        };
    }
}
