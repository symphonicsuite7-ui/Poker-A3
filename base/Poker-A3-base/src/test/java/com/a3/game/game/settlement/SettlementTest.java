package com.a3.game.game.settlement;

import com.a3.game.game.model.Card;
import com.a3.game.game.model.GamePhase;
import com.a3.game.game.model.GamePlayer;
import com.a3.game.game.model.GameState;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SettlementTest {

	@Test
	void solo_first_plus9() {
		GameState state = soloState(1, 2, 3, 4);
		Settlement.settle(state);
		assertEquals(GamePhase.SETTLED, state.getPhase());
		assertEquals(9, state.getPlayers().get(0).getScore());
		assertEquals(-3, state.getPlayers().get(1).getScore());
		assertEquals(-3, state.getPlayers().get(2).getScore());
		assertEquals(-3, state.getPlayers().get(3).getScore());
		assertEquals(List.of(9, -3, -3, -3), state.getLastDeltas());
	}

	@Test
	void solo_last_minus9() {
		GameState state = soloState(4, 1, 2, 3);
		Settlement.settle(state);
		assertEquals(-9, state.getPlayers().get(0).getScore());
		assertEquals(3, state.getPlayers().get(1).getScore());
		assertEquals(3, state.getPlayers().get(2).getScore());
		assertEquals(3, state.getPlayers().get(3).getScore());
	}

	@Test
	void solo_second_firstUnchanged() {
		GameState state = soloState(2, 1, 3, 4);
		Settlement.settle(state);
		assertEquals(4, state.getPlayers().get(0).getScore());
		assertEquals(0, state.getPlayers().get(1).getScore());
		assertEquals(-2, state.getPlayers().get(2).getScore());
		assertEquals(-2, state.getPlayers().get(3).getScore());
	}

	@Test
	void partnership_doubleUp_plus3() {
		GameState state = teamState(1, 2, 3, 4);
		Settlement.settle(state);
		assertEquals(3, state.getPlayers().get(0).getScore());
		assertEquals(3, state.getPlayers().get(1).getScore());
		assertEquals(-3, state.getPlayers().get(2).getScore());
		assertEquals(-3, state.getPlayers().get(3).getScore());
	}

	@Test
	void partnership_oneFour_draw() {
		GameState state = teamState(1, 4, 2, 3);
		Settlement.settle(state);
		assertEquals(0, state.getPlayers().get(0).getScore());
		assertEquals(0, state.getPlayers().get(1).getScore());
		assertEquals(0, state.getLastDeltas().get(0));
	}

	@Test
	void lock_soloFirst() {
		GameState state = soloState(1, null, null, null);
		assertEquals("独吞头游，计分已确定", Settlement.scoreLockReason(state));
	}

	@Test
	void resolve_sameOwnerIsSolo() {
		GamePlayer p0 = player(0, List.of(new Card(3, 12), new Card(3, 10)));
		GamePlayer p1 = player(1, List.of(new Card(0, 0)));
		GamePlayer p2 = player(2, List.of(new Card(1, 0)));
		GamePlayer p3 = player(3, List.of(new Card(2, 0)));
		TeamResolver.Teams teams = TeamResolver.resolve(List.of(p0, p1, p2, p3));
		assertTrue(teams.solo);
		assertEquals(List.of(0), teams.teamA);
		assertEquals(List.of(1, 2, 3), teams.teamB);
	}

	private static GameState soloState(Integer r0, Integer r1, Integer r2, Integer r3) {
		GameState state = new GameState();
		state.setSolo(true);
		state.setTeamA(List.of(0));
		state.setTeamB(List.of(1, 2, 3));
		state.getPlayers().add(ranked(0, r0));
		state.getPlayers().add(ranked(1, r1));
		state.getPlayers().add(ranked(2, r2));
		state.getPlayers().add(ranked(3, r3));
		if (r0 != null) {
			state.getFinishedOrder().add(0);
		}
		return state;
	}

	private static GameState teamState(int a0, int a1, int b0, int b1) {
		GameState state = new GameState();
		state.setSolo(false);
		state.setTeamA(List.of(0, 1));
		state.setTeamB(List.of(2, 3));
		state.getPlayers().add(ranked(0, a0));
		state.getPlayers().add(ranked(1, a1));
		state.getPlayers().add(ranked(2, b0));
		state.getPlayers().add(ranked(3, b1));
		return state;
	}

	private static GamePlayer ranked(int id, Integer rank) {
		GamePlayer p = player(id, List.of());
		p.setFinishedRank(rank);
		p.setScore(0);
		return p;
	}

	private static GamePlayer player(int id, List<Card> hand) {
		GamePlayer p = new GamePlayer();
		p.setId(id);
		p.setName("玩家" + (id + 1));
		p.setHand(hand);
		return p;
	}
}
