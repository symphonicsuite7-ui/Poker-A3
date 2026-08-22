package com.a3.game.user.service;

import com.a3.game.common.ApiException;
import com.a3.game.user.dto.AuthUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/** HS256 JWT。声明里带 userId / username / nickname / avatar。 */
@Service
public class JwtService {

	private final SecretKey key;
	private final long expireSeconds;

	public JwtService(
			@Value("${a3.jwt.secret}") String secret,
			@Value("${a3.jwt.expire-hours:168}") long expireHours) {
		byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
		if (bytes.length < 32) {
			throw new IllegalStateException("a3.jwt.secret 至少 32 字节");
		}
		this.key = Keys.hmacShaKeyFor(bytes);
		this.expireSeconds = expireHours * 3600L;
	}

	public String create(AuthUser user) {
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(String.valueOf(user.getId()))
				.claim("username", user.getUsername())
				.claim("nickname", user.getNickname())
				.claim("avatar", user.getAvatar())
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plusSeconds(expireSeconds)))
				.signWith(key)
				.compact();
	}

	public AuthUser parse(String token) {
		if (token == null || token.isBlank()) {
			throw new ApiException(401, "请先登录");
		}
		String raw = token.startsWith("Bearer ") ? token.substring(7).trim() : token.trim();
		try {
			Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(raw).getPayload();
			AuthUser user = new AuthUser();
			user.setId(Long.parseLong(claims.getSubject()));
			user.setUsername(claims.get("username", String.class));
			user.setNickname(claims.get("nickname", String.class));
			user.setAvatar(claims.get("avatar", String.class));
			return user;
		} catch (JwtException | IllegalArgumentException e) {
			throw new ApiException(401, "登录已失效，请重新登录");
		}
	}

	public AuthUser tryParse(String token) {
		try {
			return parse(token);
		} catch (ApiException e) {
			return null;
		}
	}
}
