package com.a3.game.game.model;

import java.util.ArrayList;
import java.util.List;

public class GameEvent {

	private String kind;
	private Integer seat;
	private String name;
	private String text;
	private String label;
	private List<Card> cards = new ArrayList<>();

	public GameEvent copy() {
		GameEvent ev = new GameEvent();
		ev.kind = kind;
		ev.seat = seat;
		ev.name = name;
		ev.text = text;
		ev.label = label;
		ev.cards = Cards.copyList(cards);
		return ev;
	}

	public String getKind() {
		return kind;
	}

	public void setKind(String kind) {
		this.kind = kind;
	}

	public Integer getSeat() {
		return seat;
	}

	public void setSeat(Integer seat) {
		this.seat = seat;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public List<Card> getCards() {
		return cards;
	}

	public void setCards(List<Card> cards) {
		this.cards = cards;
	}
}
