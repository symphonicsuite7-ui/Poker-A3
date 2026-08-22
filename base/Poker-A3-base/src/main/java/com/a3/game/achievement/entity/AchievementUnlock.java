package com.a3.game.achievement.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/** 对应 achievement_unlock。成就规则在代码里，这里只记解锁。 */
@TableName("achievement_unlock")
public class AchievementUnlock {

	@TableId(type = IdType.AUTO)
	private Long id;
	private Long userId;
	private String achievementCode;
	private Integer unlockCount;
	private LocalDateTime firstUnlockTime;
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

	public String getAchievementCode() {
		return achievementCode;
	}

	public void setAchievementCode(String achievementCode) {
		this.achievementCode = achievementCode;
	}

	public Integer getUnlockCount() {
		return unlockCount;
	}

	public void setUnlockCount(Integer unlockCount) {
		this.unlockCount = unlockCount;
	}

	public LocalDateTime getFirstUnlockTime() {
		return firstUnlockTime;
	}

	public void setFirstUnlockTime(LocalDateTime firstUnlockTime) {
		this.firstUnlockTime = firstUnlockTime;
	}

	public LocalDateTime getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(LocalDateTime updateTime) {
		this.updateTime = updateTime;
	}
}
