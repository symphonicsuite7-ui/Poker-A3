package com.a3.game.config;

import com.a3.game.game.model.GoodsMark;
import com.a3.game.game.model.PlayType;
import com.fasterxml.jackson.annotation.JsonValue;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 对局 JSON 与现网字段对齐：牌型 / 货标记输出小写 code。
 */
@Configuration
public class JacksonConfig {

	@Bean
	public Jackson2ObjectMapperBuilderCustomizer gameEnumCodes() {
		return builder -> builder.mixIn(PlayType.class, PlayTypeMixin.class).mixIn(GoodsMark.class, GoodsMarkMixin.class);
	}

	public abstract static class PlayTypeMixin {
		@JsonValue
		public abstract String getCode();
	}

	public abstract static class GoodsMarkMixin {
		@JsonValue
		public abstract String getCode();
	}
}
