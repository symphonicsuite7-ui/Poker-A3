package com.a3.game.user.service;

import com.a3.game.common.ApiException;
import com.a3.game.user.entity.SysUser;
import com.a3.game.user.mapper.SysUserMapper;
import com.a3.game.user.mapper.UserCareerMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserServiceTest {

	private SysUserMapper users;
	private UserService service;

	@BeforeEach
	void setUp() {
		users = mock(SysUserMapper.class);
		UserCareerMapper careers = mock(UserCareerMapper.class);
		PasswordEncoder encoder = new BCryptPasswordEncoder(8);
		JwtService jwt = new JwtService("a3-game-jwt-hs256-secret-change-me-32b+", 1);
		AvatarService avatars = new AvatarService("target/test-uploads");
		service = new UserService(users, careers, encoder, jwt, avatars);
	}

	@Test
	void registerRejectsBadUsernameAndShortPassword() {
		ApiException name = assertThrows(ApiException.class, () -> service.register("a", "123456", null, null, null));
		assertEquals("用户名需 2-16 位（中文/字母/数字/下划线）", name.getMessage());
		ApiException pass = assertThrows(ApiException.class, () -> service.register("player", "12", null, null, null));
		assertEquals("密码需 4-32 位", pass.getMessage());
	}

	@Test
	void loginFailsWhenPasswordWrong() {
		SysUser user = new SysUser();
		user.setId(1L);
		user.setUsername("test");
		user.setPassword(new BCryptPasswordEncoder(8).encode("right"));
		user.setStatus(1);
		when(users.selectOne(ArgumentMatchers.<LambdaQueryWrapper<SysUser>>any())).thenReturn(user);
		ApiException e = assertThrows(ApiException.class, () -> service.login("test", "wrong"));
		assertEquals("用户名或密码错误", e.getMessage());
	}

	@Test
	void loginSucceedsAndReturnsJwt() {
		SysUser user = new SysUser();
		user.setId(1L);
		user.setUsername("test");
		user.setNickname("A3玩家");
		user.setPassword(new BCryptPasswordEncoder(8).encode("123456"));
		user.setAvatarUrl("/avatars/preset-1.svg");
		user.setStatus(1);
		when(users.selectOne(ArgumentMatchers.<LambdaQueryWrapper<SysUser>>any())).thenReturn(user);
		var body = service.login("test", "123456");
		assertTrue((Boolean) body.get("ok"));
		assertTrue(body.get("token").toString().length() > 20);
	}
}
