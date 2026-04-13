import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { GameState } from './models';

const baseGameState: GameState = {
    player1: { name: 'Alice', symbol: 'X' },
    player2: { name: 'Bob', symbol: 'O' },
    currentPlayer: 'X',
    board: ['', '', '', '', '', '', '', '', ''],
    winner: null,
    draw: false,
    winningCells: [],
};

describe('GameService', () => {
    let service: GameService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(GameService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('setupGame', () => {
        it('POSTs to /api/game with the player names', () => {
            service.setupGame('Alice', 'Bob').subscribe();

            const req = httpMock.expectOne('/api/game');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ player1Name: 'Alice', player2Name: 'Bob' });
            req.flush(baseGameState);
        });

        it('returns the response body as the game state', () => {
            let result: GameState | undefined;
            service.setupGame('Alice', 'Bob').subscribe(state => (result = state));

            httpMock.expectOne('/api/game').flush(baseGameState);
            expect(result).toEqual(baseGameState);
        });
    });

    describe('placeSymbol', () => {
        it('POSTs to /api/game/move with the correct request body', () => {
            service.placeSymbol(baseGameState, 4).subscribe();

            const req = httpMock.expectOne('/api/game/move');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({
                currentPlayer: 'X',
                board: baseGameState.board,
                cellIndex: 4,
            });
            req.flush({ ...baseGameState, board: ['', '', '', '', 'X', '', '', '', ''], currentPlayer: 'O' });
        });

        it('merges player1 and player2 from the existing game state into the response', () => {
            const moveResponse = {
                currentPlayer: 'O' as const,
                board: ['X', '', '', '', '', '', '', '', ''],
                winner: null,
                draw: false,
                winningCells: [],
            };

            let result: GameState | undefined;
            service.placeSymbol(baseGameState, 0).subscribe(state => (result = state));

            httpMock.expectOne('/api/game/move').flush(moveResponse);

            expect(result?.player1).toEqual(baseGameState.player1);
            expect(result?.player2).toEqual(baseGameState.player2);
            expect(result?.currentPlayer).toBe('O');
            expect(result?.board[0]).toBe('X');
        });
    });
});
