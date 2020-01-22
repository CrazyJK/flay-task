package jk.kamoru.task.service;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jk.kamoru.task.domain.Task;
import jk.kamoru.task.source.TaskNotfoundException;
import jk.kamoru.task.source.TaskSource;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TaskServiceImpl implements TaskService {

	@Autowired TaskSource taskSource;

	@Override
	public Task get(long id) {
		log.debug("get by id: {}", id);
		Task task = new Task();
		task.setId(id);
		return taskSource.get(task);
	}

	@Override
	public Collection<Task> list(boolean admin) {
		log.debug("list by admin:{}", admin);
		if (admin) {
			return taskSource.list();
		} else {
			String username = getUsername();
			return taskSource.list().stream().filter(task -> TaskUtils.containsUser(task, username)).collect(Collectors.toList());
		}
	}

	@Override
	public Collection<Task> find(Task searchTask, boolean admin) {
		log.debug("find by id:{} title:{}, content:{}, admin:{}", searchTask.getId(), searchTask.getTitle(), searchTask.getContent(), admin);
		return list(admin).stream().filter(task -> TaskUtils.search(task, searchTask)).collect(Collectors.toList());
	}

	@Override
	public void persist(Task task) {
		log.debug("persist in  {}", task);
		task.setStatus(TaskUtils.takeStaus(task));
		try {
			Task found = taskSource.get(task);
			if (!TaskUtils.equalsData(task, found)) {
				task.setModified(new Date());
			}
			if (TaskUtils.isClosedNow(task, found)) {
				task.setCompleted(new Date());
			} else if (TaskUtils.isOpen(task, found)) {
				task.setCompleted(null);
			}
		} catch (TaskNotfoundException ignore) {}
		taskSource.save(task);
		log.debug("persist out {}", task);
	}

	@Override
	public void delete(Task task) {
		log.debug("delete {}", task);
		taskSource.delete(task);
	}

	@Override
	public List<String> categories(boolean admin) {
		log.debug("categories by admin:{}", admin);
		return list(admin).stream().map(Task::getCategory).collect(Collectors.toList());
	}

	private String getUsername() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication.getName();
	}

}
