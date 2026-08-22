package com.a3.game.resource.controller;

import com.a3.game.resource.service.ResourceService;
import com.a3.game.user.dto.AuthUser;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/** 用户图库上传 / 删除。 */
@RestController
@Profile("!test")
public class ResourceController {

	private final ResourceService resources;

	public ResourceController(ResourceService resources) {
		this.resources = resources;
	}

	@PostMapping(value = "/api/resource/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Map<String, Object> upload(Authentication authentication,
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "name", required = false) String name) {
		AuthUser user = (AuthUser) authentication.getPrincipal();
		return resources.uploadBackground(user.getId(), file, name);
	}

	@DeleteMapping("/api/resource/{id}")
	public Map<String, Object> delete(Authentication authentication, @PathVariable("id") Long id) {
		AuthUser user = (AuthUser) authentication.getPrincipal();
		return resources.deleteMine(user.getId(), id);
	}
}
