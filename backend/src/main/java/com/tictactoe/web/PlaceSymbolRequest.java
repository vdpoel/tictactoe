package com.tictactoe.web;

import com.tictactoe.domain.Symbol;

import java.util.List;

public record PlaceSymbolRequest(Symbol currentPlayer, List<String> board, int cellIndex) {
}