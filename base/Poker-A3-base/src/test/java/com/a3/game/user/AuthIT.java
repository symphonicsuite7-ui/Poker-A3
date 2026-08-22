package com.a3.game.user;

import com.a3.game.user.entity.SysUser;
import com.a3.game.user.entity.UserCareer;
import com.a3.game.user.mapper.SysUserMapper;
import com.a3.game.user.mapper.UserCareerMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@EnabledIf("com.a3.game.user.RemoteDatabaseIT#reachable")
class AuthIT {

	@Autowired
	private MockMvc mvc;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private SysUserMapper users;

	@Autowired
	private UserCareerMapper careers;

	@Test
	void testUserLoginMeAndRegister() throws Exception {
		mvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"username\":\"test\",\"password\":\"bad\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.ok").value(false));

		MvcResult login = mvc.perform(post("/api/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"username\":\"test\",\"password\":\"123456\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.ok").value(true))
				.andExpect(jsonPath("$.token").isString())
				.andReturn();
		JsonNode loginBody = mapper.readTree(login.getResponse().getContentAsString());
		String token = loginBody.get("token").asText();

		mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/me").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.user.username").value("test"));

		String name = "t" + (System.currentTimeMillis() % 1_000_000_000L);
		Long userId = null;
		try {
			MvcResult registered = mvc.perform(post("/api/register")
							.contentType(MediaType.APPLICATION_JSON)
							.content("{\"username\":\"" + name + "\",\"password\":\"abcd\",\"nickname\":\"局测\"}"))
					.andExpect(status().isOk())
					.andExpect(jsonPath("$.ok").value(true))
					.andExpect(jsonPath("$.user.nickname").value("局测"))
					.andReturn();
			JsonNode created = mapper.readTree(registered.getResponse().getContentAsByteArray());
			assertTrue(created.get("token").asText().length() > 20);
			userId = Long.parseLong(created.get("user").get("id").asText());
		} finally {
			if (userId != null) {
				careers.delete(new LambdaQueryWrapper<UserCareer>().eq(UserCareer::getUserId, userId));
				users.delete(new LambdaQueryWrapper<SysUser>().eq(SysUser::getId, userId));
			}
		}
	}
}
