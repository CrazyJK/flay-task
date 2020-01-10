package jk.kamoru.task.rest;

import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jk.kamoru.task.domain.Task;
import jk.kamoru.task.service.TaskService;

@RestController
@RequestMapping("/info/task")
public class TaskController {

	@Autowired TaskService taskService;

	@GetMapping("/{id}")
	public Task get(@PathVariable long id) {
		return taskService.get(id);
	}

	@GetMapping("/list")
	public Collection<Task> list(@RequestHeader(name = "admin", required = false, defaultValue = "false") boolean admin) {
		return taskService.list(admin);
	}

	@PatchMapping("/find")
	public Collection<Task> find(@RequestBody Task task, @RequestHeader(name = "admin", required = false, defaultValue = "false") boolean admin) {
		return taskService.find(task, admin);
	}

	@PutMapping
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void persist(@RequestBody Task task) {
		taskService.persist(task);
	}

	@DeleteMapping
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@RequestBody Task task) {
		taskService.delete(task);
	}

}
