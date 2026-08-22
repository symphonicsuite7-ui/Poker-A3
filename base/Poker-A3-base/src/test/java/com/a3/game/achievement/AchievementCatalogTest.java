package com.a3.game.achievement;

import com.a3.game.record.GameRecordProjector.ProjectedPlayer;
import com.a3.game.user.entity.UserCareer;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AchievementCatalogTest {

	@Test
	void firstWinAndTwoRoundAndEmperor() {
		ProjectedPlayer p = new ProjectedPlayer();
		p.deltaScore = 9;
		p.finishRank = 1;
		p.isSoloPlayer = 1;
		p.playedEmperor = 1;
		p.twoRoundWin = true;

		UserCareer career = new UserCareer();
		career.setWinGames(1);
		career.setTotalGames(1);
		career.setSoloTimes(1);
		career.setSoloWinTimes(1);
		career.setEmperorTimes(1);

		List<String> codes = AchievementCatalog.unlockedThisGame(p, career);
		assertTrue(codes.contains("FIRST_WIN"));
		assertTrue(codes.contains("TWO_ROUND_WIN"));
		assertTrue(codes.contains("SOLO_FIRST"));
		assertTrue(codes.contains("EMPEROR"));
	}
}
