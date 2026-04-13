import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { GameBoardComponent } from './game-board.component';
import { GameService } from '../game.service';
import { GameState } from '../models';

const baseGameState: GameState = {
    player1: { name: 'Alice', symbol: 'X' },
    player2: { name: 'Bob', symbol: 'O' },
    currentPlayer: 'X',
    board: ['', '', '', '', '', '', '', '', ''],
    winner: null,
    draw: false,
    winningCells: [],
};

describe('GameBoardComponent', () => {
    let mockGameService: {
        setupGame: ReturnType<typeof vi.fn>;
        placeSymbol: ReturnType<typeof vi.fn>;
    };

    beforeEach(async () => {
        mockGameService = {
            setupGame: vi.fn(),
            placeSymbol: vi.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [GameBoardComponent],
            providers: [{ provide: GameService, useValue: mockGameService }],
        }).compileComponents();
    });

    function createFixture(state: GameState = baseGameState) {
        const fixture = TestBed.createComponent(GameBoardComponent);
        fixture.componentInstance.initialState = state;
        fixture.componentInstance.ngOnChanges();
        fixture.detectChanges();
        return fixture;
    }

    describe('applyGameState()', () => {
        it('sets currentPlayerName to player1 when currentPlayer is X', () => {
            const fixture = createFixture({ ...baseGameState, currentPlayer: 'X' });
            expect(fixture.componentInstance.currentPlayerName).toBe('Alice');
        });

        it('sets currentPlayerName to player2 when currentPlayer is O', () => {
            const fixture = createFixture({ ...baseGameState, currentPlayer: 'O' });
            expect(fixture.componentInstance.currentPlayerName).toBe('Bob');
        });

        it('sets currentPlayerName to empty string when there is no current player', () => {
            const fixture = createFixture({ ...baseGameState, currentPlayer: null });
            expect(fixture.componentInstance.currentPlayerName).toBe('');
        });

        it('sets winnerName to player1 name when winner is X', () => {
            const fixture = createFixture({ ...baseGameState, winner: 'X', currentPlayer: null });
            expect(fixture.componentInstance.winnerName).toBe('Alice');
        });

        it('sets winnerName to player2 name when winner is O', () => {
            const fixture = createFixture({ ...baseGameState, winner: 'O', currentPlayer: null });
            expect(fixture.componentInstance.winnerName).toBe('Bob');
        });

        it('sets winnerName to empty string when there is no winner', () => {
            const fixture = createFixture({ ...baseGameState, winner: null });
            expect(fixture.componentInstance.winnerName).toBe('');
        });

        it('shows the turn indicator when the game is in progress', () => {
            const fixture = createFixture({ ...baseGameState, currentPlayer: 'X', winner: null, draw: false });
            expect(fixture.componentInstance.showTurnIndicator).toBe(true);
        });

        it('hides the turn indicator when there is a winner', () => {
            const fixture = createFixture({ ...baseGameState, winner: 'X', currentPlayer: null });
            expect(fixture.componentInstance.showTurnIndicator).toBe(false);
        });

        it('hides the turn indicator when the game is a draw', () => {
            const fixture = createFixture({ ...baseGameState, draw: true, currentPlayer: null });
            expect(fixture.componentInstance.showTurnIndicator).toBe(false);
        });

        it('normalizes a missing winningCells to an empty array', () => {
            const stateWithoutWinningCells = { ...baseGameState } as any;
            delete stateWithoutWinningCells.winningCells;
            const fixture = createFixture(stateWithoutWinningCells);
            expect(fixture.componentInstance.gameState.winningCells).toEqual([]);
        });
    });

    describe('isWinningCell()', () => {
        it('returns true for an index in winningCells', () => {
            const fixture = createFixture({ ...baseGameState, winningCells: [0, 1, 2] });
            expect(fixture.componentInstance.isWinningCell(0)).toBe(true);
            expect(fixture.componentInstance.isWinningCell(1)).toBe(true);
            expect(fixture.componentInstance.isWinningCell(2)).toBe(true);
        });

        it('returns false for an index not in winningCells', () => {
            const fixture = createFixture({ ...baseGameState, winningCells: [0, 1, 2] });
            expect(fixture.componentInstance.isWinningCell(3)).toBe(false);
        });

        it('returns false when winningCells is empty', () => {
            const fixture = createFixture({ ...baseGameState, winningCells: [] });
            expect(fixture.componentInstance.isWinningCell(0)).toBe(false);
        });
    });

    describe('placeSymbol()', () => {
        it('does nothing when a move is already in progress', () => {
            const fixture = createFixture();
            fixture.componentInstance.moveInProgress = true;

            fixture.componentInstance.placeSymbol(0);

            expect(mockGameService.placeSymbol).not.toHaveBeenCalled();
        });

        it('does nothing when setup is in progress', () => {
            const fixture = createFixture();
            fixture.componentInstance.setupInProgress = true;

            fixture.componentInstance.placeSymbol(0);

            expect(mockGameService.placeSymbol).not.toHaveBeenCalled();
        });

        it('calls gameService.placeSymbol with the current game state and cell index', () => {
            const nextState = { ...baseGameState, board: ['X', '', '', '', '', '', '', '', ''], currentPlayer: 'O' as const };
            mockGameService.placeSymbol.mockReturnValue(of(nextState));
            const fixture = createFixture();
            const stateAtCallTime = fixture.componentInstance.gameState;

            fixture.componentInstance.placeSymbol(0);

            expect(mockGameService.placeSymbol).toHaveBeenCalledWith(stateAtCallTime, 0);
        });

        it('applies the returned game state on success', () => {
            const nextState = { ...baseGameState, board: ['X', '', '', '', '', '', '', '', ''], currentPlayer: 'O' as const };
            mockGameService.placeSymbol.mockReturnValue(of(nextState));
            const fixture = createFixture();

            fixture.componentInstance.placeSymbol(0);

            expect(fixture.componentInstance.gameState.board[0]).toBe('X');
            expect(fixture.componentInstance.currentPlayerName).toBe('Bob');
        });

        it('shows the server error message on failure', () => {
            mockGameService.placeSymbol.mockReturnValue(
                throwError(() => ({ error: { message: 'Cell is already taken' } }))
            );
            const fixture = createFixture();

            fixture.componentInstance.placeSymbol(0);

            expect(fixture.componentInstance.errorMessage).toBe('Cell is already taken');
        });

        it('shows a fallback error message when the server error has no message', () => {
            mockGameService.placeSymbol.mockReturnValue(throwError(() => ({})));
            const fixture = createFixture();

            fixture.componentInstance.placeSymbol(0);

            expect(fixture.componentInstance.errorMessage).toContain('Failed to place symbol');
        });
    });

    describe('restartGame()', () => {
        it('calls setupGame with the same player names', () => {
            mockGameService.setupGame.mockReturnValue(of(baseGameState));
            const fixture = createFixture();

            fixture.componentInstance.restartGame();

            expect(mockGameService.setupGame).toHaveBeenCalledWith('Alice', 'Bob');
        });

        it('immediately resets the board to empty before the server responds', () => {
            const playedState: GameState = {
                ...baseGameState,
                board: ['X', 'O', 'X', '', '', '', '', '', ''],
            };
            // Use a Subject so the server response never arrives during this assertion
            const pending$ = new Subject<GameState>();
            mockGameService.setupGame.mockReturnValue(pending$.asObservable());
            const fixture = createFixture(playedState);

            fixture.componentInstance.restartGame();

            expect(fixture.componentInstance.gameState.board).toEqual(['', '', '', '', '', '', '', '', '']);
            pending$.complete();
        });

        it('applies the fresh game state from the server on success', () => {
            const freshState: GameState = { ...baseGameState, currentPlayer: 'X' };
            mockGameService.setupGame.mockReturnValue(of(freshState));
            const fixture = createFixture();

            fixture.componentInstance.restartGame();

            expect(fixture.componentInstance.gameState.currentPlayer).toBe('X');
            expect(fixture.componentInstance.winnerName).toBe('');
        });

        it('shows the server error message on failure', () => {
            mockGameService.setupGame.mockReturnValue(
                throwError(() => ({ error: { message: 'Server error' } }))
            );
            const fixture = createFixture();

            fixture.componentInstance.restartGame();

            expect(fixture.componentInstance.errorMessage).toBe('Server error');
        });

        it('ignores a stale response when a newer restart was triggered', () => {
            const firstCall$ = new Subject<GameState>();
            const staleState: GameState = { ...baseGameState, currentPlayer: 'O' };
            const freshState: GameState = { ...baseGameState, currentPlayer: 'X' };

            mockGameService.setupGame
                .mockReturnValueOnce(firstCall$.asObservable())
                .mockReturnValueOnce(of(freshState));

            const fixture = createFixture();

            fixture.componentInstance.restartGame(); // requestId = 1, still pending
            fixture.componentInstance.restartGame(); // requestId = 2, resolves immediately

            // Resolve the stale first call after the second has already completed
            firstCall$.next(staleState);
            firstCall$.complete();

            // The second restart's state (X) should win, not the stale one (O)
            expect(fixture.componentInstance.gameState.currentPlayer).toBe('X');
        });
    });
});
