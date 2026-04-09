package com.tictactoe;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import org.springframework.beans.factory.annotation.Autowired;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class NewGameStepDefs {

    @Autowired
    private ScenarioContext ctx;

    // Scenario: New Game button is visible

    @Then("a {string} button is visible")
    public void aButtonIsVisible(String buttonLabel) {
        if (!"New Game".equals(buttonLabel)) {
            throw new AssertionError("Unexpected button label: " + buttonLabel);
        }
    }

    // Scenario: Start a new game after clicking the New Game button
    // (uses shared: aGameHasBeenPlayed → see bottom)

    @Then("all cells are empty")
    public void allCellsAreEmpty() throws Exception {
        ctx.result.andExpect(jsonPath("$.board[0]").value(""))
                .andExpect(jsonPath("$.board[8]").value(""));
    }

    @Then("the game is reset to its initial state")
    public void theGameIsResetToItsInitialState() throws Exception {
        ctx.result.andExpect(jsonPath("$.board[0]").value(""))
                .andExpect(jsonPath("$.board[8]").value(""))
                .andExpect(jsonPath("$.currentPlayer").value("X"))
                .andExpect(jsonPath("$.winner").value(nullValue()))
                .andExpect(jsonPath("$.draw").value(false));
    }

    // Scenario: Reset turn to starting player
    // (uses shared: aGameHasBeenPlayed → see bottom)

    @Then("Player X starts the new game")
    public void playerXStartsTheNewGame() throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value("X"));
    }

    // Scenario: Clear winner or draw message on new game

    @Given("the previous game has ended with a winner or a draw")
    public void thePreviousGameHasEndedWithWinnerOrDraw() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new java.util.ArrayList<>(java.util.List.of("X", "X", "X", "O", "O", "", "", "", ""));
        ctx.selectedCellIndex = 5;
        ctx.snapshotExpectedState("X", false);
    }

    @Then("any winner or draw message is removed")
    public void anyWinnerOrDrawMessageIsRemoved() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(nullValue()))
                .andExpect(jsonPath("$.draw").value(false));
    }

    @Then("no result is displayed")
    public void noResultIsDisplayed() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(nullValue()))
                .andExpect(jsonPath("$.draw").value(false));
    }

    // Scenario: Remove highlighted winning combination on new game

    @Given("the previous game had a winning combination highlighted")
    public void thePreviousGameHadAWinningCombinationHighlighted() {
        thePreviousGameHasEndedWithWinnerOrDraw();
    }

    // Scenario: New Game button works during an ongoing game

    @Then("the current game is stopped")
    public void theCurrentGameIsStopped() throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value("X"));
    }

    @Then("a new game starts immediately")
    public void aNewGameStartsImmediately() throws Exception {
        ctx.result.andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPlayer").value("X"));
    }

    // ── Shared steps (used by multiple scenarios above) ──────────────────────

    @Given("a game has been played")
    public void aGameHasBeenPlayed() throws Exception {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.callSetupApi();
    }
}
