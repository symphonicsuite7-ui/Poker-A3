package com.a3.game.game.model;

import java.util.List;

/** 一手已识别的出牌。 */
public class Play {

	private PlayType type;
	private List<Card> cards;
	private Integer keyRank;
	private Integer keySuit;
	private Card keyCard;
	private String label;

	public Play copy() {
		Play play = new Play();
		play.type = type;
		play.cards = Cards.copyList(cards);
		play.keyRank = keyRank;
		play.keySuit = keySuit;
		play.keyCard = keyCard == null ? null : keyCard.copy();
		play.label = label;
		return play;
	}

	public PlayType getType() {
		return type;
	}

	public void setType(PlayType type) {
		this.type = type;
	}

	public List<Card> getCards() {
		return cards;
	}

	public void setCards(List<Card> cards) {
		this.cards = cards;
	}

	public Integer getKeyRank() {
		return keyRank;
	}

	public void setKeyRank(Integer keyRank) {
		this.keyRank = keyRank;
	}

	public Integer getKeySuit() {
		return keySuit;
	}

	public void setKeySuit(Integer keySuit) {
		this.keySuit = keySuit;
	}

	public Card getKeyCard() {
		return keyCard;
	}

	public void setKeyCard(Card keyCard) {
		this.keyCard = keyCard;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}
}
