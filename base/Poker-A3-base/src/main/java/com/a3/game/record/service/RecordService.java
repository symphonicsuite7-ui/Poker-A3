package com.a3.game.record.service;

import com.a3.game.achievement.AchievementCatalog;
import com.a3.game.achievement.entity.AchievementUnlock;
import com.a3.game.achievement.mapper.AchievementUnlockMapper;
import com.a3.game.record.GameRecordProjector;
import com.a3.game.record.GameRecordProjector.ProjectedGame;
import com.a3.game.record.GameRecordProjector.ProjectedPlayer;
import com.a3.game.record.GameSettledListener;
import com.a3.game.record.entity.GamePlayerRecord;
import com.a3.game.record.entity.GameRecord;
import com.a3.game.record.mapper.GamePlayerRecordMapper;
import com.a3.game.record.mapper.GameRecordMapper;
import com.a3.game.room.model.Room;
import com.a3.game.user.entity.UserCareer;
import com.a3.game.user.mapper.UserCareerMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 结算落库：一局一条 game_record，四人各一条，再累加生涯与成就。
 */
@Service
@Profile("!test")
public class RecordService implements GameSettledListener {

	private static final Logger log = LoggerFactory.getLogger(RecordService.class);

	private final GameRecordMapper games;
	private final GamePlayerRecordMapper players;
	private final UserCareerMapper careers;
	private final AchievementUnlockMapper unlocks;
	private final ObjectMapper mapper;

	public RecordService(GameRecordMapper games, GamePlayerRecordMapper players, UserCareerMapper careers,
			AchievementUnlockMapper unlocks, ObjectMapper mapper) {
		this.games = games;
		this.players = players;
		this.careers = careers;
		this.unlocks = unlocks;
		this.mapper = mapper;
	}

	@Override
	@Transactional
	public void onSettled(Room room) {
		if (room == null || room.isRecordSaved()) {
			return;
		}
		ProjectedGame snap = GameRecordProjector.project(room);
		if (!GameRecordProjector.allPlayersPersisted(snap)) {
			return;
		}
		if (games.selectCount(new LambdaQueryWrapper<GameRecord>().eq(GameRecord::getGameNo, snap.gameNo)) > 0) {
			room.setRecordSaved(true);
			return;
		}

		GameRecord record = new GameRecord();
		record.setGameNo(snap.gameNo);
		record.setRoomId(snap.roomId);
		record.setGameMode(snap.gameMode);
		record.setPlayerCount(snap.playerCount);
		record.setStartTime(snap.startTime);
		record.setEndTime(snap.endTime);
		record.setDurationSecond(snap.durationSecond);
		record.setRoundCount(snap.roundCount);
		record.setIsSolo(snap.isSolo);
		record.setWinnerType(snap.winnerType);
		record.setExtraJson(toJson(snap.extra));
		record.setCreateTime(LocalDateTime.now());
		games.insert(record);

		for (ProjectedPlayer p : snap.players) {
			GamePlayerRecord row = new GamePlayerRecord();
			row.setGameId(record.getId());
			row.setUserId(p.userId);
			row.setSeatIndex(p.seatIndex);
			row.setFinishRank(p.finishRank);
			row.setDeltaScore(p.deltaScore);
			row.setScoreAfter(p.scoreAfter);
			row.setTeamType(p.teamType);
			row.setResult(p.result);
			row.setIsSoloPlayer(p.isSoloPlayer);
			row.setPlayedEmperor(p.playedEmperor);
			row.setDrawTakeCount(p.drawTakeCount);
			row.setDrawGiveCount(p.drawGiveCount);
			row.setPlayCount(p.playCount);
			row.setCreateTime(LocalDateTime.now());
			players.insert(row);

			UserCareer career = addCareer(p);
			unlockAchievements(p, career);
		}
		room.setRecordSaved(true);
		log.info("局记录已写入 gameNo={}", snap.gameNo);
	}

	public Map<String, Object> careerOf(Long userId) {
		UserCareer career = careers.selectOne(new LambdaQueryWrapper<UserCareer>().eq(UserCareer::getUserId, userId));
		if (career == null) {
			career = emptyCareer(userId);
		}
		int total = n(career.getTotalGames());
		int wins = n(career.getWinGames());
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("career", toCareerMap(career, total == 0 ? 0 : (wins * 1000 / total) / 10.0));
		return body;
	}

	public Map<String, Object> recordsOf(Long userId, int limit) {
		int size = Math.min(Math.max(limit, 1), 50);
		List<GamePlayerRecord> rows = players.selectList(new LambdaQueryWrapper<GamePlayerRecord>()
				.eq(GamePlayerRecord::getUserId, userId)
				.orderByDesc(GamePlayerRecord::getId)
				.last("LIMIT " + size));
		List<Map<String, Object>> list = new ArrayList<>();
		for (GamePlayerRecord row : rows) {
			GameRecord game = games.selectById(row.getGameId());
			Map<String, Object> item = new LinkedHashMap<>();
			item.put("gameId", row.getGameId());
			item.put("gameNo", game == null ? null : game.getGameNo());
			item.put("endTime", game == null || game.getEndTime() == null ? null : game.getEndTime().toString());
			item.put("durationSecond", game == null ? null : game.getDurationSecond());
			item.put("roundCount", game == null ? null : game.getRoundCount());
			item.put("isSolo", game != null && game.getIsSolo() != null && game.getIsSolo() == 1);
			item.put("winnerType", game == null ? null : game.getWinnerType());
			item.put("result", row.getResult());
			item.put("deltaScore", row.getDeltaScore());
			item.put("scoreAfter", row.getScoreAfter());
			item.put("finishRank", row.getFinishRank());
			item.put("teamType", row.getTeamType());
			item.put("playedEmperor", row.getPlayedEmperor() != null && row.getPlayedEmperor() == 1);
			list.add(item);
		}
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("records", list);
		return body;
	}

