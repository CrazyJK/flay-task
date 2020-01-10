package jk.kamoru.task.source;

import java.util.Collection;

import jk.kamoru.task.domain.Task;

public interface TaskSource {

	Task get(Task task);

	Collection<Task> list();

	void save(Task task);

	void delete(Task task);

}
