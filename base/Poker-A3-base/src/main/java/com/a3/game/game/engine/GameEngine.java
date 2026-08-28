package com.a3.game.game.engine;

import com.a3.game.game.model.Card;
import com.a3.game.game.model.Cards;
import com.a3.game.game.model.DrawParty;
import com.a3.game.game.model.DrawState;
import com.a3.game.game.model.DrawTransfer;
import com.a3.game.game.model.EngineResult;
import com.a3.game.game.model.GameEvent;
import com.a3.game.game.model.GamePhase;
import com.a3.game.game.model.GamePlayer;
import com.a3.game.game.model.GameState;
import com.a3.game.game.model.GoodsMark;
import com.a3.game.game.model.Play;
import com.a3.game.game.rule.PlayRule;
import com.a3.game.game.settlement.Settlement;
import com.a3.game.game.settlement.TeamResolver;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 对局状态机，对应 Node server/engine/game.js。
 * 无 Spring 注解，不访问数据库。
 */
public class GameEngine {

	public static final long DRAW_REVEAL_MS = 5000L;

	private final Random random;

	public GameEngine() {
		this(new Random());
	}

	public GameEngine(Random random) {
		this.random = random;
	}

	public GameState newGame(List<String> playerNames, List<Integer> prevScores) {
		List<Integer> scores = prevScores == null ? List.of(0, 0, 0, 0) : prevScores;
		List<String> names = playerNames == null ? List.of("玩家1", "玩家2", "玩家3", "玩家4") : playerNames;
		List<Card> deck = Cards.shuffle(Cards.createDeck(), random);

		List<GamePlayer> players = new ArrayList<>();
		for (int id = 0; id < 4; id++) {
			GamePlayer p = new GamePlayer();
			p.setId(id);
			p.setName(id < names.size() && names.get(id) != null ? names.get(id) : "玩家" + (id + 1));
			p.setHand(Cards.sortCards(new ArrayList<>(deck.subList(id * 13, id * 13 + 13))));
			p.setScore(id < scores.size() && scores.get(id) != null ? scores.get(id) : 0);
			players.add(p);
		}

		int starter = 0;
		for (GamePlayer p : players) {
			if (p.getHand().stream().anyMatch(Cards::isDiamond4)) {
				starter = p.getId();
				break;
			}
		}

		TeamResolver.Teams teams = TeamResolver.resolve(players);
		GameState state = new GameState();
		state.getPlayers().addAll(players);
		state.setCurrentPlayer(starter);
		state.setPhase(GamePhase.PLAYING);
		state.setTeamA(teams.teamA);
		state.setTeamB(teams.teamB);
		state.setSolo(teams.solo);
		state.setRound(1);
		state.setScores(players.stream().map(GamePlayer::getScore).collect(Collectors.toList()));
		state.setLastDeltas(new ArrayList<>(List.of(0, 0, 0, 0)));
		String text = "新一局开始，" + players.get(starter).getName() + " 持有方片4，先出";
		state.getHistory().add(text);
		com.a3.game.game.model.GameEvent ev = new com.a3.game.game.model.GameEvent();
		ev.setKind("system");
		ev.setSeat(starter);
		ev.setName(players.get(starter).getName());
		ev.setText(text);
		ev.setLabel("");
		state.getEvents().add(ev);
		return state;
	}

