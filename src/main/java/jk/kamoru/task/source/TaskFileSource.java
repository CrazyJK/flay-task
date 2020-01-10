package jk.kamoru.task.source;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

import jk.kamoru.task.config.TaskConfig;
import jk.kamoru.task.config.TaskProperties;
import jk.kamoru.task.domain.Task;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
public class TaskFileSource implements TaskSource {

	@Autowired TaskProperties taskProperties;

	ObjectMapper jsonReader = new ObjectMapper();
	ObjectWriter jsonWriter = new ObjectMapper().writerWithDefaultPrettyPrinter();

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
		return list.stream().sorted(Comparator.comparing(Task::getId).reversed()).collect(Collectors.toList());
	}

	@Override
	public void save(Task task) {
		try {
			Task found = get(task);
			list.remove(found);
		} catch(TaskNotfoundException ignore) {}
		list.add(task);
		save();
	}

	@Override
	public void delete(Task task) {
		Task found = get(task);
		list.remove(found);
		save();
	}

	File getInfoFile() {
		return new File(taskProperties.getStoragePath(), TaskConfig.TASK_FILENAME);
	}

	@PostConstruct
	void load() {
		File infoFile = getInfoFile();
		try {
			list = jsonReader.readValue(infoFile, new TypeReference<List<Task>>() {});
			log.info(String.format("%5s %-7s - %s", list.size(), FilenameUtils.getBaseName(infoFile.getName()), getInfoFile()));
		} catch (IOException e) {
			throw new IllegalStateException("Fail to load note file " + infoFile, e);
		}
	}

	synchronized void save() {
		try {
			jsonWriter.writeValue(getInfoFile(), list);
		} catch (IOException e) {
			throw new IllegalStateException("Fail to save note file " + getInfoFile(), e);
		}
	}

}
