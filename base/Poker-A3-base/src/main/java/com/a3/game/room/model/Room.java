package com.a3.game.room.model;

import com.a3.game.game.model.GameState;

import java.util.ArrayList;
import java.util.List;

/** 运行时房间，不入库。对应 Node rooms.js 的 room 对象。 */
public class Room {

	private String id;
	private String password;
	private String hostId;
	private RoomStatus status = RoomStatus.WAITING;
	private final List<Seat> players = new ArrayList<>();
	private GameState game;
	private RoomBackground background;
	private long createdAt;
	/** 本局开始毫秒，用于结算时长 */
	private long gameStartedAt;
	/** 本局是否已写入 game_record */
	private boolean recordSaved;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getHostId() {
		return hostId;
	}

	public void setHostId(String hostId) {
		this.hostId = hostId;
	}

	public RoomStatus getStatus() {
		return status;
	}

	public void setStatus(RoomStatus status) {
		this.status = status;
	}

	public List<Seat> getPlayers() {
		return players;
	}

	public GameState getGame() {
		return game;
	}

	public void setGame(GameState game) {
		this.game = game;
	}

	public RoomBackground getBackground() {
		return background;
	}

	public void setBackground(RoomBackground background) {
		this.background = background;
	}

	public long getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(long createdAt) {
		this.createdAt = createdAt;
	}

	public long getGameStartedAt() {
		return gameStartedAt;
	}

	public void setGameStartedAt(long gameStartedAt) {
		this.gameStartedAt = gameStartedAt;
	}

	public boolean isRecordSaved() {
		return recordSaved;
	}

	public void setRecordSaved(boolean recordSaved) {
		this.recordSaved = recordSaved;
	}

	public int seatOf(String userId) {
		for (int i = 0; i < players.size(); i++) {
			if (players.get(i).getUserId().equals(userId)) {
				return i;
			}
		}
		return -1;
	}
}