	public EngineResult playCards(GameState state, int seatIndex, List<String> cardIds) {
		if (state.getPhase() != GamePhase.PLAYING) {
			return EngineResult.fail(state.getPhase() == GamePhase.DRAW ? "抽牌尚未结束" : "本局已结束", state);
		}
		if (state.getCurrentPlayer() != seatIndex) {
			return EngineResult.fail("还没轮到你", state);
		}
		GamePlayer player = state.getPlayers().get(seatIndex);
		List<Card> selected = new ArrayList<>();
		for (String id : cardIds) {
			player.getHand().stream().filter(c -> c.getId().equals(id)).findFirst().ifPresent(selected::add);
		}
		if (selected.size() != cardIds.size()) {
			return EngineResult.fail("选中的牌不在手牌中", state);
		}
		boolean free = state.getLastPlay() == null;
		EngineResult check = PlayRule.validatePlay(selected, free ? null : state.getLastPlay());
		if (!check.isOk()) {
			return EngineResult.fail(check.getReason(), state);
		}
		// 本局第一次出牌必须带方片4；全过后再出不算初出
		if (isOpeningLead(state) && selected.stream().noneMatch(Cards::isDiamond4)) {
			return EngineResult.fail("首出必须包含方片4", state);
		}
		Play play = check.getPlay();
		GameState next = state.copy();
		GamePlayer p = next.getPlayers().get(seatIndex);
		p.setHand(p.getHand().stream().filter(c -> !cardIds.contains(c.getId())).collect(Collectors.toList()));
		Settlement.markGoodsIfPlayed(p, play.getCards());
		GameEvents.push(next, "play", seatIndex, p.getName(), p.getName() + " 出" + play.getLabel(), play.getLabel(),
				play.getCards());
		next.setLastPlay(play);
		next.setLastPlayPlayer(seatIndex);
		next.setPassCount(0);
		updateTeamReveal(next);

		if (p.getHand().isEmpty()) {
			next.getFinishedOrder().add(p.getId());
			p.setFinishedRank(next.getFinishedOrder().size());
			if (p.getGoodsMark() != GoodsMark.HAS && p.getGoodsMark() != GoodsMark.SOLO) {
				p.setGoodsMark(GoodsMark.NONE);
			}
			GameEvents.push(next, "system", p.getId(), p.getName(),
					p.getName() + " 出完，排名第 " + p.getFinishedRank(), "", null);
			String reason = Settlement.scoreLockReason(next);
			if (reason != null) {
				GameEvents.push(next, "system", null, "", reason + "，本局结束", "", null);
				Settlement.assignRemainingRanks(next);
				Settlement.settle(next);
				return EngineResult.ok(next);
			}
		}
		advanceTurn(next);
		return EngineResult.ok(next);
	}

	public EngineResult passTurn(GameState state, int seatIndex) {
		if (state.getPhase() != GamePhase.PLAYING) {
			return EngineResult.fail(state.getPhase() == GamePhase.DRAW ? "抽牌尚未结束" : "本局已结束", state);
		}
		if (state.getCurrentPlayer() != seatIndex) {
			return EngineResult.fail("还没轮到你", state);
		}
		if (state.getLastPlay() == null) {
			return EngineResult.fail("自由出牌时不能过牌，必须出牌", state);
		}
		GameState next = state.copy();
		GamePlayer p = next.getPlayers().get(seatIndex);
		GameEvents.push(next, "pass", seatIndex, p.getName(), p.getName() + " 过牌", "过牌", null);
		next.setPassCount(next.getPassCount() + 1);
		List<GamePlayer> active = next.getPlayers().stream().filter(x -> x.getFinishedRank() == null).toList();
		long others = active.stream().filter(x -> x.getId() != next.getLastPlayPlayer()).count();
		if (next.getPassCount() >= others) {
			int starter = next.getLastPlayPlayer();
			if (next.getPlayers().get(starter).getFinishedRank() != null) {
				starter = nextActiveAfter(next, starter);
			}
			next.setLastPlay(null);
			next.setLastPlayPlayer(null);
			next.setPassCount(0);
			next.setCurrentPlayer(starter);
			GameEvents.push(next, "system", starter, nameOf(next, starter),
					"全部过牌，" + nameOf(next, starter) + " 自由出牌", "", null);
			return EngineResult.ok(next);
		}
		advanceTurn(next);
		return EngineResult.ok(next);
	}

	public GameState nextRound(GameState state, List<String> playerNames) {
		List<Integer> scores = state.getPlayers().stream().map(GamePlayer::getScore).collect(Collectors.toList());
		List<Integer> deltas = new ArrayList<>(state.getLastDeltas() == null ? List.of(0, 0, 0, 0) : state.getLastDeltas());
		List<String> names = playerNames != null ? playerNames
				: state.getPlayers().stream().map(GamePlayer::getName).collect(Collectors.toList());
		GameState g = newGame(names, scores);
		g.setRound((state.getRound() <= 0 ? 1 : state.getRound()) + 1);
		boolean startedDraw = attachDraw(g, deltas);
		if (startedDraw) {
			g.getEvents().clear();
			g.getHistory().clear();
			GameEvents.push(g, "system", null, "", "—— 第 " + g.getRound() + " 局：抽牌 ——", "", null);
		} else {
			g.getEvents().add(0, event("—— 第 " + g.getRound() + " 局 ——"));
			g.getHistory().add(0, "—— 第 " + g.getRound() + " 局 ——");
		}
		return g;
	}

