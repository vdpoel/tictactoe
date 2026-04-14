import { ChangeDetectionStrategy, Component, Input, OnDestroy, computed, inject, signal } from '@angular/core';
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
                <p class="player-chip">{{ gameState().player1.name }} ({{ gameState().player1.symbol }})</p>
                <p class="player-chip">{{ gameState().player2.name }} ({{ gameState().player2.symbol }})</p>
            </div>

            @if (showTurnIndicator()) {
                <p class="turn-indicator">{{ currentPlayerName() }}'s turn</p>
            }

            @if (winnerName()) {
                <p class="result-indicator">{{ winnerName() }} has won</p>
            }

            @if (gameState().draw) {
                <p class="result-indicator">The game is a draw</p>
            }

            <div class="board" aria-label="Game board">
                @for (cell of gameState().board; track $index) {
                    <button
                        type="button"
                        class="board-cell"
                        [class.winning-cell]="isWinningCell($index)"
                        [attr.data-cell-index]="$index"
                        [attr.aria-label]="'Board cell ' + ($index + 1)"
                        [disabled]="moveInProgress() || setupInProgress()"
                        (click)="placeSymbol($index)">
                        {{ cell }}
                    </button>
                }
            </div>

            @if (errorMessage()) {
                <p class="error" role="alert">{{ errorMessage() }}</p>
            }

            <button type="button" class="secondary" [disabled]="setupInProgress()" (click)="restartGame()">New Game</button>
        </section>
    `,
    styleUrl: './game-board.component.scss',
})
export class GameBoardComponent implements OnDestroy {
    private readonly gameService = inject(GameService);
    private readonly cancelMoveRequests$ = new Subject<void>();
    private setupRequestId = 0;

    // @Input() decorator is used instead of input() signal because the Cucumber e2e suite
    // runs Angular in JIT mode (ts-node) without the Angular compiler transforms. Signal
    // inputs are not recognised as bindable template properties in that context (NG0303).
    // The setter ensures applyGameState() is called whenever Angular sets or updates the value.
    @Input({ required: true })
    set initialState(state: GameState) {
        this.applyGameState(state);
    }

    readonly gameState = signal<GameState>(null!);
    readonly errorMessage = signal('');
    readonly moveInProgress = signal(false);
    readonly setupInProgress = signal(false);

    readonly currentPlayerName = computed(() => {
        const state = this.gameState();
        return state?.currentPlayer === 'X' ? state.player1.name
            : state?.currentPlayer === 'O' ? state.player2.name : '';
    });

    readonly winnerName = computed(() => {
        const state = this.gameState();
        return state?.winner === 'X' ? state.player1.name
            : state?.winner === 'O' ? state.player2.name : '';
    });

    readonly showTurnIndicator = computed(() => {
        const state = this.gameState();
        return !!state && !state.winner && !state.draw && !!state.currentPlayer;
    });

    ngOnDestroy(): void {
        this.cancelMoveRequests$.complete();
    }

    placeSymbol(cellIndex: number): void {
        if (this.moveInProgress() || this.setupInProgress()) {
            return;
        }

        this.errorMessage.set('');
        this.moveInProgress.set(true);

        this.gameService.placeSymbol(this.gameState(), cellIndex)
            .pipe(timeout(8000), takeUntil(this.cancelMoveRequests$), finalize(() => {
                this.moveInProgress.set(false);
            }))
            .subscribe({
                next: (state) => {
                    this.applyGameState(state);
                },
                error: (err) => {
                    this.errorMessage.set(err.error?.message ?? 'Failed to place symbol. The move request timed out or could not reach the server.');
                },
            });
    }

    restartGame(): void {
        const player1 = this.gameState().player1.name;
        const player2 = this.gameState().player2.name;

        this.cancelMoveRequests$.next();
        this.errorMessage.set('');
        this.moveInProgress.set(false);
        this.setupInProgress.set(true);
        const requestId = ++this.setupRequestId;

        this.applyGameState(this.createInitialGameState(player1, player2));

        this.gameService.setupGame(player1, player2)
            .pipe(timeout(8000), finalize(() => {
                if (requestId === this.setupRequestId) {
                    this.setupInProgress.set(false);
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
                    this.errorMessage.set(err.error?.message ?? 'Failed to start the game. The request timed out or could not reach the server.');
                },
            });
    }

    isWinningCell(index: number): boolean {
        return this.gameState().winningCells.includes(index);
    }

    applyGameState(state: GameState): void {
        this.gameState.set({
            ...state,
            winningCells: Array.isArray(state.winningCells) ? state.winningCells : [],
        });
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
