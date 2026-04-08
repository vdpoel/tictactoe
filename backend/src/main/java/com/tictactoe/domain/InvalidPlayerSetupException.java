package com.tictactoe.domain;

public class InvalidPlayerSetupException extends RuntimeException {

    public InvalidPlayerSetupException(String message) {
        super(message);
    }
}