	private UserCareer addCareer(ProjectedPlayer p) {
		UserCareer career = careers.selectOne(new LambdaQueryWrapper<UserCareer>().eq(UserCareer::getUserId, p.userId));
		if (career == null) {
			career = emptyCareer(p.userId);
			careers.insert(career);
		}
		career.setTotalGames(n(career.getTotalGames()) + 1);
		if (p.deltaScore > 0) {
			career.setWinGames(n(career.getWinGames()) + 1);
		} else if (p.deltaScore < 0) {
			career.setLoseGames(n(career.getLoseGames()) + 1);
		} else {
			career.setDrawGames(n(career.getDrawGames()) + 1);
		}
		career.setTotalScore(n(career.getTotalScore()) + p.deltaScore);
		if (p.isSoloPlayer == 1) {
			career.setSoloTimes(n(career.getSoloTimes()) + 1);
			if (p.finishRank != null && p.finishRank == 1) {
				career.setSoloWinTimes(n(career.getSoloWinTimes()) + 1);
			}
			if (p.finishRank != null && p.finishRank == 4) {
				career.setSoloLoseTimes(n(career.getSoloLoseTimes()) + 1);
			}
		}
		career.setEmperorTimes(n(career.getEmperorTimes()) + p.playedEmperor);
		career.setDrawTakeTimes(n(career.getDrawTakeTimes()) + p.drawTakeCount);
		career.setDrawGiveTimes(n(career.getDrawGiveTimes()) + p.drawGiveCount);
		if (p.twoRoundWin) {
			career.setTwoRoundWinTimes(n(career.getTwoRoundWinTimes()) + 1);
		}
		career.setUpdateTime(LocalDateTime.now());
		careers.updateById(career);
		return career;
	}

	private void unlockAchievements(ProjectedPlayer player, UserCareer career) {
		LocalDateTime now = LocalDateTime.now();
		for (String code : AchievementCatalog.unlockedThisGame(player, career)) {
			AchievementUnlock row = unlocks.selectOne(new LambdaQueryWrapper<AchievementUnlock>()
					.eq(AchievementUnlock::getUserId, player.userId)
					.eq(AchievementUnlock::getAchievementCode, code));
			if (row == null) {
				row = new AchievementUnlock();
				row.setUserId(player.userId);
				row.setAchievementCode(code);
				row.setUnlockCount(1);
				row.setFirstUnlockTime(now);
				row.setUpdateTime(now);
				unlocks.insert(row);
			} else {
				row.setUnlockCount(n(row.getUnlockCount()) + 1);
				row.setUpdateTime(now);
				unlocks.updateById(row);
			}
		}
	}

	private UserCareer emptyCareer(Long userId) {
		UserCareer career = new UserCareer();
		career.setUserId(userId);
		career.setTotalGames(0);
		career.setWinGames(0);
		career.setLoseGames(0);
		career.setDrawGames(0);
		career.setTotalScore(0);
		career.setSoloTimes(0);
		career.setSoloWinTimes(0);
		career.setSoloLoseTimes(0);
		career.setEmperorTimes(0);
		career.setDrawTakeTimes(0);
		career.setDrawGiveTimes(0);
		career.setTwoRoundWinTimes(0);
		career.setCreateTime(LocalDateTime.now());
		career.setUpdateTime(LocalDateTime.now());
		return career;
	}

	private Map<String, Object> toCareerMap(UserCareer career, double winRate) {
		Map<String, Object> map = new LinkedHashMap<>();
		map.put("totalGames", n(career.getTotalGames()));
		map.put("winGames", n(career.getWinGames()));
		map.put("loseGames", n(career.getLoseGames()));
		map.put("drawGames", n(career.getDrawGames()));
		map.put("totalScore", n(career.getTotalScore()));
		map.put("winRate", winRate);
		map.put("soloTimes", n(career.getSoloTimes()));
		map.put("soloWinTimes", n(career.getSoloWinTimes()));
		map.put("soloLoseTimes", n(career.getSoloLoseTimes()));
		map.put("emperorTimes", n(career.getEmperorTimes()));
		map.put("drawTakeTimes", n(career.getDrawTakeTimes()));
		map.put("drawGiveTimes", n(career.getDrawGiveTimes()));
		map.put("twoRoundWinTimes", n(career.getTwoRoundWinTimes()));
		return map;
	}

	private String toJson(Map<String, Object> extra) {
		try {
			return mapper.writeValueAsString(extra);
		} catch (JsonProcessingException e) {
			return "{}";
		}
	}

	private static int n(Integer v) {
		return v == null ? 0 : v;
	}
}
