import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

              <p class="turn-indicator">{{ currentPlayerName }}'s turn</p>

              <div class="board" aria-label="Game board">
                @for (cell of gameState.board; track $index) {
                  <div class="board-cell">{{ cell }}</div>
                }
              </div>

              <button type="button" class="secondary" (click)="restartGame()">New Game</button>
            </section>
          }

          @if (errorMessage) {
            <p class="error" role="alert">{{ errorMessage }}</p>
          }

          @if (!gameState) {
            <button type="button" (click)="startGame()" [disabled]="!canStart">Start Game</button>
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
        }
    `],
})
export class PlayerSetupComponent {
    private readonly gameService = inject(GameService);

    player1Name = '';
    player2Name = '';
    errorMessage = '';
    gameState: GameState | null = null;

    readonly gameStarted = output<GameState>();

    get canStart(): boolean {
        return this.player1Name.trim().length > 0 && this.player2Name.trim().length > 0;
    }

    get currentPlayerName(): string {
      if (!this.gameState) {
        return '';
      }

      return this.gameState.currentPlayer === 'X'
        ? this.gameState.player1.name
        : this.gameState.player2.name;
    }

    startGame(): void {
      this.setupGame();
    }

    restartGame(): void {
      this.setupGame();
    }

    private setupGame(): void {
      if (!this.canStart) {
        return;
      }

      this.errorMessage = '';
      this.gameService.setupGame(this.player1Name.trim(), this.player2Name.trim()).subscribe({
        next: (state) => {
          this.gameState = state;
          this.player1Name = state.player1.name;
          this.player2Name = state.player2.name;
          this.gameStarted.emit(state);
        },
        error: (err) => {
          this.errorMessage = err.error?.message ?? 'Failed to start the game. Please try again.';
        },
      });
    }
}
