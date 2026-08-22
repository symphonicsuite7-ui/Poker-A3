package com.a3.game.websocket;

import com.a3.game.room.model.Room;
import com.a3.game.room.model.RoomUser;
import com.a3.game.room.model.Seat;
import com.a3.game.room.service.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 会话登记与按座位推送 room:update，对应 Node broadcastRoom。
 */
@Component
public class GameWsHub {

	private static final Logger log = LoggerFactory.getLogger(GameWsHub.class);

	private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
	private final ConcurrentHashMap<String, RoomUser> users = new ConcurrentHashMap<>();
	private final RoomService rooms;
	private final ObjectMapper mapper;

	public GameWsHub(RoomService rooms, ObjectMapper mapper) {
		this.rooms = rooms;
		this.mapper = mapper;
	}

	public void register(WebSocketSession session, RoomUser user) {
		sessions.put(session.getId(), session);
		users.put(session.getId(), user);
		Room room = rooms.bindSocket(user.getUserId(), session.getId());
		if (room != null) {
			broadcast(room);
		}
	}

	public void unregister(WebSocketSession session) {
		if (session == null) {
			return;
		}
		sessions.remove(session.getId());
		users.remove(session.getId());
		Room room = rooms.setOffline(session.getId());
		if (room != null) {
			broadcast(room);
		}
	}

	public RoomUser userOf(WebSocketSession session) {
		return session == null ? null : users.get(session.getId());
	}

	/** 每人一份脱敏后的 {event, room, game}。 */
	public void broadcast(Room room) {
		if (room == null) {
			return;
		}
		for (Seat p : room.getPlayers()) {
			if (p.getSocketId() == null) {
				continue;
			}
			WebSocketSession session = sessions.get(p.getSocketId());
			if (session == null || !session.isOpen()) {
				continue;
			}
			Map<String, Object> payload = new LinkedHashMap<>();
			payload.put("event", "room:update");
			payload.put("room", rooms.toPublic(room, p.getUserId()));
			payload.put("game", rooms.gameViewFor(room, p.getUserId()));
			send(session, payload);
		}
	}

	public void sendAck(WebSocketSession session, String id, RoomUser user, DispatchResult result) {
		Map<String, Object> ack = new LinkedHashMap<>();
		ack.put("event", "ack");
		ack.put("id", id);
		ack.put("ok", result.isOk());
		if (!result.isOk()) {
			ack.put("error", result.getError());
			send(session, ack);
			return;
		}
		if (result.isSync()) {
			if (result.getRoom() == null || user == null) {
				ack.put("room", null);
				ack.put("game", null);
			} else {
				ack.put("room", rooms.toPublic(result.getRoom(), user.getUserId()));
				ack.put("game", rooms.gameViewFor(result.getRoom(), user.getUserId()));
			}
		} else if (result.isBind() && result.getRoom() != null && user != null) {
			// room:create / room:join 与现网一样带回房间快照
			ack.put("room", rooms.toPublic(result.getRoom(), user.getUserId()));
		}
		send(session, ack);
	}

	public void sendErrorAck(WebSocketSession session, String id, String error) {
		Map<String, Object> ack = new LinkedHashMap<>();
		ack.put("event", "ack");
		ack.put("id", id);
		ack.put("ok", false);
		ack.put("error", error);
		send(session, ack);
	}

	void send(WebSocketSession session, Object payload) {
		if (session == null || !session.isOpen()) {
			return;
		}
		try {
			String json = mapper.writeValueAsString(payload);
			synchronized (session) {
				session.sendMessage(new TextMessage(json));
			}
		} catch (IOException e) {
			log.warn("WebSocket 发送失败：{}", e.getMessage());
		}
	}
}
