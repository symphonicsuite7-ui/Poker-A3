package com.a3.game.game.model;

/** 货标记：有货 / 独吞 / 没货。 */
public enum GoodsMark {
	HAS("has"),
	SOLO("solo"),
	NONE("none");

	private final String code;

	GoodsMark(String code) {
		this.code = code;
	}

	public String getCode() {
		return code;
	}
}