	public EngineResult devourDraw(GameState state, int seat) {
		if (state.getPhase() != GamePhase.DRAW || state.getDraw() == null
				|| !"devour".equals(state.getDraw().getStep()) || !state.getDraw().isDevour()) {
			return EngineResult.fail("现在不能吞噬", state);
		}
		DrawParty g = state.getDraw().getGainers().stream().filter(x -> x.getSeat() == seat).findFirst().orElse(null);
		if (g == null) {
			return EngineResult.fail("你不是加分者", state);
		}
		GameState next = state.copy();
		GameEvents.push(next, "system", seat, nameOf(next, seat),
				nameOf(next, seat) + " 吞噬 " + g.getAmount() + " 张牌", "", null);
		applyDevourTakes(next);
		return EngineResult.ok(next);
	}

	public EngineResult pickDrawTarget(GameState state, int seat, int targetSeat) {
		if (state.getPhase() != GamePhase.DRAW || state.getDraw() == null || !"pick".equals(state.getDraw().getStep())) {
			return EngineResult.fail("现在不能选择抽牌对象", state);
		}
		if (state.getDraw().isDevour()) {
			return EngineResult.fail("吞噬模式请点击吞噬", state);
		}
		DrawParty g = state.getDraw().getGainers().stream().filter(x -> x.getSeat() == seat).findFirst().orElse(null);
		if (g == null) {
			return EngineResult.fail("你不是加分者", state);
		}
		if (state.getDraw().pickOf(seat) != null) {
			return EngineResult.fail("你已经选过了", state);
		}
		boolean loserOk = state.getDraw().getLosers().stream().anyMatch(x -> x.getSeat() == targetSeat);
		if (!loserOk) {
			return EngineResult.fail("只能抽减分者", state);
		}
		if (state.getDraw().isUniqueTargets()
				&& state.getDraw().getPicks().containsValue(targetSeat)) {
			return EngineResult.fail("该玩家已被其他胜者抽走", state);
		}
		GameState next = state.copy();
		next.getDraw().getPicks().put(String.valueOf(seat), targetSeat);
		GameEvents.push(next, "system", seat, nameOf(next, seat),
				nameOf(next, seat) + " 选择抽 " + nameOf(next, targetSeat), "", null);
		if (allGainersPicked(next.getDraw())) {
			applyTakes(next);
		}
		return EngineResult.ok(next);
	}

	public EngineResult giveDrawCards(GameState state, int seat, List<String> cardIds, Integer targetSeat) {
		if (state.getPhase() != GamePhase.DRAW || state.getDraw() == null || !"give".equals(state.getDraw().getStep())) {
			return EngineResult.fail("现在不能还牌", state);
		}
		DrawParty g = state.getDraw().getGainers().stream().filter(x -> x.getSeat() == seat).findFirst().orElse(null);
		if (g == null) {
			return EngineResult.fail("你不是加分者", state);
		}
		List<String> ids = cardIds == null ? List.of() : cardIds;
		if (new HashSet<>(ids).size() != ids.size()) {
			return EngineResult.fail("不能重复选同一张牌", state);
		}
		GamePlayer p = state.getPlayers().get(seat);
		for (String id : ids) {
			if (p.getHand().stream().noneMatch(c -> c.getId().equals(id))) {
				return EngineResult.fail("选中的牌不在手牌中", state);
			}
		}

		if (state.getDraw().isDevour()) {
			if (targetSeat == null) {
				return EngineResult.fail("请选择还牌对象", state);
			}
			List<DrawParty> rem = state.getDraw().remainingGiveLosers(seat);
			DrawParty loser = rem.stream().filter(x -> x.getSeat() == targetSeat).findFirst().orElse(null);
			if (loser == null) {
				return EngineResult.fail("只能还给尚未还过的减分者", state);
			}
			if (ids.size() != loser.getAmount()) {
				return EngineResult.fail("请选择 " + loser.getAmount() + " 张还牌", state);
			}
			GameState next = state.copy();
			applyOneDevourGive(next, seat, ids, targetSeat);
			return EngineResult.ok(next);
		}

		if (state.getDraw().giveOf(seat) != null) {
			return EngineResult.fail("你已经还过牌", state);
		}
		if (ids.size() != g.getAmount()) {
			return EngineResult.fail("请选择 " + g.getAmount() + " 张还牌", state);
		}
		GameState next = state.copy();
		next.getDraw().getGives().put(String.valueOf(seat), new ArrayList<>(ids));
		GameEvents.push(next, "system", seat, nameOf(next, seat), nameOf(next, seat) + " 已选好还牌，等待其他人", "", null);
		if (allGainersGave(next.getDraw())) {
			applyGives(next);
		}
		return EngineResult.ok(next);
	}

