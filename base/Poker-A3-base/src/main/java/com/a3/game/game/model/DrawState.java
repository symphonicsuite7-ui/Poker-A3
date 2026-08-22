package com.a3.game.game.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class DrawState {

	private String step;
	private boolean uniqueTargets;
	private List<DrawParty> gainers = new ArrayList<>();
	private List<DrawParty> losers = new ArrayList<>();
	private Map<String, Integer> picks = new LinkedHashMap<>();
	private List<DrawTransfer> takes = new ArrayList<>();
	private Map<String, List<String>> gives = new LinkedHashMap<>();
	private List<DrawTransfer> giveCards = new ArrayList<>();
	private Long revealUntil;

	public DrawState copy() {
		DrawState d = new DrawState();
		d.step = step;
		d.uniqueTargets = uniqueTargets;
		for (DrawParty g : gainers) {
			d.gainers.add(g.copy());
		}
		for (DrawParty g : losers) {
			d.losers.add(g.copy());
		}
		d.picks.putAll(picks);
		for (DrawTransfer t : takes) {
			d.takes.add(t.copy());
		}
		for (Map.Entry<String, List<String>> e : gives.entrySet()) {
			d.gives.put(e.getKey(), e.getValue() == null ? new ArrayList<>() : new ArrayList<>(e.getValue()));
		}
		for (DrawTransfer t : giveCards) {
			d.giveCards.add(t.copy());
		}
		d.revealUntil = revealUntil;
		return d;
	}

	public String getStep() {
		return step;
	}

	public void setStep(String step) {
		this.step = step;
	}

	public boolean isUniqueTargets() {
		return uniqueTargets;
	}

	public void setUniqueTargets(boolean uniqueTargets) {
		this.uniqueTargets = uniqueTargets;
	}

	public List<DrawParty> getGainers() {
		return gainers;
	}

	public List<DrawParty> getLosers() {
		return losers;
	}

	public Map<String, Integer> getPicks() {
		return picks;
	}

	public List<DrawTransfer> getTakes() {
		return takes;
	}

	public Map<String, List<String>> getGives() {
		return gives;
	}

	public List<DrawTransfer> getGiveCards() {
		return giveCards;
	}

	public Long getRevealUntil() {
		return revealUntil;
	}

	public void setRevealUntil(Long revealUntil) {
		this.revealUntil = revealUntil;
	}

	public Integer pickOf(int seat) {
		if (picks.containsKey(String.valueOf(seat))) {
			return picks.get(String.valueOf(seat));
		}
		return picks.get(Integer.toString(seat));
	}

	public List<String> giveOf(int seat) {
		List<String> v = gives.get(String.valueOf(seat));
		if (v != null) {
			return v;
		}
		return gives.get(Integer.toString(seat));
	}
}
