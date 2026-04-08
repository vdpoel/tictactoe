Feature: Detect draw

  Scenario: Detect draw when last cell is filled without a winner
    Given a game is in progress
    And all cells except one are filled
    And no player has three symbols aligned
    When the last empty cell is filled
    Then the game detects a draw
    And the game announces that the game is a draw
    And the game ends

  Scenario: No draw is announced if a winning move occurs on the last cell
    Given a game is in progress
    And all cells except one are filled
    And a winning combination is still possible
    When the last empty cell is filled and creates a winning alignment
    Then the game announces the winning player
    And the game does not announce a draw

  Scenario: No draw is announced while moves are still possible
    Given a game is in progress
    And there are still empty cells available
    When a player places a symbol
    Then the game does not announce a draw
    And the game continues

  Scenario: Game stops accepting moves after a draw is announced
    Given the game has ended in a draw
    When a player clicks on any cell
    Then no symbol is placed
    And the game state does not change

  Scenario: Draw message is clearly displayed to players
    Given the game has ended in a draw
    When the result is shown on the screen
    Then the screen clearly displays that the game is a draw

  Scenario: No winner is announced in a draw situation
    Given the game has ended in a draw
    When the result is displayed
    Then no player is announced as the winner