	/** 兼容旧签名：无目标座位 */
	public EngineResult giveDrawCards(GameState state, int seat, List<String> cardIds) {
		return giveDrawCards(state, seat, cardIds, null);
	}

	public EngineResult advanceDrawReveal(GameState state) {
		if (state.getPhase() != GamePhase.DRAW || state.getDraw() == null) {
			return EngineResult.fail("当前不是抽牌阶段", state);
		}
		GameState next = state.copy();
		if ("showTake".equals(next.getDraw().getStep())) {
			next.getDraw().setStep("give");
			next.getDraw().setRevealUntil(null);
			String tip = next.getDraw().isDevour()
					? "请选出还牌，再选择对象归还（按失分张数分批）"
					: "请加分者从手牌中选出还牌";
			GameEvents.push(next, "system", null, "", tip, "", null);
			return EngineResult.ok(next);
		}
		if ("showGive".equals(next.getDraw().getStep())) {
			beginPlayAfterDraw(next);
			return EngineResult.ok(next);
		}
		return EngineResult.fail("当前不能进入下一步", next);
	}

	public void addBackgroundLog(GameState state, Integer seat, String playerName, String imageName) {
		String name = playerName == null ? "玩家" : playerName;
		GameEvents.push(state, "system", seat, name, name + " 将背景图修改为" + imageName, "", null);
	}

	boolean attachDraw(GameState state, List<Integer> deltas) {
		state.setLastDeltas(new ArrayList<>(deltas == null ? List.of(0, 0, 0, 0) : deltas));
		List<DrawParty> gainers = new ArrayList<>();
		List<DrawParty> losers = new ArrayList<>();
		for (int i = 0; i < 4; i++) {
			int d = i < state.getLastDeltas().size() ? state.getLastDeltas().get(i) : 0;
			if (d > 0) {
				gainers.add(new DrawParty(i, d));
			}
			if (d < 0) {
				losers.add(new DrawParty(i, -d));
			}
		}
		if (gainers.isEmpty() || losers.isEmpty()) {
			state.setPhase(GamePhase.PLAYING);
			state.setDraw(null);
			return false;
		}
		int loserSum = losers.stream().mapToInt(DrawParty::getAmount).sum();
		boolean devour = gainers.size() == 1 && losers.size() >= 2 && gainers.get(0).getAmount() == loserSum;
		state.setPhase(GamePhase.DRAW);
		DrawState draw = new DrawState();
		draw.setStep(devour ? "devour" : "pick");
		draw.setMode(devour ? "devour" : "normal");
		draw.setUniqueTargets(gainers.size() <= losers.size());
		draw.getGainers().addAll(gainers);
		draw.getLosers().addAll(losers);
		state.setDraw(draw);
		return true;
	}

	private void applyTakes(GameState state) {
		DrawState draw = state.getDraw();
		for (DrawParty g : draw.getGainers()) {
			int from = draw.pickOf(g.getSeat());
			GamePlayer target = state.getPlayers().get(from);
			GamePlayer gainer = state.getPlayers().get(g.getSeat());
			TakeResult result = randomTake(target.getHand(), g.getAmount());
			target.setHand(Cards.sortCards(result.remain));
			List<Card> merged = new ArrayList<>(gainer.getHand());
			merged.addAll(result.taken);
			gainer.setHand(Cards.sortCards(merged));
			DrawTransfer t = new DrawTransfer();
			t.setFrom(from);
			t.setTo(g.getSeat());
			t.setCards(result.taken);
			draw.getTakes().add(t);
			GameEvents.push(state, "system", g.getSeat(), gainer.getName(),
					gainer.getName() + " 从 " + target.getName() + " 抽了 " + result.taken.size() + " 张",
					"", result.taken);
		}
		draw.setStep("showTake");
		draw.setRevealUntil(System.currentTimeMillis() + DRAW_REVEAL_MS);
	}

