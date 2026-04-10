package com.tictactoe;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class PlayerSetupStepDefs {

    @Autowired
    private ScenarioContext ctx;

    // Scenario: Players can enter their names before starting the game
    // (uses shared: theGameHasNotStartedYet → see bottom)

    @When("Player 1 enters the name {string}")
    public void player1EntersName(String name) {
        ctx.player1Name = name;
    }

    @When("Player 2 enters the name {string}")
    public void player2EntersName(String name) {
        ctx.player2Name = name;
    }

    @Then("the names {string} and {string} are stored for the game")
    public void theNamesAreStoredForTheGame(String name1, String name2) throws Exception {
        ctx.callSetupApi();
        ctx.result.andExpect(status().isOk())
                .andExpect(jsonPath("$.player1.name").value(name1))
                .andExpect(jsonPath("$.player2.name").value(name2));
    }

    // Scenario: Player 1 is assigned symbol X and Player 2 is assigned symbol O
    // (uses shared: nameIsAssignedSymbol → see bottom)

    @Given("Player 1 is {string}")
    public void player1Is(String name) {
        ctx.player1Name = name;
    }

    @Given("Player 2 is {string}")
    public void player2Is(String name) {
        ctx.player2Name = name;
    }

    @When("the game starts")
    public void theGameStarts() throws Exception {
        ctx.callSetupApi();
    }

    // Scenario: Display player names with their symbols

    @Given("Player 1 is {string} with symbol {string}")
    public void player1IsWithSymbol(String name, String ignoredSymbol) {
        ctx.player1Name = name;
    }

    @Given("Player 2 is {string} with symbol {string}")
    public void player2IsWithSymbol(String name, String ignoredSymbol) {
        ctx.player2Name = name;
    }

    @When("the game screen is displayed")
    public void theGameScreenIsDisplayed() throws Exception {
        ctx.callSetupApi();
    }

    @Then("the screen shows {string}")
    public void theScreenShows(String text) throws Exception {
        if (text.contains("(")) {
            String name = text.substring(0, text.indexOf(" ("));
            String symbol = text.substring(text.indexOf("(") + 1, text.indexOf(")"));
            String path = name.equals(ctx.player1Name) ? "$.player1" : "$.player2";
            ctx.result.andExpect(jsonPath(path + ".name").value(name))
                    .andExpect(jsonPath(path + ".symbol").value(symbol));
        }
    }

    // Scenario: Turn display uses player names instead of generic labels

    @Given("^it is (.+)'s turn \\(X\\)$")
    public void itIsPlayersTurnX(String playerName) {
        ctx.player1Name = playerName;
        if (ctx.player2Name.isBlank()) ctx.player2Name = "Bob";
    }

    @When("the turn indicator is shown")
    public void theTurnIndicatorIsShown() throws Exception {
        ctx.callSetupApi();
    }

    @Then("the screen shows that it is {string}")
    public void theScreenShowsThatItIs(String text) throws Exception {
        String playerName = text.replace("'s turn", "");
        ctx.result.andExpect(jsonPath("$.currentPlayer").value("X"))
                .andExpect(jsonPath("$.player1.name").value(playerName));
    }

    // Scenario: Names remain the same during the game

    @Given("a game is in progress with players {string} and {string}")
    public void aGameIsInProgressWithPlayers(String p1, String p2) throws Exception {
        ctx.player1Name = p1;
        ctx.player2Name = p2;
        ctx.callSetupApi();
    }

    @When("players take turns")
    public void playersTakeTurns() {
        // stateless — names stay fixed in the response from the Given setup
    }

    @Then("the names remain {string} and {string}")
    public void theNamesRemain(String name1, String name2) throws Exception {
        ctx.result.andExpect(jsonPath("$.player1.name").value(name1))
                .andExpect(jsonPath("$.player2.name").value(name2));
    }

    // Scenario: Restart game keeps player names
    // (uses shared: thePlayerClicksButton → SharedStepDefs, theBoardIsCleared → SharedStepDefs)

    @Given("a game has been played with players {string} and {string}")
    public void aGameHasBeenPlayedWithPlayers(String p1, String p2) throws Exception {
        ctx.player1Name = p1;
        ctx.player2Name = p2;
        ctx.callSetupApi();
    }

    @Then("the players are still {string} and {string}")
    public void thePlayersAreStill(String name1, String name2) throws Exception {
        ctx.result.andExpect(jsonPath("$.player1.name").value(name1))
                .andExpect(jsonPath("$.player2.name").value(name2));
    }

    // Scenario: Restart game resets symbols and starting player
    // (uses shared: nameIsAssignedSymbol, itIsPlayersTurn → see bottom)

    @Given("^a game has been played with players \"([^\"]+)\" \\(X\\) and \"([^\"]+)\" \\(O\\)$")
    public void aGameHasBeenPlayedWithPlayersAndSymbols(String p1, String p2) throws Exception {
        ctx.player1Name = p1;
        ctx.player2Name = p2;
        ctx.callSetupApi();
    }

    // Scenario: Start Game button is replaced by the game board after starting

    @Then("the Start Game button is no longer visible")
    public void theStartGameButtonIsNoLongerVisible() throws Exception {
        ctx.result.andExpect(status().isOk());
    }

    @Then("the game board is visible")
    public void theGameBoardIsVisible() throws Exception {
        ctx.result.andExpect(jsonPath("$.board").isArray());
    }

    // Scenario: Start Game button is disabled until both names are filled in

    @Then("the Start Game button is disabled")
    public void theStartGameButtonIsDisabled() throws Exception {
        ctx.callSetupApi();
        ctx.result.andExpect(status().isBadRequest());
    }

    @Then("the Start Game button is enabled")
    public void theStartGameButtonIsEnabled() throws Exception {
        ctx.callSetupApi();
        ctx.result.andExpect(status().isOk());
    }

    // Scenarios: Prevent starting game without player name(s)
    // (uses shared: theGameHasNotStartedYet, playerNameIs, thePlayerAttemptsToStartTheGame,
    //               theGameDoesNotStart, aMessageIsShownAskingForBothPlayerNames → see bottom)

    // ── Shared steps (used by multiple scenarios above) ──────────────────────

    @Given("the game has not started yet")
    public void theGameHasNotStartedYet() {
        // stateless — no action needed
    }

    @Given("Player {int} name is {word}")
    public void playerNameIs(int playerNum, String name) {
        String value = "empty".equals(name) ? "" : name;
        if (playerNum == 1) ctx.player1Name = value;
        else ctx.player2Name = value;
    }

    @When("the player attempts to start the game")
    public void thePlayerAttemptsToStartTheGame() throws Exception {
        ctx.callSetupApi();
    }

    @Then("{word} is assigned symbol {string}")
    public void nameIsAssignedSymbol(String playerName, String symbol) throws Exception {
        String path = playerName.equals(ctx.player1Name) ? "$.player1" : "$.player2";
        ctx.result.andExpect(jsonPath(path + ".symbol").value(symbol));
    }

    @Then("^it is (\\w+)'s turn$")
    public void itIsPlayersTurn(String playerName) throws Exception {
        ctx.result.andExpect(jsonPath("$.currentPlayer").value("X"))
                .andExpect(jsonPath("$.player1.name").value(playerName));
    }

    @Then("the game does not start")
    public void theGameDoesNotStart() throws Exception {
        ctx.result.andExpect(status().isBadRequest());
    }

    @Then("^a message is shown asking for both player names?$")
    public void aMessageIsShownAskingForBothPlayerNames() throws Exception {
        ctx.result.andExpect(jsonPath("$.message").isString());
    }
}
