package com.a3.game.user.controller;

import com.a3.game.user.dto.AuthUser;
import com.a3.game.user.dto.LoginRequest;
import com.a3.game.user.service.UserService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 认证接口，路径与现网 Node 一致。
 */
@RestController
@Profile("!test")
public class AuthController {

	private final UserService users;

	public AuthController(UserService users) {
		this.users = users;
	}

	@PostMapping(value = "/api/login", consumes = MediaType.APPLICATION_JSON_VALUE)
	public Map<String, Object> loginJson(@RequestBody LoginRequest body) {
		return users.login(body == null ? null : body.getUsername(), body == null ? null : body.getPassword());
	}

	@PostMapping(value = "/api/register", consumes = MediaType.APPLICATION_JSON_VALUE)
	public Map<String, Object> registerJson(@RequestBody LoginRequest body) {
		if (body == null) {
			body = new LoginRequest();
		}
		return users.register(body.getUsername(), body.getPassword(), body.getNickname(), body.getAvatar(), null);
	}

	@PostMapping(value = "/api/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Map<String, Object> registerForm(
			@RequestParam("username") String username,
			@RequestParam("password") String password,
			@RequestParam(value = "nickname", required = false) String nickname,
			@RequestParam(value = "avatar", required = false) String avatar,
			@RequestParam(value = "avatarFile", required = false) MultipartFile avatarFile) {
		return users.register(username, password, nickname, avatar, avatarFile);
	}

	@GetMapping("/api/me")
	public Map<String, Object> me(Authentication authentication) {
		AuthUser user = (AuthUser) authentication.getPrincipal();
		AuthUser fresh = users.requireActive(user.getId());
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("user", fresh.toPublic());
		return body;
	}

	@PostMapping("/api/logout")
	public Map<String, Object> logout() {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		return body;
	}
}