	private void applyDevourTakes(GameState state) {
		DrawState draw = state.getDraw();
		DrawParty g = draw.getGainers().get(0);
		GamePlayer gainer = state.getPlayers().get(g.getSeat());
		for (DrawParty loser : draw.getLosers()) {
			GamePlayer target = state.getPlayers().get(loser.getSeat());
			TakeResult result = randomTake(target.getHand(), loser.getAmount());
			target.setHand(Cards.sortCards(result.remain));
			List<Card> merged = new ArrayList<>(gainer.getHand());
			merged.addAll(result.taken);
			gainer.setHand(Cards.sortCards(merged));
			DrawTransfer t = new DrawTransfer();
			t.setFrom(loser.getSeat());
			t.setTo(g.getSeat());
			t.setCards(result.taken);
			draw.getTakes().add(t);
			GameEvents.push(state, "system", g.getSeat(), gainer.getName(),
					gainer.getName() + " 从 " + target.getName() + " 抽了 " + result.taken.size() + " 张",
					"", result.taken);
		}
		draw.setStep("showTake");
		draw.setRevealUntil(System.currentTimeMillis() + DRAW_REVEAL_MS);
	}

	private void applyGives(GameState state) {
		DrawState draw = state.getDraw();
		for (DrawParty g : draw.getGainers()) {
			List<String> ids = draw.giveOf(g.getSeat());
			if (ids == null) {
				ids = List.of();
			}
			Set<String> idSet = new HashSet<>(ids);
			GamePlayer gainer = state.getPlayers().get(g.getSeat());
			int targetSeat = draw.pickOf(g.getSeat());
			GamePlayer target = state.getPlayers().get(targetSeat);
			List<Card> given = new ArrayList<>();
			List<Card> remain = new ArrayList<>();
			for (Card c : gainer.getHand()) {
				if (idSet.contains(c.getId())) {
					given.add(c);
				} else {
					remain.add(c);
				}
			}
			gainer.setHand(Cards.sortCards(remain));
			List<Card> targetHand = new ArrayList<>(target.getHand());
			targetHand.addAll(given);
			target.setHand(Cards.sortCards(targetHand));
			DrawTransfer t = new DrawTransfer();
			t.setFrom(g.getSeat());
			t.setTo(targetSeat);
			t.setCards(given);
			draw.getGiveCards().add(t);
			GameEvents.push(state, "system", g.getSeat(), gainer.getName(),
					gainer.getName() + " 还给 " + target.getName() + " " + given.size() + " 张", "", given);
		}
		draw.setStep("showGive");
		draw.setRevealUntil(System.currentTimeMillis() + DRAW_REVEAL_MS);
	}

	private void applyOneDevourGive(GameState state, int seat, List<String> ids, int targetSeat) {
		DrawState draw = state.getDraw();
		Set<String> idSet = new HashSet<>(ids);
		GamePlayer gainer = state.getPlayers().get(seat);
		GamePlayer target = state.getPlayers().get(targetSeat);
		List<Card> given = new ArrayList<>();
		List<Card> remain = new ArrayList<>();
		for (Card c : gainer.getHand()) {
			if (idSet.contains(c.getId())) {
				given.add(c);
			} else {
				remain.add(c);
			}
		}
		gainer.setHand(Cards.sortCards(remain));
		List<Card> targetHand = new ArrayList<>(target.getHand());
		targetHand.addAll(given);
		target.setHand(Cards.sortCards(targetHand));
		DrawTransfer t = new DrawTransfer();
		t.setFrom(seat);
		t.setTo(targetSeat);
		t.setCards(given);
		draw.getGiveCards().add(t);
		GameEvents.push(state, "system", seat, gainer.getName(),
				gainer.getName() + " 还给 " + target.getName() + " " + given.size() + " 张", "", given);
		if (draw.remainingGiveLosers(seat).isEmpty()) {
			draw.setStep("showGive");
			draw.setRevealUntil(System.currentTimeMillis() + DRAW_REVEAL_MS);
		}
	}

