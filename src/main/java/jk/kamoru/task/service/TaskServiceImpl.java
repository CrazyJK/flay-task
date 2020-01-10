package jk.kamoru.task.service;

import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jk.kamoru.task.domain.Task;
import jk.kamoru.task.source.TaskSource;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TaskServiceImpl implements TaskService {

	@Autowired TaskSource taskSource;

	@Override
	public Task get(long id) {
		Task task = new Task();
		task.setId(id);
		return taskSource.get(task);
	}

	@Override
	public Collection<Task> list(boolean admin) {
		if (admin) {
			return taskSource.list();
		} else {
			return taskSource.list().stream().filter(n -> {
				return StringUtils.equals(n.getAuthor(), getUsername());
			}).collect(Collectors.toList());
		}
	}

	@Override
	public Collection<Task> find(Task task, boolean admin) {
		log.info("find by id:{} title:{}, content:{}, admin:{}", task.getId(), task.getTitle(), task.getContent(), admin);
		return list(admin).stream().filter(n -> {
			boolean result = false;
			if (task.getId() > 0)
				result = result | task.getId() == n.getId();
			if (StringUtils.isNotBlank(task.getTitle()))
				result = result | StringUtils.containsIgnoreCase(n.getTitle(), task.getTitle());
			if (StringUtils.isNotBlank(task.getContent()))
				result = result | StringUtils.containsIgnoreCase(n.getContent(), task.getContent());
			if (task.getStatus() != null)
				result = result & n.getStatus() == task.getStatus();

			return result;
		}).collect(Collectors.toList());
	}

	@Override
	public void persist(Task task) {
		if (task.getAuthor() == null) {
			task.setAuthor(getUsername());
		}
		if (task.getCreated() == null) {
			task.setCreated(new Date());
		}
		if (task.getStatus() == null) {
			task.setStatus(Task.Status.N);
		}
		if (task.getStatus() == Task.Status.D) {
			if (task.getClosed() == null)
				task.setClosed(new Date());
		} else if (task.getStatus() == Task.Status.N) {
			if (task.getClosed() != null)
				task.setClosed(null);
		} else {
			throw new IllegalStateException("task status illegal stataus " + task);
		}
		taskSource.save(task);
	}

	@Override
	public void delete(Task task) {
		taskSource.delete(task);
	}

	String getUsername() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication.getName();
	}

}
