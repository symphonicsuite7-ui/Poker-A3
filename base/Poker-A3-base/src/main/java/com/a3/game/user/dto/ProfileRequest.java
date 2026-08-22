package com.a3.game.user.dto;

/** 改资料入参。 */
public class ProfileRequest {

	private String nickname;
	private String avatar;
	private Long resourceId;
	private Long backgroundId;
	private String file;
	private String name;
	private String url;

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

	public Long getResourceId() {
		return resourceId;
	}

	public void setResourceId(Long resourceId) {
		this.resourceId = resourceId;
	}

	public Long getBackgroundId() {
		return backgroundId;
	}

	public void setBackgroundId(Long backgroundId) {
		this.backgroundId = backgroundId;
	}

	public String getFile() {
		return file;
	}

	public void setFile(String file) {
		this.file = file;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}
}
