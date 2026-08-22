package com.a3.game.common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** 把 / 转到现网首页。 */
@Controller
public class HomeController {

	@GetMapping("/")
	public String index() {
		return "forward:/index.html";
	}
}
