package com.a3.game.room.service;

import com.a3.game.game.engine.GameEngine;
import com.a3.game.record.GameSettledListener;
import com.a3.game.game.model.Card;
import com.a3.game.game.model.DrawParty;
import com.a3.game.game.model.DrawState;
import com.a3.game.game.model.DrawTransfer;
import com.a3.game.game.model.EngineResult;
import com.a3.game.game.model.GameEvent;
import com.a3.game.game.model.GamePhase;
import com.a3.game.game.model.GamePlayer;
import com.a3.game.game.model.GameState;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.a3.game.room.model.Room;
import com.a3.game.room.model.RoomBackground;
import com.a3.game.room.model.RoomPublicView;
import com.a3.game.room.model.RoomResult;
import com.a3.game.room.model.RoomStatus;
import com.a3.game.room.model.RoomUser;
import com.a3.game.room.model.Seat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 房间编排，对应 Node server/rooms.js。
 * 只调用 GameEngine，不重写牌规。房间存在内存。
 */
public class RoomService {

	public static final int MAX_PLAYERS = 4;
	private static final String PASS_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	private static final Logger log = LoggerFactory.getLogger(RoomService.class);

	private final GameEngine engine;
	private final GameSettledListener settledListener;
	private final Map<String, Room> roomsById = new ConcurrentHashMap<>();
	private final Map<String, Room> roomsByPassword = new ConcurrentHashMap<>();
	private final Map<String, String> userRoom = new ConcurrentHashMap<>();

	public RoomService() {
		this(new GameEngine());
	}

	public RoomService(GameEngine engine) {
		this(engine, null);
	}

	public RoomService(GameEngine engine, GameSettledListener settledListener) {
		this.engine = engine;
		this.settledListener = settledListener;
	}

	public RoomResult createRoom(RoomUser user) {
		if (userRoom.containsKey(user.getUserId())) {
			return RoomResult.fail("你已在房间中，请先离开");
		}
		String password = generatePassword();
		Room room = new Room();
		room.setId(UUID.randomUUID().toString());
		room.setPassword(password);
		room.setHostId(user.getUserId());
		room.setStatus(RoomStatus.WAITING);
		room.setCreatedAt(System.currentTimeMillis());
		room.getPlayers().add(newSeat(user, 0));
		roomsById.put(room.getId(), room);
		roomsByPassword.put(password, room);
		userRoom.put(user.getUserId(), room.getId());
		return RoomResult.ok(room);
	}

	public RoomResult joinRoom(RoomUser user, String password) {
		String code = password == null ? "" : password.trim().toUpperCase();
		if (code.isEmpty()) {
			return RoomResult.fail("请输入房间密码");
		}
		if (userRoom.containsKey(user.getUserId())) {
			Room existing = getRoomByUser(user.getUserId());
			if (existing != null && existing.getPassword().equals(code)) {
				return RoomResult.ok(existing);
			}
			return RoomResult.fail("你已在其他房间中，请先离开");
		}
		Room room = roomsByPassword.get(code);
		if (room == null) {
			return RoomResult.fail("房间不存在或密码错误");
		}
		if (room.getStatus() != RoomStatus.WAITING) {
			return RoomResult.fail("对局已开始，无法加入");
		}
		if (room.getPlayers().size() >= MAX_PLAYERS) {
			return RoomResult.fail("房间已满");
		}
		if (room.seatOf(user.getUserId()) >= 0) {
			return RoomResult.ok(room);
		}
		room.getPlayers().add(newSeat(user, room.getPlayers().size()));
		userRoom.put(user.getUserId(), room.getId());
		return RoomResult.ok(room);
	}

	public RoomResult leaveRoom(String userId) {
		String roomId = userRoom.remove(userId);
		if (roomId == null) {
			return RoomResult.left(null, false, false);
		}
		Room room = roomsById.get(roomId);
		if (room == null) {
			return RoomResult.left(null, false, false);
		}
		if (room.getStatus() == RoomStatus.PLAYING) {
			Seat p = findSeat(room, userId);
			if (p != null) {
				p.setOnline(false);
			}
			return RoomResult.left(room, false, true);
		}
		room.getPlayers().removeIf(p -> p.getUserId().equals(userId));
		for (int i = 0; i < room.getPlayers().size(); i++) {
			room.getPlayers().get(i).setSeat(i);
		}
		if (room.getPlayers().isEmpty()) {
			roomsById.remove(room.getId());
			roomsByPassword.remove(room.getPassword());
			return RoomResult.left(null, true, false);
		}
		if (room.getHostId().equals(userId)) {
			room.setHostId(room.getPlayers().get(0).getUserId());
		}
		return RoomResult.left(room, false, false);
	}

