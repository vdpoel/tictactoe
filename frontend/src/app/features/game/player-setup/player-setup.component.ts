import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
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

                @if (errorMessage) {
                    <p class="error" role="alert">{{ errorMessage }}</p>
                }

                <button type="button" (click)="startGame()" [disabled]="!canStart || setupInProgress">Start Game</button>
            } @else {
                <app-game-board [initialState]="gameState" />
            }
        </section>
    `,
    styleUrl: './player-setup.component.scss',
})
export class PlayerSetupComponent {
    private readonly gameService = inject(GameService);
    private readonly cdr = inject(ChangeDetectorRef);

    player1Name = '';
    player2Name = '';
    errorMessage = '';
    gameState: GameState | null = null;
    setupInProgress = false;

    get canStart(): boolean {
        return this.player1Name.trim().length > 0 && this.player2Name.trim().length > 0;
    }

    startGame(): void {
        if (!this.canStart) {
            return;
        }

        this.errorMessage = '';
        this.setupInProgress = true;
        this.cdr.markForCheck();

        this.gameService.setupGame(this.player1Name.trim(), this.player2Name.trim())
            .pipe(timeout(8000), finalize(() => {
                this.setupInProgress = false;
                this.cdr.markForCheck();
            }))
            .subscribe({
                next: (state) => {
                    this.gameState = state;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.errorMessage = err.error?.message ?? 'Failed to start the game. The request timed out or could not reach the server.';
                    this.cdr.markForCheck();
                },
            });
    }
}
