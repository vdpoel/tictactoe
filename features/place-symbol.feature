Feature: Place symbol on the board

  Scenario: Display Player X symbol after clicking an empty cell
    Given a game is in progress
    And it is Player X's turn
    And the selected cell is empty
    When Player X clicks on the cell
    Then the cell should immediately display an "X"

  Scenario: Display Player O symbol after clicking an empty cell
    Given a game is in progress
    And it is Player O's turn
    And the selected cell is empty
    When Player O clicks on the cell
    Then the cell should immediately display an "O"

  Scenario: Prevent overwriting a filled cell
    Given a game is in progress
    And a cell is already occupied
    When a player clicks on the occupied cell
    Then the cell content should not change

  Scenario: Only one symbol appears per click
    Given a game is in progress
    And it is Player X's turn
    And the selected cell is empty
    When Player X clicks on the cell
    Then only one "X" should appear in that cell

  Scenario: No delay in symbol display
    Given a game is in progress
    And it is Player O's turn
    And the selected cell is empty
    When Player O clicks on the cell
    Then the symbol should appear without noticeable delay

  Scenario: No symbol appears after the game has ended
    Given the game has ended
    When a player clicks on any cell
    Then no symbol should be added to the board

  Scenario: Player cannot place a symbol on a cell occupied by X
    Given it is Bob's turn (O) and a cell contains an X placed by Alice
    When Bob clicks on that occupied cell
    Then no symbol is placed, the X remains in the cell and it stays Bob's turn

  Scenario: Server rejects a move when the board already shows a winning combination
    Given the board already shows X winning in the top row but currentPlayer is still set to X
    When a player attempts to place a symbol in an empty cell
    Then the move is rejected, X remains the winner and the game is over