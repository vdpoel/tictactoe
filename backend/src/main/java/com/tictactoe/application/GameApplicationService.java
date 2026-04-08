package com.tictactoe.application;

import com.tictactoe.domain.GameState;
import com.tictactoe.domain.InvalidPlayerSetupException;
import com.tictactoe.domain.Player;
import com.tictactoe.domain.Symbol;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class GameApplicationService {

    private static final List<int[]> WINNING_LINES = List.of(
            new int[]{0, 1, 2},
            new int[]{3, 4, 5},
            new int[]{6, 7, 8},
            new int[]{0, 3, 6},
            new int[]{1, 4, 7},
            new int[]{2, 5, 8},
            new int[]{0, 4, 8},
            new int[]{2, 4, 6}
    );

    public GameState setupGame(String player1Name, String player2Name) {
        if (player1Name == null || player1Name.isBlank() || player2Name == null || player2Name.isBlank()) {
            throw new InvalidPlayerSetupException("Both player names are required");
        }

        Player player1 = new Player(player1Name.trim(), Symbol.X);
        Player player2 = new Player(player2Name.trim(), Symbol.O);
        List<String> board = Collections.nCopies(9, "");

        return new GameState(player1, player2, Symbol.X, board, null, false, List.of());
    }

    public GameState placeSymbol(GameState gameState, int cellIndex) {
        List<Integer> existingWinningCells = determineWinningCells(gameState.board());
        Symbol winner = winnerFromCells(gameState.board(), existingWinningCells);
        boolean draw = winner == null && isBoardFull(gameState.board());
        if (winner != null || draw || gameState.currentPlayer() == null) {
            return new GameState(
                    gameState.player1(),
                    gameState.player2(),
                    null,
                    gameState.board(),
                    winner,
                    draw,
                    existingWinningCells
            );
        }

        if (cellIndex < 0 || cellIndex >= gameState.board().size()) {
            return gameState;
        }

        if (!gameState.board().get(cellIndex).isBlank()) {
            return gameState;
        }

        List<String> updatedBoard = new ArrayList<>(gameState.board());
        updatedBoard.set(cellIndex, gameState.currentPlayer().name());

        List<Integer> updatedWinningCells = determineWinningCells(updatedBoard);
        Symbol updatedWinner = winnerFromCells(updatedBoard, updatedWinningCells);
        if (updatedWinner != null) {
            return new GameState(
                    gameState.player1(),
                    gameState.player2(),
                    null,
                    List.copyOf(updatedBoard),
                    updatedWinner,
                    false,
                    updatedWinningCells
            );
        }

        boolean updatedDraw = isBoardFull(updatedBoard);
        if (updatedDraw) {
                return new GameState(
                    gameState.player1(),
                    gameState.player2(),
                    null,
                    List.copyOf(updatedBoard),
                    null,
                    true,
                    List.of()
                );
        }

        return new GameState(
                gameState.player1(),
                gameState.player2(),
                switchPlayer(gameState.currentPlayer()),
                List.copyOf(updatedBoard),
                null,
                false,
                List.of()
        );
    }

    private Symbol switchPlayer(Symbol currentPlayer) {
        return currentPlayer == Symbol.X ? Symbol.O : Symbol.X;
    }

    private List<Integer> determineWinningCells(List<String> board) {
        for (int[] line : WINNING_LINES) {
            String first = board.get(line[0]);
            if (first.isBlank()) {
                continue;
            }

            if (first.equals(board.get(line[1])) && first.equals(board.get(line[2]))) {
                return List.of(line[0], line[1], line[2]);
            }
        }

        return List.of();
    }

    private Symbol winnerFromCells(List<String> board, List<Integer> winningCells) {
        if (winningCells.isEmpty()) {
            return null;
        }

        return Symbol.valueOf(board.get(winningCells.get(0)));
    }

    private boolean isBoardFull(List<String> board) {
        return board.stream().noneMatch(String::isBlank);
    }
}
