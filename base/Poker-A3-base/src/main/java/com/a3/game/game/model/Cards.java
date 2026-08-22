package com.a3.game.game.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * 牌堆与比较，对应 Node server/engine/cards.js。
 */
public final class Cards {

	public static final String[] SUIT_NAMES = { "方片", "梅花", "红桃", "葵扇" };
	public static final String[] RANK_NAMES = {
			"4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2", "3"
	};

	private Cards() {
	}

	public static List<Card> createDeck() {
		List<Card> deck = new ArrayList<>(52);
		for (int suit = 0; suit < 4; suit++) {
			for (int rank = 0; rank < 13; rank++) {
				deck.add(new Card(suit, rank));
			}
		}
		return deck;
	}

	public static List<Card> shuffle(List<Card> deck, Random random) {
		List<Card> arr = copyList(deck);
		for (int i = arr.size() - 1; i > 0; i--) {
			int j = random.nextInt(i + 1);
			Card tmp = arr.get(i);
			arr.set(i, arr.get(j));
			arr.set(j, tmp);
		}
		return arr;
	}

	public static int compareSingle(Card a, Card b) {
		if (a.getRank() != b.getRank()) {
			return a.getRank() - b.getRank();
		}
		return a.getSuit() - b.getSuit();
	}

	public static List<Card> sortCards(List<Card> cards) {
		List<Card> copy = copyList(cards);
		copy.sort(Cards::compareSingle);
		return copy;
	}

	public static String cardLabel(Card card) {
		return SUIT_NAMES[card.getSuit()] + RANK_NAMES[card.getRank()];
	}

	public static boolean isSpade3(Card card) {
		return card.getSuit() == 3 && card.getRank() == 12;
	}

	public static boolean isSpadeA(Card card) {
		return card.getSuit() == 3 && card.getRank() == 10;
	}

	public static boolean isDiamond4(Card card) {
		return card.getSuit() == 0 && card.getRank() == 0;
	}

	public static List<Card> copyList(List<Card> cards) {
		List<Card> copy = new ArrayList<>();
		if (cards == null) {
			return copy;
		}
		for (Card card : cards) {
			copy.add(card.copy());
		}
		return copy;
	}

	public static Card maxCard(List<Card> cards) {
		Card max = cards.get(0);
		for (int i = 1; i < cards.size(); i++) {
			if (compareSingle(cards.get(i), max) > 0) {
				max = cards.get(i);
			}
		}
		return max;
	}
}
