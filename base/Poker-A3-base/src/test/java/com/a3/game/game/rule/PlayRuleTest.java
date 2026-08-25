package com.a3.game.game.rule;

import com.a3.game.game.model.Card;
import com.a3.game.game.model.Play;
import com.a3.game.game.model.PlayType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PlayRuleTest {

	@Test
	void identify_singlePairTripleQuad() {
		assertEquals(PlayType.SINGLE, PlayRule.identifyPlay(List.of(c(0, 0))).getType());
		assertEquals(PlayType.PAIR, PlayRule.identifyPlay(List.of(c(0, 3), c(1, 3))).getType());
		assertNull(PlayRule.identifyPlay(List.of(c(0, 3), c(1, 4))));
		assertEquals(PlayType.TRIPLE, PlayRule.identifyPlay(List.of(c(0, 5), c(1, 5), c(2, 5))).getType());
		assertEquals(PlayType.QUAD, PlayRule.identifyPlay(List.of(c(0, 2), c(1, 2), c(2, 2), c(3, 2))).getType());
	}

	@Test
	void identify_fiveCardTypes() {
		assertEquals(PlayType.FOURONE, PlayRule.identifyPlay(List.of(c(0, 1), c(1, 1), c(2, 1), c(3, 1), c(0, 4))).getType());
		assertEquals(PlayType.FULLHOUSE, PlayRule.identifyPlay(List.of(c(0, 6), c(1, 6), c(2, 6), c(0, 7), c(1, 7))).getType());
		assertEquals(PlayType.STRAIGHT, PlayRule.identifyPlay(List.of(c(0, 0), c(1, 1), c(2, 2), c(3, 3), c(0, 4))).getType());
		assertEquals(PlayType.FLUSH, PlayRule.identifyPlay(List.of(c(2, 0), c(2, 2), c(2, 5), c(2, 7), c(2, 9))).getType());
		assertEquals(PlayType.FLUSHSTRAIGHT, PlayRule.identifyPlay(List.of(c(3, 0), c(3, 1), c(3, 2), c(3, 3), c(3, 4))).getType());
		assertEquals("天子", PlayRule.identifyPlay(List.of(c(3, 0), c(3, 1), c(3, 2), c(3, 3), c(3, 4))).getLabel());
	}

	@Test
	void pair_sameRankNeedsSpade() {
		Play low = PlayRule.identifyPlay(List.of(c(0, 3), c(1, 3)));
		Play noSpade = PlayRule.identifyPlay(List.of(c(0, 3), c(2, 3)));
		Play withSpade = PlayRule.identifyPlay(List.of(c(1, 3), c(3, 3)));
		Play bigger = PlayRule.identifyPlay(List.of(c(0, 4), c(1, 4)));
		assertFalse(PlayRule.canBeat(noSpade, low));
		assertTrue(PlayRule.canBeat(withSpade, low));
		assertTrue(PlayRule.canBeat(bigger, low));
	}

	@Test
	void fiveCard_beatLadder() {
		Play straight = PlayRule.identifyPlay(List.of(c(0, 0), c(1, 1), c(2, 2), c(3, 3), c(0, 4)));
		Play flush = PlayRule.identifyPlay(List.of(c(2, 0), c(2, 2), c(2, 5), c(2, 7), c(2, 9)));
		Play boat = PlayRule.identifyPlay(List.of(c(0, 6), c(1, 6), c(2, 6), c(0, 7), c(1, 7)));
		Play fourOne = PlayRule.identifyPlay(List.of(c(0, 1), c(1, 1), c(2, 1), c(3, 1), c(0, 4)));
		Play emperor = PlayRule.identifyPlay(List.of(c(3, 0), c(3, 1), c(3, 2), c(3, 3), c(3, 4)));
		assertTrue(PlayRule.canBeat(flush, straight));
		assertTrue(PlayRule.canBeat(boat, flush));
		assertTrue(PlayRule.canBeat(fourOne, boat));
		assertTrue(PlayRule.canBeat(emperor, fourOne));
		assertFalse(PlayRule.canBeat(straight, emperor));
	}

	/** 绕圈顺：3→4；跨圈键牌为末张（A2345 看 5），小顺可压大牌绕圈顺 */
	@Test
	void wrapStraight_keyIsLastNotThree() {
		// A2345：ranks 10,11,12,0,1 → 末张 5
		Play wrap = PlayRule.identifyPlay(List.of(c(0, 10), c(1, 11), c(2, 12), c(3, 0), c(0, 1)));
		assertEquals(PlayType.STRAIGHT, wrap.getType());
		assertEquals(1, wrap.getKeyRank().intValue());
		assertEquals(1, wrap.getKeyCard().getRank());

		// 45678 末张 8，应能压 A2345
		Play low = PlayRule.identifyPlay(List.of(c(0, 0), c(1, 1), c(2, 2), c(3, 3), c(0, 4)));
		assertTrue(PlayRule.canBeat(low, wrap));
		assertFalse(PlayRule.canBeat(wrap, low));

		// KA234 末张 4
		Play ka234 = PlayRule.identifyPlay(List.of(c(0, 9), c(1, 10), c(2, 11), c(3, 12), c(0, 0)));
		assertEquals(PlayType.STRAIGHT, ka234.getType());
		assertEquals(0, ka234.getKeyRank().intValue());

		// 同花绕圈仍是天子，不是同花
		Play wrapFlush = PlayRule.identifyPlay(List.of(c(2, 10), c(2, 11), c(2, 12), c(2, 0), c(2, 1)));
		assertEquals(PlayType.FLUSHSTRAIGHT, wrapFlush.getType());
		assertEquals(1, wrapFlush.getKeyRank().intValue());
	}

	@Test
	void validate_rejectsIllegal() {
		assertFalse(PlayRule.validatePlay(List.of(c(0, 0), c(1, 1)), null).isOk());
		assertNotNull(PlayRule.validatePlay(List.of(c(0, 0)), null).getPlay());
	}

	private static Card c(int suit, int rank) {
		return new Card(suit, rank);
	}
}
