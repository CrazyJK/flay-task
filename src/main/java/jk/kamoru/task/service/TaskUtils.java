package jk.kamoru.task.service;

import java.util.Calendar;
import java.util.Date;
import java.util.Objects;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.context.SecurityContextHolder;

import jk.kamoru.task.domain.Color;
import jk.kamoru.task.domain.Status;
import jk.kamoru.task.domain.Task;

public class TaskUtils {

	/**
	 * new Task instance
	 * @return
	 */
	public static Task getInstance() {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		Task task = new Task();
		task.setId(System.currentTimeMillis());
		task.setCreator(username);
		task.setOwner(username);
		task.setWorker(username);
		task.setCreated(new Date());
		task.setStartd(new Date());
		task.setModified(new Date());
		task.setStatus(Status.I);
		task.setColor(Color.WHITE);
		task.setWindowMinimized(false);
		return task;
	}

	/**
	 * task 내용이 같은지
	 * @param task1
	 * @param task2
	 * @return
	 */
	public static boolean equalsData(Task task1, Task task2) {
		return StringUtils.equals(task1.getCategory(), task2.getCategory())
				&& StringUtils.equals(task1.getTitle(), task2.getTitle())
				&& StringUtils.equals(task1.getContent(), task2.getContent())
				&& StringUtils.equals(task1.getCreator(), task2.getCreator())
				&& StringUtils.equals(task1.getOwner(), task2.getOwner())
				&& StringUtils.equals(task1.getWorker(), task2.getWorker())
				&& Objects.deepEquals(task1.getCoworker(), task2.getCoworker())
				&& StringUtils.equals(task1.getDelegator(), task2.getDelegator())
				&& task1.getStatus() == task2.getStatus();
	}

	/**
	 * 상태 결정
	 * <pre>
	 * 종료(T, C)가 아닌 상태에서
	 * I: created < {today} < startd     < [deadline]
	 * R: created < startd  < {today}    < [deadline]
	 * O: created < startd  < [deadline] < {today}
	 * </pre>
	 * @param task
	 * @return
	 */
	public static Status takeStaus(Task task) {
		if (Status.equalsAny(task.getStatus(), Status.I, Status.R, Status.O)) {
			Date today = Calendar.getInstance().getTime();
			if (task.getCreated().before(today) && today.before(task.getStartd())) {
				return Status.I;
			} else if (task.getStartd().before(today) && (task.getDeadline() == null || today.before(task.getDeadline()))) {
				return Status.R;
			} else if (task.getDeadline() == null || task.getDeadline().before(today)) {
				return Status.O;
			}
		} else {
			return task.getStatus();
		}
		throw new IllegalStateException("can not determine status " + task);
	}

	/**
	 * 이제 막 종료됬는지
	 * @param task
	 * @param pastTask
	 * @return
	 */
	public static boolean isClosedNow(Task task, Task pastTask) {
		if (Status.equalsAny(task.getStatus(), Status.T, Status.C)) {
			if (Status.equalsAny(pastTask.getStatus(), Status.I, Status.R, Status.O, Status.P)) {
				return true;
			}
		}
		return false;
	}

	public static boolean isOpen(Task task, Task pastTask) {
		if (Status.equalsAny(task.getStatus(), Status.I, Status.R, Status.O, Status.P)) {
			return true;
		}
		return false;
	}

	/**
	 * 이 task에 포함된 사람인지
	 * @param task
	 * @param username
	 * @return
	 */
	public static boolean containsUser(Task task, String username) {
		return StringUtils.equals(username, task.getCreator())
				|| StringUtils.equals(username, task.getOwner())
				|| StringUtils.equals(username, task.getWorker())
				|| StringUtils.equalsAny(username, task.getCoworker())
				|| StringUtils.equals(username, task.getDelegator());
	}

	/**
	 * 검색. id, title, content, 사용자
	 * @param task
	 * @param searchTask
	 * @return
	 */
	public static boolean search(Task task, Task searchTask) {
		boolean result = false;
		if (searchTask.getId() > 0)
			result = result | searchTask.getId() == task.getId();
		if (StringUtils.isNotBlank(searchTask.getTitle()))
			result = result | StringUtils.containsIgnoreCase(task.getTitle(), searchTask.getTitle());
		if (StringUtils.isNotBlank(searchTask.getContent()))
			result = result | StringUtils.containsIgnoreCase(task.getContent(), searchTask.getContent());
		if (searchTask.getStatus() != null)
			result = result | (task.getStatus() == searchTask.getStatus());

		if (StringUtils.isNotBlank(searchTask.getCreator()))
			result = result | StringUtils.containsIgnoreCase(task.getCreator(), searchTask.getCreator());
		if (StringUtils.isNotBlank(searchTask.getOwner()))
			result = result | StringUtils.containsIgnoreCase(task.getOwner(), searchTask.getOwner());
		if (StringUtils.isNotBlank(searchTask.getWorker()))
			result = result | StringUtils.containsIgnoreCase(task.getWorker(), searchTask.getWorker());
		if (StringUtils.isNotBlank(searchTask.getCoworker()))
			result = result | StringUtils.containsIgnoreCase(task.getCoworker(), searchTask.getCoworker());
		if (StringUtils.isNotBlank(searchTask.getDelegator()))
			result = result | StringUtils.containsIgnoreCase(task.getDelegator(), searchTask.getDelegator());

		return result;
	}

	public static boolean containsAny(String[] coworker, String[] searchCoworker) {
		if (ArrayUtils.isEmpty(coworker)) {
			return false;
		} else {
			boolean result = false;
			for (String person : coworker) {
				result = result | StringUtils.equalsAny(person, searchCoworker);
			}
			return result;
		}
	}
}
