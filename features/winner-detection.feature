Feature: Detect and announce winner

  Scenario: Player wins with a horizontal row
    Given a game is in progress and it is Alice's turn (X)
    And Alice has already placed two X symbols in the same row
    When Alice places a third X in that row
    Then the game detects a winning condition
    And the game announces that Alice has won
    And the game ends

  Scenario: Player wins with a vertical column
    Given a game is in progress and it is Bob's turn (O)
    And Bob has already placed two O symbols in the same column
    When Bob places a third O in that column
    Then the game detects a winning condition
    And the game announces that Bob has won
    And the game ends

  Scenario: Player wins with a diagonal from top-left to bottom-right
    Given a game is in progress and it is Alice's turn (X)
    And Alice has already placed two X symbols diagonally from top-left to bottom-right
    When Alice places a third X on that diagonal
    Then the game detects a winning condition
    And the game announces that Alice has won
    And the game ends

  Scenario: Player wins with a diagonal from top-right to bottom-left
    Given a game is in progress and it is Bob's turn (O)
    And Bob has already placed two O symbols diagonally from top-right to bottom-left
    When Bob places a third O on that diagonal
    Then the game detects a winning condition
    And the game announces that Bob has won
    And the game ends

  Scenario: No false positive winner detection
    Given a game is in progress
    And no player has three symbols aligned in a row, column, or diagonal
    When a player places a symbol
    Then the game does not announce a winner
    And the game continues

  Scenario: Game stops accepting moves after a winner is announced
    Given the game has ended and Alice has been announced as the winner
    When a player clicks on any cell
    Then no symbol is placed
    And the game state does not change