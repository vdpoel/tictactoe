export type Symbol = 'X' | 'O';

export interface PlayerState {
    name: string;
    symbol: Symbol;
}

export interface GameState {
    player1: PlayerState;
    player2: PlayerState;
    currentPlayer: Symbol | null;
    board: string[];
    winner: Symbol | null;
    draw: boolean;
    winningCells: number[];
}

export interface PlaceSymbolRequest {
    player1Name: string;
    player2Name: string;
    currentPlayer: Symbol | null;
    board: string[];
    cellIndex: number;
}
