package com.a3.game.achievement;

import com.a3.game.record.GameRecordProjector.ProjectedPlayer;
import com.a3.game.user.entity.UserCareer;

import java.util.ArrayList;
import java.util.List;

/** 成就规则在代码里，库里只记解锁。 */
public final class AchievementCatalog {

	private AchievementCatalog() {
	}

	public static List<Def> all() {
		return List.of(
				new Def("FIRST_WIN", "初胜", "赢得第一局"),
				new Def("TWO_ROUND_WIN", "两回合胜利", "两回合内打完并获胜"),
				new Def("SOLO_FIRST", "独吞完胜", "独吞并拿下头游"),
				new Def("SOLO_LAST", "独吞完败", "独吞并垫底"),
				new Def("EMPEROR", "天子", "打出天子"),
				new Def("GAMES_10", "常客", "累计完成 10 局"),
				new Def("WINS_10", "十胜", "累计胜利 10 局"),
				new Def("SOLO_3", "独行侠", "累计独吞 3 次"));
	}

	/** 本局结算后，按本局快照 + 已累加的生涯判断新解锁。 */
	public static List<String> unlockedThisGame(ProjectedPlayer player, UserCareer career) {
		List<String> codes = new ArrayList<>();
		if (player == null || career == null) {
			return codes;
		}
		if (player.deltaScore > 0 && n(career.getWinGames()) >= 1) {
			codes.add("FIRST_WIN");
		}
		if (player.twoRoundWin) {
			codes.add("TWO_ROUND_WIN");
		}
		if (player.isSoloPlayer == 1 && player.finishRank != null && player.finishRank == 1) {
			codes.add("SOLO_FIRST");
		}
		if (player.isSoloPlayer == 1 && player.finishRank != null && player.finishRank == 4) {
			codes.add("SOLO_LAST");
		}
		if (player.playedEmperor > 0) {
			codes.add("EMPEROR");
		}
		if (n(career.getTotalGames()) >= 10) {
			codes.add("GAMES_10");
		}
		if (n(career.getWinGames()) >= 10) {
			codes.add("WINS_10");
		}
		if (n(career.getSoloTimes()) >= 3) {
			codes.add("SOLO_3");
		}
		return codes;
	}

	private static int n(Integer v) {
		return v == null ? 0 : v;
	}

	public static class Def {
		public final String code;
		public final String name;
		public final String desc;

		public Def(String code, String name, String desc) {
			this.code = code;
			this.name = name;
			this.desc = desc;
		}
	}
}
