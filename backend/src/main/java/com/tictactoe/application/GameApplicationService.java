package com.tictactoe.application;

import com.tictactoe.domain.GameState;
import com.tictactoe.domain.InvalidPlayerSetupException;
import com.tictactoe.domain.Player;
import com.tictactoe.domain.Symbol;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class GameApplicationService {

    public GameState setupGame(String player1Name, String player2Name) {
        if (player1Name == null || player1Name.isBlank() || player2Name == null || player2Name.isBlank()) {
            throw new InvalidPlayerSetupException("Both player names are required");
        }

        Player player1 = new Player(player1Name.trim(), Symbol.X);
        Player player2 = new Player(player2Name.trim(), Symbol.O);
        List<String> board = Collections.nCopies(9, "");

        return new GameState(player1, player2, Symbol.X, board);
    }
}
