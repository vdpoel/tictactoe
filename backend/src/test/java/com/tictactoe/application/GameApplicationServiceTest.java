package com.tictactoe.application;

import com.tictactoe.domain.GameState;
import com.tictactoe.domain.InvalidPlayerSetupException;
import com.tictactoe.domain.Symbol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

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

    @Test
    void placeSymbol_placesXInSelectedEmptyCell() {
        GameState updatedState = service.placeSymbol(service.setupGame("Alice", "Bob"), 0);

        assertThat(updatedState.board()).containsExactly("X", "", "", "", "", "", "", "", "");
    }

    @Test
    void placeSymbol_placesOInSelectedEmptyCell() {
        GameState updatedState = service.placeSymbol(gameState(Symbol.O, List.of("X", "", "", "", "", "", "", "", "")), 1);

        assertThat(updatedState.board()).containsExactly("X", "O", "", "", "", "", "", "", "");
    }

    @Test
    void placeSymbol_switchesTurnAfterValidMove() {
        GameState updatedState = service.placeSymbol(service.setupGame("Alice", "Bob"), 4);

        assertThat(updatedState.currentPlayer()).isEqualTo(Symbol.O);
        assertThat(updatedState.winner()).isNull();
        assertThat(updatedState.draw()).isFalse();
    }

    @Test
    void placeSymbol_doesNotOverwriteFilledCellAndKeepsTurn() {
        GameState state = gameState(Symbol.O, List.of("X", "", "", "", "", "", "", "", ""));

        GameState updatedState = service.placeSymbol(state, 0);

        assertThat(updatedState.board()).isEqualTo(state.board());
        assertThat(updatedState.currentPlayer()).isEqualTo(Symbol.O);
    }

    @Test
    void placeSymbol_doesNothingWhenGameHasEnded() {
        GameState endedState = gameState(
                null,
                List.of("X", "X", "X", "O", "O", "", "", "", ""),
                Symbol.X,
                false
        );

        GameState updatedState = service.placeSymbol(endedState, 5);

        assertThat(updatedState.board()).isEqualTo(endedState.board());
        assertThat(updatedState.winner()).isEqualTo(Symbol.X);
        assertThat(updatedState.currentPlayer()).isNull();
    }

    @Test
    void placeSymbol_setsWinnerAndStopsTurnSwitching() {
        GameState state = gameState(Symbol.X, List.of("X", "X", "", "O", "O", "", "", "", ""));

        GameState updatedState = service.placeSymbol(state, 2);

        assertThat(updatedState.board()).containsExactly("X", "X", "X", "O", "O", "", "", "", "");
        assertThat(updatedState.winner()).isEqualTo(Symbol.X);
        assertThat(updatedState.currentPlayer()).isNull();
    }

    @Test
    void placeSymbol_setsDrawAndStopsTurnSwitching() {
        GameState state = gameState(Symbol.O, List.of("X", "O", "X", "X", "O", "O", "O", "X", ""));

        GameState updatedState = service.placeSymbol(state, 8);

        assertThat(updatedState.board()).containsExactly("X", "O", "X", "X", "O", "O", "O", "X", "O");
        assertThat(updatedState.draw()).isTrue();
        assertThat(updatedState.winner()).isNull();
        assertThat(updatedState.currentPlayer()).isNull();
    }

    private GameState gameState(Symbol currentPlayer, List<String> board) {
        return gameState(currentPlayer, board, null, false);
    }

    private GameState gameState(Symbol currentPlayer, List<String> board, Symbol winner, boolean draw) {
        return new GameState(
                new com.tictactoe.domain.Player("Alice", Symbol.X),
                new com.tictactoe.domain.Player("Bob", Symbol.O),
                currentPlayer,
                board,
                winner,
            draw,
            winner == null ? List.of() : List.of(0, 1, 2)
        );
    }
}
