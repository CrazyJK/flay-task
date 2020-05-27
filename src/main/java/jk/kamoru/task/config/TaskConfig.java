package jk.kamoru.task.config;

import java.nio.charset.Charset;

import org.apache.commons.io.Charsets;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TaskConfig {

	public static final long SERIAL_VERSION_UID = 0x000000A88;

	public static final Charset CHARSET = Charsets.toCharset("UTF-8");

}
