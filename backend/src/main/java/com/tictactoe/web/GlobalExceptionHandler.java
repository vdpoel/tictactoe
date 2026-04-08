package com.tictactoe.web;

import com.tictactoe.domain.InvalidPlayerSetupException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidPlayerSetupException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPlayerSetup(InvalidPlayerSetupException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
    }
}
