package com.a3.game.game.rule;

import com.a3.game.game.model.Card;
import com.a3.game.game.model.Cards;
import com.a3.game.game.model.EngineResult;
import com.a3.game.game.model.Play;
import com.a3.game.game.model.PlayType;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 牌型识别与压制，对应 Node server/engine/rules.js。
 */
public final class PlayRule {

	private PlayRule() {
	}

	public static Play identifyPlay(List<Card> raw) {
		if (raw == null || raw.isEmpty()) {
			return null;
		}
		List<Card> cards = Cards.sortCards(raw);
		int n = cards.size();

		if (n == 1) {
			return play(PlayType.SINGLE, cards, cards.get(0).getRank(), cards.get(0), null);
		}
		if (n == 2) {
			if (cards.get(0).getRank() == cards.get(1).getRank()) {
				return play(PlayType.PAIR, cards, cards.get(0).getRank(), cards.get(1), null);
			}
			return null;
		}
		if (n == 3) {
			return sameRank(cards) ? play(PlayType.TRIPLE, cards, cards.get(0).getRank(), null, null) : null;
		}
		if (n == 4) {
			return sameRank(cards) ? play(PlayType.QUAD, cards, cards.get(0).getRank(), null, null) : null;
		}
		if (n == 5) {
			Map<Integer, Integer> counts = rankCounts(cards);
			Integer four = null;
			Integer one = null;
			Integer three = null;
			Integer two = null;
			for (Map.Entry<Integer, Integer> e : counts.entrySet()) {
				if (e.getValue() == 4) {
					four = e.getKey();
				}
				if (e.getValue() == 1) {
					one = e.getKey();
				}
				if (e.getValue() == 3) {
					three = e.getKey();
				}
				if (e.getValue() == 2) {
					two = e.getKey();
				}
			}
			if (four != null && one != null) {
				return play(PlayType.FOURONE, cards, four, null, null);
			}
			if (three != null && two != null) {
				return play(PlayType.FULLHOUSE, cards, three, null, null);
			}

			Card maxCard = Cards.maxCard(cards);
			boolean sameSuit = cards.stream().allMatch(c -> c.getSuit() == cards.get(0).getSuit());
			if (isStraightRanks(cards)) {
				Card keyCard = straightKeyCard(cards);
				if (keyCard == null) {
					keyCard = maxCard;
				}
				if (sameSuit) {
					return play(PlayType.FLUSHSTRAIGHT, cards, keyCard.getRank(), keyCard, cards.get(0).getSuit());
				}
				return play(PlayType.STRAIGHT, cards, keyCard.getRank(), keyCard, null);
			}
			if (sameSuit) {
				return play(PlayType.FLUSH, cards, maxCard.getRank(), maxCard, cards.get(0).getSuit());
			}
		}
		return null;
	}

