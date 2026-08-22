package com.a3.game.record;

import com.a3.game.game.model.GameEvent;
import com.a3.game.game.model.GamePhase;
import com.a3.game.game.model.GamePlayer;
import com.a3.game.game.model.GameState;
import com.a3.game.room.model.Room;
import com.a3.game.room.model.Seat;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 从结算后的 GameState 投影出入库快照。不写库、不改牌规。
 */
public final class GameRecordProjector {

	private GameRecordProjector() {
	}

	public static ProjectedGame project(Room room) {
		if (room == null || room.getGame() == null || room.getGame().getPhase() != GamePhase.SETTLED) {
			return null;
		}
		GameState state = room.getGame();
		int[] playCount = new int[4];
		int[] emperor = new int[4];
		int[] take = new int[4];
		int[] give = new int[4];
		int tricks = 1;
		for (GameEvent ev : state.getEvents()) {
			if ("play".equals(ev.getKind()) && ev.getSeat() != null && inSeat(ev.getSeat())) {
				playCount[ev.getSeat()]++;
				String label = ev.getLabel() == null ? "" : ev.getLabel();
				if (label.contains("天子")) {
					emperor[ev.getSeat()] = 1;
				}
			}
			String text = ev.getText() == null ? "" : ev.getText();
			if (text.contains("全部过牌")) {
				tricks++;
			}
			if (text.contains(" 抽了 ") && ev.getSeat() != null && inSeat(ev.getSeat())) {
				take[ev.getSeat()]++;
				int fromIdx = text.indexOf(" 从 ");
				int takeIdx = text.indexOf(" 抽了 ");
				if (fromIdx >= 0 && takeIdx > fromIdx) {
					String loserName = text.substring(fromIdx + 3, takeIdx);
					int loser = findByName(state, loserName);
					if (loser >= 0) {
						give[loser]++;
					}
				}
			}
		}

		boolean allDraw = true;
		for (int delta : state.getLastDeltas()) {
			if (delta != 0) {
				allDraw = false;
				break;
			}
		}
		String winnerType = state.isSolo() ? "SOLO" : (allDraw ? "DRAW" : "TEAM");
		long startedAt = room.getGameStartedAt() > 0 ? room.getGameStartedAt() : System.currentTimeMillis();
		long endedAt = System.currentTimeMillis();
		int duration = (int) Math.max(0, (endedAt - startedAt) / 1000);

		ProjectedGame game = new ProjectedGame();
		game.gameNo = room.getId() + "-" + state.getRound() + "-" + startedAt;
		game.roomId = room.getId();
		game.gameMode = "NORMAL";
		game.playerCount = 4;
		game.startTime = local(startedAt);
		game.endTime = local(endedAt);
		game.durationSecond = duration;
		game.roundCount = tricks;
		game.isSolo = state.isSolo() ? 1 : 0;
		game.winnerType = winnerType;
		game.extra.put("roomRound", state.getRound());
		game.extra.put("tricks", tricks);
		game.extra.put("finishedOrder", new ArrayList<>(state.getFinishedOrder()));

		for (int i = 0; i < 4; i++) {
			GamePlayer p = state.getPlayers().get(i);
			int delta = i < state.getLastDeltas().size() ? state.getLastDeltas().get(i) : 0;
			String result = delta > 0 ? "WIN" : (delta < 0 ? "LOSE" : "DRAW");
			boolean soloPlayer = state.isSolo() && state.getTeamA().contains(i);
			String teamType = soloPlayer ? "SOLO" : (state.getTeamA().contains(i) ? "A" : "B");
			boolean twoRoundWin = delta > 0 && p.getFinishedRank() != null && p.getFinishedRank() == 1 && tricks <= 2;

			ProjectedPlayer row = new ProjectedPlayer();
			row.userId = userIdOf(room, i);
			row.seatIndex = i;
			row.finishRank = p.getFinishedRank();
			row.deltaScore = delta;
			row.scoreAfter = p.getScore();
			row.teamType = teamType;
			row.result = result;
			row.isSoloPlayer = soloPlayer ? 1 : 0;
			row.playedEmperor = emperor[i];
			row.drawTakeCount = take[i];
			row.drawGiveCount = give[i];
			row.playCount = playCount[i];
			row.twoRoundWin = twoRoundWin;
			game.players.add(row);
		}
		return game;
	}

	public static boolean allPlayersPersisted(ProjectedGame game) {
		if (game == null || game.players.size() != 4) {
			return false;
		}
		for (ProjectedPlayer p : game.players) {
			if (p.userId == null) {
				return false;
			}
		}
		return true;
	}

	private static boolean inSeat(int seat) {
		return seat >= 0 && seat < 4;
	}

	private static int findByName(GameState state, String name) {
		if (name == null) {
			return -1;
		}
		for (GamePlayer p : state.getPlayers()) {
			if (name.equals(p.getName())) {
				return p.getId();
			}
		}
		return -1;
	}

	private static Long userIdOf(Room room, int seat) {
		if (seat < 0 || seat >= room.getPlayers().size()) {
			return null;
		}
		Seat s = room.getPlayers().get(seat);
		if (s == null || s.getUserId() == null) {
			return null;
		}
		try {
			return Long.parseLong(s.getUserId());
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private static LocalDateTime local(long millis) {
		return LocalDateTime.ofInstant(Instant.ofEpochMilli(millis), ZoneId.systemDefault());
	}

	public static class ProjectedGame {
		public String gameNo;
		public String roomId;
		public String gameMode;
		public int playerCount;
		public LocalDateTime startTime;
		public LocalDateTime endTime;
		public int durationSecond;
		public int roundCount;
		public int isSolo;
		public String winnerType;
		public final Map<String, Object> extra = new LinkedHashMap<>();
		public final List<ProjectedPlayer> players = new ArrayList<>();
	}

	public static class ProjectedPlayer {
		public Long userId;
		public int seatIndex;
		public Integer finishRank;
		public int deltaScore;
		public int scoreAfter;
		public String teamType;
		public String result;
		public int isSoloPlayer;
		public int playedEmperor;
		public int drawTakeCount;
		public int drawGiveCount;
		public int playCount;
		public boolean twoRoundWin;
	}
}
