package com.a3.game.room.model;

/** 进房身份。由 JWT 或查询参数构造。 */
public class RoomUser {

	private final String userId;
	private final String username;
	private final String avatar;

	public RoomUser(String userId, String username, String avatar) {
		this.userId = userId;
		this.username = username;
		this.avatar = avatar == null || avatar.isBlank() ? "/avatars/preset-1.svg" : avatar;
	}

	public String getUserId() {
		return userId;
	}

	public String getUsername() {
		return username;
	}

	public String getAvatar() {
		return avatar;
	}
}
