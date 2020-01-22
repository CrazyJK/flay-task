package jk.kamoru.task.domain;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Task {

	/** ID 생성시 milliseconds */
	long id;
	/** task 주제 */
	String category;
	/** task 요약 */
	String title;
	/** task 상세내용 */
	String content;
	/** task 생성자 */
	String creator;
	/** task 책임자 */
	String owner;
	/** task 처리자 */
	String worker;
	/** task 공동 처리자 */
	String coworker;
	/** 위임자 */
	String delegator;
	/** 상태 */
	Status status;
	/** task 생성일 */
	Date created;
	/** 내용 수정일 */
	Date modified;
	/** task 시작일 */
	Date startd;
	/** task 마감일 */
	Date deadline;
	/** task 종료일 */
	Date completed;

	boolean windowMinimized;
	Position position;
	Size size;
	Color color;

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Task other = (Task) obj;
		if (id != other.id)
			return false;
		return true;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (id ^ (id >>> 32));
		return result;
	}

}
