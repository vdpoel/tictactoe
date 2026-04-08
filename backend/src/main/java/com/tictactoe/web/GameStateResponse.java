package com.tictactoe.web;

import com.tictactoe.domain.GameState;

import java.util.List;

public record GameStateResponse(PlayerResponse player1, PlayerResponse player2, String currentPlayer,
                                List<String> board) {

    public static GameStateResponse from(GameState gameState) {
        return new GameStateResponse(
                PlayerResponse.from(gameState.player1()),
                PlayerResponse.from(gameState.player2()),
                gameState.currentPlayer().name(),
                gameState.board()
        );
    }
}
