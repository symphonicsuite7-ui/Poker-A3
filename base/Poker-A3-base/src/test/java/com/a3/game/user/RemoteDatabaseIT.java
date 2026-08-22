package com.a3.game.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 直连现网库核对脚本是否已执行。库不可达时整类跳过。
 */
class RemoteDatabaseIT {

	private static final String URL =
			"jdbc:mysql://47.104.243.13:3306/a3_game?useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true";
	private static final String USER = "a3_game";
	private static final String PASSWORD = "Aa257774050";

	static boolean reachable() {
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			try (Connection ignored = DriverManager.getConnection(URL, USER, PASSWORD)) {
				return true;
			}
		} catch (Exception e) {
			return false;
		}
	}

	@Test
	@EnabledIf("reachable")
	void seedUserAndBackgroundExist() throws Exception {
		try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
				Statement st = conn.createStatement()) {
			try (ResultSet tables = st.executeQuery(
					"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='a3_game' AND table_name IN ('sys_user','resource','game_record','game_player_record','user_career','achievement_unlock')")) {
				assertTrue(tables.next());
				assertEquals(6, tables.getInt(1));
			}
			try (ResultSet user = st.executeQuery("SELECT nickname FROM sys_user WHERE username='test'")) {
				assertTrue(user.next(), "缺少初始化用户 test");
				assertEquals("A3玩家", user.getString("nickname"));
			}
			try (ResultSet bg = st.executeQuery("SELECT name FROM resource WHERE file_key='default_background.jpg'")) {
				assertTrue(bg.next(), "缺少默认背景");
				assertEquals("默认背景", bg.getString("name"));
			}
		}
	}
}
