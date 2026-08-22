package com.a3.game;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * A3 棋牌后端入口。
 * MySQL / MyBatis-Plus 已启用；Redis 仍关闭。
 */
@SpringBootApplication
public class A3GameApplication {

	public static void main(String[] args) {
		SpringApplication.run(A3GameApplication.class, args);
	}
}
