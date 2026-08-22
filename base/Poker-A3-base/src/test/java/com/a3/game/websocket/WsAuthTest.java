package com.a3.game.websocket;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WsAuthTest {

	@Test
	void parseQueryDecodesChineseUsername() {
		Map<String, String> q = WsAuth.parseQuery("userId=a&username=%E7%94%B2&avatar=/avatars/preset-1.svg");
		assertEquals("a", q.get("userId"));
		assertEquals("甲", q.get("username"));
		assertEquals("/avatars/preset-1.svg", q.get("avatar"));
		assertTrue(q.containsKey("userId"));
	}
}
