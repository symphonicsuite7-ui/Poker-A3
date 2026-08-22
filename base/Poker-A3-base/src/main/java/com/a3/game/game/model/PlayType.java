package com.a3.game.game.model;

/** 牌型，code 与 Node 字符串一致。 */
public enum PlayType {
	SINGLE("single", "单张"),
	PAIR("pair", "一对"),
	TRIPLE("triple", "三条"),
	QUAD("quad", "四条"),
	STRAIGHT("straight", "顺子"),
	FLUSH("flush", "同花"),
	FULLHOUSE("fullhouse", "三带二"),
	FOURONE("fourone", "四带一"),
	FLUSHSTRAIGHT("flushstraight", "天子");

	private final String code;
	private final String label;

	PlayType(String code, String label) {
		this.code = code;
		this.label = label;
	}

	public String getCode() {
		return code;
	}

	public String getLabel() {
		return label;
	}

	public static PlayType fromCode(String code) {
		if (code == null) {
			return null;
		}
		for (PlayType type : values()) {
			if (type.code.equals(code)) {
				return type;
			}
		}
		return null;
	}
}