	public static boolean canBeat(Play challenger, Play previous) {
		if (challenger == null) {
			return false;
		}
		if (previous == null) {
			return true;
		}
		PlayType t = previous.getType();
		PlayType c = challenger.getType();

		if (t == PlayType.SINGLE) {
			return c == PlayType.SINGLE
					&& Cards.compareSingle(challenger.getCards().get(0), previous.getCards().get(0)) > 0;
		}
		if (t == PlayType.PAIR) {
			if (c != PlayType.PAIR) {
				return false;
			}
			if (challenger.getKeyRank() > previous.getKeyRank()) {
				return true;
			}
			if (challenger.getKeyRank() < previous.getKeyRank()) {
				return false;
			}
			return challenger.getCards().stream().anyMatch(card -> card.getSuit() == 3);
		}
		if (t == PlayType.TRIPLE) {
			return c == PlayType.TRIPLE && challenger.getKeyRank() > previous.getKeyRank();
		}
		if (t == PlayType.QUAD) {
			return c == PlayType.QUAD && challenger.getKeyRank() > previous.getKeyRank();
		}
		if (t == PlayType.STRAIGHT) {
			if (c == PlayType.FLUSH || c == PlayType.FULLHOUSE || c == PlayType.FOURONE || c == PlayType.FLUSHSTRAIGHT) {
				return true;
			}
			if (c == PlayType.STRAIGHT) {
				return Cards.compareSingle(challenger.getKeyCard(), previous.getKeyCard()) > 0;
			}
			return false;
		}
		if (t == PlayType.FLUSH) {
			if (c == PlayType.FULLHOUSE || c == PlayType.FOURONE || c == PlayType.FLUSHSTRAIGHT) {
				return true;
			}
			if (c == PlayType.FLUSH) {
				if (challenger.getKeySuit() > previous.getKeySuit()) {
					return true;
				}
				if (challenger.getKeySuit() < previous.getKeySuit()) {
					return false;
				}
				return Cards.compareSingle(challenger.getKeyCard(), previous.getKeyCard()) > 0;
			}
			return false;
		}
		if (t == PlayType.FULLHOUSE) {
			if (c == PlayType.FOURONE || c == PlayType.FLUSHSTRAIGHT) {
				return true;
			}
			return c == PlayType.FULLHOUSE && challenger.getKeyRank() > previous.getKeyRank();
		}
		if (t == PlayType.FOURONE) {
			if (c == PlayType.FLUSHSTRAIGHT) {
				return true;
			}
			return c == PlayType.FOURONE && challenger.getKeyRank() > previous.getKeyRank();
		}
		if (t == PlayType.FLUSHSTRAIGHT) {
			return c == PlayType.FLUSHSTRAIGHT
					&& Cards.compareSingle(challenger.getKeyCard(), previous.getKeyCard()) > 0;
		}
		return false;
	}

	public static EngineResult validatePlay(List<Card> selected, Play lastPlay) {
		Play play = identifyPlay(selected);
		if (play == null) {
			return EngineResult.fail("不是合法牌型", null);
		}
		if (!canBeat(play, lastPlay)) {
			return EngineResult.fail(lastPlay != null ? "压不过上一手牌" : "牌型无效", null);
		}
		return EngineResult.playOk(play);
	}

	private static boolean sameRank(List<Card> cards) {
		int rank = cards.get(0).getRank();
		return cards.stream().allMatch(c -> c.getRank() == rank);
	}

	private static Map<Integer, Integer> rankCounts(List<Card> cards) {
		Map<Integer, Integer> m = new HashMap<>();
		for (Card c : cards) {
			m.merge(c.getRank(), 1, Integer::sum);
		}
		return m;
	}

	/** 点数环 4→…→3→4；返回顺子起点，非法 null */
	private static Integer straightStartRank(List<Card> cards) {
		Set<Integer> set = new HashSet<>();
		for (Card c : cards) {
			set.add(c.getRank());
		}
		if (set.size() != 5) {
			return null;
		}
		for (int start = 0; start < 13; start++) {
			boolean ok = true;
			for (int i = 0; i < 5; i++) {
				if (!set.contains((start + i) % 13)) {
					ok = false;
					break;
				}
			}
			if (ok) {
				return start;
			}
		}
		return null;
	}

	private static boolean isStraightRanks(List<Card> cards) {
		return straightStartRank(cards) != null;
	}

	/** 顺子/天子键牌：环上末张（跨 3→4 时如 A2345 看 5） */
	private static Card straightKeyCard(List<Card> cards) {
		Integer start = straightStartRank(cards);
		if (start == null) {
			return null;
		}
		int endRank = (start + 4) % 13;
		Card key = null;
		for (Card c : cards) {
			if (c.getRank() != endRank) {
				continue;
			}
			if (key == null || Cards.compareSingle(c, key) > 0) {
				key = c;
			}
		}
		return key;
	}

	private static Play play(PlayType type, List<Card> cards, Integer keyRank, Card keyCard, Integer keySuit) {
		Play p = new Play();
		p.setType(type);
		p.setCards(cards);
		p.setKeyRank(keyRank);
		p.setKeyCard(keyCard);
		p.setKeySuit(keySuit);
		p.setLabel(type.getLabel());
		return p;
	}
}
