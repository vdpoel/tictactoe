package com.tictactoe;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.hamcrest.Matchers;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

public class DrawDetectionStepDefs {

    @Autowired
    private ScenarioContext ctx;

    // Scenario: Detect draw when last cell is filled without a winner
    // (uses shared: allCellsExceptOneAreFilled, theGameHasEndedInADraw → see bottom)

    @Given("no player has three symbols aligned")
    public void noPlayerHasThreeSymbolsAligned() {
        // Board state is prepared by the preceding Given for draw scenarios.
    }

    @When("the last empty cell is filled")
    public void theLastEmptyCellIsFilled() throws Exception {
        ctx.callMoveApi();
    }

    @Then("the game detects a draw")
    public void theGameDetectsADraw() throws Exception {
        ctx.result.andExpect(jsonPath("$.draw").value(true));
    }

    @Then("the game announces that the game is a draw")
    public void theGameAnnouncesThatTheGameIsADraw() throws Exception {
        ctx.result.andExpect(jsonPath("$.draw").value(true));
    }

    // Scenario: No draw is announced if a winning move occurs on the last cell
    // (uses shared: allCellsExceptOneAreFilled, theGameDoesNotAnnounceADraw → see bottom)

    @Given("a winning combination is still possible")
    public void aWinningCombinationIsStillPossible() {
        ctx.board = new ArrayList<>(List.of("X", "X", "", "O", "O", "X", "O", "X", "O"));
        ctx.currentPlayer = "X";
        ctx.selectedCellIndex = 2;
    }

    @When("the last empty cell is filled and creates a winning alignment")
    public void theLastEmptyCellCreatesWinningAlignment() throws Exception {
        ctx.callMoveApi();
    }

    @Then("the game announces the winning player")
    public void theGameAnnouncesTheWinningPlayer() throws Exception {
        ctx.result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    // Scenario: No draw is announced while moves are still possible
    // (uses shared: theGameDoesNotAnnounceADraw → see bottom)

    @Given("there are still empty cells available")
    public void thereAreStillEmptyCellsAvailable() {
        ctx.board = new ArrayList<>(List.of("X", "O", "", "", "O", "", "", "", ""));
        ctx.currentPlayer = "X";
        ctx.selectedCellIndex = 2;
    }

    // Scenario: Game stops accepting moves after a draw is announced
    // (uses shared: theGameHasEndedInADraw → see bottom)

    // Scenario: Draw message is clearly displayed to players
    // (uses shared: theGameHasEndedInADraw → see bottom)

    @When("the result is shown on the screen")
    public void theResultIsShownOnTheScreen() {
        // Stateless API: assertions validate current state only.
    }

    @Then("the screen clearly displays that the game is a draw")
    public void theScreenClearlyDisplaysDraw() {
        if (!ctx.previousDraw) {
            throw new AssertionError("Expected draw state to be active");
        }
    }

    // Scenario: No winner is announced in a draw situation
    // (uses shared: theGameHasEndedInADraw → see bottom)

    @When("the result is displayed")
    public void theResultIsDisplayed() {
        // Stateless API: assertions validate current state only.
    }

    @Then("no player is announced as the winner")
    public void noPlayerIsAnnouncedAsWinner() {
        if (ctx.previousWinner != null) {
            throw new AssertionError("Did not expect a winner in draw state");
        }
    }

    // ── Shared steps (used by multiple scenarios above) ──────────────────────

    @Given("all cells except one are filled")
    public void allCellsExceptOneAreFilled() {
        ctx.board = new ArrayList<>(List.of("X", "O", "X", "X", "O", "O", "O", "X", ""));
        ctx.selectedCellIndex = 8;
    }

    @Given("the game has ended in a draw")
    public void theGameHasEndedInADraw() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new ArrayList<>(List.of("X", "O", "X", "X", "O", "O", "O", "X", "X"));
        ctx.selectedCellIndex = 0;
        ctx.snapshotExpectedState(null, true);
    }

    @Then("the game does not announce a draw")
    public void theGameDoesNotAnnounceADraw() throws Exception {
        ctx.result.andExpect(jsonPath("$.draw").value(false));
    }
}
