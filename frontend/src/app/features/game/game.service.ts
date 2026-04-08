import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameState, PlaceSymbolRequest } from './models';

@Injectable({ providedIn: 'root' })
export class GameService {
    private readonly http = inject(HttpClient);

    setupGame(player1Name: string, player2Name: string): Observable<GameState> {
        return this.http.post<GameState>('/api/game', { player1Name, player2Name });
    }

    placeSymbol(gameState: GameState, cellIndex: number): Observable<GameState> {
        const request: PlaceSymbolRequest = {
            player1Name: gameState.player1.name,
            player2Name: gameState.player2.name,
            currentPlayer: gameState.currentPlayer,
            board: gameState.board,
            cellIndex,
        };

        return this.http.post<GameState>('/api/game/move', request);
    }
}
