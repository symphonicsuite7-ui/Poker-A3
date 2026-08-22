package com.a3.game.user.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 脚本里 test 用户的 BCrypt 被截短，启动时补成 123456 的合法哈希。
 */
@Component
@Order(1)
@Profile("!test")
public class TestPasswordFixer implements ApplicationRunner {

	private final UserService users;

	public TestPasswordFixer(UserService users) {
		this.users = users;
	}

	@Override
	public void run(ApplicationArguments args) {
		users.repairPasswordIfBroken("test", "123456");
	}
}
