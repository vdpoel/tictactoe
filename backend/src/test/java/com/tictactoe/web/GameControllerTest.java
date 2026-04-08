package com.tictactoe.web;

import com.tictactoe.application.GameApplicationService;
import com.tictactoe.domain.GameState;
import com.tictactoe.domain.InvalidPlayerSetupException;
import com.tictactoe.domain.Player;
import com.tictactoe.domain.Symbol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GameControllerTest {

    @Mock
    private GameApplicationService gameApplicationService;

    @InjectMocks
    private GameController gameController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(gameController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void setupGame_returns200WithGameState() throws Exception {
        GameState state = new GameState(
                new Player("Alice", Symbol.X),
                new Player("Bob", Symbol.O),
                Symbol.X,
                Collections.nCopies(9, "")
        );
        when(gameApplicationService.setupGame("Alice", "Bob")).thenReturn(state);

        mockMvc.perform(post("/api/game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "player1Name": "Alice", "player2Name": "Bob" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.player1.name").value("Alice"))
                .andExpect(jsonPath("$.player1.symbol").value("X"))
                .andExpect(jsonPath("$.player2.name").value("Bob"))
                .andExpect(jsonPath("$.player2.symbol").value("O"))
                .andExpect(jsonPath("$.currentPlayer").value("X"))
                .andExpect(jsonPath("$.board").isArray());
    }

    @Test
    void setupGame_returns400WhenNamesAreInvalid() throws Exception {
        when(gameApplicationService.setupGame("", "Bob"))
                .thenThrow(new InvalidPlayerSetupException("Both player names are required"));

        mockMvc.perform(post("/api/game")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "player1Name": "", "player2Name": "Bob" }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Both player names are required"));
    }
}
