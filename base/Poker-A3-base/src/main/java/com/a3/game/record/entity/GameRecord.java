package com.a3.game.record.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/** 对应 game_record，一局一条。房间与手牌不入库。 */
@TableName("game_record")
public class GameRecord {

	@TableId(type = IdType.AUTO)
	private Long id;
	private String gameNo;
	private String roomId;
	private String gameMode;
	private Integer playerCount;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private Integer durationSecond;
	private Integer roundCount;
	private Integer isSolo;
	private String winnerType;
	private String extraJson;
	private LocalDateTime createTime;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getGameNo() {
		return gameNo;
	}

	public void setGameNo(String gameNo) {
		this.gameNo = gameNo;
	}

	public String getRoomId() {
		return roomId;
	}

	public void setRoomId(String roomId) {
		this.roomId = roomId;
	}

	public String getGameMode() {
		return gameMode;
	}

	public void setGameMode(String gameMode) {
		this.gameMode = gameMode;
	}

	public Integer getPlayerCount() {
		return playerCount;
	}

	public void setPlayerCount(Integer playerCount) {
		this.playerCount = playerCount;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public LocalDateTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalDateTime endTime) {
		this.endTime = endTime;
	}

	public Integer getDurationSecond() {
		return durationSecond;
	}

	public void setDurationSecond(Integer durationSecond) {
		this.durationSecond = durationSecond;
	}

	public Integer getRoundCount() {
		return roundCount;
	}

	public void setRoundCount(Integer roundCount) {
		this.roundCount = roundCount;
	}

	public Integer getIsSolo() {
		return isSolo;
	}

	public void setIsSolo(Integer isSolo) {
		this.isSolo = isSolo;
	}

	public String getWinnerType() {
		return winnerType;
	}

	public void setWinnerType(String winnerType) {
		this.winnerType = winnerType;
	}

	public String getExtraJson() {
		return extraJson;
	}

	public void setExtraJson(String extraJson) {
		this.extraJson = extraJson;
	}

	public LocalDateTime getCreateTime() {
		return createTime;
	}

	public void setCreateTime(LocalDateTime createTime) {
		this.createTime = createTime;
	}
}
