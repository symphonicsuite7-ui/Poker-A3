package com.a3.game.resource;

import com.a3.game.room.model.RoomBackground;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * 扫 public/backgrounds，对应 Node backgrounds.js。
 */
@Component
public class BackgroundCatalog {

	private static final Set<String> ALLOWED = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp");

	private final Path dir;

	public BackgroundCatalog(@Value("${a3.web-root:../../public}") String webRoot) {
		this.dir = Path.of(webRoot).toAbsolutePath().normalize().resolve("backgrounds");
	}

	public List<RoomBackground> list() {
		List<RoomBackground> list = new ArrayList<>();
		if (!Files.isDirectory(dir)) {
			return list;
		}
		try (var stream = Files.list(dir)) {
			stream.filter(Files::isRegularFile).sorted().forEach(path -> {
				String file = path.getFileName().toString();
				int dot = file.lastIndexOf('.');
				String ext = dot < 0 ? "" : file.substring(dot).toLowerCase(Locale.ROOT);
				if (!ALLOWED.contains(ext)) {
					return;
				}
				list.add(item(file, file.substring(0, dot), encodeUrl(file)));
			});
		} catch (IOException ignored) {
			return list;
		}
		return list;
	}

	public RoomBackground complete(String file, String name, String url) {
		if (file == null || file.isBlank()) {
			return null;
		}
		String base = Path.of(file).getFileName().toString();
		for (RoomBackground item : list()) {
			if (base.equals(item.getFile())) {
				return item;
			}
		}
		String display = name == null || name.isBlank() ? stripExt(base) : name;
		String href = url == null || url.isBlank() ? encodeUrl(base) : url;
		return item(base, display, href);
	}

	private static RoomBackground item(String file, String name, String url) {
		RoomBackground bg = new RoomBackground();
		bg.setFile(file);
		bg.setName(name);
		bg.setUrl(url);
		return bg;
	}

	private static String stripExt(String file) {
		int dot = file.lastIndexOf('.');
		return dot < 0 ? file : file.substring(0, dot);
	}

	private static String encodeUrl(String file) {
		return "/backgrounds/" + URLEncoder.encode(file, StandardCharsets.UTF_8).replace("+", "%20");
	}
}
