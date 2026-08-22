package com.a3.game.user.service;

import com.a3.game.common.ApiException;
import com.a3.game.user.dto.AuthUser;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

	private final JwtService jwt = new JwtService("a3-game-jwt-hs256-secret-change-me-32b+", 1);

	@Test
	void createAndParseRoundTrip() {
		AuthUser user = new AuthUser();
		user.setId(7L);
		user.setUsername("甲");
		user.setNickname("玩家甲");
		user.setAvatar("/avatars/preset-1.svg");
		String token = jwt.create(user);
		AuthUser parsed = jwt.parse(token);
		assertEquals(7L, parsed.getId());
		assertEquals("甲", parsed.getUsername());
		assertEquals("玩家甲", parsed.getNickname());
		assertEquals("/avatars/preset-1.svg", parsed.getAvatar());
		assertNotNull(jwt.tryParse("Bearer " + token));
	}

	@Test
	void badTokenIsUnauthorized() {
		ApiException e = assertThrows(ApiException.class, () -> jwt.parse("not-a-jwt"));
		assertEquals(401, e.getStatus());
	}
}
