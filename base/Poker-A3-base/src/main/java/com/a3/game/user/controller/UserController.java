package com.a3.game.user.controller;

import com.a3.game.resource.entity.GameResource;
import com.a3.game.resource.mapper.GameResourceMapper;
import com.a3.game.resource.service.ResourceService;
import com.a3.game.user.dto.AuthUser;
import com.a3.game.user.dto.ProfileRequest;
import com.a3.game.user.entity.SysUser;
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

/** 资料：昵称、头像、默认背景。路径对齐重构设计。 */
@RestController
@Profile("!test")
public class UserController {

	private final UserService users;
	private final ResourceService resources;
	private final GameResourceMapper resourceMapper;

	public UserController(UserService users, ResourceService resources, GameResourceMapper resourceMapper) {
		this.users = users;
		this.resources = resources;
		this.resourceMapper = resourceMapper;
	}

	@GetMapping("/api/user/info")
	public Map<String, Object> info(Authentication authentication) {
		AuthUser auth = current(authentication);
		SysUser user = users.requireEntity(auth.getId());
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("user", publicUser(user));
		return body;
	}

	@PostMapping(value = "/api/user/profile", consumes = MediaType.APPLICATION_JSON_VALUE)
	public Map<String, Object> profileJson(Authentication authentication, @RequestBody ProfileRequest body) {
		AuthUser auth = current(authentication);
		if (body == null) {
			body = new ProfileRequest();
		}
		Map<String, Object> result = users.updateProfile(auth.getId(), body.getNickname(), body.getAvatar(), null);
		SysUser user = users.requireEntity(auth.getId());
		result.put("user", publicUser(user));
		return result;
	}

	@PostMapping(value = "/api/user/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Map<String, Object> profileForm(
			Authentication authentication,
			@RequestParam(value = "nickname", required = false) String nickname,
			@RequestParam(value = "avatar", required = false) String avatar,
			@RequestParam(value = "avatarFile", required = false) MultipartFile avatarFile) {
		AuthUser auth = current(authentication);
		Map<String, Object> result = users.updateProfile(auth.getId(), nickname, avatar, avatarFile);
		SysUser user = users.requireEntity(auth.getId());
		result.put("user", publicUser(user));
		return result;
	}

	@PostMapping(value = "/api/user/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Map<String, Object> avatar(Authentication authentication,
			@RequestParam("avatarFile") MultipartFile avatarFile) {
		AuthUser auth = current(authentication);
		Map<String, Object> result = users.updateProfile(auth.getId(), null, null, avatarFile);
		SysUser user = users.requireEntity(auth.getId());
		result.put("user", publicUser(user));
		return result;
	}

	@PostMapping("/api/user/background")
	public Map<String, Object> background(Authentication authentication, @RequestBody ProfileRequest body) {
		AuthUser auth = current(authentication);
		Long resourceId = body == null ? null : (body.getResourceId() != null ? body.getResourceId() : body.getBackgroundId());
		GameResource row;
		if (resourceId != null) {
			row = resources.requireReadable(auth.getId(), resourceId);
		} else {
			row = resources.ensureSystem(body == null ? null : body.getFile(),
					body == null ? null : body.getName(),
					body == null ? null : body.getUrl());
		}
		if (row == null) {
			throw new com.a3.game.common.ApiException("请选择背景图");
		}
		users.setBackgroundId(auth.getId(), row.getId());
		SysUser user = users.requireEntity(auth.getId());
		Map<String, Object> resp = new LinkedHashMap<>();
		resp.put("ok", true);
		resp.put("user", publicUser(user));
		return resp;
	}

	private Map<String, Object> publicUser(SysUser user) {
		Map<String, Object> map = UserService.toAuthUser(user).toPublic();
		map.put("createTime", user.getCreateTime() == null ? null : user.getCreateTime().toString());
		map.put("backgroundId", user.getBackgroundId());
		if (user.getBackgroundId() != null) {
			GameResource bg = resourceMapper.selectById(user.getBackgroundId());
			if (bg != null) {
				Map<String, Object> image = new LinkedHashMap<>();
				image.put("id", bg.getId());
				image.put("name", bg.getName());
				image.put("file", bg.getFileKey());
				image.put("url", bg.getUrl());
				map.put("background", image);
			}
		}
		return map;
	}

	private static AuthUser current(Authentication authentication) {
		return (AuthUser) authentication.getPrincipal();
	}
}
