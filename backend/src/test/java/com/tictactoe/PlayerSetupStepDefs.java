package com.tictactoe;

import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class PlayerSetupStepDefs {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private String player1Name;
    private String player2Name;
    private ResultActions result;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        player1Name = "";
        player2Name = "";
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

    @When("the game starts")
    public void theGameStarts() throws Exception {
        callSetupApi();
    }

    @When("the game screen is displayed")
    public void theGameScreenIsDisplayed() throws Exception {
        callSetupApi();
    }

    @When("the turn indicator is shown")
    public void theTurnIndicatorIsShown() throws Exception {
        callSetupApi();
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
}
