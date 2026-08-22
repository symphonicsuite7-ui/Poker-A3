package com.a3.game.resource.service;

import com.a3.game.common.ApiException;
import com.a3.game.resource.entity.GameResource;
import com.a3.game.resource.mapper.GameResourceMapper;
import com.a3.game.room.model.RoomBackground;
import com.a3.game.user.entity.SysUser;
import com.a3.game.user.mapper.SysUserMapper;
import com.a3.game.user.service.AvatarService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 图库元数据。文件落磁盘，MySQL 只存 URL。
 */
@Service
@Profile("!test")
public class ResourceService {

	private final GameResourceMapper resources;
	private final SysUserMapper users;
	private final AvatarService avatars;

	public ResourceService(GameResourceMapper resources, SysUserMapper users, AvatarService avatars) {
		this.resources = resources;
		this.users = users;
		this.avatars = avatars;
	}

	public List<RoomBackground> mergeGallery(List<RoomBackground> system, Long userId) {
		List<RoomBackground> list = new ArrayList<>();
		if (system != null) {
			for (RoomBackground item : system) {
				item.setMine(false);
				list.add(item);
			}
		}
		List<GameResource> mine = userId == null ? List.of()
				: resources.selectList(new LambdaQueryWrapper<GameResource>()
						.eq(GameResource::getOwnerId, userId)
						.eq(GameResource::getType, "BACKGROUND")
						.orderByDesc(GameResource::getId));
		for (GameResource row : mine) {
			boolean dup = false;
			for (RoomBackground item : list) {
				if (row.getFileKey() != null && row.getFileKey().equals(item.getFile())) {
					item.setId(row.getId());
					item.setMine(true);
					dup = true;
					break;
				}
			}
			if (!dup) {
				list.add(toBackground(row, true));
			}
		}
		return list;
	}

	public Map<String, Object> uploadBackground(Long userId, MultipartFile file, String name) {
		String url = avatars.saveBackground(file);
		String fileKey = url.substring(url.lastIndexOf('/') + 1);
		String display = name == null || name.isBlank() ? stripExt(fileKey) : name.trim();
		if (display.length() > 64) {
			display = display.substring(0, 64);
		}
		GameResource row = new GameResource();
		row.setOwnerId(userId);
		row.setName(display);
		row.setFileKey(fileKey);
		row.setUrl(url);
		row.setType("BACKGROUND");
		row.setSize(file == null ? 0L : file.getSize());
		row.setFormat(extOf(fileKey));
		row.setIsDeleted(0);
		row.setCreateTime(LocalDateTime.now());
		row.setUpdateTime(LocalDateTime.now());
		resources.insert(row);
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("resource", toMap(row, true));
		body.put("image", toBackground(row, true));
		return body;
	}

	public Map<String, Object> deleteMine(Long userId, Long resourceId) {
		GameResource row = resources.selectById(resourceId);
		if (row == null) {
			throw new ApiException("图片不存在");
		}
		if (row.getOwnerId() == null || !row.getOwnerId().equals(userId)) {
			throw new ApiException(403, "只能删除自己上传的图片");
		}
		resources.deleteById(resourceId);
		SysUser user = users.selectById(userId);
		if (user != null && resourceId.equals(user.getBackgroundId())) {
			user.setBackgroundId(null);
			users.updateById(user);
		}
		deleteFileQuietly(row.getUrl());
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		return body;
	}

	public GameResource ensureSystem(String file, String name, String url) {
		if (file == null || file.isBlank()) {
			return null;
		}
		String key = Path.of(file).getFileName().toString();
		GameResource row = resources.selectOne(new LambdaQueryWrapper<GameResource>().eq(GameResource::getFileKey, key));
		if (row != null) {
			return row;
		}
		String href = url == null || url.isBlank() ? "/backgrounds/" + key : url;
		String display = name == null || name.isBlank() ? stripExt(key) : name.trim();
		row = new GameResource();
		row.setOwnerId(null);
		row.setName(display);
		row.setFileKey(key);
		row.setUrl(href);
		row.setType("BACKGROUND");
		row.setSize(0L);
		row.setFormat(extOf(key));
		row.setIsDeleted(0);
		row.setCreateTime(LocalDateTime.now());
		row.setUpdateTime(LocalDateTime.now());
		resources.insert(row);
		return row;
	}

	public GameResource requireReadable(Long userId, Long resourceId) {
		GameResource row = resources.selectById(resourceId);
		if (row == null) {
			throw new ApiException("图片不存在");
		}
		if (row.getOwnerId() != null && !row.getOwnerId().equals(userId)) {
			throw new ApiException(403, "不能使用他人上传的图片");
		}
		return row;
	}

	private void deleteFileQuietly(String url) {
		if (url == null || !url.startsWith("/uploads/")) {
			return;
		}
		try {
			Path file = avatars.uploadRoot().resolve(url.substring("/uploads/".length())).normalize();
			if (file.startsWith(avatars.uploadRoot())) {
				Files.deleteIfExists(file);
			}
		} catch (Exception ignored) {
			// 元数据已删，磁盘失败不影响接口
		}
	}

	private static RoomBackground toBackground(GameResource row, boolean mine) {
		RoomBackground bg = new RoomBackground();
		bg.setId(row.getId());
		bg.setName(row.getName());
		bg.setFile(row.getFileKey());
		bg.setUrl(row.getUrl());
		bg.setMine(mine);
		return bg;
	}

	private static Map<String, Object> toMap(GameResource row, boolean mine) {
		Map<String, Object> map = new LinkedHashMap<>();
		map.put("id", row.getId());
		map.put("name", row.getName());
		map.put("file", row.getFileKey());
		map.put("url", row.getUrl());
		map.put("type", row.getType());
		map.put("mine", mine);
		return map;
	}

	private static String stripExt(String file) {
		int dot = file.lastIndexOf('.');
		return dot < 0 ? file : file.substring(0, dot);
	}

	private static String extOf(String file) {
		int dot = file.lastIndexOf('.');
		return dot < 0 ? null : file.substring(dot + 1).toLowerCase();
	}
}
