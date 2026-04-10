package com.tictactoe.web;

import com.tictactoe.application.GameApplicationService;
import com.tictactoe.domain.GameState;
import com.tictactoe.domain.Player;
import com.tictactoe.domain.Symbol;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/game")
public class GameController {

    private final GameApplicationService gameApplicationService;

    public GameController(GameApplicationService gameApplicationService) {
        this.gameApplicationService = gameApplicationService;
    }

    @PostMapping
    public ResponseEntity<GameStateResponse> setupGame(@RequestBody SetupGameRequest request) {
        GameState gameState = gameApplicationService.setupGame(request.player1Name(), request.player2Name());
        return ResponseEntity.ok(GameStateResponse.from(gameState));
    }

    @PostMapping("/move")
    public ResponseEntity<MoveResponse> placeSymbol(@RequestBody PlaceSymbolRequest request) {
        GameState gameState = new GameState(
                new Player("X", Symbol.X),
                new Player("O", Symbol.O),
                request.currentPlayer(),
                request.board(),
                null,
                false,
                List.of()
        );

        GameState updatedState = gameApplicationService.placeSymbol(gameState, request.cellIndex());
        return ResponseEntity.ok(MoveResponse.from(updatedState));
    }
}
