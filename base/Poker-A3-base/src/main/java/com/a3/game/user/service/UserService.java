package com.a3.game.user.service;

import com.a3.game.common.ApiException;
import com.a3.game.user.dto.AuthUser;
import com.a3.game.user.entity.SysUser;
import com.a3.game.user.entity.UserCareer;
import com.a3.game.user.mapper.SysUserMapper;
import com.a3.game.user.mapper.UserCareerMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 注册 / 登录，规则对齐 Node auth.js。
 */
@Service
@Profile("!test")
public class UserService {

	private static final Pattern USERNAME = Pattern.compile("^[a-zA-Z0-9_\\u4e00-\\u9fa5]{2,16}$");

	private final SysUserMapper users;
	private final UserCareerMapper careers;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AvatarService avatars;

	public UserService(SysUserMapper users, UserCareerMapper careers, PasswordEncoder passwordEncoder,
			JwtService jwtService, AvatarService avatars) {
		this.users = users;
		this.careers = careers;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.avatars = avatars;
	}

	@Transactional
	public Map<String, Object> register(String username, String password, String nickname, String avatar,
			MultipartFile avatarFile) {
		String name = username == null ? "" : username.trim();
		String pass = password == null ? "" : password;
		if (!USERNAME.matcher(name).matches()) {
			throw new ApiException("用户名需 2-16 位（中文/字母/数字/下划线）");
		}
		if (pass.length() < 4 || pass.length() > 32) {
			throw new ApiException("密码需 4-32 位");
		}
		if (users.selectCount(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, name)) > 0) {
			throw new ApiException("用户名已存在");
		}
		String nick = nickname == null || nickname.isBlank() ? name : nickname.trim();
		if (nick.length() > 32) {
			throw new ApiException("昵称过长");
		}
		String avatarUrl;
		if (avatarFile != null && !avatarFile.isEmpty()) {
			avatarUrl = avatars.saveUploaded(avatarFile);
		} else if (avatar != null && !avatar.isBlank()
				&& (avatar.startsWith("/avatars/") || avatar.startsWith("/uploads/"))) {
			avatarUrl = avatars.normalize(avatar);
		} else {
			// 未上传时用用户名（或昵称）首字生成头像
			avatarUrl = avatars.createLetterAvatar(name);
		}

		SysUser user = new SysUser();
		user.setUsername(name);
		user.setPassword(passwordEncoder.encode(pass));
		user.setNickname(nick);
		user.setAvatarUrl(avatarUrl);
		user.setStatus(1);
		users.insert(user);

		UserCareer career = new UserCareer();
		career.setUserId(user.getId());
		career.setTotalGames(0);
		career.setWinGames(0);
		career.setLoseGames(0);
		career.setDrawGames(0);
		career.setTotalScore(0);
		career.setSoloTimes(0);
		career.setSoloWinTimes(0);
		career.setSoloLoseTimes(0);
		career.setEmperorTimes(0);
		career.setDrawTakeTimes(0);
		career.setDrawGiveTimes(0);
		career.setTwoRoundWinTimes(0);
		careers.insert(career);

		return authOk(toAuthUser(user));
	}

	public Map<String, Object> login(String username, String password) {
		String name = username == null ? "" : username.trim();
		String pass = password == null ? "" : password;
		SysUser user = users.selectOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, name));
		if (user == null || user.getPassword() == null || !passwordEncoder.matches(pass, user.getPassword())) {
			throw new ApiException("用户名或密码错误");
		}
		if (user.getStatus() != null && user.getStatus() == 0) {
			throw new ApiException("账号已禁用");
		}
		if (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) {
			user.setAvatarUrl(AvatarService.DEFAULT);
			users.updateById(user);
		}
		return authOk(toAuthUser(user));
	}

	public AuthUser requireActive(Long userId) {
		SysUser user = users.selectById(userId);
		if (user == null || (user.getStatus() != null && user.getStatus() == 0)) {
			throw new ApiException(401, "请先登录");
		}
		return toAuthUser(user);
	}

	public AuthUser findActive(Long userId) {
		if (userId == null) {
			return null;
		}
		SysUser user = users.selectById(userId);
		if (user == null || (user.getStatus() != null && user.getStatus() == 0)) {
			return null;
		}
		return toAuthUser(user);
	}

	public SysUser requireEntity(Long userId) {
		SysUser user = users.selectById(userId);
		if (user == null || (user.getStatus() != null && user.getStatus() == 0)) {
			throw new ApiException(401, "请先登录");
		}
		return user;
	}

	@Transactional
	public Map<String, Object> updateProfile(Long userId, String nickname, String avatar, MultipartFile avatarFile) {
		SysUser user = requireEntity(userId);
		if (nickname != null && !nickname.isBlank()) {
			String nick = nickname.trim();
			if (nick.length() > 32) {
				throw new ApiException("昵称过长");
			}
			user.setNickname(nick);
		}
		if (avatarFile != null && !avatarFile.isEmpty()) {
			user.setAvatarUrl(avatars.saveUploaded(avatarFile));
		} else if (avatar != null && !avatar.isBlank()) {
			user.setAvatarUrl(avatars.normalize(avatar));
		}
		users.updateById(user);
		return authOk(toAuthUser(user));
	}

	public void setBackgroundId(Long userId, Long backgroundId) {
		SysUser user = requireEntity(userId);
		user.setBackgroundId(backgroundId);
		users.updateById(user);
	}

	void repairPasswordIfBroken(String username, String rawPassword) {
		SysUser user = users.selectOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username));
		if (user == null || user.getPassword() == null) {
			return;
		}
		if (user.getPassword().length() >= 60) {
			return;
		}
		user.setPassword(passwordEncoder.encode(rawPassword));
		users.updateById(user);
	}

	public static AuthUser toAuthUser(SysUser user) {
		AuthUser a = new AuthUser();
		a.setId(user.getId());
		a.setUsername(user.getUsername());
		a.setNickname(user.getNickname());
		a.setAvatar(user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()
				? AvatarService.DEFAULT
				: user.getAvatarUrl());
		return a;
	}

	private Map<String, Object> authOk(AuthUser user) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("ok", true);
		body.put("token", jwtService.create(user));
		body.put("user", user.toPublic());
		return body;
	}
}
