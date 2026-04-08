Feature: Highlight winning combination

  Scenario: Highlight winning horizontal row
    Given a game has been won by Alice (X) with three symbols in the same row
    When the game displays the final board
    Then the three cells in the winning row are highlighted

  Scenario: Highlight winning vertical column
    Given a game has been won by Bob (O) with three symbols in the same column
    When the game displays the final board
    Then the three cells in the winning column are highlighted

  Scenario: Highlight winning diagonal from top-left to bottom-right
    Given a game has been won by Alice (X) with three symbols on a diagonal from top-left to bottom-right
    When the game displays the final board
    Then the three cells on the diagonal are highlighted

  Scenario: Highlight winning diagonal from top-right to bottom-left
    Given a game has been won by Bob (O) with three symbols on a diagonal from top-right to bottom-left
    When the game displays the final board
    Then the three cells on the diagonal are highlighted

  Scenario: Only the winning combination is highlighted
    Given a game has been won
    When the board is displayed
    Then only the three cells that form the winning combination are highlighted
    And all other cells are not highlighted

  Scenario: No highlight when there is no winner
    Given a game is in progress or has ended in a draw
    When the board is displayed
    Then no cells are highlighted

  Scenario: Highlight remains visible after game ends
    Given a game has been won and the winning combination is highlighted
    When players view the board after the game has ended
    Then the highlight remains visible
    And the highlighted cells do not change