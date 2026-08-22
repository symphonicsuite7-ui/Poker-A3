package com.a3.game.achievement.controller;

import com.a3.game.achievement.service.AchievementService;
import com.a3.game.user.dto.AuthUser;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** 成就页。 */
@RestController
@Profile("!test")
public class AchievementController {

	private final AchievementService achievements;

	public AchievementController(AchievementService achievements) {
		this.achievements = achievements;
	}

	@GetMapping("/api/achievements")
	public Map<String, Object> list(Authentication authentication) {
		AuthUser user = (AuthUser) authentication.getPrincipal();
		return achievements.listOf(user.getId());
	}
}