	public RoomResult startGame(String userId) {
		Room room = getRoomByUser(userId);
		if (room == null) {
			return RoomResult.fail("不在房间中");
		}
		if (!room.getHostId().equals(userId)) {
			return RoomResult.fail("只有房主可以开始游戏");
		}
		if (room.getPlayers().size() < MAX_PLAYERS) {
			return RoomResult.fail("需要 4 名玩家才能开始");
		}
		if (room.getStatus() == RoomStatus.PLAYING) {
			return RoomResult.fail("游戏已开始");
		}
		List<String> names = room.getPlayers().stream().map(Seat::displayName).toList();
		List<Integer> prevScores = room.getGame() != null && room.getGame().getPhase() == GamePhase.SETTLED
				? room.getGame().getPlayers().stream().map(GamePlayer::getScore).toList()
				: List.of(0, 0, 0, 0);
		room.setGame(engine.newGame(names, prevScores));
		room.setStatus(RoomStatus.PLAYING);
		room.setGameStartedAt(System.currentTimeMillis());
		room.setRecordSaved(false);
		return RoomResult.ok(room);
	}

	public RoomResult nextRound(String userId) {
		Room room = getRoomByUser(userId);
		if (room == null) {
			return RoomResult.fail("不在房间中");
		}
		if (!room.getHostId().equals(userId)) {
			return RoomResult.fail("只有房主可以开下一局");
		}
		if (room.getGame() == null || room.getGame().getPhase() != GamePhase.SETTLED) {
			return RoomResult.fail("当前不能开下一局");
		}
		if (room.getPlayers().size() < MAX_PLAYERS) {
			return RoomResult.fail("人数不足");
		}
		notifySettled(room);
		List<String> names = room.getPlayers().stream().map(Seat::displayName).toList();
		room.setGame(engine.nextRound(room.getGame(), names));
		room.setStatus(RoomStatus.PLAYING);
		room.setGameStartedAt(System.currentTimeMillis());
		room.setRecordSaved(false);
		return RoomResult.ok(room);
	}

	public RoomResult playCards(String userId, List<String> cardIds) {
		Room room = requirePlaying(userId);
		if (room == null) {
			return RoomResult.fail("对局未开始");
		}
		int seat = room.seatOf(userId);
		if (seat < 0) {
			return RoomResult.fail("座位无效");
		}
		EngineResult result = engine.playCards(room.getGame(), seat, cardIds == null ? List.of() : cardIds);
		if (!result.isOk()) {
			return RoomResult.fail(result.getReason());
		}
		room.setGame(result.getState());
		if (room.getGame().getPhase() == GamePhase.SETTLED) {
			room.setStatus(RoomStatus.SETTLED);
			notifySettled(room);
		}
		return RoomResult.ok(room);
	}

	public RoomResult passTurn(String userId) {
		Room room = requirePlaying(userId);
		if (room == null) {
			return RoomResult.fail("对局未开始");
		}
		int seat = room.seatOf(userId);
		if (seat < 0) {
			return RoomResult.fail("座位无效");
		}
		EngineResult result = engine.passTurn(room.getGame(), seat);
		if (!result.isOk()) {
			return RoomResult.fail(result.getReason());
		}
		room.setGame(result.getState());
		return RoomResult.ok(room);
	}

	public RoomResult pickDrawTarget(String userId, int targetSeat) {
		Room room = requirePlaying(userId);
		if (room == null) {
			return RoomResult.fail("对局未开始");
		}
		int seat = room.seatOf(userId);
		if (seat < 0) {
			return RoomResult.fail("座位无效");
		}
		EngineResult result = engine.pickDrawTarget(room.getGame(), seat, targetSeat);
		if (!result.isOk()) {
			return RoomResult.fail(result.getReason());
		}
		room.setGame(result.getState());
		return RoomResult.ok(room);
	}

