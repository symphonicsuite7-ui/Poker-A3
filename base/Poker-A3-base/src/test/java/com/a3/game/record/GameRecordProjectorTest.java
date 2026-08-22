package com.a3.game.record;

import com.a3.game.game.model.GameEvent;
import com.a3.game.game.model.GamePhase;
import com.a3.game.game.model.GamePlayer;
import com.a3.game.game.model.GameState;
import com.a3.game.record.GameRecordProjector.ProjectedGame;
import com.a3.game.record.GameRecordProjector.ProjectedPlayer;
import com.a3.game.room.model.Room;
import com.a3.game.room.model.Seat;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GameRecordProjectorTest {

	@Test
	void soloFirst_emperor_twoRoundWin() {
		Room room = settledRoom(true, List.of(9, -3, -3, -3), List.of(1, 2, 3, 4));
		GameState g = room.getGame();
		g.setTeamA(List.of(0));
		g.setTeamB(List.of(1, 2, 3));
		play(g, 0, "天子");
		event(g, "system", null, "全部过牌，甲 自由出牌");
		play(g, 0, "单张");
		event(g, "system", 0, "甲 从 乙 抽了 2 张");

		ProjectedGame snap = GameRecordProjector.project(room);
		assertTrue(GameRecordProjector.allPlayersPersisted(snap));
		assertEquals("SOLO", snap.winnerType);
		assertEquals(1, snap.isSolo);
		assertEquals(2, snap.roundCount);

		ProjectedPlayer a = snap.players.get(0);
		assertEquals(1L, a.userId);
		assertEquals("WIN", a.result);
		assertEquals(9, a.deltaScore);
		assertEquals(1, a.isSoloPlayer);
		assertEquals("SOLO", a.teamType);
		assertEquals(1, a.playedEmperor);
		assertEquals(2, a.playCount);
		assertEquals(1, a.drawTakeCount);
		assertTrue(a.twoRoundWin);

		ProjectedPlayer b = snap.players.get(1);
		assertEquals("LOSE", b.result);
		assertEquals(1, b.drawGiveCount);
		assertEquals(0, b.isSoloPlayer);
		assertEquals("B", b.teamType);
	}

	@Test
	void skipWhenSeatIdNotNumeric() {
		Room room = settledRoom(false, List.of(3, 3, -3, -3), List.of(1, 2, 3, 4));
		room.getPlayers().get(0).setUserId("host");
		ProjectedGame snap = GameRecordProjector.project(room);
		assertFalse(GameRecordProjector.allPlayersPersisted(snap));
		assertNull(snap.players.get(0).userId);
	}

	@Test
	void teamDraw_noTwoRound() {
		Room room = settledRoom(false, List.of(0, 0, 0, 0), List.of(1, 4, 2, 3));
		room.getGame().setTeamA(List.of(0, 1));
		room.getGame().setTeamB(List.of(2, 3));
		play(room.getGame(), 0, "单张");
		event(room.getGame(), "system", null, "全部过牌，甲 自由出牌");
		event(room.getGame(), "system", null, "全部过牌，乙 自由出牌");
		play(room.getGame(), 1, "一对");

		ProjectedGame snap = GameRecordProjector.project(room);
		assertEquals("DRAW", snap.winnerType);
		assertEquals(3, snap.roundCount);
		assertEquals("DRAW", snap.players.get(0).result);
		assertFalse(snap.players.get(0).twoRoundWin);
		assertEquals("A", snap.players.get(0).teamType);
	}

	private static Room settledRoom(boolean solo, List<Integer> deltas, List<Integer> ranks) {
		Room room = new Room();
		room.setId("room-1");
		room.setGameStartedAt(System.currentTimeMillis() - 8000);
		for (int i = 0; i < 4; i++) {
			Seat s = new Seat();
			s.setUserId(String.valueOf(i + 1L));
			s.setUsername(name(i));
			s.setSeat(i);
			room.getPlayers().add(s);
		}
		GameState g = new GameState();
		g.setPhase(GamePhase.SETTLED);
		g.setSolo(solo);
		g.setRound(1);
		g.setLastDeltas(deltas);
		g.setTeamA(List.of(0, 1));
		g.setTeamB(List.of(2, 3));
		for (int i = 0; i < 4; i++) {
			GamePlayer p = new GamePlayer();
			p.setId(i);
			p.setName(name(i));
			p.setFinishedRank(ranks.get(i));
			p.setScore(deltas.get(i));
			g.getPlayers().add(p);
			g.getFinishedOrder().add(i);
		}
		room.setGame(g);
		return room;
	}

	private static void play(GameState g, int seat, String label) {
		GameEvent ev = new GameEvent();
		ev.setKind("play");
		ev.setSeat(seat);
		ev.setName(name(seat));
		ev.setLabel(label);
		ev.setText(name(seat) + " 出" + label);
		g.getEvents().add(ev);
	}

	private static void event(GameState g, String kind, Integer seat, String text) {
		GameEvent ev = new GameEvent();
		ev.setKind(kind);
		ev.setSeat(seat);
		ev.setText(text);
		g.getEvents().add(ev);
	}

	private static String name(int i) {
		return List.of("甲", "乙", "丙", "丁").get(i);
	}
}
