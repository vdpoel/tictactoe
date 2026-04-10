package com.tictactoe.web;

import com.tictactoe.domain.GameState;

import java.util.List;

public record MoveResponse(String currentPlayer, List<String> board, String winner, boolean draw,
                           List<Integer> winningCells) {

    public static MoveResponse from(GameState state) {
        return new MoveResponse(
                state.currentPlayer() == null ? null : state.currentPlayer().name(),
                state.board(),
                state.winner() == null ? null : state.winner().name(),
                state.draw(),
                state.winningCells()
        );
    }
}
