package com.a3.game.game.model;

import java.util.ArrayList;
import java.util.List;

public class GameState {

	private List<GamePlayer> players = new ArrayList<>();
	private int currentPlayer;
	private Play lastPlay;
	private Integer lastPlayPlayer;
	private int passCount;
	private List<Integer> finishedOrder = new ArrayList<>();
	private GamePhase phase = GamePhase.PLAYING;
	private boolean revealedTeam;
	private List<Integer> teamA = new ArrayList<>();
	private List<Integer> teamB = new ArrayList<>();
	private boolean solo;
	private List<String> history = new ArrayList<>();
	private List<GameEvent> events = new ArrayList<>();
	private int round = 1;
	private List<Integer> scores = new ArrayList<>();
	private List<Integer> lastDeltas = new ArrayList<>(List.of(0, 0, 0, 0));
	private DrawState draw;

	public GameState copy() {
		GameState s = new GameState();
		for (GamePlayer p : players) {
			s.players.add(p.copy());
		}
		s.currentPlayer = currentPlayer;
		s.lastPlay = lastPlay == null ? null : lastPlay.copy();
		s.lastPlayPlayer = lastPlayPlayer;
		s.passCount = passCount;
		s.finishedOrder = new ArrayList<>(finishedOrder);
		s.phase = phase;
		s.revealedTeam = revealedTeam;
		s.teamA = new ArrayList<>(teamA);
		s.teamB = new ArrayList<>(teamB);
		s.solo = solo;
		s.history = new ArrayList<>(history);
		for (GameEvent ev : events) {
			s.events.add(ev.copy());
		}
		s.round = round;
		s.scores = new ArrayList<>(scores);
		s.lastDeltas = new ArrayList<>(lastDeltas);
		s.draw = draw == null ? null : draw.copy();
		return s;
	}

	public List<GamePlayer> getPlayers() {
		return players;
	}

	public int getCurrentPlayer() {
		return currentPlayer;
	}

	public void setCurrentPlayer(int currentPlayer) {
		this.currentPlayer = currentPlayer;
	}

	public Play getLastPlay() {
		return lastPlay;
	}

	public void setLastPlay(Play lastPlay) {
		this.lastPlay = lastPlay;
	}

	public Integer getLastPlayPlayer() {
		return lastPlayPlayer;
	}

	public void setLastPlayPlayer(Integer lastPlayPlayer) {
		this.lastPlayPlayer = lastPlayPlayer;
	}

	public int getPassCount() {
		return passCount;
	}

	public void setPassCount(int passCount) {
		this.passCount = passCount;
	}

	public List<Integer> getFinishedOrder() {
		return finishedOrder;
	}

	public GamePhase getPhase() {
		return phase;
	}

	public void setPhase(GamePhase phase) {
		this.phase = phase;
	}

	public boolean isRevealedTeam() {
		return revealedTeam;
	}

	public void setRevealedTeam(boolean revealedTeam) {
		this.revealedTeam = revealedTeam;
	}

	public List<Integer> getTeamA() {
		return teamA;
	}

	public void setTeamA(List<Integer> teamA) {
		this.teamA = teamA;
	}

	public List<Integer> getTeamB() {
		return teamB;
	}

	public void setTeamB(List<Integer> teamB) {
		this.teamB = teamB;
	}

	public boolean isSolo() {
		return solo;
	}

	public void setSolo(boolean solo) {
		this.solo = solo;
	}

	public List<String> getHistory() {
		return history;
	}

	public List<GameEvent> getEvents() {
		return events;
	}

	public int getRound() {
		return round;
	}

	public void setRound(int round) {
		this.round = round;
	}

	public List<Integer> getScores() {
		return scores;
	}

	public void setScores(List<Integer> scores) {
		this.scores = scores;
	}

	public List<Integer> getLastDeltas() {
		return lastDeltas;
	}

	public void setLastDeltas(List<Integer> lastDeltas) {
		this.lastDeltas = lastDeltas;
	}

	public DrawState getDraw() {
		return draw;
	}

	public void setDraw(DrawState draw) {
		this.draw = draw;
	}
}
