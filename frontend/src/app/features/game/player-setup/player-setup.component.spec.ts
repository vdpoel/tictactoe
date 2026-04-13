import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PlayerSetupComponent } from './player-setup.component';
import { GameService } from '../game.service';
import { GameState } from '../models';

const mockGameState: GameState = {
    player1: { name: 'Alice', symbol: 'X' },
    player2: { name: 'Bob', symbol: 'O' },
    currentPlayer: 'X',
    board: ['', '', '', '', '', '', '', '', ''],
    winner: null,
    draw: false,
    winningCells: [],
};

describe('PlayerSetupComponent', () => {
    let mockGameService: { setupGame: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        mockGameService = { setupGame: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [PlayerSetupComponent],
            providers: [{ provide: GameService, useValue: mockGameService }],
        }).compileComponents();
    });

    function createFixture() {
        const fixture = TestBed.createComponent(PlayerSetupComponent);
        fixture.detectChanges();
        return fixture;
    }

    function getStartButton(fixture: ReturnType<typeof createFixture>): HTMLButtonElement {
        return fixture.nativeElement.querySelector('button[type="button"]');
    }

    describe('canStart', () => {
        it('is false when both names are empty', () => {
            const fixture = createFixture();
            expect(fixture.componentInstance.canStart).toBe(false);
        });

        it('is false when only player1 has a name', () => {
            const fixture = createFixture();
            fixture.componentInstance.player1Name = 'Alice';
            expect(fixture.componentInstance.canStart).toBe(false);
        });

        it('is false when only player2 has a name', () => {
            const fixture = createFixture();
            fixture.componentInstance.player2Name = 'Bob';
            expect(fixture.componentInstance.canStart).toBe(false);
        });

        it('is false when both names are whitespace only', () => {
            const fixture = createFixture();
            fixture.componentInstance.player1Name = '   ';
            fixture.componentInstance.player2Name = '   ';
            expect(fixture.componentInstance.canStart).toBe(false);
        });

        it('is true when both names are filled', () => {
            const fixture = createFixture();
            fixture.componentInstance.player1Name = 'Alice';
            fixture.componentInstance.player2Name = 'Bob';
            expect(fixture.componentInstance.canStart).toBe(true);
        });
    });

    describe('Start Game button', () => {
        it('is disabled when names are not filled', () => {
            const fixture = createFixture();
            expect(getStartButton(fixture).disabled).toBe(true);
        });

        it('is enabled when both names are filled', () => {
            const fixture = createFixture();

            const [input1, input2] = fixture.nativeElement.querySelectorAll('input');
            input1.value = 'Alice';
            input1.dispatchEvent(new Event('input'));
            input2.value = 'Bob';
            input2.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            expect(getStartButton(fixture).disabled).toBe(false);
        });

        it('is disabled while the request is in flight', () => {
            const fixture = createFixture();
            fixture.componentInstance.player1Name = 'Alice';
            fixture.componentInstance.player2Name = 'Bob';
            fixture.componentInstance.setupInProgress = true;
            fixture.detectChanges();
            expect(getStartButton(fixture).disabled).toBe(true);
        });
    });

    describe('startGame()', () => {
        it('does nothing when canStart is false', () => {
            const fixture = createFixture();
            fixture.componentInstance.startGame();
            expect(mockGameService.setupGame).not.toHaveBeenCalled();
        });

        it('calls setupGame with trimmed player names', () => {
            mockGameService.setupGame.mockReturnValue(of(mockGameState));
            const fixture = createFixture();
            fixture.componentInstance.player1Name = '  Alice  ';
            fixture.componentInstance.player2Name = '  Bob  ';

            fixture.componentInstance.startGame();

            expect(mockGameService.setupGame).toHaveBeenCalledWith('Alice', 'Bob');
        });

        it('sets gameState and renders the game board on success', () => {
            mockGameService.setupGame.mockReturnValue(of(mockGameState));
            const fixture = createFixture();
            fixture.componentInstance.player1Name = 'Alice';
            fixture.componentInstance.player2Name = 'Bob';

            fixture.componentInstance.startGame();
            fixture.detectChanges();

            expect(fixture.componentInstance.gameState).toEqual(mockGameState);
            expect(fixture.nativeElement.querySelector('app-game-board')).not.toBeNull();
        });

        it('shows the error message from the server on failure', () => {
            mockGameService.setupGame.mockReturnValue(
                throwError(() => ({ error: { message: 'Names cannot be blank' } }))
            );
            const fixture = createFixture();
            fixture.componentInstance.player1Name = 'Alice';
            fixture.componentInstance.player2Name = 'Bob';

            fixture.componentInstance.startGame();
            fixture.detectChanges();

            const errorEl: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
            expect(errorEl?.textContent?.trim()).toBe('Names cannot be blank');
        });

        it('shows a fallback error message when the server error has no message', () => {
            mockGameService.setupGame.mockReturnValue(throwError(() => ({})));
            const fixture = createFixture();
            fixture.componentInstance.player1Name = 'Alice';
            fixture.componentInstance.player2Name = 'Bob';

            fixture.componentInstance.startGame();

            expect(fixture.componentInstance.errorMessage).toContain('Failed to start the game');
        });
    });
});
