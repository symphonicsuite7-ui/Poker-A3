package com.a3.game.game.model;

public class EngineResult {

	private final boolean ok;
	private final String reason;
	private final GameState state;
	private final Play play;

	private EngineResult(boolean ok, String reason, GameState state, Play play) {
		this.ok = ok;
		this.reason = reason;
		this.state = state;
		this.play = play;
	}

	public static EngineResult ok(GameState state) {
		return new EngineResult(true, null, state, null);
	}

	public static EngineResult fail(String reason, GameState state) {
		return new EngineResult(false, reason, state, null);
	}

	public static EngineResult playOk(Play play) {
		return new EngineResult(true, null, null, play);
	}

	public boolean isOk() {
		return ok;
	}

	public String getReason() {
		return reason;
	}

	public GameState getState() {
		return state;
	}

	public Play getPlay() {
		return play;
	}
}
