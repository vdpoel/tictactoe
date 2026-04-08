package com.tictactoe.domain;

import java.util.List;

public record GameState(Player player1, Player player2, Symbol currentPlayer, List<String> board,
						Symbol winner, boolean draw, List<Integer> winningCells) {
}
