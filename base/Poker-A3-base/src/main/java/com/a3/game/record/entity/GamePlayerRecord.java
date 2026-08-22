package com.a3.game.record.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/** 对应 game_player_record，一局 4 条。 */
@TableName("game_player_record")
public class GamePlayerRecord {

	@TableId(type = IdType.AUTO)
	private Long id;
	private Long gameId;
	private Long userId;
	private Integer seatIndex;
	private Integer finishRank;
	private Integer deltaScore;
	private Integer scoreAfter;
	/** A / B / SOLO */
	private String teamType;
	/** WIN / LOSE / DRAW */
	private String result;
	private Integer isSoloPlayer;
	private Integer playedEmperor;
	private Integer drawTakeCount;
	private Integer drawGiveCount;
	private Integer playCount;
	private LocalDateTime createTime;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getGameId() {
		return gameId;
	}

	public void setGameId(Long gameId) {
		this.gameId = gameId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Integer getSeatIndex() {
		return seatIndex;
	}

	public void setSeatIndex(Integer seatIndex) {
		this.seatIndex = seatIndex;
	}

	public Integer getFinishRank() {
		return finishRank;
	}

	public void setFinishRank(Integer finishRank) {
		this.finishRank = finishRank;
	}

	public Integer getDeltaScore() {
		return deltaScore;
	}

	public void setDeltaScore(Integer deltaScore) {
		this.deltaScore = deltaScore;
	}

	public Integer getScoreAfter() {
		return scoreAfter;
	}

	public void setScoreAfter(Integer scoreAfter) {
		this.scoreAfter = scoreAfter;
	}

	public String getTeamType() {
		return teamType;
	}

	public void setTeamType(String teamType) {
		this.teamType = teamType;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public Integer getIsSoloPlayer() {
		return isSoloPlayer;
	}

	public void setIsSoloPlayer(Integer isSoloPlayer) {
		this.isSoloPlayer = isSoloPlayer;
	}

	public Integer getPlayedEmperor() {
		return playedEmperor;
	}

	public void setPlayedEmperor(Integer playedEmperor) {
		this.playedEmperor = playedEmperor;
	}

	public Integer getDrawTakeCount() {
		return drawTakeCount;
	}

	public void setDrawTakeCount(Integer drawTakeCount) {
		this.drawTakeCount = drawTakeCount;
	}

	public Integer getDrawGiveCount() {
		return drawGiveCount;
	}

	public void setDrawGiveCount(Integer drawGiveCount) {
		this.drawGiveCount = drawGiveCount;
	}

	public Integer getPlayCount() {
		return playCount;
	}

	public void setPlayCount(Integer playCount) {
		this.playCount = playCount;
	}

	public LocalDateTime getCreateTime() {
		return createTime;
	}

	public void setCreateTime(LocalDateTime createTime) {
		this.createTime = createTime;
	}
}
