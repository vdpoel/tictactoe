package com.tictactoe;

import io.cucumber.java.Before;
import org.springframework.beans.factory.annotation.Autowired;

public class Hooks {

    @Autowired
    private ScenarioContext ctx;

    @Before
    public void setUp() {
        ctx.reset();
    }
}
