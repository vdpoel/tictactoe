package com.tictactoe;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.hamcrest.Matchers;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

public class TurnDisplayStepDefs {

    @Autowired
    private ScenarioContext ctx;

    // Scenario: Show Player X turn at the start of a new game
    // (uses shared: theScreenShouldShowThatItIsPlayerXTurn → see bottom)

    @Given("a new Tic Tac Toe game has started")
    public void aNewGameHasStarted() throws Exception {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.callSetupApi();
    }

    // Scenario: Switch turn display after Player X makes a move
    // (uses shared: theScreenShouldShowThatItIsPlayerXTurn → see bottom)

    @When("Player X places a mark on an empty cell")
    public void playerXPlacesAMarkOnAnEmptyCell() throws Exception {
        ctx.currentPlayer = "X";
        ctx.callMoveApi();
    }

    @Then("the screen should show that it is Player O's turn")
    public void theScreenShouldShowThatItIsPlayerOTurn() throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value("O"));
    }

    // Scenario: Switch turn display after Player O makes a move
    // (uses shared: theScreenShouldShowThatItIsPlayerXTurn → see bottom)

    @When("Player O places a mark on an empty cell")
    public void playerOPlacesAMarkOnAnEmptyCell() throws Exception {
        ctx.currentPlayer = "O";
        ctx.callMoveApi();
    }

    // Scenario: Keep current turn visible during the game

    @Then("the current player's turn should be visible")
    public void theCurrentPlayersTurnShouldBeVisible() throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value(
                Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    // Scenario: Do not show the next turn after the game is won

    @When("Player X places a mark on an empty cell and wins the game")
    public void playerXPlacesAMarkOnAnEmptyCellAndWinsTheGame() throws Exception {
        ctx.currentPlayer = "X";
        ctx.board = new ArrayList<>(List.of("X", "X", "", "O", "O", "", "", "", ""));
        ctx.selectedCellIndex = 2;
        ctx.callMoveApi();
    }

    @Then("the screen should show that Player X has won")
    public void theScreenShouldShowThatPlayerXHasWon() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value("X"));
    }

    @Then("the screen should not show that it is Player O's turn")
    public void theScreenShouldNotShowThatItIsPlayerOTurn() throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value(nullValue()));
    }

    // Scenario: Do not show the next turn after the game ends in a draw

    @When("Player O places a mark on the last empty cell")
    public void playerOPlacesAMarkOnTheLastEmptyCell() throws Exception {
        ctx.currentPlayer = "O";
        ctx.board = new ArrayList<>(List.of("X", "O", "X", "X", "O", "O", "O", "X", ""));
        ctx.selectedCellIndex = 8;
        ctx.callMoveApi();
    }

    @When("the game ends in a draw")
    public void theGameEndsInADraw() {
        // asserted by the subsequent Then steps using the move response
    }

    @Then("the screen should show that the game is a draw")
    public void theScreenShouldShowThatTheGameIsADraw() throws Exception {
        ctx.result.andExpect(jsonPath("$.draw").value(true));
    }

    @Then("the screen should not show that it is Player X's turn")
    public void theScreenShouldNotShowThatItIsPlayerXTurn() throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value(nullValue()));
    }

    // ── Shared steps (used by multiple scenarios above) ──────────────────────

    @Then("the screen should show that it is Player X's turn")
    public void theScreenShouldShowThatItIsPlayerXTurn() throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value("X"));
    }
}
