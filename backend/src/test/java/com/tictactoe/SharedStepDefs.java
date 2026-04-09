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

public class SharedStepDefs {

    @Autowired
    private ScenarioContext ctx;

    // ── Given ───────────────────────────────────────────────────────────────

    @Given("a game is in progress")
    public void aGameIsInProgress() {
        if (ctx.player1Name.isBlank()) ctx.player1Name = "Alice";
        if (ctx.player2Name.isBlank()) ctx.player2Name = "Bob";
        ctx.currentPlayer = "X";
        ctx.board = new ArrayList<>(List.of("", "", "", "", "", "", "", "", ""));
    }

    @Given("it is Player X's turn")
    public void itIsPlayerXTurn() {
        ctx.currentPlayer = "X";
    }

    @Given("it is Player O's turn")
    public void itIsPlayerOTurn() {
        ctx.currentPlayer = "O";
    }

    // ── When ────────────────────────────────────────────────────────────────

    @When("the game board is displayed")
    public void theGameBoardIsDisplayed() throws Exception {
        ctx.callSetupApi();
    }

    @When("the players look at the game screen")
    public void thePlayersLookAtTheGameScreen() throws Exception {
        ctx.callSetupApi();
    }

    @When("the player looks at the interface")
    public void thePlayerLooksAtTheInterface() {
        // UI-specific assertion is covered in frontend tests.
    }

    @When("the player clicks the {string} button")
    public void thePlayerClicksButton(String buttonName) throws Exception {
        // "New Game" restarts with the same players
        ctx.callSetupApi();
    }

    @When("a player clicks on any cell")
    public void aPlayerClicksOnAnyCell() throws Exception {
        ctx.callMoveApi();
    }

    @When("a player places a symbol")
    public void aPlayerPlacesASymbol() throws Exception {
        ctx.callMoveApi();
    }

    // ── Then ────────────────────────────────────────────────────────────────

    @Then("the board is cleared")
    public void theBoardIsCleared() throws Exception {
        ctx.result.andExpect(jsonPath("$.board").isArray())
                .andExpect(jsonPath("$.board[0]").value(""))
                .andExpect(jsonPath("$.board[8]").value(""));
    }

    @Then("the game ends")
    public void theGameEnds() throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value(nullValue()));
    }

    @Then("no symbol is placed")
    public void noSymbolIsPlaced() throws Exception {
        ctx.result.andExpect(jsonPath("$.board").value(ctx.previousBoard));
    }

    @Then("the game state does not change")
    public void theGameStateDoesNotChange() throws Exception {
        ctx.result.andExpect(jsonPath("$.board").value(ctx.previousBoard))
                .andExpect(jsonPath("$.currentPlayer").value(ctx.previousCurrentPlayer == null ? nullValue() : Matchers.is(ctx.previousCurrentPlayer)))
                .andExpect(jsonPath("$.winner").value(ctx.previousWinner == null ? nullValue() : Matchers.is(ctx.previousWinner)))
                .andExpect(jsonPath("$.draw").value(ctx.previousDraw));
    }

    @Then("the game continues")
    public void theGameContinues() throws Exception {
        ctx.result.andExpect(jsonPath("$.draw").value(false))
                .andExpect(jsonPath("$.currentPlayer").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("no cells are highlighted")
    public void noCellsAreHighlighted() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(nullValue()));
    }
}
