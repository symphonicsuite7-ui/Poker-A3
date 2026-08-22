package com.a3.game.websocket;

import com.a3.game.room.model.RoomUser;
import org.springframework.web.socket.WebSocketSession;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * WebSocket 身份：优先 query token（JWT），没有则退回 userId/username。
 */
public final class WsAuth {

	private WsAuth() {
	}

	public static String tokenOf(WebSocketSession session) {
		if (session == null || session.getUri() == null) {
			return null;
		}
		return first(parseQuery(session.getUri().getRawQuery()), "token");
	}

	public static RoomUser fromQuery(WebSocketSession session) {
		if (session == null || session.getUri() == null) {
			return null;
		}
		Map<String, String> query = parseQuery(session.getUri().getRawQuery());
		String userId = first(query, "userId", "user_id");
		String username = first(query, "username", "name");
		if (userId == null || userId.isBlank() || username == null || username.isBlank()) {
			return null;
		}
		return new RoomUser(userId.trim(), username.trim(), first(query, "avatar"));
	}

	public static RoomUser fromSession(WebSocketSession session) {
		return fromQuery(session);
	}

	static Map<String, String> parseQuery(String raw) {
		Map<String, String> map = new LinkedHashMap<>();
		if (raw == null || raw.isBlank()) {
			return map;
		}
		for (String part : raw.split("&")) {
			if (part.isEmpty()) {
				continue;
			}
			int eq = part.indexOf('=');
			if (eq < 0) {
				map.put(decode(part), "");
			} else {
				map.put(decode(part.substring(0, eq)), decode(part.substring(eq + 1)));
			}
		}
		return map;
	}

	private static String first(Map<String, String> query, String... keys) {
		for (String key : keys) {
			String value = query.get(key);
			if (value != null && !value.isBlank()) {
				return value;
			}
		}
		return null;
	}

	private static String decode(String value) {
		return URLDecoder.decode(value, StandardCharsets.UTF_8);
	}
}
