package com.a3.game.game.model;

import java.util.List;

public class DrawTransfer {

	private int from;
	private int to;
	private List<Card> cards;

	public DrawTransfer copy() {
		DrawTransfer t = new DrawTransfer();
		t.from = from;
		t.to = to;
		t.cards = Cards.copyList(cards);
		return t;
	}

	public int getFrom() {
		return from;
	}

	public void setFrom(int from) {
		this.from = from;
	}

	public int getTo() {
		return to;
	}

	public void setTo(int to) {
		this.to = to;
	}

	public List<Card> getCards() {
		return cards;
	}

	public void setCards(List<Card> cards) {
		this.cards = cards;
	}
}
