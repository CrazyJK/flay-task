package jk.kamoru.task.config;

import java.io.File;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "task")
public class TaskProperties {

	String taskFileName;

	File taskFilePath;
}
