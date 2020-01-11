package jk.kamoru.task.domain;

import java.util.LinkedHashMap;
import java.util.Map;

public enum Status {

	I("Initiated"), R("Running"), O("Overdue"), T("Terminated"), C("Completed");

	private String statusName;

	private Status(String statusName) {
		this.statusName = statusName;
	}

	public String getStatusName() {
		return statusName;
	}

	public static Map<Status, String> valuesMap() {
		Map<Status, String> map = new LinkedHashMap<>();
		for (Status status : values()) {
			map.put(status, status.getStatusName());
		}
		return map;
	}

	public static boolean equalsAny(Status status, Status...compareSstatus) {
		for (Status s : compareSstatus) {
			if (s == status) {
				return true;
			}
		}
		return false;
	}

}
