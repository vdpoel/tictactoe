package com.tictactoe;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@Component
public class ScenarioContext {

    @Autowired
    WebApplicationContext webApplicationContext;

    MockMvc mockMvc;
    String player1Name;
    String player2Name;
    String currentPlayer;
    List<String> board;
    int selectedCellIndex;
    List<String> previousBoard;
    String previousCurrentPlayer;
    String previousWinner;
    boolean previousDraw;
    ResultActions result;

    void reset() {
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

    void callSetupApi() throws Exception {
        result = mockMvc.perform(post("/api/game")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "player1Name": "%s", "player2Name": "%s" }
                        """.formatted(player1Name, player2Name)));
    }

    void callMoveApi() throws Exception {
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
                        board.get(0), board.get(1), board.get(2),
                        board.get(3), board.get(4), board.get(5),
                        board.get(6), board.get(7), board.get(8),
                        selectedCellIndex
                )));
    }

    void snapshotExpectedState(String winner, boolean draw) {
        previousBoard = new ArrayList<>(board);
        previousCurrentPlayer = currentPlayer;
        previousWinner = winner;
        previousDraw = draw;
    }
}