	private void beginPlayAfterDraw(GameState state) {
		// 抽还后葵扇3/A 可能易主，按最终手牌重算队伍，避免结算分差影响下一局抽牌
		TeamResolver.Teams teams = TeamResolver.resolve(state.getPlayers());
		state.setSolo(teams.solo);
		state.setTeamA(teams.teamA);
		state.setTeamB(teams.teamB);
		int starter = findDiamond4Seat(state.getPlayers());
		state.setCurrentPlayer(starter);
		state.setPhase(GamePhase.PLAYING);
		if (state.getDraw() != null) {
			state.getDraw().setStep("done");
			state.getDraw().setRevealUntil(null);
		}
		GameEvents.push(state, "system", starter, nameOf(state, starter),
				"抽牌结束，" + nameOf(state, starter) + " 持有方片4，先出", "", null);
	}

	private void updateTeamReveal(GameState state) {
		if (state.isRevealedTeam()) {
			return;
		}
		boolean has3 = state.getPlayers().stream().anyMatch(p -> p.getHand().stream().anyMatch(Cards::isSpade3));
		boolean hasA = state.getPlayers().stream().anyMatch(p -> p.getHand().stream().anyMatch(Cards::isSpadeA));
		if (!has3 && !hasA) {
			state.setRevealedTeam(true);
			String tip = state.isSolo()
					? "队伍已揭晓：" + nameOf(state, state.getTeamA().get(0)) + " 独吞（葵扇3+葵扇A），其余三人一队"
					: "队伍已揭晓："
							+ state.getTeamA().stream().map(i -> nameOf(state, i)).collect(Collectors.joining("、"))
							+ " vs "
							+ state.getTeamB().stream().map(i -> nameOf(state, i)).collect(Collectors.joining("、"));
			GameEvents.push(state, "system", null, "", tip, "", null);
		}
	}

	/** 顺时针下家：座位号递减（跳过已出完的玩家）。 */
	private static int nextActiveAfter(GameState state, int fromId) {
		for (int i = 1; i <= 4; i++) {
			int id = (fromId - i + 4) % 4;
			if (state.getPlayers().get(id).getFinishedRank() == null) {
				return id;
			}
		}
		return fromId;
	}

	private static void advanceTurn(GameState state) {
		state.setCurrentPlayer(nextActiveAfter(state, state.getCurrentPlayer()));
	}

	private static String nameOf(GameState state, int id) {
		return state.getPlayers().get(id).getName();
	}

	private static int findDiamond4Seat(List<GamePlayer> players) {
		for (GamePlayer p : players) {
			if (p.getHand().stream().anyMatch(Cards::isDiamond4)) {
				return p.getId();
			}
		}
		return 0;
	}

	/** 本局第一次出牌才必须带方片4；全过后再出不算初出。 */
	private static boolean isOpeningLead(GameState state) {
		if (state.getLastPlay() != null) {
			return false;
		}
		if (state.getEvents() == null) {
			return true;
		}
		for (GameEvent ev : state.getEvents()) {
			if ("play".equals(ev.getKind())) {
				return false;
			}
		}
		return true;
	}

	private TakeResult randomTake(List<Card> hand, int n) {
		List<Card> arr = new ArrayList<>(hand);
		List<Card> taken = new ArrayList<>();
		for (int i = 0; i < n && !arr.isEmpty(); i++) {
			int j = random.nextInt(arr.size());
			taken.add(arr.remove(j));
		}
		return new TakeResult(taken, arr);
	}

	private static boolean allGainersPicked(DrawState draw) {
		return draw.getGainers().stream().allMatch(g -> draw.pickOf(g.getSeat()) != null);
	}

	private static boolean allGainersGave(DrawState draw) {
		return draw.getGainers().stream().allMatch(g -> draw.giveOf(g.getSeat()) != null);
	}

	private static com.a3.game.game.model.GameEvent event(String text) {
		com.a3.game.game.model.GameEvent ev = new com.a3.game.game.model.GameEvent();
		ev.setKind("system");
		ev.setName("");
		ev.setText(text);
		ev.setLabel("");
		return ev;
	}

	private static final class TakeResult {
		private final List<Card> taken;
		private final List<Card> remain;

		private TakeResult(List<Card> taken, List<Card> remain) {
			this.taken = taken;
			this.remain = remain;
		}
	}
}
