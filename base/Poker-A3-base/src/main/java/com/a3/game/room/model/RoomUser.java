package com.a3.game.room.model;

/** 进房身份。由 JWT 构造；username 为登录名，展示用 displayName()。 */
public class RoomUser {

	private final String userId;
	private final String username;
	private final String nickname;
	private final String avatar;

	public RoomUser(String userId, String username, String avatar) {
		this(userId, username, null, avatar);
	}

	public RoomUser(String userId, String username, String nickname, String avatar) {
		this.userId = userId;
		this.username = username;
		this.nickname = nickname == null ? "" : nickname.trim();
		this.avatar = avatar == null || avatar.isBlank() ? "/avatars/preset-1.svg" : avatar;
	}

	public String getUserId() {
		return userId;
	}

	public String getUsername() {
		return username;
	}

	public String getNickname() {
		return nickname;
	}

	/** 有昵称用昵称，否则用户名 */
	public String displayName() {
		if (nickname != null && !nickname.isBlank()) {
			return nickname;
		}
		return username;
	}

	public String getAvatar() {
		return avatar;
	}
}
