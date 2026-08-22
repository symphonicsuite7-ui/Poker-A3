package com.a3.game.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/** 对应用户生涯 user_career，每个用户一行。 */
@TableName("user_career")
public class UserCareer {

	@TableId(type = IdType.AUTO)
	private Long id;
	private Long userId;
	private Integer totalGames;
	private Integer winGames;
	private Integer loseGames;
	private Integer drawGames;
	private Integer totalScore;
	private Integer soloTimes;
	private Integer soloWinTimes;
	private Integer soloLoseTimes;
	private Integer emperorTimes;
	private Integer drawTakeTimes;
	private Integer drawGiveTimes;
	private Integer twoRoundWinTimes;
	private LocalDateTime createTime;
	private LocalDateTime updateTime;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Integer getTotalGames() {
		return totalGames;
	}

	public void setTotalGames(Integer totalGames) {
		this.totalGames = totalGames;
	}

	public Integer getWinGames() {
		return winGames;
	}

	public void setWinGames(Integer winGames) {
		this.winGames = winGames;
	}

	public Integer getLoseGames() {
		return loseGames;
	}

	public void setLoseGames(Integer loseGames) {
		this.loseGames = loseGames;
	}

	public Integer getDrawGames() {
		return drawGames;
	}

	public void setDrawGames(Integer drawGames) {
		this.drawGames = drawGames;
	}

	public Integer getTotalScore() {
		return totalScore;
	}

	public void setTotalScore(Integer totalScore) {
		this.totalScore = totalScore;
	}

	public Integer getSoloTimes() {
		return soloTimes;
	}

	public void setSoloTimes(Integer soloTimes) {
		this.soloTimes = soloTimes;
	}

	public Integer getSoloWinTimes() {
		return soloWinTimes;
	}

	public void setSoloWinTimes(Integer soloWinTimes) {
		this.soloWinTimes = soloWinTimes;
	}

	public Integer getSoloLoseTimes() {
		return soloLoseTimes;
	}

	public void setSoloLoseTimes(Integer soloLoseTimes) {
		this.soloLoseTimes = soloLoseTimes;
	}

	public Integer getEmperorTimes() {
		return emperorTimes;
	}

	public void setEmperorTimes(Integer emperorTimes) {
		this.emperorTimes = emperorTimes;
	}

	public Integer getDrawTakeTimes() {
		return drawTakeTimes;
	}

	public void setDrawTakeTimes(Integer drawTakeTimes) {
		this.drawTakeTimes = drawTakeTimes;
	}

	public Integer getDrawGiveTimes() {
		return drawGiveTimes;
	}

	public void setDrawGiveTimes(Integer drawGiveTimes) {
		this.drawGiveTimes = drawGiveTimes;
	}

	public Integer getTwoRoundWinTimes() {
		return twoRoundWinTimes;
	}

	public void setTwoRoundWinTimes(Integer twoRoundWinTimes) {
		this.twoRoundWinTimes = twoRoundWinTimes;
	}

	public LocalDateTime getCreateTime() {
		return createTime;
	}

	public void setCreateTime(LocalDateTime createTime) {
		this.createTime = createTime;
	}

	public LocalDateTime getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(LocalDateTime updateTime) {
		this.updateTime = updateTime;
	}
}
