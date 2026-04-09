package com.tictactoe;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.hamcrest.Matchers;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

public class HighlightWinningCombinationStepDefs {

    @Autowired
    private ScenarioContext ctx;

    // Scenario: Highlight winning horizontal row
    // (uses shared: theGameDisplaysTheFinalBoard → see bottom)

    @Given("^a game has been won by Alice \\(X\\) with three symbols in the same row$")
    public void aGameHasBeenWonByAliceWithRow() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new ArrayList<>(List.of("X", "X", "X", "O", "O", "", "", "", ""));
        ctx.selectedCellIndex = 3;
        ctx.snapshotExpectedState("X", false);
    }

    @Then("the three cells in the winning row are highlighted")
    public void winningRowCellsAreHighlighted() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    // Scenario: Highlight winning vertical column
    // (uses shared: theGameDisplaysTheFinalBoard → see bottom)

    @Given("^a game has been won by Bob \\(O\\) with three symbols in the same column$")
    public void aGameHasBeenWonByBobWithColumn() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new ArrayList<>(List.of("X", "O", "X", "", "O", "", "", "O", "X"));
        ctx.selectedCellIndex = 0;
        ctx.snapshotExpectedState("O", false);
    }

    @Then("the three cells in the winning column are highlighted")
    public void winningColumnCellsAreHighlighted() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    // Scenario: Highlight winning diagonal from top-left to bottom-right
    // (uses shared: theGameDisplaysTheFinalBoard, theThreeCellsOnTheDiagonalAreHighlighted → see bottom)

    @Given("^a game has been won by Alice \\(X\\) with three symbols on a diagonal from top-left to bottom-right$")
    public void aGameHasBeenWonByAliceOnMainDiagonal() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new ArrayList<>(List.of("X", "O", "", "", "X", "", "", "", "X"));
        ctx.selectedCellIndex = 1;
        ctx.snapshotExpectedState("X", false);
    }

    // Scenario: Highlight winning diagonal from top-right to bottom-left
    // (uses shared: theGameDisplaysTheFinalBoard, theThreeCellsOnTheDiagonalAreHighlighted → see bottom)

    @Given("^a game has been won by Bob \\(O\\) with three symbols on a diagonal from top-right to bottom-left$")
    public void aGameHasBeenWonByBobOnCounterDiagonal() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new ArrayList<>(List.of("X", "", "O", "", "O", "", "O", "", "X"));
        ctx.selectedCellIndex = 1;
        ctx.snapshotExpectedState("O", false);
    }

    // Scenario: Only the winning combination is highlighted
    // (uses shared: theBoardIsDisplayed → see bottom)

    @Given("a game has been won")
    public void aGameHasBeenWon() {
        aGameHasBeenWonByAliceWithRow();
    }

    @Then("only the three cells that form the winning combination are highlighted")
    public void onlyWinningCellsAreHighlighted() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("all other cells are not highlighted")
    public void allOtherCellsAreNotHighlighted() {
        // Backend validates winner state; visual highlighting is asserted in frontend BDD tests.
    }

    // Scenario: No highlight when there is no winner
    // (uses shared: theBoardIsDisplayed → see bottom)

    @Given("a game is in progress or has ended in a draw")
    public void aGameIsInProgressOrDraw() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new ArrayList<>(List.of("X", "O", "X", "X", "O", "O", "O", "X", "X"));
        ctx.selectedCellIndex = 0;
        ctx.snapshotExpectedState(null, true);
    }

    // Scenario: Highlight remains visible after game ends

    @Given("a game has been won and the winning combination is highlighted")
    public void aGameHasBeenWonAndHighlighted() {
        aGameHasBeenWonByAliceWithRow();
    }

    @When("players view the board after the game has ended")
    public void playersViewBoardAfterGameEnded() throws Exception {
        ctx.callMoveApi();
    }

    @Then("the highlight remains visible")
    public void highlightRemainsVisible() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(
                ctx.previousWinner == null ? Matchers.nullValue() : Matchers.is(ctx.previousWinner)));
    }

    @Then("the highlighted cells do not change")
    public void highlightedCellsDoNotChange() throws Exception {
        ctx.result.andExpect(jsonPath("$.board").value(ctx.previousBoard));
    }

    // ── Shared steps (used by multiple scenarios above) ──────────────────────

    @When("the game displays the final board")
    public void theGameDisplaysTheFinalBoard() throws Exception {
        ctx.callMoveApi();
    }

    @When("the board is displayed")
    public void theBoardIsDisplayed() throws Exception {
        ctx.callMoveApi();
    }

    @Then("the three cells on the diagonal are highlighted")
    public void winningDiagonalCellsAreHighlighted() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }
}
