Feature: Restart game board

  Scenario: New Game button is visible
    Given the game screen is displayed
    When the player looks at the interface
    Then a "New Game" button is visible

  Scenario: Start a new game after clicking the New Game button
    Given a game has been played
    When the player clicks the "New Game" button
    Then the board is cleared
    And all cells are empty
    And the game is reset to its initial state

  Scenario: Reset turn to starting player
    Given a game has been played
    When the player clicks the "New Game" button
    Then Player X starts the new game
    And it is Player X's turn

  Scenario: Clear winner or draw message on new game
    Given the previous game has ended with a winner or a draw
    When the player clicks the "New Game" button
    Then any winner or draw message is removed
    And no result is displayed

  Scenario: Remove highlighted winning combination on new game
    Given the previous game had a winning combination highlighted
    When the player clicks the "New Game" button
    Then no cells are highlighted

  Scenario: New Game button works during an ongoing game
    Given a game is in progress
    When the player clicks the "New Game" button
    Then the current game is stopped
    And the board is cleared
    And a new game starts immediately