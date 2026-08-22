package com.a3.game.common;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

/** 探活。有数据源时顺带探一下库。 */
@RestController
public class HealthController {

	private final ObjectProvider<DataSource> dataSource;

	public HealthController(ObjectProvider<DataSource> dataSource) {
		this.dataSource = dataSource;
	}

	@GetMapping("/health")
	public Map<String, Object> health() {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("status", "up");
		DataSource ds = dataSource.getIfAvailable();
		if (ds == null) {
			body.put("db", "off");
			return body;
		}
		try (Connection ignored = ds.getConnection()) {
			body.put("db", "up");
		} catch (Exception e) {
			body.put("ok", false);
			body.put("status", "down");
			body.put("db", "down");
		}
		return body;
	}
}
