package com.a3.game.game.model;

public enum GamePhase {
	DRAW("draw"),
	PLAYING("playing"),
	SETTLED("settled");

	private final String code;

	GamePhase(String code) {
		this.code = code;
	}

	public String getCode() {
		return code;
	}
}
