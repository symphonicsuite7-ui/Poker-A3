package com.a3.game.game.model;

public class DrawParty {

	private int seat;
	private int amount;

	public DrawParty() {
	}

	public DrawParty(int seat, int amount) {
		this.seat = seat;
		this.amount = amount;
	}

	public DrawParty copy() {
		return new DrawParty(seat, amount);
	}

	public int getSeat() {
		return seat;
	}

	public void setSeat(int seat) {
		this.seat = seat;
	}

	public int getAmount() {
		return amount;
	}

	public void setAmount(int amount) {
		this.amount = amount;
	}
}
