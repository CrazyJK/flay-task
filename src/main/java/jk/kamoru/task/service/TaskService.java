package jk.kamoru.task.service;

import java.util.Collection;
import java.util.List;

import jk.kamoru.task.domain.Task;

public interface TaskService {

	Task get(long id);

	Collection<Task> list(boolean admin);

	Collection<Task> find(Task task, boolean admin);

	void persist(Task task);

	void delete(Task task);

	List<String> categories(boolean admin);

}
