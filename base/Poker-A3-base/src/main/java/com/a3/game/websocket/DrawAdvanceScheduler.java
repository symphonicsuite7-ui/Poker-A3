package com.a3.game.websocket;

import com.a3.game.game.model.DrawState;
import com.a3.game.room.model.Room;
import com.a3.game.room.model.RoomResult;
import com.a3.game.room.service.RoomService;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * 抽还牌亮牌计时，对应 Node scheduleDrawAdvance。
 */
@Component
public class DrawAdvanceScheduler {

	private final ConcurrentHashMap<String, ScheduledFuture<?>> timers = new ConcurrentHashMap<>();
	private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor(r -> {
		Thread t = new Thread(r, "draw-advance");
		t.setDaemon(true);
		return t;
	});
	private final RoomService rooms;
	private final GameWsHub hub;

	public DrawAdvanceScheduler(RoomService rooms, GameWsHub hub) {
		this.rooms = rooms;
		this.hub = hub;
	}

	public void schedule(Room room) {
		if (room == null || room.getGame() == null || room.getGame().getDraw() == null) {
			return;
		}
		DrawState draw = room.getGame().getDraw();
		String step = draw.getStep();
		if (!"showTake".equals(step) && !"showGive".equals(step)) {
			return;
		}
		long until = draw.getRevealUntil() == null ? System.currentTimeMillis() : draw.getRevealUntil();
		long wait = Math.max(50, until - System.currentTimeMillis());
		String roomId = room.getId();
		ScheduledFuture<?> old = timers.remove(roomId);
		if (old != null) {
			old.cancel(false);
		}
		ScheduledFuture<?> future = executor.schedule(() -> advance(roomId), wait, TimeUnit.MILLISECONDS);
		timers.put(roomId, future);
	}

	private void advance(String roomId) {
		timers.remove(roomId);
		RoomResult result;
		synchronized (rooms) {
			result = rooms.advanceDraw(roomId);
		}
		if (!result.isOk()) {
			return;
		}
		hub.broadcast(result.getRoom());
		schedule(result.getRoom());
	}

	@PreDestroy
	public void shutdown() {
		executor.shutdownNow();
	}
}