	public RoomResult devourDraw(String userId) {
		Room room = requirePlaying(userId);
		if (room == null) {
			return RoomResult.fail("对局未开始");
		}
		int seat = room.seatOf(userId);
		if (seat < 0) {
			return RoomResult.fail("座位无效");
		}
		EngineResult result = engine.devourDraw(room.getGame(), seat);
		if (!result.isOk()) {
			return RoomResult.fail(result.getReason());
		}
		room.setGame(result.getState());
		return RoomResult.ok(room);
	}

	public RoomResult giveDrawCards(String userId, List<String> cardIds) {
		return giveDrawCards(userId, cardIds, null);
	}

	public RoomResult giveDrawCards(String userId, List<String> cardIds, Integer targetSeat) {
		Room room = requirePlaying(userId);
		if (room == null) {
			return RoomResult.fail("对局未开始");
		}
		int seat = room.seatOf(userId);
		if (seat < 0) {
			return RoomResult.fail("座位无效");
		}
		EngineResult result = engine.giveDrawCards(room.getGame(), seat, cardIds == null ? List.of() : cardIds, targetSeat);
		if (!result.isOk()) {
			return RoomResult.fail(result.getReason());
		}
		room.setGame(result.getState());
		return RoomResult.ok(room);
	}

	public RoomResult advanceDraw(String roomId) {
		Room room = roomsById.get(roomId);
		if (room == null || room.getGame() == null) {
			return RoomResult.fail("对局未开始");
		}
		EngineResult result = engine.advanceDrawReveal(room.getGame());
		if (!result.isOk()) {
			return RoomResult.fail(result.getReason());
		}
		room.setGame(result.getState());
		return RoomResult.ok(room);
	}

	public RoomResult setBackground(String userId, RoomBackground item) {
		Room room = getRoomByUser(userId);
		if (room == null) {
			return RoomResult.fail("不在房间中");
		}
		if (item == null || item.getFile() == null || item.getFile().isBlank()) {
			return RoomResult.fail("图片不存在");
		}
		Seat p = findSeat(room, userId);
		if (p == null) {
			return RoomResult.fail("座位无效");
		}
		item.setBy(p.displayName());
		room.setBackground(item);
		if (room.getGame() != null) {
			engine.addBackgroundLog(room.getGame(), p.getSeat(), p.displayName(), item.getName());
		}
		return RoomResult.ok(room);
	}

	public Room bindSocket(String userId, String socketId) {
		Room room = getRoomByUser(userId);
		if (room == null) {
			return null;
		}
		Seat p = findSeat(room, userId);
		if (p != null) {
			p.setSocketId(socketId);
			p.setOnline(true);
		}
		return room;
	}

	public Room setOffline(String socketId) {
		for (Room room : roomsById.values()) {
			for (Seat p : room.getPlayers()) {
				if (socketId != null && socketId.equals(p.getSocketId())) {
					p.setOnline(false);
					p.setSocketId(null);
					return room;
				}
			}
		}
		return null;
	}

	public Room getRoomByUser(String userId) {
		String roomId = userRoom.get(userId);
		if (roomId == null) {
			return null;
		}
		return roomsById.get(roomId);
	}

	public Room getRoom(String roomId) {
		return roomsById.get(roomId);
	}

	public RoomPublicView toPublic(Room room, String viewerUserId) {
		RoomPublicView view = new RoomPublicView();
		view.setId(room.getId());
		view.setPassword(room.getPassword());
		view.setHostId(room.getHostId());
		view.setStatus(room.getStatus().name().toLowerCase());
		view.setPlayerCount(room.getPlayers().size());
		view.setMaxPlayers(MAX_PLAYERS);
		view.setBackground(room.getBackground());
		for (Seat p : room.getPlayers()) {
			RoomPublicView.SeatView s = new RoomPublicView.SeatView();
			s.setUserId(p.getUserId());
			s.setUsername(p.getUsername());
			s.setNickname(p.getNickname());
			s.setAvatar(p.getAvatar());
			s.setSeat(p.getSeat());
			s.setOnline(p.isOnline());
			s.setHost(p.getUserId().equals(room.getHostId()));
			s.setMe(p.getUserId().equals(viewerUserId));
			view.getPlayers().add(s);
		}
		return view;
	}

