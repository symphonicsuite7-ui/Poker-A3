package com.a3.game.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

/** HTTP 错误体与现网 Node 一致：{ok, error}。 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<Map<String, Object>> handleApi(ApiException e) {
		return ResponseEntity.status(e.getStatus()).body(fail(e.getMessage()));
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<Map<String, Object>> handleUpload(MaxUploadSizeExceededException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(fail("文件不能超过大小限制"));
	}

	static Map<String, Object> fail(String error) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", false);
		body.put("error", error);
		return body;
	}
}
