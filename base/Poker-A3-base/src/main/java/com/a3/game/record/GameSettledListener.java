package com.a3.game.record;

import com.a3.game.room.model.Room;

/** 一局 settled 后的落库钩子。RoomService 不直接碰数据库。 */
public interface GameSettledListener {

	void onSettled(Room room);
}
