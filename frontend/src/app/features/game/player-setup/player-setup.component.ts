import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';
import { GameService } from '../game.service';
import { GameState } from '../models';
import { GameBoardComponent } from '../game-board/game-board.component';

@Component({
    selector: 'app-player-setup',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, GameBoardComponent],
    template: `
        <section class="player-setup">
            <header class="hero">
                <p class="eyebrow">TicTacToe</p>
                <h2>Player Setup</h2>
            </header>

            @if (!gameState()) {
                <div class="player-fields">
                    <div class="field">
                        <label for="player1">Player 1 name</label>
                        <input id="player1" type="text" [ngModel]="player1Name()" (ngModelChange)="player1Name.set($event)" placeholder="Enter name" />
                    </div>
                    <div class="field">
                        <label for="player2">Player 2 name</label>
                        <input id="player2" type="text" [ngModel]="player2Name()" (ngModelChange)="player2Name.set($event)" placeholder="Enter name" />
                    </div>
                </div>

                @if (errorMessage()) {
                    <p class="error" role="alert">{{ errorMessage() }}</p>
                }

                <button type="button" (click)="startGame()" [disabled]="!canStart() || setupInProgress()">Start Game</button>
            } @else {
                <app-game-board [initialState]="gameState()!" />
            }
        </section>
    `,
    styleUrl: './player-setup.component.scss',
})
export class PlayerSetupComponent {
    private readonly gameService = inject(GameService);

    readonly player1Name = signal('');
    readonly player2Name = signal('');
    readonly errorMessage = signal('');
    readonly gameState = signal<GameState | null>(null);
    readonly setupInProgress = signal(false);

    readonly canStart = computed(() =>
        this.player1Name().trim().length > 0 && this.player2Name().trim().length > 0
    );

    startGame(): void {
        if (!this.canStart()) {
            return;
        }

        this.errorMessage.set('');
        this.setupInProgress.set(true);

        this.gameService.setupGame(this.player1Name().trim(), this.player2Name().trim())
            .pipe(timeout(8000), finalize(() => {
                this.setupInProgress.set(false);
            }))
            .subscribe({
                next: (state) => {
                    this.gameState.set(state);
                },
                error: (err) => {
                    this.errorMessage.set(err.error?.message ?? 'Failed to start the game. The request timed out or could not reach the server.');
                },
            });
    }
}
