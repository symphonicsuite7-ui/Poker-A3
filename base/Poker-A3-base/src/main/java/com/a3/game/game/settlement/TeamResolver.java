package com.a3.game.game.settlement;

import com.a3.game.game.model.Cards;
import com.a3.game.game.model.GamePlayer;

import java.util.ArrayList;
import java.util.List;

/**
 * 按手中葵扇3 / 葵扇A 分队，与 Node resolveTeams 一致。
 */
public final class TeamResolver {

	public static final class Teams {
		public final boolean solo;
		public final List<Integer> teamA;
		public final List<Integer> teamB;

		public Teams(boolean solo, List<Integer> teamA, List<Integer> teamB) {
			this.solo = solo;
			this.teamA = teamA;
			this.teamB = teamB;
		}
	}

	private TeamResolver() {
	}

	public static Teams resolve(List<GamePlayer> players) {
		int owner3 = -1;
		int ownerA = -1;
		for (GamePlayer p : players) {
			if (p.getHand().stream().anyMatch(Cards::isSpade3)) {
				owner3 = p.getId();
			}
			if (p.getHand().stream().anyMatch(Cards::isSpadeA)) {
				ownerA = p.getId();
			}
		}
		if (owner3 == ownerA) {
			List<Integer> teamA = new ArrayList<>();
			teamA.add(owner3);
			List<Integer> teamB = new ArrayList<>();
			for (int i = 0; i < 4; i++) {
				if (i != owner3) {
					teamB.add(i);
				}
			}
			return new Teams(true, teamA, teamB);
		}
		List<Integer> teamA = new ArrayList<>();
		teamA.add(owner3);
		teamA.add(ownerA);
		List<Integer> teamB = new ArrayList<>();
		for (int i = 0; i < 4; i++) {
			if (i != owner3 && i != ownerA) {
				teamB.add(i);
			}
		}
		return new Teams(false, teamA, teamB);
	}
}
