package com.a3.game.websocket;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * 客户端上行：{"id":"1","event":"room:create","data":{}}
 * 事件名与现网 Socket.IO 保持一致。
 */
public class WsEnvelope {

	private String id;
	private String event;
	private JsonNode data;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getEvent() {
		return event;
	}

	public void setEvent(String event) {
		this.event = event;
	}

	public JsonNode getData() {
		return data;
	}

	public void setData(JsonNode data) {
		this.data = data;
	}
}
