package com.a3.game.websocket;

import com.a3.game.resource.BackgroundCatalog;
import com.a3.game.room.model.RoomBackground;
import com.a3.game.room.model.RoomResult;
import com.a3.game.room.model.RoomUser;
import com.a3.game.room.service.RoomService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 把与 Socket.IO 同名的事件转到 RoomService。
 */
@Component
public class GameWsDispatcher {

	private final RoomService rooms;
	private final BackgroundCatalog catalog;

	public GameWsDispatcher(RoomService rooms) {
		this(rooms, null);
	}

	@Autowired
	public GameWsDispatcher(RoomService rooms, BackgroundCatalog catalog) {
		this.rooms = rooms;
		this.catalog = catalog;
	}

	public DispatchResult handle(RoomUser user, String event, JsonNode data) {
		if (event == null || event.isBlank()) {
			return DispatchResult.fail("缺少 event");
		}
		return switch (event) {
			case "room:create" -> from(rooms.createRoom(user), true, false, false, true);
			case "room:join" -> from(rooms.joinRoom(user, text(data, "password")), true, false, false, true);
			case "room:leave" -> leave(user);
			case "room:start" -> from(rooms.startGame(user.getUserId()), true, false, false, false);
			case "room:next" -> from(rooms.nextRound(user.getUserId()), true, false, false, false);
			case "game:play" -> from(rooms.playCards(user.getUserId(), stringList(data, "cardIds")), true, false, false, false);
			case "game:pass" -> from(rooms.passTurn(user.getUserId()), true, false, false, false);
			case "game:drawPick" -> from(rooms.pickDrawTarget(user.getUserId(), intVal(data, "targetSeat")), true, true, false, false);
			case "game:drawGive" -> from(rooms.giveDrawCards(user.getUserId(), stringList(data, "cardIds")), true, true, false, false);
			case "room:background" -> from(rooms.setBackground(user.getUserId(), background(data)), true, false, false, false);
			case "room:sync" -> DispatchResult.ack(rooms.getRoomByUser(user.getUserId()), false, false, true, true);
			default -> DispatchResult.fail("未知事件：" + event);
		};
	}

	private DispatchResult leave(RoomUser user) {
		RoomResult result = rooms.leaveRoom(user.getUserId());
		return new DispatchResult(true, null, result.getRoom(), result.getRoom() != null, false, false, false);
	}

	private static DispatchResult from(RoomResult result, boolean broadcast, boolean scheduleDraw, boolean sync,
			boolean bind) {
		if (!result.isOk()) {
			return DispatchResult.fail(result.getError());
		}
		return DispatchResult.ack(result.getRoom(), broadcast, scheduleDraw, sync, bind);
	}

	private static String text(JsonNode data, String field) {
		if (data == null || data.get(field) == null || data.get(field).isNull()) {
			return null;
		}
		return data.get(field).asText();
	}

	private static int intVal(JsonNode data, String field) {
		if (data == null || data.get(field) == null || data.get(field).isNull()) {
			return -1;
		}
		return data.get(field).asInt();
	}

	private static List<String> stringList(JsonNode data, String field) {
		List<String> list = new ArrayList<>();
		if (data == null || data.get(field) == null || !data.get(field).isArray()) {
			return list;
		}
		data.get(field).forEach(n -> list.add(n.asText()));
		return list;
	}

	private RoomBackground background(JsonNode data) {
		String file = text(data, "file");
		String name = text(data, "name");
		String url = text(data, "url");
		if (catalog != null) {
			return catalog.complete(file, name, url);
		}
		if (file == null || file.isBlank()) {
			return null;
		}
		RoomBackground bg = new RoomBackground();
		bg.setFile(file);
		bg.setName(name);
		bg.setUrl(url);
		return bg;
	}
}
