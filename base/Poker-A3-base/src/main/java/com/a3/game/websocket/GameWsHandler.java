package com.a3.game.websocket;

import com.a3.game.room.model.RoomUser;
import com.a3.game.room.service.RoomService;
import com.a3.game.user.dto.AuthUser;
import com.a3.game.user.service.JwtService;
import com.a3.game.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * 原生 WebSocket 入口。握手带 ?token=JWT，事件名与现网 Socket.IO 一致。
 */
@Component
public class GameWsHandler extends TextWebSocketHandler {

	private final GameWsDispatcher dispatcher;
	private final GameWsHub hub;
	private final DrawAdvanceScheduler drawScheduler;
	private final RoomService rooms;
	private final ObjectMapper mapper;
	private final JwtService jwtService;
	private final ObjectProvider<UserService> users;

	public GameWsHandler(GameWsDispatcher dispatcher, GameWsHub hub, DrawAdvanceScheduler drawScheduler,
			RoomService rooms, ObjectMapper mapper, JwtService jwtService, ObjectProvider<UserService> users) {
		this.dispatcher = dispatcher;
		this.hub = hub;
		this.drawScheduler = drawScheduler;
		this.rooms = rooms;
		this.mapper = mapper;
		this.jwtService = jwtService;
		this.users = users;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		RoomUser user = resolveUser(session);
		if (user == null) {
			session.close(CloseStatus.POLICY_VIOLATION.withReason("未登录"));
			return;
		}
		synchronized (rooms) {
			hub.register(session, user);
		}
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) {
		RoomUser user = hub.userOf(session);
		if (user == null) {
			hub.sendErrorAck(session, null, "未登录");
			return;
		}
		WsEnvelope envelope;
		try {
			envelope = mapper.readValue(message.getPayload(), WsEnvelope.class);
		} catch (Exception e) {
			hub.sendErrorAck(session, null, "消息格式错误");
			return;
		}
		if (envelope.getEvent() == null || envelope.getEvent().isBlank()) {
			hub.sendErrorAck(session, envelope.getId(), "缺少 event");
			return;
		}
		DispatchResult result;
		synchronized (rooms) {
			result = dispatcher.handle(user, envelope.getEvent(), envelope.getData());
			if (result.isOk() && result.isBind() && result.getRoom() != null) {
				rooms.bindSocket(user.getUserId(), session.getId());
			}
			if (result.isBroadcast() && result.getRoom() != null) {
				hub.broadcast(result.getRoom());
			}
			if (result.isScheduleDraw() && result.getRoom() != null) {
				drawScheduler.schedule(result.getRoom());
			}
		}
		hub.sendAck(session, envelope.getId(), user, result);
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		synchronized (rooms) {
			hub.unregister(session);
		}
	}

	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		synchronized (rooms) {
			hub.unregister(session);
		}
		if (session.isOpen()) {
			session.close(CloseStatus.SERVER_ERROR);
		}
	}

	private RoomUser resolveUser(WebSocketSession session) {
		String token = WsAuth.tokenOf(session);
		if (token != null && !token.isBlank()) {
			AuthUser parsed = jwtService.tryParse(token);
			if (parsed == null) {
				return null;
			}
			UserService service = users.getIfAvailable();
			AuthUser user = service == null ? parsed : service.findActive(parsed.getId());
			if (user == null) {
				return null;
			}
			return new RoomUser(String.valueOf(user.getId()), user.displayName(), user.getAvatar());
		}
		return WsAuth.fromQuery(session);
	}
}
