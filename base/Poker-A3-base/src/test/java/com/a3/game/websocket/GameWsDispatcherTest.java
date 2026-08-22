package com.a3.game.websocket;

import com.a3.game.game.model.Card;
import com.a3.game.game.model.Cards;
import com.a3.game.room.model.RoomUser;
import com.a3.game.room.service.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GameWsDispatcherTest {

	private final RoomService rooms = new RoomService();
	private final GameWsDispatcher dispatcher = new GameWsDispatcher(rooms);
	private final ObjectMapper mapper = new ObjectMapper();

	@Test
	void create_join_start_play_andUnknownEvent() {
		RoomUser a = user("a", "甲");
		DispatchResult created = dispatcher.handle(a, "room:create", null);
		assertTrue(created.isOk());
		assertTrue(created.isBroadcast());
		assertTrue(created.isBind());
		assertNotNull(created.getRoom().getPassword());

		ObjectNode join = mapper.createObjectNode();
		join.put("password", created.getRoom().getPassword());
		assertTrue(dispatcher.handle(user("b", "乙"), "room:join", join).isOk());
		assertTrue(dispatcher.handle(user("c", "丙"), "room:join", join).isOk());
		assertEquals("需要 4 名玩家才能开始", dispatcher.handle(a, "room:start", null).getError());
		assertTrue(dispatcher.handle(user("d", "丁"), "room:join", join).isOk());

		DispatchResult started = dispatcher.handle(a, "room:start", null);
		assertTrue(started.isOk());
		assertTrue(started.isBroadcast());

		int current = started.getRoom().getGame().getCurrentPlayer();
		String currentUser = started.getRoom().getPlayers().get(current).getUserId();
		Card card = started.getRoom().getGame().getPlayers().get(current).getHand().stream().filter(Cards::isDiamond4)
				.findFirst().orElseThrow();
		ObjectNode play = mapper.createObjectNode();
		play.putArray("cardIds").add(card.getId());
		DispatchResult played = dispatcher.handle(user(currentUser, "当前"), "game:play", play);
		assertTrue(played.isOk());

		DispatchResult unknown = dispatcher.handle(a, "foo:bar", null);
		assertFalse(unknown.isOk());
		assertTrue(unknown.getError().contains("未知事件"));
	}

	@Test
	void joinWithoutPasswordFails_syncReturnsRoom() {
		RoomUser a = user("a", "甲");
		dispatcher.handle(a, "room:create", null);
		assertEquals("请输入房间密码", dispatcher.handle(user("b", "乙"), "room:join", null).getError());

		DispatchResult sync = dispatcher.handle(a, "room:sync", null);
		assertTrue(sync.isOk());
		assertTrue(sync.isSync());
		assertFalse(sync.isBroadcast());
		assertNotNull(sync.getRoom());

		DispatchResult empty = dispatcher.handle(user("z", "路人"), "room:sync", null);
		assertTrue(empty.isOk());
		assertNull(empty.getRoom());
	}

	@Test
	void leaveBroadcastsRemaining() {
		RoomUser a = user("a", "甲");
		ObjectNode join = mapper.createObjectNode();
		join.put("password", dispatcher.handle(a, "room:create", null).getRoom().getPassword());
		dispatcher.handle(user("b", "乙"), "room:join", join);
		DispatchResult left = dispatcher.handle(a, "room:leave", null);
		assertTrue(left.isOk());
		assertTrue(left.isBroadcast());
		assertEquals("b", left.getRoom().getHostId());
	}

	private static RoomUser user(String id, String name) {
		return new RoomUser(id, name, null);
	}
}
