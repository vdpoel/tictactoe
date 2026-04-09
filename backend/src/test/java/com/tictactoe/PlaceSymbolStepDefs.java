package com.tictactoe;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class PlaceSymbolStepDefs {

    @Autowired
    private ScenarioContext ctx;

    // Scenario: Display Player X symbol after clicking an empty cell
    // (uses shared: theSelectedCellIsEmpty, playerXClicksOnTheCell → see bottom)

    @Then("the cell should immediately display an {string}")
    public void theCellShouldImmediatelyDisplay(String symbol) throws Exception {
        ctx.result.andExpect(jsonPath("$.board[%s]".formatted(ctx.selectedCellIndex)).value(symbol));
    }

    // Scenario: Display Player O symbol after clicking an empty cell
    // (uses shared: theSelectedCellIsEmpty, playerOClicksOnTheCell → see bottom)

    // Scenario: Prevent overwriting a filled cell

    @Given("a cell is already occupied")
    public void aCellIsAlreadyOccupied() {
        ctx.selectedCellIndex = 0;
        ctx.board.set(ctx.selectedCellIndex, "X");
        ctx.currentPlayer = "O";
    }

    @When("a player clicks on the occupied cell")
    public void aPlayerClicksOnTheOccupiedCell() throws Exception {
        ctx.callMoveApi();
    }

    @Then("the cell content should not change")
    public void theCellContentShouldNotChange() throws Exception {
        ctx.result.andExpect(jsonPath("$.board[%s]".formatted(ctx.selectedCellIndex)).value("X"));
    }

    // Scenario: Only one symbol appears per click
    // (uses shared: theSelectedCellIsEmpty, playerXClicksOnTheCell → see bottom)

    @Then("only one {string} should appear in that cell")
    public void onlyOneSymbolShouldAppearInThatCell(String symbol) throws Exception {
        ctx.result.andExpect(jsonPath("$.board[%s]".formatted(ctx.selectedCellIndex)).value(symbol));
    }

    // Scenario: No delay in symbol display
    // (uses shared: theSelectedCellIsEmpty, playerOClicksOnTheCell → see bottom)

    @Then("the symbol should appear without noticeable delay")
    public void theSymbolShouldAppearWithoutNoticeableDelay() throws Exception {
        ctx.result.andExpect(status().isOk());
    }

    // Scenario: No symbol appears after the game has ended

    @Given("the game has ended")
    public void theGameHasEnded() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = null;
        ctx.board = new ArrayList<>(List.of("X", "X", "X", "O", "O", "", "", "", ""));
        ctx.selectedCellIndex = 5;
    }

    @Then("no symbol should be added to the board")
    public void noSymbolShouldBeAddedToTheBoard() throws Exception {
        ctx.result.andExpect(jsonPath("$.board[5]").value(""));
    }

    // Scenario: Player cannot place a symbol on a cell occupied by X

    @Given("^it is Bob's turn \\(O\\) and a cell contains an X placed by Alice$")
    public void itIsBobTurnAndCellContainsXPlacedByAlice() {
        ctx.player1Name = "Alice";
        ctx.player2Name = "Bob";
        ctx.currentPlayer = "O";
        ctx.selectedCellIndex = 0;
        ctx.board = new ArrayList<>(List.of("X", "", "", "", "", "", "", "", ""));
    }

    @When("Bob clicks on that occupied cell")
    public void bobClicksOnThatOccupiedCell() throws Exception {
        ctx.callMoveApi();
    }

    @Then("no symbol is placed, the X remains in the cell and it stays Bob's turn")
    public void noSymbolIsPlacedAndItStaysBobTurn() throws Exception {
        ctx.result.andExpect(jsonPath("$.board[0]").value("X"))
                .andExpect(jsonPath("$.currentPlayer").value("O"));
    }

    // ── Shared steps (used by multiple scenarios above) ──────────────────────

    @Given("the selected cell is empty")
    public void theSelectedCellIsEmpty() {
        ctx.selectedCellIndex = 0;
        ctx.board.set(ctx.selectedCellIndex, "");
    }

    @When("Player X clicks on the cell")
    public void playerXClicksOnTheCell() throws Exception {
        ctx.currentPlayer = "X";
        ctx.callMoveApi();
    }

    @When("Player O clicks on the cell")
    public void playerOClicksOnTheCell() throws Exception {
        ctx.currentPlayer = "O";
        ctx.callMoveApi();
    }
}
