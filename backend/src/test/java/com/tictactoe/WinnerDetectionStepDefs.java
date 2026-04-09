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

public class WinnerDetectionStepDefs {

    @Autowired
    private ScenarioContext ctx;

    // Scenario: Player wins with a horizontal row
    // (uses shared: aGameIsInProgressAndItIsAlicesTurn, theGameDetectsWinningCondition,
    //               theGameAnnouncesAliceWon, theGameEnds → see bottom)

    @Given("Alice has already placed two X symbols in the same row")
    public void aliceHasTwoXInSameRow() {
        ctx.board = new ArrayList<>(List.of("X", "X", "", "O", "", "", "", "", ""));
        ctx.selectedCellIndex = 2;
    }

    @When("Alice places a third X in that row")
    public void alicePlacesThirdXInThatRow() throws Exception {
        ctx.currentPlayer = "X";
        ctx.selectedCellIndex = 2;
        ctx.callMoveApi();
    }

    // Scenario: Player wins with a vertical column
    // (uses shared: aGameIsInProgressAndItIsBobsTurn, theGameDetectsWinningCondition,
    //               theGameAnnouncesBobWon, theGameEnds → see bottom)

    @Given("Bob has already placed two O symbols in the same column")
    public void bobHasTwoOInSameColumn() {
        ctx.board = new ArrayList<>(List.of("X", "O", "X", "", "O", "", "", "", ""));
        ctx.selectedCellIndex = 7;
    }

    @When("Bob places a third O in that column")
    public void bobPlacesThirdOInThatColumn() throws Exception {
        ctx.currentPlayer = "O";
        ctx.selectedCellIndex = 7;
        ctx.callMoveApi();
    }

    // Scenario: Player wins with a diagonal from top-left to bottom-right
    // (uses shared: aGameIsInProgressAndItIsAlicesTurn, theGameDetectsWinningCondition,
    //               theGameAnnouncesAliceWon, theGameEnds → see bottom)

    @Given("Alice has already placed two X symbols diagonally from top-left to bottom-right")
    public void aliceHasTwoXOnMainDiagonal() {
        ctx.board = new ArrayList<>(List.of("X", "O", "", "", "X", "", "", "", ""));
        ctx.selectedCellIndex = 8;
    }

    @When("Alice places a third X on that diagonal")
    public void alicePlacesThirdXOnThatDiagonal() throws Exception {
        ctx.currentPlayer = "X";
        ctx.selectedCellIndex = 8;
        ctx.callMoveApi();
    }

    // Scenario: Player wins with a diagonal from top-right to bottom-left
    // (uses shared: aGameIsInProgressAndItIsBobsTurn, theGameDetectsWinningCondition,
    //               theGameAnnouncesBobWon, theGameEnds → see bottom)

    @Given("Bob has already placed two O symbols diagonally from top-right to bottom-left")
    public void bobHasTwoOOnCounterDiagonal() {
        ctx.board = new ArrayList<>(List.of("X", "", "O", "", "O", "", "", "", "X"));
        ctx.selectedCellIndex = 6;
    }

    @When("Bob places a third O on that diagonal")
    public void bobPlacesThirdOOnThatDiagonal() throws Exception {
        ctx.currentPlayer = "O";
        ctx.selectedCellIndex = 6;
        ctx.callMoveApi();
    }

    // Scenario: No false positive winner detection
    // (uses shared: theGameContinues → SharedStepDefs)

    @Given("no player has three symbols aligned in a row, column, or diagonal")
    public void noPlayerHasThreeAlignedInAnyDirection() {
        ctx.board = new ArrayList<>(List.of("X", "O", "X", "", "O", "", "", "", ""));
        ctx.currentPlayer = "X";
        ctx.selectedCellIndex = 3;
    }

    @Then("the game does not announce a winner")
    public void theGameDoesNotAnnounceAWinner() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(nullValue()));
    }

    // Scenario: Game stops accepting moves after a winner is announced
    // (uses shared: noSymbolIsPlaced, theGameStateDoesNotChange → SharedStepDefs)

    @Given("the game has ended and Alice has been announced as the winner")
    public void theGameHasEndedAndAliceWon() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new ArrayList<>(List.of("X", "X", "X", "O", "O", "", "", "", ""));
        ctx.selectedCellIndex = 5;
        ctx.snapshotExpectedState("X", false);
    }

    // ── Shared steps (used by multiple scenarios above) ──────────────────────

    @Given("^a game is in progress and it is Alice's turn \\(X\\)$")
    public void aGameIsInProgressAndItIsAlicesTurn() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = "X";
        ctx.board = new ArrayList<>(List.of("", "", "", "", "", "", "", "", ""));
    }

    @Given("^a game is in progress and it is Bob's turn \\(O\\)$")
    public void aGameIsInProgressAndItIsBobsTurn() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = "O";
        ctx.board = new ArrayList<>(List.of("", "", "", "", "", "", "", "", ""));
    }

    @Then("the game detects a winning condition")
    public void theGameDetectsWinningCondition() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("the game announces that Alice has won")
    public void theGameAnnouncesAliceWon() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value("X"));
    }

    @Then("the game announces that Bob has won")
    public void theGameAnnouncesBobWon() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value("O"));
    }
}
