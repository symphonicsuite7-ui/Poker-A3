package com.a3.game.room.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

/** 大厅可见的房间快照，对应 Node roomPublic。 */
public class RoomPublicView {

	private String id;
	private String password;
	private String hostId;
	private String status;
	private List<SeatView> players = new ArrayList<>();
	private int playerCount;
	private int maxPlayers;
	private RoomBackground background;

	public static class SeatView {
		private String userId;
		private String username;
		private String nickname;
		private String avatar;
		private int seat;
		private boolean online;
		private boolean host;
		private boolean me;

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

		@JsonProperty("isHost")
		public boolean isHost() {
			return host;
		}

		public void setHost(boolean host) {
			this.host = host;
		}

		@JsonProperty("isMe")
		public boolean isMe() {
			return me;
		}

		public void setMe(boolean me) {
			this.me = me;
		}
	}

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

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public List<SeatView> getPlayers() {
		return players;
	}

	public int getPlayerCount() {
		return playerCount;
	}

	public void setPlayerCount(int playerCount) {
		this.playerCount = playerCount;
	}

	public int getMaxPlayers() {
		return maxPlayers;
	}

	public void setMaxPlayers(int maxPlayers) {
		this.maxPlayers = maxPlayers;
	}

	public RoomBackground getBackground() {
		return background;
	}

	public void setBackground(RoomBackground background) {
		this.background = background;
	}
}
