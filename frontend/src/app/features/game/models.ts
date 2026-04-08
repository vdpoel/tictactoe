export interface PlayerState {
    name: string;
    symbol: 'X' | 'O';
}

export interface GameState {
    player1: PlayerState;
    player2: PlayerState;
    currentPlayer: 'X' | 'O';
    board: string[];
}
