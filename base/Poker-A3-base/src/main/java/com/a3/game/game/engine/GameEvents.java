package com.a3.game.game.engine;

import com.a3.game.game.model.Card;
import com.a3.game.game.model.Cards;
import com.a3.game.game.model.GameEvent;
import com.a3.game.game.model.GameState;

import java.util.List;

/** 写本局日志，对应 Node pushEvent。 */
public final class GameEvents {

	private GameEvents() {
	}

	public static void push(GameState state, String kind, Integer seat, String name, String text, String label,
			List<Card> cards) {
		state.getHistory().add(text);
		GameEvent ev = new GameEvent();
		ev.setKind(kind == null ? "system" : kind);
		ev.setSeat(seat);
		ev.setName(name == null ? "" : name);
		ev.setText(text);
		ev.setLabel(label == null ? "" : label);
		ev.setCards(Cards.copyList(cards));
		state.getEvents().add(ev);
	}
}
