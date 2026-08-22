package com.a3.game.game.model;

import java.util.ArrayList;
import java.util.List;

public class GamePlayer {

	private int id;
	private String name;
	private List<Card> hand = new ArrayList<>();
	private Integer finishedRank;
	private GoodsMark goodsMark;
	private int goodsCount;
	private int score;

	public GamePlayer copy() {
		GamePlayer p = new GamePlayer();
		p.id = id;
		p.name = name;
		p.hand = Cards.copyList(hand);
		p.finishedRank = finishedRank;
		p.goodsMark = goodsMark;
		p.goodsCount = goodsCount;
		p.score = score;
		return p;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<Card> getHand() {
		return hand;
	}

	public void setHand(List<Card> hand) {
		this.hand = hand;
	}

	public Integer getFinishedRank() {
		return finishedRank;
	}

	public void setFinishedRank(Integer finishedRank) {
		this.finishedRank = finishedRank;
	}

	public GoodsMark getGoodsMark() {
		return goodsMark;
	}

	public void setGoodsMark(GoodsMark goodsMark) {
		this.goodsMark = goodsMark;
	}

	public int getGoodsCount() {
		return goodsCount;
	}

	public void setGoodsCount(int goodsCount) {
		this.goodsCount = goodsCount;
	}

	public int getScore() {
		return score;
	}

	public void setScore(int score) {
		this.score = score;
	}
}
