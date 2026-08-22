package com.a3.game.room.service;

import com.a3.game.game.model.Card;
import com.a3.game.game.model.Cards;
import com.a3.game.game.model.GamePhase;
import com.a3.game.room.model.Room;
import com.a3.game.room.model.RoomResult;
import com.a3.game.room.model.RoomStatus;
import com.a3.game.room.model.RoomUser;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoomServiceTest {

	private final RoomService rooms = new RoomService();

	@Test
	void create_join_needFourToStart() {
		RoomUser a = user("a", "甲");
		RoomResult created = rooms.createRoom(a);
		assertTrue(created.isOk());
		String code = created.getRoom().getPassword();

		assertFalse(rooms.startGame("a").isOk());
		rooms.joinRoom(user("b", "乙"), code);
		rooms.joinRoom(user("c", "丙"), code);
		assertEquals("需要 4 名玩家才能开始", rooms.startGame("a").getError());

		rooms.joinRoom(user("d", "丁"), code);
		RoomResult started = rooms.startGame("a");
		assertTrue(started.isOk());
		assertEquals(RoomStatus.PLAYING, started.getRoom().getStatus());
		assertEquals(GamePhase.PLAYING, started.getRoom().getGame().getPhase());
		assertEquals(4, started.getRoom().getGame().getPlayers().size());
	}

	@Test
	void onlyHostCanStart_cannotJoinAfterStart() {
		Room room = fullRoom();
		assertEquals("只有房主可以开始游戏", rooms.startGame("b").getError());
		assertTrue(rooms.startGame("a").isOk());
		assertEquals("对局已开始，无法加入", rooms.joinRoom(user("e", "戊"), room.getPassword()).getError());
	}

	@Test
	void play_onlyCurrentSeat_andHideOthersHands() {
		fullRoom();
		Room room = rooms.startGame("a").getRoom();
		int current = room.getGame().getCurrentPlayer();
		String currentUser = room.getPlayers().get(current).getUserId();
		String otherUser = room.getPlayers().get((current + 1) % 4).getUserId();

		assertEquals("还没轮到你", rooms.playCards(otherUser, List.of("0-0")).getError());

		Card card = room.getGame().getPlayers().get(current).getHand().stream().filter(Cards::isDiamond4).findFirst()
				.orElseThrow();
		RoomResult played = rooms.playCards(currentUser, List.of(card.getId()));
		assertTrue(played.isOk());

		RoomService.GameView view = rooms.gameViewFor(played.getRoom(), otherUser);
		assertNotNull(view);
		for (RoomService.PlayerView p : view.players) {
			if (p.me) {
				assertNotNull(p.hand);
			} else {
				assertNull(p.hand);
			}
		}
	}

	@Test
	void leave_waitingTransfersHost_playingMarksOffline() {
		RoomUser a = user("a", "甲");
		String code = rooms.createRoom(a).getRoom().getPassword();
		rooms.joinRoom(user("b", "乙"), code);
		RoomResult left = rooms.leaveRoom("a");
		assertTrue(left.isOk());
		assertEquals("b", left.getRoom().getHostId());

		rooms.joinRoom(user("c", "丙"), code);
		rooms.joinRoom(user("d", "丁"), code);
		rooms.joinRoom(user("e", "戊"), code);
		assertTrue(rooms.startGame("b").isOk());
		RoomResult mid = rooms.leaveRoom("c");
		assertTrue(mid.isLeftDuringGame());
		assertFalse(mid.getRoom().getPlayers().stream().filter(p -> "c".equals(p.getUserId())).findFirst().orElseThrow()
				.isOnline());
	}

	@Test
	void cannotCreateSecondRoom() {
		rooms.createRoom(user("a", "甲"));
		assertEquals("你已在房间中，请先离开", rooms.createRoom(user("a", "甲")).getError());
	}

	private Room fullRoom() {
		RoomUser a = user("a", "甲");
		String code = rooms.createRoom(a).getRoom().getPassword();
		rooms.joinRoom(user("b", "乙"), code);
		rooms.joinRoom(user("c", "丙"), code);
		rooms.joinRoom(user("d", "丁"), code);
		return rooms.getRoomByUser("a");
	}

	private static RoomUser user(String id, String name) {
		return new RoomUser(id, name, null);
	}
}
