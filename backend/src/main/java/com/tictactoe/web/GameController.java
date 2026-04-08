package com.tictactoe.web;

import com.tictactoe.application.GameApplicationService;
import com.tictactoe.domain.GameState;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
