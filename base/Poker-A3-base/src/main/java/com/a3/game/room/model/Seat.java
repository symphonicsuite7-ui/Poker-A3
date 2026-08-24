package com.a3.game.room.model;

public class Seat {

	private String userId;
	private String username;
	private String nickname;
	private String avatar;
	private int seat;
	private boolean online = true;
	private String socketId;

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	/** 座位旁展示名 */
	public String displayName() {
		if (nickname != null && !nickname.isBlank()) {
			return nickname;
		}
		return username;
	}

	public String getAvatar() {
		return avatar;
	}

	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

	public int getSeat() {
		return seat;
	}

	public void setSeat(int seat) {
		this.seat = seat;
	}

	public boolean isOnline() {
		return online;
	}

	public void setOnline(boolean online) {
		this.online = online;
	}

	public String getSocketId() {
		return socketId;
	}

	public void setSocketId(String socketId) {
		this.socketId = socketId;
	}
}
