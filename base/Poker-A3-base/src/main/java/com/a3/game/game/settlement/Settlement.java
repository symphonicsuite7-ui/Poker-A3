package com.a3.game.game.settlement;

import com.a3.game.game.engine.GameEvents;
import com.a3.game.game.model.Cards;
import com.a3.game.game.model.GamePhase;
import com.a3.game.game.model.GamePlayer;
import com.a3.game.game.model.GameState;
import com.a3.game.game.model.GoodsMark;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 提前锁分与胜点结算，对应 Node game.js 的 settle / scoreLock。
 */
public final class Settlement {

	private Settlement() {
	}

	public static String teamKey(GameState state, int id) {
		return state.getTeamA().contains(id) ? "A" : "B";
	}

	public static int goodsCountIn(List<com.a3.game.game.model.Card> cards) {
		int n = 0;
		if (cards != null && cards.stream().anyMatch(Cards::isSpade3)) {
			n += 1;
		}
		if (cards != null && cards.stream().anyMatch(Cards::isSpadeA)) {
			n += 1;
		}
		return n;
	}

	public static void refreshGoodsMark(GamePlayer player) {
		int n = player.getGoodsCount();
		if (n >= 2) {
			player.setGoodsMark(GoodsMark.SOLO);
		} else if (n == 1) {
			player.setGoodsMark(GoodsMark.HAS);
		}
	}

	public static void markGoodsIfPlayed(GamePlayer player, List<com.a3.game.game.model.Card> cards) {
		int n = goodsCountIn(cards);
		if (n <= 0) {
			return;
		}
		player.setGoodsCount(player.getGoodsCount() + n);
		refreshGoodsMark(player);
	}

	public static void markGoodsFromHand(GamePlayer player) {
		player.setGoodsCount(player.getGoodsCount() + goodsCountIn(player.getHand()));
		refreshGoodsMark(player);
		if (player.getGoodsMark() == null) {
			player.setGoodsMark(GoodsMark.NONE);
		}
	}

	public static String scoreLockReason(GameState state) {
		if (state.getFinishedOrder().size() >= 3) {
			return "已有三人出完";
		}
		if (state.isSolo()) {
			Integer r = state.getPlayers().get(state.getTeamA().get(0)).getFinishedRank();
			if (r != null && r == 1) {
				return "独吞头游，计分已确定";
			}
			if (r != null && r == 2) {
				return "独吞二游，计分已确定";
			}
			return null;
		}
		if (state.getFinishedOrder().size() >= 2) {
			int a = state.getFinishedOrder().get(0);
			int b = state.getFinishedOrder().get(1);
			if (teamKey(state, a).equals(teamKey(state, b))) {
				return "头游二游同队，计分已确定";
			}
		}
		return null;
	}

	public static void assignRemainingRanks(GameState state) {
		// 按顺时针座位顺序补名次（与出牌方向一致）
		for (int i = 1; i <= 4; i++) {
			GamePlayer p = state.getPlayers().get((state.getCurrentPlayer() - i + 4) % 4);
			if (p.getFinishedRank() != null) {
				continue;
			}
			state.getFinishedOrder().add(p.getId());
			p.setFinishedRank(state.getFinishedOrder().size());
			markGoodsFromHand(p);
			GameEvents.push(state, "system", p.getId(), p.getName(),
					p.getName() + " 未出完，亮牌，排名第 " + p.getFinishedRank(), "", p.getHand());
		}
	}

	public static void settle(GameState state) {
		List<Integer> scoresBefore = state.getPlayers().stream().map(GamePlayer::getScore).collect(Collectors.toList());
		state.setPhase(GamePhase.SETTLED);
		state.setRevealedTeam(true);

		if (state.isSolo()) {
			int soloId = state.getTeamA().get(0);
			List<Integer> others = state.getTeamB();
			int r = state.getPlayers().get(soloId).getFinishedRank();
			if (r == 1) {
				add(state, List.of(soloId), 9);
				add(state, others, -3);
				GameEvents.push(state, "system", null, "", "结算（独吞第1）：独吞 +9，其余各 -3", "", null);
			} else if (r == 2) {
				add(state, List.of(soloId), 4);
				List<Integer> rest = others.stream()
						.filter(id -> state.getPlayers().get(id).getFinishedRank() != 1)
						.collect(Collectors.toList());
				add(state, rest, -2);
				GameEvents.push(state, "system", null, "", "结算（独吞第2）：独吞 +4，第1名不变，其余各 -2", "", null);
			} else if (r == 3) {
				add(state, List.of(soloId), -4);
				List<Integer> rest = others.stream()
						.filter(id -> state.getPlayers().get(id).getFinishedRank() != 4)
						.collect(Collectors.toList());
				add(state, rest, 2);
				GameEvents.push(state, "system", null, "", "结算（独吞第3）：独吞 -4，第4名不变，其余各 +2", "", null);
			} else {
				add(state, List.of(soloId), -9);
				add(state, others, 3);
				GameEvents.push(state, "system", null, "", "结算（独吞第4）：独吞 -9，其余各 +3", "", null);
			}
		} else {
			List<Integer> a = state.getTeamA();
			List<Integer> b = state.getTeamB();
			List<Integer> ranksA = a.stream()
					.map(id -> state.getPlayers().get(id).getFinishedRank())
					.sorted(Comparator.naturalOrder())
					.collect(Collectors.toList());
			String pair = ranksA.get(0) + "," + ranksA.get(1);
			int delta = 0;
			if ("1,2".equals(pair)) {
				delta = 3;
			} else if ("1,3".equals(pair)) {
				delta = 2;
			} else if ("1,4".equals(pair) || "2,3".equals(pair)) {
				delta = 0;
			} else if ("2,4".equals(pair)) {
				delta = -2;
			} else if ("3,4".equals(pair)) {
				delta = -3;
			}
			if (delta != 0) {
				add(state, a, delta);
				add(state, b, -delta);
				String names = a.stream().map(i -> state.getPlayers().get(i).getName()).collect(Collectors.joining("、"));
				String rankText = ranksA.stream().map(String::valueOf).collect(Collectors.joining("、"));
				String plus = delta > 0 ? "+" : "";
				String opp = (-delta > 0 ? "+" : "") + (-delta);
				GameEvents.push(state, "system", null, "",
						"结算：队伍 " + names + " 名次 " + rankText + "，各 " + plus + delta + "；对方各 " + opp,
						"", null);
			} else {
				GameEvents.push(state, "system", null, "", "结算：名次为 1、4 对 2、3，胜点不变", "", null);
			}
		}

		state.setScores(state.getPlayers().stream().map(GamePlayer::getScore).collect(Collectors.toList()));
		List<Integer> deltas = new ArrayList<>();
		for (int i = 0; i < 4; i++) {
			deltas.add(state.getPlayers().get(i).getScore() - scoresBefore.get(i));
		}
		state.setLastDeltas(deltas);
		String sum = state.getPlayers().stream()
				.map(p -> p.getName() + " " + p.getScore())
				.collect(Collectors.joining("，"));
		GameEvents.push(state, "system", null, "", "本局结束。累计胜点：" + sum, "", null);
	}

	private static void add(GameState state, List<Integer> ids, int delta) {
		for (int id : ids) {
			GamePlayer p = state.getPlayers().get(id);
			p.setScore(p.getScore() + delta);
		}
	}
}
