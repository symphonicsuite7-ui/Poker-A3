package com.a3.game.config;

import com.a3.game.user.dto.AuthUser;
import com.a3.game.user.service.JwtService;
import com.a3.game.user.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/** 从 Authorization: Bearer 解析 JWT，写入 SecurityContext。 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final ObjectProvider<UserService> users;

	public JwtAuthFilter(JwtService jwtService, ObjectProvider<UserService> users) {
		this.jwtService = jwtService;
		this.users = users;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (SecurityContextHolder.getContext().getAuthentication() == null) {
			AuthUser parsed = jwtService.tryParse(request.getHeader("Authorization"));
			if (parsed != null) {
				UserService service = users.getIfAvailable();
				AuthUser user = service == null ? parsed : service.findActive(parsed.getId());
				if (user != null) {
					UsernamePasswordAuthenticationToken auth =
							new UsernamePasswordAuthenticationToken(user, null, List.of());
					auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(auth);
				}
			}
		}
		filterChain.doFilter(request, response);
	}
}
