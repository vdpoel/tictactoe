import { ChangeDetectorRef, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, takeUntil, timeout } from 'rxjs';
import { GameService } from '../game.service';
import { GameState } from '../models';

@Component({
    selector: 'app-player-setup',
    standalone: true,
    imports: [FormsModule],
    template: `
        <section class="player-setup">
          <header class="hero">
            <p class="eyebrow">TicTacToe</p>
            <h2>Player Setup</h2>
          </header>

          @if (!gameState) {
            <div class="player-fields">
              <div class="field">
                <label for="player1">Player 1 name</label>
                <input id="player1" type="text" [(ngModel)]="player1Name" placeholder="Enter name" />
              </div>

              <div class="field">
                <label for="player2">Player 2 name</label>
                <input id="player2" type="text" [(ngModel)]="player2Name" placeholder="Enter name" />
              </div>
            </div>
          } @else {
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

              <button type="button" class="secondary" [disabled]="setupInProgress" (click)="restartGame()">New Game</button>
            </section>
          }

          @if (errorMessage) {
            <p class="error" role="alert">{{ errorMessage }}</p>
          }

          @if (!gameState) {
            <button type="button" (click)="startGame()" [disabled]="!canStart || setupInProgress">Start Game</button>
          }
        </section>
    `,
    styles: [`
        .player-setup {
            max-width: 34rem;
            margin: 3rem auto;
            padding: 2rem;
            border-radius: 1.5rem;
            background: linear-gradient(180deg, #fff9ee 0%, #fff 100%);
            box-shadow: 0 1rem 3rem rgba(53, 43, 28, 0.12);
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .hero {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }

        .hero h2 {
            margin: 0;
            font-size: 2rem;
        }

        .eyebrow {
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-size: 0.75rem;
            color: #9a6d38;
        }

        .player-fields {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .field label {
            font-weight: 600;
        }

        .field input {
            padding: 0.5rem;
            font-size: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .error {
            color: #c0392b;
        }

        button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            border: 0;
            border-radius: 999px;
            background: #1f6f5f;
            color: #fffdf8;
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .secondary {
            background: #f0ede4;
            color: #2f3d38;
        }

        .game-screen {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .player-summary {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .player-chip {
            margin: 0;
            padding: 0.65rem 0.9rem;
            border-radius: 999px;
            background: #f2efe6;
            font-weight: 600;
        }

        .turn-indicator {
            margin: 0;
            font-size: 1.1rem;
            color: #2f3d38;
        }

        .board {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.5rem;
        }

        .board-cell {
            min-height: 4.5rem;
            border-radius: 0.9rem;
            background: #fcfbf7;
            border: 1px solid #e0d8c8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            color: #2f3d38;
            cursor: pointer;
            padding: 0;
            transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
          }

          .board-cell:not(:disabled):hover {
            transform: translateY(-1px);
            border-color: #9a6d38;
            box-shadow: 0 0.5rem 1rem rgba(53, 43, 28, 0.08);
          }

          .board-cell:disabled {
            cursor: wait;
          }

          .winning-cell {
            background: #dff6c8;
            border-color: #70a64a;
            box-shadow: inset 0 0 0 2px rgba(112, 166, 74, 0.35);
          }

          .result-indicator {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 700;
            color: #9a6d38;
        }
    `],
})
export class PlayerSetupComponent {
    private readonly gameService = inject(GameService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly cancelMoveRequests$ = new Subject<void>();
  private setupRequestId = 0;

    player1Name = '';
    player2Name = '';
    errorMessage = '';
    gameState: GameState | null = null;
    moveInProgress = false;
    setupInProgress = false;
    currentPlayerName = '';
    winnerName = '';
    showTurnIndicator = false;

    readonly gameStarted = output<GameState>();

    get canStart(): boolean {
        return this.player1Name.trim().length > 0 && this.player2Name.trim().length > 0;
    }

    startGame(): void {
      if (!this.canStart) {
        return;
      }

      this.setupGame(this.player1Name.trim(), this.player2Name.trim(), false);
    }

    restartGame(): void {
      const player1 = this.gameState?.player1.name ?? this.player1Name.trim();
      const player2 = this.gameState?.player2.name ?? this.player2Name.trim();
      if (!player1 || !player2) {
        this.errorMessage = 'Both player names are required to start a new game.';
        return;
      }

      this.setupGame(player1, player2, true);
    }

    placeSymbol(cellIndex: number): void {
      if (!this.gameState || this.moveInProgress || this.setupInProgress) {
        return;
      }

      this.errorMessage = '';
      this.moveInProgress = true;

      this.gameService.placeSymbol(this.gameState, cellIndex)
        .pipe(timeout(8000))
        .pipe(takeUntil(this.cancelMoveRequests$))
        .pipe(finalize(() => {
          this.moveInProgress = false;
          this.changeDetectorRef.detectChanges();
        }))
        .subscribe({
          next: (state) => {
            this.applyGameState(state);
            this.changeDetectorRef.detectChanges();
          },
          error: (err) => {
            this.errorMessage = err.error?.message ?? 'Failed to place symbol. The move request timed out or could not reach the server.';
            this.changeDetectorRef.detectChanges();
          },
        });
    }

    private setupGame(player1Name: string, player2Name: string, isRestart: boolean): void {
      // Ensure stale move responses cannot overwrite a newly started game.
      this.cancelMoveRequests$.next();
      this.errorMessage = '';
      this.moveInProgress = false;
      this.setupInProgress = true;
      const requestId = ++this.setupRequestId;

      if (isRestart) {
        this.applyGameState(this.createInitialGameState(player1Name, player2Name));
      }

      this.gameService.setupGame(player1Name, player2Name)
        .pipe(timeout(8000))
        .pipe(finalize(() => {
          if (requestId === this.setupRequestId) {
            this.setupInProgress = false;
            this.changeDetectorRef.detectChanges();
          }
        }))
        .subscribe({
        next: (state) => {
          if (requestId !== this.setupRequestId) {
            return;
          }
          this.applyGameState(state);
          this.player1Name = state.player1.name;
          this.player2Name = state.player2.name;
          this.gameStarted.emit(state);
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          if (requestId !== this.setupRequestId) {
            return;
          }
          this.errorMessage = err.error?.message ?? 'Failed to start the game. The request timed out or could not reach the server.';
          this.changeDetectorRef.detectChanges();
        },
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
    }

    isWinningCell(index: number): boolean {
      return !!this.gameState && this.gameState.winningCells.includes(index);
    }
}
