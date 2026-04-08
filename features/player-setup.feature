Feature: Player setup and symbol assignment

  Scenario: Players can enter their names before starting the game
    Given the game has not started yet
    When Player 1 enters the name "Alice"
    And Player 2 enters the name "Bob"
    Then the names "Alice" and "Bob" are stored for the game

  Scenario: Player 1 is assigned symbol X and Player 2 is assigned symbol O
    Given Player 1 is "Alice"
    And Player 2 is "Bob"
    When the game starts
    Then Alice is assigned symbol "X"
    And Bob is assigned symbol "O"

  Scenario: Display player names with their symbols
    Given a game is in progress
    And Player 1 is "Alice" with symbol "X"
    And Player 2 is "Bob" with symbol "O"
    When the game screen is displayed
    Then the screen shows "Alice (X)"
    And the screen shows "Bob (O)"

  Scenario: Turn display uses player names instead of generic labels
    Given a game is in progress
    And it is Alice's turn (X)
    When the turn indicator is shown
    Then the screen shows that it is "Alice's turn"

  Scenario: Names remain the same during the game
    Given a game is in progress with players "Alice" and "Bob"
    When players take turns
    Then the names remain "Alice" and "Bob"

  Scenario: Restart game keeps player names
    Given a game has been played with players "Alice" and "Bob"
    When the player clicks the "New Game" button
    Then the board is cleared
    And the players are still "Alice" and "Bob"

  Scenario: Restart game resets symbols and starting player
    Given a game has been played with players "Alice" (X) and "Bob" (O)
    When the player clicks the "New Game" button
    Then Alice is assigned symbol "X"
    And Bob is assigned symbol "O"
    And it is Alice's turn

  Scenario: Prevent starting game without player names
    Given the game has not started yet
    And Player 1 name is empty
    Or Player 2 name is empty
    When the player attempts to start the game
    Then the game does not start
    And a message is shown asking for both player names