package com.a3.game.config;

import com.a3.game.game.engine.GameEngine;
import com.a3.game.record.service.RecordService;
import com.a3.game.room.service.RoomService;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 领域 / 应用对象装配。GameEngine 本身不打 Spring 注解。
 */
@Configuration
public class DomainBeans {

	@Bean
	public GameEngine gameEngine() {
		return new GameEngine();
	}

	@Bean
	public RoomService roomService(GameEngine gameEngine, ObjectProvider<RecordService> records) {
		return new RoomService(gameEngine, records.getIfAvailable());
	}
}
