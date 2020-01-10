package jk.kamoru.task.domain;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Task {

	long id;
	String author;
	String title;
	String content;
	Position position;
	Size size;
	boolean windowMinimized;
	Status status;
	Date created;
	Date modified;
	Date closed;
	String color;

	@Data
	public static class Position {
		int left;
		int top;
	}

	@Data
	public static class Size {
		String width;
		String height;
	}

	public static enum Status {
		N, D;
	}

}
