package com.a3.game.achievement.service;

import com.a3.game.achievement.AchievementCatalog;
import com.a3.game.achievement.entity.AchievementUnlock;
import com.a3.game.achievement.mapper.AchievementUnlockMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 成就列表：目录 + 当前用户解锁记录。 */
@Service
@Profile("!test")
public class AchievementService {

	private final AchievementUnlockMapper unlocks;

	public AchievementService(AchievementUnlockMapper unlocks) {
		this.unlocks = unlocks;
	}

	public Map<String, Object> listOf(Long userId) {
		List<AchievementUnlock> rows = unlocks.selectList(
				new LambdaQueryWrapper<AchievementUnlock>().eq(AchievementUnlock::getUserId, userId));
		Map<String, AchievementUnlock> byCode = new LinkedHashMap<>();
		for (AchievementUnlock row : rows) {
			byCode.put(row.getAchievementCode(), row);
		}
		List<Map<String, Object>> items = new ArrayList<>();
		for (AchievementCatalog.Def def : AchievementCatalog.all()) {
			AchievementUnlock row = byCode.get(def.code);
			Map<String, Object> item = new LinkedHashMap<>();
			item.put("code", def.code);
			item.put("name", def.name);
			item.put("desc", def.desc);
			item.put("unlocked", row != null);
			item.put("unlockCount", row == null ? 0 : (row.getUnlockCount() == null ? 0 : row.getUnlockCount()));
			item.put("firstUnlockTime", row == null || row.getFirstUnlockTime() == null
					? null
					: row.getFirstUnlockTime().toString());
			items.add(item);
		}
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("items", items);
		return body;
	}
}
