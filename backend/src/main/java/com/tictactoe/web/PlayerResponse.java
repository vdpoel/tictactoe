package com.tictactoe.web;

import com.tictactoe.domain.Player;

public record PlayerResponse(String name, String symbol) {

    public static PlayerResponse from(Player player) {
        return new PlayerResponse(player.name(), player.symbol().name());
    }
}
