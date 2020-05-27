package jk.kamoru.task.source;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

import jk.kamoru.task.config.TaskProperties;
import jk.kamoru.task.domain.Task;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
public class TaskFileSource implements TaskSource {

	@Autowired TaskProperties taskProperties;

	ObjectMapper jsonReader = new ObjectMapper();
	ObjectWriter jsonWriter = new ObjectMapper().writerWithDefaultPrettyPrinter();

	File taskFile;
	List<Task> list;

	@Override
	public Task get(Task task) {
		for (Task t : list) {
			if (t.getId() == task.getId()) {
				return t;
			}
		}
		throw new TaskNotfoundException(task);
	}

	@Override
	public Collection<Task> list() {
		return list.stream().sorted(Comparator.comparing(Task::getStartd).reversed()).collect(Collectors.toList());
	}

	@Override
	public void save(Task task) {
		if (list.contains(task)) {
			list.remove(task);
		}
		list.add(task);
		save();
	}

	@Override
	public void delete(Task task) {
		list.remove(task);
		save();
	}

	private File getTaskFile() throws URISyntaxException, IOException {
		if (taskProperties.getTaskFilePath() == null) {
			URL taskResource = Thread.currentThread().getContextClassLoader().getResource(taskProperties.getTaskFileName());
			if (taskResource == null) {
				throw new IOException("Task file not found in classpath");
			}
			return new File(taskResource.toURI());
		} else {
			File taskFile = new File(taskProperties.getTaskFilePath(), taskProperties.getTaskFileName());
			if (!taskFile.exists()) {
				throw new IOException("Task file not found -> " + taskFile.getCanonicalPath());
			}
			return taskFile;
		}
	}

	@PostConstruct
	void load() {
		try {
			// set data file
			taskFile = getTaskFile();
			// read data tp json
			list = jsonReader.readValue(taskFile, new TypeReference<List<Task>>() {});
			log.info("{} task loaded in {}", list.size(), taskFile.getCanonicalPath());
		} catch (IOException | URISyntaxException e) {
			throw new IllegalStateException("Fail to load task data", e);
		}
	}

	synchronized void save() {
		try {
			jsonWriter.writeValue(taskFile, list);
		} catch (IOException e) {
			throw new IllegalStateException("Fail to save task data", e);
		}
	}

}