	/**
	 * 对指定玩家脱敏：只看自己的手牌。对应 Node gameViewFor。
	 */
	public GameView gameViewFor(Room room, String userId) {
		if (room.getGame() == null) {
			return null;
		}
		int seat = room.seatOf(userId);
		GameState g = room.getGame();
		GameView view = new GameView();
		view.mySeat = seat;
		view.currentPlayer = g.getCurrentPlayer();
		view.lastPlay = g.getLastPlay();
		view.lastPlayPlayer = g.getLastPlayPlayer();
		view.phase = g.getPhase().getCode();
		view.revealedTeam = g.isRevealedTeam();
		boolean showTeam = g.isRevealedTeam() || g.getPhase() == GamePhase.SETTLED;
		view.teamA = showTeam ? g.getTeamA() : null;
		view.teamB = showTeam ? g.getTeamB() : null;
		view.solo = g.isSolo();
		view.round = g.getRound();
		view.lastDeltas = g.getLastDeltas();
		int from = Math.max(0, g.getHistory().size() - 40);
		view.history = new ArrayList<>(g.getHistory().subList(from, g.getHistory().size()));
		int evFrom = Math.max(0, g.getEvents().size() - 60);
		for (int i = evFrom; i < g.getEvents().size(); i++) {
			GameEvent ev = g.getEvents().get(i);
			EventView e = new EventView();
			e.kind = ev.getKind();
			e.seat = ev.getSeat();
			e.name = ev.getName();
			e.text = ev.getText();
			e.label = ev.getLabel();
			e.cards = ev.getCards();
			if (ev.getSeat() != null && ev.getSeat() >= 0 && ev.getSeat() < room.getPlayers().size()) {
				e.avatar = room.getPlayers().get(ev.getSeat()).getAvatar();
			}
			view.events.add(e);
		}
		view.draw = drawView(g, seat);
		for (int i = 0; i < g.getPlayers().size(); i++) {
			GamePlayer p = g.getPlayers().get(i);
			PlayerView pv = new PlayerView();
			pv.id = p.getId();
			pv.name = p.getName();
			pv.avatar = i < room.getPlayers().size() ? room.getPlayers().get(i).getAvatar() : "/avatars/preset-1.svg";
			pv.score = p.getScore();
			pv.handCount = p.getHand().size();
			pv.finishedRank = p.getFinishedRank();
			pv.goodsMark = p.getGoodsMark() == null ? null : p.getGoodsMark().getCode();
			boolean showHand = i == seat || g.getPhase() == GamePhase.SETTLED;
			pv.hand = showHand ? p.getHand() : null;
			pv.me = i == seat;
			view.players.add(pv);
		}
		return view;
	}

	/** 抽还牌对指定座位的脱敏视图，对应 Node drawView。 */
	private static DrawView drawView(GameState g, int seat) {
		if (g.getDraw() == null || g.getPhase() != GamePhase.DRAW || "done".equals(g.getDraw().getStep())) {
			return null;
		}
		DrawState d = g.getDraw();
		DrawParty gainer = null;
		for (DrawParty p : d.getGainers()) {
			if (p.getSeat() == seat) {
				gainer = p;
				break;
			}
		}
		List<Integer> takenSeats = new ArrayList<>();
		for (Integer v : d.getPicks().values()) {
			if (v != null && !takenSeats.contains(v)) {
				takenSeats.add(v);
			}
		}
		boolean showTakes = "showTake".equals(d.getStep()) || "give".equals(d.getStep()) || "showGive".equals(d.getStep());
		boolean showGives = "showGive".equals(d.getStep());
		DrawView view = new DrawView();
		view.step = d.getStep();
		view.mode = d.getMode();
		view.uniqueTargets = d.isUniqueTargets();
		view.gainers = d.getGainers();
		view.losers = d.getLosers();
		view.picks = d.getPicks();
		view.takenSeats = takenSeats;
		view.takes = showTakes ? d.getTakes() : List.of();
		view.giveCards = showGives ? d.getGiveCards() : List.of();
		view.revealUntil = d.getRevealUntil();
		view.isGainer = gainer != null;
		view.myAmount = gainer == null ? 0 : gainer.getAmount();
		view.myPick = gainer == null ? null : d.pickOf(seat);
		view.myGiveDone = gainer != null && d.giveOf(seat) != null;
		view.myGiveChunk = view.myAmount;
		view.remainingTargets = List.of();
		if (d.isDevour() && gainer != null) {
			List<DrawParty> rem = d.remainingGiveLosers(seat);
			view.remainingTargets = rem.stream().map(DrawParty::getSeat).toList();
			view.myGiveChunk = d.giveChunkSize(seat);
			view.myGiveDone = rem.isEmpty();
		}
		return view;
	}

