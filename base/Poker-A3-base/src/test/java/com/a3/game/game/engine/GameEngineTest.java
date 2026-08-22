package com.a3.game.game.engine;

import com.a3.game.game.model.Card;
import com.a3.game.game.model.Cards;
import com.a3.game.game.model.EngineResult;
import com.a3.game.game.model.GamePhase;
import com.a3.game.game.model.GameState;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GameEngineTest {

	@Test
	void newGame_deals52_diamond4Starts() {
		GameEngine engine = new GameEngine(new Random(1));
		GameState state = engine.newGame(null, null);
		assertEquals(4, state.getPlayers().size());
		assertEquals(52, state.getPlayers().stream().mapToInt(p -> p.getHand().size()).sum());
		state.getPlayers().forEach(p -> assertEquals(13, p.getHand().size()));
		int starter = state.getCurrentPlayer();
		assertTrue(state.getPlayers().get(starter).getHand().stream().anyMatch(Cards::isDiamond4));
		assertEquals(GamePhase.PLAYING, state.getPhase());
	}

	@Test
	void play_and_pass_followNodeRules() {
		GameEngine engine = new GameEngine(new Random(2));
		GameState state = engine.newGame(List.of("甲", "乙", "丙", "丁"), null);
		int seat = state.getCurrentPlayer();
		Card d4 = state.getPlayers().get(seat).getHand().stream().filter(Cards::isDiamond4).findFirst().orElseThrow();
		EngineResult played = engine.playCards(state, seat, List.of(d4.getId()));
		assertTrue(played.isOk());
		assertEquals((seat + 3) % 4, played.getState().getCurrentPlayer());

		EngineResult freePass = engine.passTurn(state, seat);
		assertFalse(freePass.isOk());
		assertEquals("自由出牌时不能过牌，必须出牌", freePass.getReason());

		int next = played.getState().getCurrentPlayer();
		EngineResult passed = engine.passTurn(played.getState(), next);
		assertTrue(passed.isOk());
		assertEquals(1, passed.getState().getPassCount());
	}

	@Test
	void openingLead_mustIncludeDiamond4() {
		GameEngine engine = new GameEngine(new Random(2));
		GameState state = engine.newGame(List.of("甲", "乙", "丙", "丁"), null);
		int seat = state.getCurrentPlayer();
		Card notD4 = state.getPlayers().get(seat).getHand().stream().filter(c -> !Cards.isDiamond4(c)).findFirst()
				.orElseThrow();
		EngineResult rejected = engine.playCards(state, seat, List.of(notD4.getId()));
		assertFalse(rejected.isOk());
		assertEquals("首出必须包含方片4", rejected.getReason());

		Card d4 = state.getPlayers().get(seat).getHand().stream().filter(Cards::isDiamond4).findFirst().orElseThrow();
		EngineResult ok = engine.playCards(state, seat, List.of(d4.getId()));
		assertTrue(ok.isOk());
	}

	@Test
	void attachDraw_whenSomeoneScored() {
		GameEngine engine = new GameEngine(new Random(3));
		GameState settled = engine.newGame(null, List.of(3, 3, -3, -3));
		settled.setLastDeltas(List.of(3, 3, -3, -3));
		GameState next = engine.nextRound(settled, null);
		assertEquals(GamePhase.DRAW, next.getPhase());
		assertEquals("pick", next.getDraw().getStep());
		assertEquals(2, next.getDraw().getGainers().size());
	}
}
