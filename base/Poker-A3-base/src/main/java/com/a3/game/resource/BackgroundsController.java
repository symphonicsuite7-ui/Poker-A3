package com.a3.game.resource;

import com.a3.game.resource.service.ResourceService;
import com.a3.game.room.model.RoomBackground;
import com.a3.game.user.dto.AuthUser;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** GET /api/backgrounds，系统目录 + 当前用户上传。 */
@RestController
public class BackgroundsController {

	private final BackgroundCatalog catalog;
	private final ObjectProvider<ResourceService> resources;

	public BackgroundsController(BackgroundCatalog catalog, ObjectProvider<ResourceService> resources) {
		this.catalog = catalog;
		this.resources = resources;
	}

	@GetMapping("/api/backgrounds")
	public Map<String, Object> list(Authentication authentication) {
		List<RoomBackground> images = catalog.list();
		ResourceService svc = resources.getIfAvailable();
		if (svc != null) {
			Long userId = null;
			if (authentication != null && authentication.getPrincipal() instanceof AuthUser auth) {
				userId = auth.getId();
			}
			images = svc.mergeGallery(images, userId);
		}
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("images", images);
		return body;
	}
}