	private void notifySettled(Room room) {
		if (settledListener == null || room == null || room.getGame() == null) {
			return;
		}
		if (room.getGame().getPhase() != GamePhase.SETTLED || room.isRecordSaved()) {
			return;
		}
		try {
			settledListener.onSettled(room);
		} catch (RuntimeException e) {
			log.warn("结算落库失败 roomId={}", room.getId(), e);
		}
	}

	private Room requirePlaying(String userId) {
		Room room = getRoomByUser(userId);
		if (room == null || room.getGame() == null) {
			return null;
		}
		return room;
	}

	private static Seat findSeat(Room room, String userId) {
		return room.getPlayers().stream().filter(p -> p.getUserId().equals(userId)).findFirst().orElse(null);
	}

	private static Seat newSeat(RoomUser user, int seatIndex) {
		Seat s = new Seat();
		s.setUserId(user.getUserId());
		s.setUsername(user.getUsername());
		s.setNickname(user.getNickname());
		s.setAvatar(user.getAvatar());
		s.setSeat(seatIndex);
		s.setOnline(true);
		return s;
	}

	/** 资料变更后同步房间座位展示信息 */
	public Room refreshPlayerProfile(String userId, String username, String nickname, String avatar) {
		Room room = getRoomByUser(userId);
		if (room == null) {
			return null;
		}
		Seat p = findSeat(room, userId);
		if (p == null) {
			return null;
		}
		if (username != null && !username.isBlank()) {
			p.setUsername(username);
		}
		if (nickname != null) {
			p.setNickname(nickname);
		}
		if (avatar != null && !avatar.isBlank()) {
			p.setAvatar(avatar);
		}
		if (room.getGame() != null && room.getGame().getPlayers() != null
				&& p.getSeat() >= 0 && p.getSeat() < room.getGame().getPlayers().size()) {
			room.getGame().getPlayers().get(p.getSeat()).setName(p.displayName());
		}
		return room;
	}

	private String generatePassword() {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < 6; i++) {
			int idx = (int) (Math.random() * PASS_CHARS.length());
			sb.append(PASS_CHARS.charAt(idx));
		}
		String code = sb.toString();
		if (roomsByPassword.containsKey(code)) {
			return generatePassword();
		}
		return code;
	}

	public static class GameView {
		public int mySeat;
		public int currentPlayer;
		public Object lastPlay;
		public Integer lastPlayPlayer;
		public String phase;
		public boolean revealedTeam;
		public List<Integer> teamA;
		public List<Integer> teamB;
		public boolean solo;
		public List<String> history = new ArrayList<>();
		public List<EventView> events = new ArrayList<>();
		public int round;
		public List<Integer> lastDeltas;
		public DrawView draw;
		public List<PlayerView> players = new ArrayList<>();
	}

	public static class EventView {
		public String kind;
		public Integer seat;
		public String name;
		public String text;
		public String label;
		public List<Card> cards;
		public String avatar;
	}

	public static class DrawView {
		public String step;
		public String mode;
		public boolean uniqueTargets;
		public List<DrawParty> gainers;
		public List<DrawParty> losers;
		public Map<String, Integer> picks;
		public List<Integer> takenSeats;
		public List<DrawTransfer> takes;
		public List<DrawTransfer> giveCards;
		public Long revealUntil;
		public boolean isGainer;
		public int myAmount;
		public int myGiveChunk;
		public Integer myPick;
		public boolean myGiveDone;
		public List<Integer> remainingTargets;
	}

	public static class PlayerView {
		public int id;
		public String name;
		public String avatar;
		public int score;
		public int handCount;
		public Integer finishedRank;
		public String goodsMark;
		public List<Card> hand;
		@JsonProperty("isMe")
		public boolean me;
	}
}
