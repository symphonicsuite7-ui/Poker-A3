package com.a3.game.user.service;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * 头像校验与保存，规则对齐 Node avatars.js。
 * 支持上传图片，或按用户名首字生成字母头像 SVG。
 */
@Component
public class AvatarService {

	public static final String DEFAULT = "/avatars/preset-1.svg";

	private static final Set<String> PRESETS = Set.of(
			"/avatars/preset-1.svg",
			"/avatars/preset-2.svg",
			"/avatars/preset-3.svg",
			"/avatars/preset-4.svg",
			"/avatars/preset-5.svg",
			"/avatars/preset-6.svg");

	private static final List<String> LETTER_COLORS = List.of(
			"#3d5a80", "#2f6b4f", "#6b4a2f", "#4a3d6b", "#6b3d4a", "#2f5a6b");

	private final Path uploadDir;

	public AvatarService(@org.springframework.beans.factory.annotation.Value("${a3.upload-dir:data/uploads}") String uploadDir) {
		this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
	}

	public String normalize(String avatar) {
		if (isPreset(avatar) || isUploaded(avatar)) {
			return avatar;
		}
		return DEFAULT;
	}

	public String saveUploaded(MultipartFile file) {
		return saveImage(file, "avatars", 2 * 1024 * 1024, "头像");
	}

	/** 背景图，最大 5MB，目录 uploads/backgrounds。 */
	public String saveBackground(MultipartFile file) {
		return saveImage(file, "backgrounds", 5 * 1024 * 1024, "图片");
	}

	/**
	 * 用名字首字生成圆形 SVG 头像并落盘。
	 */
	public String createLetterAvatar(String name) {
		String ch = firstChar(name);
		String color = letterColor(ch);
		String escaped = escapeXml(ch);
		String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"128\" height=\"128\" viewBox=\"0 0 128 128\">"
				+ "<rect width=\"128\" height=\"128\" rx=\"64\" fill=\"" + color + "\"/>"
				+ "<text x=\"64\" y=\"64\" dy=\".35em\" text-anchor=\"middle\" fill=\"#f7f1e4\" "
				+ "font-size=\"56\" font-family=\"Segoe UI, PingFang SC, Microsoft YaHei, sans-serif\" font-weight=\"700\">"
				+ escaped + "</text></svg>";
		try {
			Path dir = uploadDir.resolve("avatars");
			Files.createDirectories(dir);
			String fileName = UUID.randomUUID() + ".svg";
			Files.writeString(dir.resolve(fileName), svg, StandardCharsets.UTF_8);
			return "/uploads/avatars/" + fileName;
		} catch (IOException e) {
			throw new com.a3.game.common.ApiException("头像生成失败");
		}
	}

	public Path uploadRoot() {
		return uploadDir;
	}

	private String saveImage(MultipartFile file, String subDir, int maxBytes, String label) {
		if (file == null || file.isEmpty()) {
			return null;
		}
		byte[] bytes;
		try {
			bytes = file.getBytes();
		} catch (IOException e) {
			throw new com.a3.game.common.ApiException(label + "上传失败");
		}
		if (bytes.length > maxBytes) {
			throw new com.a3.game.common.ApiException(label + "不能超过 " + (maxBytes / (1024 * 1024)) + "MB");
		}
		String ext = detectExt(bytes);
		if (ext == null) {
			throw new com.a3.game.common.ApiException("仅支持 JPG / PNG / GIF / WEBP 图片");
		}
		try {
			Path dir = uploadDir.resolve(subDir);
			Files.createDirectories(dir);
			String name = UUID.randomUUID() + ext;
			Files.write(dir.resolve(name), bytes);
			return "/uploads/" + subDir + "/" + name;
		} catch (IOException e) {
			throw new com.a3.game.common.ApiException(label + "保存失败");
		}
	}

	private static String firstChar(String name) {
		if (name == null) {
			return "?";
		}
		String t = name.trim();
		if (t.isEmpty()) {
			return "?";
		}
		return t.substring(0, 1).toUpperCase();
	}

	private static String letterColor(String ch) {
		int h = 0;
		for (int i = 0; i < ch.length(); i++) {
			h = 31 * h + ch.charAt(i);
		}
		int idx = Math.floorMod(h, LETTER_COLORS.size());
		return LETTER_COLORS.get(idx);
	}

	private static String escapeXml(String s) {
		return s.replace("&", "&amp;")
				.replace("<", "&lt;")
				.replace(">", "&gt;")
				.replace("\"", "&quot;");
	}

	private static boolean isPreset(String avatar) {
		return avatar != null && PRESETS.contains(avatar);
	}

	private static boolean isUploaded(String avatar) {
		return avatar != null
				&& avatar.matches("(?i)^/uploads/avatars/[a-zA-Z0-9-]+\\.(jpg|jpeg|png|gif|webp|svg)$");
	}

	private static String detectExt(byte[] buffer) {
		if (buffer == null || buffer.length < 12) {
			return null;
		}
		if (buffer[0] == (byte) 0xff && buffer[1] == (byte) 0xd8 && buffer[2] == (byte) 0xff) {
			return ".jpg";
		}
		if (buffer[0] == (byte) 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4e && buffer[3] == 0x47) {
			return ".png";
		}
		if (buffer[0] == 0x47 && buffer[1] == 0x49 && buffer[2] == 0x46 && buffer[3] == 0x38) {
			return ".gif";
		}
		if (buffer[0] == 'R' && buffer[1] == 'I' && buffer[2] == 'F' && buffer[3] == 'F'
				&& buffer[8] == 'W' && buffer[9] == 'E' && buffer[10] == 'B' && buffer[11] == 'P') {
			return ".webp";
		}
		return null;
	}
}
