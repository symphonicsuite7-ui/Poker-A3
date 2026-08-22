package com.a3.game.config;

import com.a3.game.user.service.AvatarService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * 静态资源：现网 public 目录 + 上传头像。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

	private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

	private final AvatarService avatars;
	private final Path webRoot;

	public WebConfig(AvatarService avatars, @Value("${a3.web-root:../../public}") String webRoot) {
		this.avatars = avatars;
		this.webRoot = Path.of(webRoot).toAbsolutePath().normalize();
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		Path upload = avatars.uploadRoot();
		registry.addResourceHandler("/uploads/**").addResourceLocations(toLocation(upload));
		if (Files.isDirectory(webRoot)) {
			log.info("web-root {}", webRoot);
			registry.addResourceHandler("/**").addResourceLocations(toLocation(webRoot)).setCachePeriod(0);
		} else {
			log.warn("web-root missing {}", webRoot);
		}
	}

	private static String toLocation(Path dir) {
		String location = dir.toUri().toString();
		if (!location.endsWith("/")) {
			location = location + "/";
		}
		return location;
	}
}
