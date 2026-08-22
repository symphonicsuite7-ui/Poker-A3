package com.a3.game.record.controller;

import com.a3.game.record.service.RecordService;
import com.a3.game.user.dto.AuthUser;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** 生涯与战绩查询。 */
@RestController
@Profile("!test")
public class RecordController {

	private final RecordService records;

	public RecordController(RecordService records) {
		this.records = records;
	}

	@GetMapping("/api/career")
	public Map<String, Object> career(Authentication authentication) {
		AuthUser user = (AuthUser) authentication.getPrincipal();
		return records.careerOf(user.getId());
	}

	@GetMapping("/api/game/records")
	public Map<String, Object> gameRecords(Authentication authentication,
			@RequestParam(value = "limit", defaultValue = "20") int limit) {
		AuthUser user = (AuthUser) authentication.getPrincipal();
		return records.recordsOf(user.getId(), limit);
	}
}
