Feature: Display current player's turn

  Scenario: Show Player X turn at the start of a new game
    Given a new Tic Tac Toe game has started
    When the game board is displayed
    Then the screen should show that it is Player X's turn

  Scenario: Switch turn display after Player X makes a move
    Given a game is in progress
    And it is Player X's turn
    When Player X places a mark on an empty cell
    Then the screen should show that it is Player O's turn

  Scenario: Switch turn display after Player O makes a move
    Given a game is in progress
    And it is Player O's turn
    When Player O places a mark on an empty cell
    Then the screen should show that it is Player X's turn

  Scenario: Keep current turn visible during the game
    Given a game is in progress
    When the players look at the game screen
    Then the current player's turn should be visible

  Scenario: Do not show the next turn after the game is won
    Given a game is in progress
    And it is Player X's turn
    When Player X places a mark on an empty cell and wins the game
    Then the screen should show that Player X has won
    And the screen should not show that it is Player O's turn

  Scenario: Do not show the next turn after the game ends in a draw
    Given a game is in progress
    And it is Player O's turn
    When Player O places a mark on the last empty cell
    And the game ends in a draw
    Then the screen should show that the game is a draw
    And the screen should not show that it is Player X's turn