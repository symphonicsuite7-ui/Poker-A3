package com.a3.game.user.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** 登录态用户，作为 Security principal，也进 JWT。 */
public class AuthUser {

	private Long id;
	private String username;
	private String nickname;
	private String avatar;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public String getAvatar() {
		return avatar;
	}

	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

	public String displayName() {
		if (nickname != null && !nickname.isBlank()) {
			return nickname;
		}
		return username;
	}

	/** 现网 publicUser：id / username / avatar，并带上 nickname。 */
	public Map<String, Object> toPublic() {
		Map<String, Object> user = new LinkedHashMap<>();
		user.put("id", String.valueOf(id));
		user.put("username", username);
		user.put("nickname", nickname);
		user.put("avatar", avatar);
		return user;
	}
}
