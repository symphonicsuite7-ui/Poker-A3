package com.a3.game.game.model;

/**
 * 一张牌。id 与 Node 一致：suit + "-" + rank。
 * 花色 0 方片 &lt; 1 梅花 &lt; 2 红桃 &lt; 3 葵扇。
 * 点数 0=4 … 12=3。
 */
public final class Card {

	private final String id;
	private final int suit;
	private final int rank;

	public Card(int suit, int rank) {
		this.suit = suit;
		this.rank = rank;
		this.id = suit + "-" + rank;
	}

	public Card(String id, int suit, int rank) {
		this.id = id;
		this.suit = suit;
		this.rank = rank;
	}

	public Card copy() {
		return new Card(id, suit, rank);
	}

	public String getId() {
		return id;
	}

	public int getSuit() {
		return suit;
	}

	public int getRank() {
		return rank;
	}
}
