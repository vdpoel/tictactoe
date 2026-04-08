import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameState } from './models';

@Injectable({ providedIn: 'root' })
export class GameService {
    private readonly http = inject(HttpClient);

    setupGame(player1Name: string, player2Name: string): Observable<GameState> {
        return this.http.post<GameState>('/api/game', { player1Name, player2Name });
    }
}
