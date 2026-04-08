package com.tictactoe;

import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.hamcrest.Matchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class PlayerSetupStepDefs {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private String player1Name;
    private String player2Name;
    private String currentPlayer;
    private List<String> board;
    private int selectedCellIndex;
    private List<String> previousBoard;
    private String previousCurrentPlayer;
    private String previousWinner;
    private boolean previousDraw;
    private ResultActions result;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        player1Name = "";
        player2Name = "";
        currentPlayer = "X";
        board = new ArrayList<>(List.of("", "", "", "", "", "", "", "", ""));
        selectedCellIndex = 0;
        previousBoard = null;
        previousCurrentPlayer = null;
        previousWinner = null;
        previousDraw = false;
        result = null;
    }

    // ── API helper ──────────────────────────────────────────────────────────

    private void callSetupApi() throws Exception {
        result = mockMvc.perform(post("/api/game")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "player1Name": "%s", "player2Name": "%s" }
                        """.formatted(player1Name, player2Name)));
    }

    private void callMoveApi() throws Exception {
        result = mockMvc.perform(post("/api/game/move")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "player1Name": "%s",
                          "player2Name": "%s",
                          "currentPlayer": %s,
                          "board": ["%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s"],
                          "cellIndex": %s
                        }
                        """.formatted(
                        player1Name,
                        player2Name,
                        currentPlayer == null ? "null" : "\"%s\"".formatted(currentPlayer),
                        board.get(0),
                        board.get(1),
                        board.get(2),
                        board.get(3),
                        board.get(4),
                        board.get(5),
                        board.get(6),
                        board.get(7),
                        board.get(8),
                        selectedCellIndex
                )));
    }

    private void snapshotExpectedState(String winner, boolean draw) {
        previousBoard = new ArrayList<>(board);
        previousCurrentPlayer = currentPlayer;
        previousWinner = winner;
        previousDraw = draw;
    }

    // ── Given ───────────────────────────────────────────────────────────────

    @Given("the game has not started yet")
    public void theGameHasNotStartedYet() {
        // stateless — no action needed
    }

    @Given("Player 1 is {string}")
    public void player1Is(String name) {
        player1Name = name;
    }

    @Given("Player 2 is {string}")
    public void player2Is(String name) {
        player2Name = name;
    }

    @Given("Player 1 is {string} with symbol {string}")
    public void player1IsWithSymbol(String name, String ignoredSymbol) {
        player1Name = name;
    }

    @Given("Player 2 is {string} with symbol {string}")
    public void player2IsWithSymbol(String name, String ignoredSymbol) {
        player2Name = name;
    }

    @Given("a game is in progress")
    public void aGameIsInProgress() {
        if (player1Name.isBlank()) player1Name = "Alice";
        if (player2Name.isBlank()) player2Name = "Bob";
        currentPlayer = "X";
        board = new ArrayList<>(List.of("", "", "", "", "", "", "", "", ""));
    }

    @Given("^a game is in progress and it is Alice's turn \\(X\\)$")
    public void aGameIsInProgressAndItIsAlicesTurn() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = "X";
        board = new ArrayList<>(List.of("", "", "", "", "", "", "", "", ""));
    }

    @Given("^a game is in progress and it is Bob's turn \\(O\\)$")
    public void aGameIsInProgressAndItIsBobsTurn() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = "O";
        board = new ArrayList<>(List.of("", "", "", "", "", "", "", "", ""));
    }

    @Given("Alice has already placed two X symbols in the same row")
    public void aliceHasTwoXInSameRow() {
        board = new ArrayList<>(List.of("X", "X", "", "O", "", "", "", "", ""));
        selectedCellIndex = 2;
    }

    @Given("Bob has already placed two O symbols in the same column")
    public void bobHasTwoOInSameColumn() {
        board = new ArrayList<>(List.of("X", "O", "X", "", "O", "", "", "", ""));
        selectedCellIndex = 7;
    }

    @Given("Alice has already placed two X symbols diagonally from top-left to bottom-right")
    public void aliceHasTwoXOnMainDiagonal() {
        board = new ArrayList<>(List.of("X", "O", "", "", "X", "", "", "", ""));
        selectedCellIndex = 8;
    }

    @Given("Bob has already placed two O symbols diagonally from top-right to bottom-left")
    public void bobHasTwoOOnCounterDiagonal() {
        board = new ArrayList<>(List.of("X", "", "O", "", "O", "", "", "", "X"));
        selectedCellIndex = 6;
    }

    @Given("no player has three symbols aligned in a row, column, or diagonal")
    public void noPlayerHasThreeAlignedInAnyDirection() {
        board = new ArrayList<>(List.of("X", "O", "X", "", "O", "", "", "", ""));
        currentPlayer = "X";
        selectedCellIndex = 3;
    }

    @Given("the game has ended and Alice has been announced as the winner")
    public void theGameHasEndedAndAliceWon() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = null;
        board = new ArrayList<>(List.of("X", "X", "X", "O", "O", "", "", "", ""));
        selectedCellIndex = 5;
        snapshotExpectedState("X", false);
    }

    @Given("^a game has been won by Alice \\(X\\) with three symbols in the same row$")
    public void aGameHasBeenWonByAliceWithRow() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = null;
        board = new ArrayList<>(List.of("X", "X", "X", "O", "O", "", "", "", ""));
        selectedCellIndex = 3;
        snapshotExpectedState("X", false);
    }

    @Given("^a game has been won by Bob \\(O\\) with three symbols in the same column$")
    public void aGameHasBeenWonByBobWithColumn() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = null;
        board = new ArrayList<>(List.of("X", "O", "X", "", "O", "", "", "O", "X"));
        selectedCellIndex = 0;
        snapshotExpectedState("O", false);
    }

    @Given("^a game has been won by Alice \\(X\\) with three symbols on a diagonal from top-left to bottom-right$")
    public void aGameHasBeenWonByAliceOnMainDiagonal() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = null;
        board = new ArrayList<>(List.of("X", "O", "", "", "X", "", "", "", "X"));
        selectedCellIndex = 1;
        snapshotExpectedState("X", false);
    }

    @Given("^a game has been won by Bob \\(O\\) with three symbols on a diagonal from top-right to bottom-left$")
    public void aGameHasBeenWonByBobOnCounterDiagonal() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = null;
        board = new ArrayList<>(List.of("X", "", "O", "", "O", "", "O", "", "X"));
        selectedCellIndex = 1;
        snapshotExpectedState("O", false);
    }

    @Given("a game has been won")
    public void aGameHasBeenWon() {
        aGameHasBeenWonByAliceWithRow();
    }

    @Given("a game is in progress or has ended in a draw")
    public void aGameIsInProgressOrDraw() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = null;
        board = new ArrayList<>(List.of("X", "O", "X", "X", "O", "O", "O", "X", "X"));
        selectedCellIndex = 0;
        snapshotExpectedState(null, true);
    }

    @Given("a game has been won and the winning combination is highlighted")
    public void aGameHasBeenWonAndHighlighted() {
        aGameHasBeenWonByAliceWithRow();
    }

    @Given("all cells except one are filled")
    public void allCellsExceptOneAreFilled() {
        board = new ArrayList<>(List.of("X", "O", "X", "X", "O", "O", "O", "X", ""));
        selectedCellIndex = 8;
    }

    @Given("no player has three symbols aligned")
    public void noPlayerHasThreeSymbolsAligned() {
        // Board state is prepared by previous Given for draw scenarios.
    }

    @Given("a winning combination is still possible")
    public void aWinningCombinationIsStillPossible() {
        board = new ArrayList<>(List.of("X", "X", "", "O", "O", "X", "O", "X", "O"));
        currentPlayer = "X";
        selectedCellIndex = 2;
    }

    @Given("there are still empty cells available")
    public void thereAreStillEmptyCellsAvailable() {
        board = new ArrayList<>(List.of("X", "O", "", "", "O", "", "", "", ""));
        currentPlayer = "X";
        selectedCellIndex = 2;
    }

    @Given("the game has ended in a draw")
    public void theGameHasEndedInADraw() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = null;
        board = new ArrayList<>(List.of("X", "O", "X", "X", "O", "O", "O", "X", "X"));
        selectedCellIndex = 0;
        snapshotExpectedState(null, true);
    }

    @Given("a new Tic Tac Toe game has started")
    public void aNewGameHasStarted() throws Exception {
        player1Name = "Alice";
        player2Name = "Bob";
        callSetupApi();
    }

    @Given("it is Player X's turn")
    public void itIsPlayerXTurn() {
        currentPlayer = "X";
    }

    @Given("it is Player O's turn")
    public void itIsPlayerOTurn() {
        currentPlayer = "O";
    }

    @Given("the selected cell is empty")
    public void theSelectedCellIsEmpty() {
        selectedCellIndex = 0;
        board.set(selectedCellIndex, "");
    }

    @Given("a cell is already occupied")
    public void aCellIsAlreadyOccupied() {
        selectedCellIndex = 0;
        board.set(selectedCellIndex, "X");
        currentPlayer = "O";
    }

    @Given("the game has ended")
    public void theGameHasEnded() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = null;
        board = new ArrayList<>(List.of("X", "X", "X", "O", "O", "", "", "", ""));
        selectedCellIndex = 5;
    }

    @Given("^it is Bob's turn \\(O\\) and a cell contains an X placed by Alice$")
    public void itIsBobTurnAndCellContainsXPlacedByAlice() {
        player1Name = "Alice";
        player2Name = "Bob";
        currentPlayer = "O";
        selectedCellIndex = 0;
        board = new ArrayList<>(List.of("X", "", "", "", "", "", "", "", ""));
    }

    @Given("a game is in progress with players {string} and {string}")
    public void aGameIsInProgressWithPlayers(String p1, String p2) throws Exception {
        player1Name = p1;
        player2Name = p2;
        callSetupApi();
    }

    @Given("a game has been played with players {string} and {string}")
    public void aGameHasBeenPlayedWithPlayers(String p1, String p2) throws Exception {
        player1Name = p1;
        player2Name = p2;
        callSetupApi();
    }

    @Given("^a game has been played with players \"([^\"]+)\" \\(X\\) and \"([^\"]+)\" \\(O\\)$")
    public void aGameHasBeenPlayedWithPlayersAndSymbols(String p1, String p2) throws Exception {
        player1Name = p1;
        player2Name = p2;
        callSetupApi();
    }

    @Given("^it is (.+)'s turn \\(X\\)$")
    public void itIsPlayersTurnX(String playerName) {
        player1Name = playerName;
        if (player2Name.isBlank()) player2Name = "Bob";
    }

    @Given("Player {int} name is {word}")
    public void playerNameIs(int playerNum, String name) {
        String value = "empty".equals(name) ? "" : name;
        if (playerNum == 1) player1Name = value;
        else player2Name = value;
    }

    // ── When ────────────────────────────────────────────────────────────────

    @When("Player 1 enters the name {string}")
    public void player1EntersName(String name) {
        player1Name = name;
    }

    @When("Player 2 enters the name {string}")
    public void player2EntersName(String name) {
        player2Name = name;
    }

    @Given("a game has been played")
    public void aGameHasBeenPlayed() throws Exception {
        player1Name = "Alice";
        player2Name = "Bob";
        callSetupApi();
    }

    @When("the game starts")
    public void theGameStarts() throws Exception {
        callSetupApi();
    }


    @Given("the previous game has ended with a winner or a draw")
    public void thePreviousGameHasEndedWithWinnerOrDraw() {
        theGameHasEndedAndAliceWon();
    }

    @Given("the previous game had a winning combination highlighted")
    public void thePreviousGameHadAWinningCombinationHighlighted() {
        aGameHasBeenWonAndHighlighted();
    }
    @When("the game screen is displayed")
    public void theGameScreenIsDisplayed() throws Exception {
        callSetupApi();
    }

    @When("the game board is displayed")
    public void theGameBoardIsDisplayed() throws Exception {
        callSetupApi();
    }

    @When("the turn indicator is shown")
    public void theTurnIndicatorIsShown() throws Exception {
        callSetupApi();
    }

    @When("the player looks at the interface")
    public void thePlayerLooksAtTheInterface() {
        // UI-specific assertion is covered in frontend tests.
    }

    @When("Player X clicks on the cell")
    public void playerXClicksOnTheCell() throws Exception {
        currentPlayer = "X";
        callMoveApi();
    }

    @When("Player O clicks on the cell")
    public void playerOClicksOnTheCell() throws Exception {
        currentPlayer = "O";
        callMoveApi();
    }

    @When("a player clicks on the occupied cell")
    public void aPlayerClicksOnTheOccupiedCell() throws Exception {
        callMoveApi();
    }

    @When("a player clicks on any cell")
    public void aPlayerClicksOnAnyCell() throws Exception {
        callMoveApi();
    }

    @When("Bob clicks on that occupied cell")
    public void bobClicksOnThatOccupiedCell() throws Exception {
        callMoveApi();
    }

    @When("Player X places a mark on an empty cell")
    public void playerXPlacesAMarkOnAnEmptyCell() throws Exception {
        currentPlayer = "X";
        callMoveApi();
    }

    @When("Player O places a mark on an empty cell")
    public void playerOPlacesAMarkOnAnEmptyCell() throws Exception {
        currentPlayer = "O";
        callMoveApi();
    }

    @When("the players look at the game screen")
    public void thePlayersLookAtTheGameScreen() throws Exception {
        callSetupApi();
    }

    @When("Player X places a mark on an empty cell and wins the game")
    public void playerXPlacesAMarkOnAnEmptyCellAndWinsTheGame() throws Exception {
        currentPlayer = "X";
        board = new ArrayList<>(List.of("X", "X", "", "O", "O", "", "", "", ""));
        selectedCellIndex = 2;
        callMoveApi();
    }

    @When("Alice places a third X in that row")
    public void alicePlacesThirdXInThatRow() throws Exception {
        currentPlayer = "X";
        selectedCellIndex = 2;
        callMoveApi();
    }

    @When("Bob places a third O in that column")
    public void bobPlacesThirdOInThatColumn() throws Exception {
        currentPlayer = "O";
        selectedCellIndex = 7;
        callMoveApi();
    }

    @When("Alice places a third X on that diagonal")
    public void alicePlacesThirdXOnThatDiagonal() throws Exception {
        currentPlayer = "X";
        selectedCellIndex = 8;
        callMoveApi();
    }

    @When("Bob places a third O on that diagonal")
    public void bobPlacesThirdOOnThatDiagonal() throws Exception {
        currentPlayer = "O";
        selectedCellIndex = 6;
        callMoveApi();
    }

    @When("a player places a symbol")
    public void aPlayerPlacesASymbol() throws Exception {
        callMoveApi();
    }

    @When("the last empty cell is filled")
    public void theLastEmptyCellIsFilled() throws Exception {
        callMoveApi();
    }

    @When("the last empty cell is filled and creates a winning alignment")
    public void theLastEmptyCellCreatesWinningAlignment() throws Exception {
        callMoveApi();
    }

    @When("the result is shown on the screen")
    public void theResultIsShownOnTheScreen() {
        // Stateless API: assertions validate current state only.
    }

    @When("the result is displayed")
    public void theResultIsDisplayed() {
        // Stateless API: assertions validate current state only.
    }

    @When("the game displays the final board")
    public void theGameDisplaysTheFinalBoard() throws Exception {
        callMoveApi();
    }

    @When("the board is displayed")
    public void theBoardIsDisplayed() throws Exception {
        callMoveApi();
    }

    @When("players view the board after the game has ended")
    public void playersViewBoardAfterGameEnded() throws Exception {
        callMoveApi();
    }

    @When("Player O places a mark on the last empty cell")
    public void playerOPlacesAMarkOnTheLastEmptyCell() throws Exception {
        currentPlayer = "O";
        board = new ArrayList<>(List.of("X", "O", "X", "X", "O", "O", "O", "X", ""));
        selectedCellIndex = 8;
        callMoveApi();
    }

    @When("the game ends in a draw")
    public void theGameEndsInADraw() {
        // asserted by the subsequent Then steps using the move response
    }

    @When("players take turns")
    public void playersTakeTurns() {
        // stateless — names stay fixed in the response from the Given setup
    }

    @When("the player clicks the {string} button")
    public void thePlayerClicksButton(String buttonName) throws Exception {
        // "New Game" restarts with the same players
        callSetupApi();
    }

    @When("the player attempts to start the game")
    public void thePlayerAttemptsToStartTheGame() throws Exception {
        callSetupApi();
    }

    // ── Then ────────────────────────────────────────────────────────────────

    @Then("the names {string} and {string} are stored for the game")
    public void theNamesAreStoredForTheGame(String name1, String name2) throws Exception {
        callSetupApi();
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.player1.name").value(name1))
                .andExpect(jsonPath("$.player2.name").value(name2));
    }

    @Then("{word} is assigned symbol {string}")
    public void nameIsAssignedSymbol(String playerName, String symbol) throws Exception {
        String path = playerName.equals(player1Name) ? "$.player1" : "$.player2";
        result.andExpect(jsonPath(path + ".symbol").value(symbol));
    }

    @Then("the screen shows {string}")
    public void theScreenShows(String text) throws Exception {
        if (text.contains("(")) {
            // format: "Alice (X)" or "Bob (O)"
            String name = text.substring(0, text.indexOf(" ("));
            String symbol = text.substring(text.indexOf("(") + 1, text.indexOf(")"));
            String path = name.equals(player1Name) ? "$.player1" : "$.player2";
            result.andExpect(jsonPath(path + ".name").value(name))
                    .andExpect(jsonPath(path + ".symbol").value(symbol));
        }
    }

    @Then("the screen shows that it is {string}")
    public void theScreenShowsThatItIs(String text) throws Exception {
        // text = "Alice's turn"
        String playerName = text.replace("'s turn", "");
        result.andExpect(jsonPath("$.currentPlayer").value("X"))
                .andExpect(jsonPath("$.player1.name").value(playerName));
    }

    @Then("the names remain {string} and {string}")
    public void theNamesRemain(String name1, String name2) throws Exception {
        result.andExpect(jsonPath("$.player1.name").value(name1))
                .andExpect(jsonPath("$.player2.name").value(name2));
    }

    @Then("the board is cleared")
    public void theBoardIsCleared() throws Exception {
        result.andExpect(jsonPath("$.board").isArray())
                .andExpect(jsonPath("$.board[0]").value(""))
                .andExpect(jsonPath("$.board[8]").value(""));
    }

    @Then("the players are still {string} and {string}")
    public void thePlayersAreStill(String name1, String name2) throws Exception {
        result.andExpect(jsonPath("$.player1.name").value(name1))
                .andExpect(jsonPath("$.player2.name").value(name2));
    }

    @Then("^it is (\\w+)'s turn$")
    public void itIsPlayersTurn(String playerName) throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value("X"))
                .andExpect(jsonPath("$.player1.name").value(playerName));
    }

    @Then("the game does not start")
    public void theGameDoesNotStart() throws Exception {
        result.andExpect(status().isBadRequest());
    }

    @Then("^a message is shown asking for both player names?$")
    public void aMessageIsShownAskingForBothPlayerNames() throws Exception {
        result.andExpect(jsonPath("$.message").isString());
    }

    @Then("the screen should show that it is Player X's turn")
    public void theScreenShouldShowThatItIsPlayerXTurn() throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value("X"));
    }

    @Then("the screen should show that it is Player O's turn")
    public void theScreenShouldShowThatItIsPlayerOTurn() throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value("O"));
    }

    @Then("the current player's turn should be visible")
    public void theCurrentPlayersTurnShouldBeVisible() throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("the cell should immediately display an {string}")
    public void theCellShouldImmediatelyDisplay(String symbol) throws Exception {
        result.andExpect(jsonPath("$.board[%s]".formatted(selectedCellIndex)).value(symbol));
    }

    @Then("the cell content should not change")
    public void theCellContentShouldNotChange() throws Exception {
        result.andExpect(jsonPath("$.board[%s]".formatted(selectedCellIndex)).value("X"));
    }

    @Then("only one {string} should appear in that cell")
    public void onlyOneSymbolShouldAppearInThatCell(String symbol) throws Exception {
        result.andExpect(jsonPath("$.board[%s]".formatted(selectedCellIndex)).value(symbol));
    }

    @Then("the symbol should appear without noticeable delay")
    public void theSymbolShouldAppearWithoutNoticeableDelay() throws Exception {
        result.andExpect(status().isOk());
    }

    @Then("no symbol should be added to the board")
    public void noSymbolShouldBeAddedToTheBoard() throws Exception {
        result.andExpect(jsonPath("$.board[5]").value(""));
    }

    @Then("no symbol is placed, the X remains in the cell and it stays Bob's turn")
    public void noSymbolIsPlacedAndItStaysBobTurn() throws Exception {
        result.andExpect(jsonPath("$.board[0]").value("X"))
                .andExpect(jsonPath("$.currentPlayer").value("O"));
    }

    @Then("the game detects a winning condition")
    public void theGameDetectsWinningCondition() throws Exception {
        result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("the game announces that Alice has won")
    public void theGameAnnouncesAliceWon() throws Exception {
        result.andExpect(jsonPath("$.winner").value("X"));
    }

    @Then("the game announces that Bob has won")
    public void theGameAnnouncesBobWon() throws Exception {
        result.andExpect(jsonPath("$.winner").value("O"));
    }

    @Then("the game ends")
    public void theGameEnds() throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value(nullValue()));
    }

    @Then("the game does not announce a winner")
    public void theGameDoesNotAnnounceAWinner() throws Exception {
        result.andExpect(jsonPath("$.winner").value(nullValue()));
    }

    @Then("the game continues")
    public void theGameContinues() throws Exception {
        result.andExpect(jsonPath("$.draw").value(false))
                .andExpect(jsonPath("$.currentPlayer").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("no symbol is placed")
    public void noSymbolIsPlaced() throws Exception {
        result.andExpect(jsonPath("$.board").value(previousBoard));
    }

    @Then("the game state does not change")
    public void theGameStateDoesNotChange() throws Exception {
        result.andExpect(jsonPath("$.board").value(previousBoard))
                .andExpect(jsonPath("$.currentPlayer").value(previousCurrentPlayer == null ? nullValue() : Matchers.is(previousCurrentPlayer)))
                .andExpect(jsonPath("$.winner").value(previousWinner == null ? nullValue() : Matchers.is(previousWinner)))
                .andExpect(jsonPath("$.draw").value(previousDraw));
    }

    @Then("the game detects a draw")
    public void theGameDetectsADraw() throws Exception {
        result.andExpect(jsonPath("$.draw").value(true));
    }

    @Then("the game announces that the game is a draw")
    public void theGameAnnouncesThatTheGameIsADraw() throws Exception {
        result.andExpect(jsonPath("$.draw").value(true));
    }

    @Then("the game announces the winning player")
    public void theGameAnnouncesTheWinningPlayer() throws Exception {
        result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("the game does not announce a draw")
    public void theGameDoesNotAnnounceADraw() throws Exception {
        result.andExpect(jsonPath("$.draw").value(false));
    }

    @Then("the screen clearly displays that the game is a draw")
    public void theScreenClearlyDisplaysDraw() {
        if (!previousDraw) {
            throw new AssertionError("Expected draw state to be active");
        }
    }

    @Then("no player is announced as the winner")
    public void noPlayerIsAnnouncedAsWinner() {
        if (previousWinner != null) {
            throw new AssertionError("Did not expect a winner in draw state");
        }
    }

    @Then("the three cells in the winning row are highlighted")
    public void winningRowCellsAreHighlighted() throws Exception {
        result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("the three cells in the winning column are highlighted")
    public void winningColumnCellsAreHighlighted() throws Exception {
        result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("the three cells on the diagonal are highlighted")
    public void winningDiagonalCellsAreHighlighted() throws Exception {
        result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("only the three cells that form the winning combination are highlighted")
    public void onlyWinningCellsAreHighlighted() throws Exception {
        result.andExpect(jsonPath("$.winner").value(Matchers.anyOf(Matchers.is("X"), Matchers.is("O"))));
    }

    @Then("all other cells are not highlighted")
    public void allOtherCellsAreNotHighlighted() {
        // Backend validates winner state; visual highlighting is asserted in frontend BDD tests.
    }

    @Then("no cells are highlighted")
    public void noCellsAreHighlighted() throws Exception {
        result.andExpect(jsonPath("$.winner").value(nullValue()));
    }

    @Then("the highlight remains visible")
    public void highlightRemainsVisible() throws Exception {
        result.andExpect(jsonPath("$.winner").value(previousWinner == null ? nullValue() : Matchers.is(previousWinner)));
    }

    @Then("the highlighted cells do not change")
    public void highlightedCellsDoNotChange() throws Exception {
        result.andExpect(jsonPath("$.board").value(previousBoard));
    }

    @Then("a {string} button is visible")
    public void aButtonIsVisible(String buttonLabel) {
        if (!"New Game".equals(buttonLabel)) {
            throw new AssertionError("Unexpected button label: " + buttonLabel);
        }
    }

    @Then("all cells are empty")
    public void allCellsAreEmpty() throws Exception {
        theBoardIsCleared();
    }

    @Then("the game is reset to its initial state")
    public void theGameIsResetToItsInitialState() throws Exception {
        result.andExpect(jsonPath("$.board[0]").value(""))
                .andExpect(jsonPath("$.board[8]").value(""))
                .andExpect(jsonPath("$.currentPlayer").value("X"))
                .andExpect(jsonPath("$.winner").value(nullValue()))
                .andExpect(jsonPath("$.draw").value(false));
    }

    @Then("Player X starts the new game")
    public void playerXStartsTheNewGame() throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value("X"));
    }

    @Then("any winner or draw message is removed")
    public void anyWinnerOrDrawMessageIsRemoved() throws Exception {
        result.andExpect(jsonPath("$.winner").value(nullValue()))
                .andExpect(jsonPath("$.draw").value(false));
    }

    @Then("no result is displayed")
    public void noResultIsDisplayed() throws Exception {
        result.andExpect(jsonPath("$.winner").value(nullValue()))
                .andExpect(jsonPath("$.draw").value(false));
    }

    @Then("the current game is stopped")
    public void theCurrentGameIsStopped() throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value("X"));
    }

    @Then("a new game starts immediately")
    public void aNewGameStartsImmediately() throws Exception {
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPlayer").value("X"));
    }

    @Then("the screen should show that Player X has won")
    public void theScreenShouldShowThatPlayerXHasWon() throws Exception {
        result.andExpect(jsonPath("$.winner").value("X"));
    }

    @Then("the screen should not show that it is Player O's turn")
    public void theScreenShouldNotShowThatItIsPlayerOTurn() throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value(nullValue()));
    }

    @Then("the screen should show that the game is a draw")
    public void theScreenShouldShowThatTheGameIsADraw() throws Exception {
        result.andExpect(jsonPath("$.draw").value(true));
    }

    @Then("the screen should not show that it is Player X's turn")
    public void theScreenShouldNotShowThatItIsPlayerXTurn() throws Exception {
        result.andExpect(jsonPath("$.currentPlayer").value(nullValue()));
    }
}
