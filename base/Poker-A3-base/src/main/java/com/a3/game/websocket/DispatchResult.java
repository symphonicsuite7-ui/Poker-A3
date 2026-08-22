package com.a3.game.websocket;

import com.a3.game.room.model.Room;

public class DispatchResult {

	private final boolean ok;
	private final String error;
	private final Room room;
	private final boolean broadcast;
	private final boolean scheduleDraw;
	private final boolean sync;
	private final boolean bind;

	public DispatchResult(boolean ok, String error, Room room, boolean broadcast, boolean scheduleDraw, boolean sync,
			boolean bind) {
		this.ok = ok;
		this.error = error;
		this.room = room;
		this.broadcast = broadcast;
		this.scheduleDraw = scheduleDraw;
		this.sync = sync;
		this.bind = bind;
	}

	public static DispatchResult fail(String error) {
		return new DispatchResult(false, error, null, false, false, false, false);
	}

	public static DispatchResult ack(Room room, boolean broadcast, boolean scheduleDraw, boolean sync, boolean bind) {
		return new DispatchResult(true, null, room, broadcast, scheduleDraw, sync, bind);
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

	public boolean isBroadcast() {
		return broadcast;
	}

	public boolean isScheduleDraw() {
		return scheduleDraw;
	}

	public boolean isSync() {
		return sync;
	}

	public boolean isBind() {
		return bind;
	}
}
