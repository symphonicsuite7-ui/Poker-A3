package com.a3.game.common;

/** 业务错误，返回 {ok:false, error}。 */
public class ApiException extends RuntimeException {

	private final int status;

	public ApiException(String message) {
		this(400, message);
	}

	public ApiException(int status, String message) {
		super(message);
		this.status = status;
	}

	public int getStatus() {
		return status;
	}
}
