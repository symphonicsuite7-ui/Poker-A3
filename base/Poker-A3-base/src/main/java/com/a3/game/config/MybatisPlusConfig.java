package com.a3.game.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * 只在有数据源时扫描 Mapper。单测关掉库时不会强行创建 SqlSession。
 */
@Configuration
@ConditionalOnBean(DataSource.class)
@MapperScan({
		"com.a3.game.user.mapper",
		"com.a3.game.record.mapper",
		"com.a3.game.resource.mapper",
		"com.a3.game.achievement.mapper"
})
public class MybatisPlusConfig {
}
