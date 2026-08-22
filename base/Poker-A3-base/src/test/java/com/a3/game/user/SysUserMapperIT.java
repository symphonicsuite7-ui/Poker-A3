package com.a3.game.user;

import com.a3.game.resource.entity.GameResource;
import com.a3.game.resource.mapper.GameResourceMapper;
import com.a3.game.user.entity.SysUser;
import com.a3.game.user.entity.UserCareer;
import com.a3.game.user.mapper.SysUserMapper;
import com.a3.game.user.mapper.UserCareerMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/** 用 MyBatis-Plus 读现网库，核对实体字段映射。库不可达则跳过。 */
@SpringBootTest
@EnabledIf("com.a3.game.user.RemoteDatabaseIT#reachable")
class SysUserMapperIT {

	@Autowired
	private SysUserMapper sysUserMapper;

	@Autowired
	private UserCareerMapper userCareerMapper;

	@Autowired
	private GameResourceMapper resourceMapper;

	@Test
	void seedRowsMapToEntities() {
		SysUser user = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, "test"));
		assertNotNull(user);
		assertEquals("A3玩家", user.getNickname());
		assertEquals(1, user.getStatus());

		UserCareer career = userCareerMapper
				.selectOne(new LambdaQueryWrapper<UserCareer>().eq(UserCareer::getUserId, user.getId()));
		assertNotNull(career);
		assertEquals(0, career.getTotalGames());

		GameResource bg = resourceMapper
				.selectOne(new LambdaQueryWrapper<GameResource>().eq(GameResource::getFileKey, "default_background.jpg"));
		assertNotNull(bg);
		assertEquals("BACKGROUND", bg.getType());
		assertEquals("默认背景", bg.getName());
	}
}
