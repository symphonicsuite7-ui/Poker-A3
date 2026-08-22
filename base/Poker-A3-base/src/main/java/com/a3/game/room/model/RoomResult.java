package com.a3.game.room.model;

public class RoomResult {

	private final boolean ok;
	private final String error;
	private final Room room;
	private final boolean dissolved;
	private final boolean leftDuringGame;

	private RoomResult(boolean ok, String error, Room room, boolean dissolved, boolean leftDuringGame) {
		this.ok = ok;
		this.error = error;
		this.room = room;
		this.dissolved = dissolved;
		this.leftDuringGame = leftDuringGame;
	}

	public static RoomResult ok(Room room) {
		return new RoomResult(true, null, room, false, false);
	}

	public static RoomResult fail(String error) {
		return new RoomResult(false, error, null, false, false);
	}

	public static RoomResult left(Room room, boolean dissolved, boolean leftDuringGame) {
		return new RoomResult(true, null, room, dissolved, leftDuringGame);
	}

	public boolean isOk() {
		return ok;
	}

	public String getError() {
		return error;
	}

	public Room getRoom() {
		return room;
	}

	public boolean isDissolved() {
		return dissolved;
	}

	public boolean isLeftDuringGame() {
		return leftDuringGame;
	}
}
