package jk.kamoru.task.source;

import jk.kamoru.task.config.TaskConfig;
import jk.kamoru.task.domain.Task;

public class TaskNotfoundException extends RuntimeException {

	private static final long serialVersionUID = TaskConfig.SERIAL_VERSION_UID;

	public TaskNotfoundException(Task task) {
		super("task id: " + task.getId());
	}

}
