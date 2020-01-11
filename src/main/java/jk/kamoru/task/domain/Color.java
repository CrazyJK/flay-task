package jk.kamoru.task.domain;

import org.apache.commons.lang3.RandomUtils;

public enum Color {

	WHITE, YELLOW, RED;

	public static Color getRandom() {
		Color[] values = Color.values();
		return values[RandomUtils.nextInt(0, values.length)];
	}

}
