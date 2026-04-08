package com.tictactoe.web;

import com.tictactoe.domain.Symbol;

import java.util.List;

public record PlaceSymbolRequest(String player1Name, String player2Name, Symbol currentPlayer,
                                 List<String> board, int cellIndex) {
}