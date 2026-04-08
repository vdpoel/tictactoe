package com.tictactoe.application;

import com.tictactoe.domain.GameState;
import com.tictactoe.domain.InvalidPlayerSetupException;
import com.tictactoe.domain.Symbol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GameApplicationServiceTest {

    private GameApplicationService service;

    @BeforeEach
    void setUp() {
        service = new GameApplicationService();
    }

    @Test
    void setupGame_assignsSymbolXToPlayer1AndOToPlayer2() {
        GameState state = service.setupGame("Alice", "Bob");

        assertThat(state.player1().name()).isEqualTo("Alice");
        assertThat(state.player1().symbol()).isEqualTo(Symbol.X);
        assertThat(state.player2().name()).isEqualTo("Bob");
        assertThat(state.player2().symbol()).isEqualTo(Symbol.O);
    }

    @Test
    void setupGame_setsCurrentPlayerToX() {
        GameState state = service.setupGame("Alice", "Bob");

        assertThat(state.currentPlayer()).isEqualTo(Symbol.X);
    }

    @Test
    void setupGame_returnsEmptyBoard() {
        GameState state = service.setupGame("Alice", "Bob");

        assertThat(state.board()).hasSize(9);
        assertThat(state.board()).containsOnly("");
    }

    @Test
    void setupGame_throwsWhenPlayer1NameIsBlank() {
        assertThatThrownBy(() -> service.setupGame("", "Bob"))
                .isInstanceOf(InvalidPlayerSetupException.class)
                .hasMessage("Both player names are required");
    }

    @Test
    void setupGame_throwsWhenPlayer2NameIsBlank() {
        assertThatThrownBy(() -> service.setupGame("Alice", ""))
                .isInstanceOf(InvalidPlayerSetupException.class)
                .hasMessage("Both player names are required");
    }

    @Test
    void setupGame_throwsWhenPlayer1NameIsWhitespace() {
        assertThatThrownBy(() -> service.setupGame("  ", "Bob"))
                .isInstanceOf(InvalidPlayerSetupException.class);
    }

    @Test
    void setupGame_trimmsPlayerNames() {
        GameState state = service.setupGame("  Alice  ", "  Bob  ");

        assertThat(state.player1().name()).isEqualTo("Alice");
        assertThat(state.player2().name()).isEqualTo("Bob");
    }
}
