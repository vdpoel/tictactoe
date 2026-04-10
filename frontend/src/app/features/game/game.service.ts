import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameState, MoveResponse, PlaceSymbolRequest } from './models';

@Injectable({ providedIn: 'root' })
export class GameService {
    private readonly http = inject(HttpClient);

    setupGame(player1Name: string, player2Name: string): Observable<GameState> {
        return this.http.post<GameState>('/api/game', { player1Name, player2Name });
    }

    placeSymbol(gameState: GameState, cellIndex: number): Observable<GameState> {
        const request: PlaceSymbolRequest = {
            currentPlayer: gameState.currentPlayer,
            board: gameState.board,
            cellIndex,
        };

        return this.http.post<MoveResponse>('/api/game/move', request).pipe(
            map(move => ({
                ...move,
                player1: gameState.player1,
                player2: gameState.player2,
            }))
        );
    }
}
