/**
 * 
 */

var taskColors = ['yellow', 'red'], isListAll = false;
var statusMap, colorList;

restCall("/info/task/statusMap", {async: false}, function(map) {
	statusMap = map;
});

restCall("/info/task/color", {async: false}, function(list) {
	colorList = list;
});

function Task(data) {
	const WIDTH = 36, HEIGHT = 26;
	var self = this;
	
	var taskData = {};
	self.wrapName = "taskWrapper";

	// make data
	if (data) {
		taskData = data;
		taskData.position = {
				left: Math.max(0, Math.min(data.position.left, $(window).width() - WIDTH * 16)),
				top: Math.max(0, Math.min(data.position.top,  $(window).height() - HEIGHT * 16))
		}
		console.log("load Task", taskData);
	} else {
		restCall('/info/task/new', {async: false}, function(newTask) {
			const DEFAULTS = {
					category: '',
					title: '',
					content: '',
					position: {
						left: Math.floor(Math.random() * ($(window).width() - WIDTH * 16)),
						top: Math.floor(Math.random() * ($(window).height() - HEIGHT * 16))
					},
					size: {
						width: WIDTH + 'rem',
						height: HEIGHT + 'rem'
					}
			};
			taskData = $.extend({}, newTask, DEFAULTS);
			console.log("new Task", taskData);
		});
	}
	
	// make ui
	self.$task = $(
			  '<div class="task" id="task-' + taskData.id + '">'
			+ '  <div class="task-control">'
			+ '    <a href="#" class="task-save-btn mx-4"><i class="fa fa-check"></i></a>'
			+ '    <a href="#" class="task-minimize-btn"><i class="fa fa-window-minimize"></i></a>'
			+ '    <a href="#" class="task-restore-btn hide"><i class="fa fa-window-restore"></i></a>'
			+ '    <a href="#" class="task-hide-btn"><i class="fa fa-window-close"></i></a>'
			+ '  </div>'
			+ '  <div class="task-header">'
			+ '    <h5>Task-' + taskData.id + '</h5>'
			+ '  </div>'
			+ '  <div class="task-category">'
			+ '    <input name="category" class="input-category" placeholder="Task category">'
			+ '  </div>'
			+ '  <div class="task-title">'
			+ '    <input name="title" class="input-title" placeholder="Task title">'
			+ '  </div>'
			+ '  <div class="task-body">'
			+ '    <textarea name="content" class="input-content" placeholder="Task content"></textarea>'
			+ '  </div>'
			+ '  <div class="task-person d-flex justify-content-between">'
			+ '    <input name="worker"    class="input-worker" placeholder="Worker">'
			+ '    <input name="coworker"  class="input-coworker" placeholder="Coworker">'
			+ '    <input name="delegator" class="input-delegator flex-grow-1" placeholder="Delegator">'
			+ '  </div>'
			+ '  <div class="task-schedule d-flex justify-content-between small">'
			+ '    <input type="date" name="created"  class="input-created"  placeholder="Create date">'
			+ '    <input type="date" name="startd"   class="input-startd"   placeholder="Start date">'
			+ '    <input type="date" name="deadline" class="input-deadline" placeholder="Deadline">'
			+ '  </div>'
			+ '  <div class="task-tail small">'
			+ '    <label><input type="radio" name="status" value="R">Resume</label>'
			+ '    <label><input type="radio" name="status" value="P">Pause</label>'
			+ '    <label><input type="radio" name="status" value="T">Terminate</label>'
			+ '    <label><input type="radio" name="status" value="C">Complete</label>'
			+ '    <label class="task-time"></label>'
			+ '  </div>'
			+ '  <div style="display: none;">'
			+ '    <input name="id" value="' + taskData.id + '">'
			+ '    <input name="completed" class="input-completed">'
			+ '  </div>'
			+ '</div>').attr("id", "task_" + taskData.id).addClass(taskData.color).css({
				left: taskData.position.left,
				top:  taskData.position.top,
				width: taskData.size.width,
				height: taskData.size.height
			});

	// set data
	self.$task.find(".input-category").val(taskData.category);
	self.$task.find(".input-title").val(taskData.title);
	self.$task.find(".input-content").val(taskData.content);
	self.$task.find(".input-worker").val(taskData.worker);
	self.$task.find(".input-coworker").val(taskData.coworker);
	self.$task.find(".input-delegator").val(taskData.delegator);
	self.$task.find(".input-created").val(formatDate(taskData.created));
	self.$task.find(".input-startd").val(formatDate(taskData.startd));
	self.$task.find(".input-deadline").val(formatDate(taskData.deadline));
	self.$task.find(".input-completed").val(formatDate(taskData.completed));
	self.$task.find(".task-time").html(formatDate(taskData.modified));
	self.$task.find("input:radio[name='status'][value='" + ("IRO".indexOf(taskData.status) > -1 ? "R" : taskData.status) + "']").prop("checked", true);
	
	self.$task.on("blur", function(e) {
		console.log("task blur", e);
	});
	
	// task event
	self.$task.find(".task-minimize-btn").on("click", function() {
		$(this).parent().children().toggle();
		self.$task.addClass("task-minimize");
		self.$task.resizable("disable");
		taskData.windowMinimized = true;
//		self.saveTask('ui');
	});
	self.$task.find(".task-restore-btn").on("click", function() {
		$(this).parent().children().toggle();
		self.$task.removeClass("task-minimize");
		self.$task.resizable("enable");
		taskData.windowMinimized = false;
//		self.saveTask('ui');
	});
	self.$task.find(".task-hide-btn").on("click", function() {
		self.$task.remove();
		$("#tr_" + taskData.id).removeClass("table-active");
	});
	/*
	self.$task.find("input, textarea").on("blur", function() {
		self.saveTask('', getList);
	}).on("keyup", function(e) {
		e.stopPropagation();
	});
	 */
	self.$task.find("input, textarea").on("blur", function() {
		self.$task.toggleClass("change", self.isContentChange());
	});
	self.$task.find("input, textarea").on("keyup", function(e) {
		e.stopPropagation();
	});
	self.$task.find(".task-save-btn").on("click", function() {
		if (self.isContentChange()) {
			self.saveTask('', getList);
		}
	});

	// jquery-ui effect callback
	self.draggableCallback = function(event, ui) {
		taskData.position = ui.position;
//		self.saveTask('ui');
	};
	self.resizableCallback = function(event, ui) {
		taskData.size = ui.size;
//		self.saveTask('ui');
	};

	// jquery-ui effect
	self.$task.draggable({
		stop: self.draggableCallback
	});
	self.$task.resizable({
		stop: self.resizableCallback,
		disabled: taskData.windowMinimized
	});

	self.isContentChange = function() {
		var category  = self.$task.find(".input-category").val();
		var title     = self.$task.find(".input-title").val();
		var content   = self.$task.find(".input-content").val();
		var worker    = self.$task.find(".input-worker").val();
		var coworker  = self.$task.find(".input-coworker").val();
		var delegator = self.$task.find(".input-delegator").val();
		var created   = self.$task.find(".input-created").val();
		var startd    = self.$task.find(".input-startd").val();
		var deadline  = self.$task.find(".input-deadline").val();
		var completed = self.$task.find(".input-completed").val();
		var status    = self.$task.find('input:radio[name="status"]:checked').val();
		
		var isEqualDate = function(date1, date2) {
			if ((date1 == null || date1 === '') && (date2 == null || date2 === '')) {
				return true;
			} else if (date2 !== null && date2 !== '') {
				return date2.indexOf(date1) === 0;
			} else {
				return false;
			}
		}
		
		return (category  !== '' && category  !== taskData.category)
			|| (title     !== '' && title     !== taskData.title)
			|| (content   !== '' && content   !== taskData.content)
			|| (worker    !== '' && worker    !== taskData.worker)
			|| (coworker  !== '' && coworker  !== taskData.coworker)
			|| (delegator !== '' && delegator !== taskData.delegator)
			|| (created   !== '' && !isEqualDate(created,  taskData.created))
			|| (startd    !== '' && !isEqualDate(startd,   taskData.startd))
			|| (deadline  !== '' && !isEqualDate(deadline, taskData.deadline))
			|| (status    !== '' && status    !== taskData.status);
	}
	
	// save & delete
	self.saveTask = function(mode, callback) {
		var category  = self.$task.find(".input-category").val();
		var title     = self.$task.find(".input-title").val();
		var content   = self.$task.find(".input-content").val();
		var worker    = self.$task.find(".input-worker").val();
		var coworker  = self.$task.find(".input-coworker").val();
		var delegator = self.$task.find(".input-delegator").val();
		var status    = self.$task.find('input:radio[name="status"]:checked').val();
		var created   = self.$task.find(".input-created").val();
		var startd    = self.$task.find(".input-startd").val();
		var deadline  = self.$task.find(".input-deadline").val();
		var completed = self.$task.find(".input-completed").val();

		if ($.trim(title) === '') {
			return;
		} else if (mode === 'ui' || self.isContentChange()) {
			taskData.category  = category;
			taskData.title     = title;
			taskData.content   = content;
			taskData.worker    = worker;
			taskData.coworker  = coworker;
			taskData.delegator = delegator;
			taskData.status    = status;
			taskData.created   = created;
//			taskData.modified  = new Date().getTime();
			taskData.startd    = startd;
			taskData.deadline  = deadline;
			taskData.completed = completed;

			restCall('/info/task', {data: taskData, method: "PUT"}, callback);
			console.log('save task', taskData);
		}
	}
	self.deleteTask = function(callback) {
		restCall('/info/task', {data: taskData, method: "DELETE"}, callback);
		console.log('delete task', taskData);
	}
	
	if (taskData.windowMinimized) {
		self.$task.addClass("task-minimize");
		self.$task.find(".task-control").children().toggleClass("hide");
	}

}

Task.prototype.show = function() {
	var self = this;
	
	if ($("#" + self.wrapName).length === 0) {
		$("<div>", {id: self.wrapName}).appendTo($("body"));
	}
	self.$task.appendTo($("#" + self.wrapName));
	
	console.log("task show");
};

function getList() {
	var keyword = $(".search-input").val();
	if (keyword !== '') {
		console.log('search keyword', keyword);
		var task = {
				title: keyword,
				content: keyword
		};
		restCall('/info/task/find', {data: task, method: "PATCH", headers: {"admin": isListAll}}, showList);
	} else {
		restCall('/info/task/list', {headers: {"admin": isListAll}}, showList);
	}
}

function showList(list) {
	console.log('list', list.length);
	
	$(".task.change").removeClass("change");

	$("#taskList, #taskListCompleted").empty();
	list.forEach(function(task, idx) {
		$("#taskList" + (task.status === 'T' || task.status === 'C' ? "Completed" : "")).append(
				$("<tr>", {id: "tr_" + task.id}).append(
						$("<td>", {class: "col-task-no"}).html(idx+1),
						$("<td>", {class: "col-task-id"}).html(task.id),
						$("<td>", {class: "col-task-category"}).html(task.category),
						$("<td>", {class: "col-task-title"}).html(task.title).on("click", function() {
							if ($("#task_" + task.id).length === 0) {
								$(this).parent().addClass("table-active");
								new Task(task).show();
							}
						}),
						$("<td>", {class: "col-task-content"}).html(task.content),
						
						$("<td>", {class: "col-task-creator"}).html(task.creator),
						$("<td>", {class: "col-task-owner"}).html(task.owner),
						$("<td>", {class: "col-task-worker"}).html(task.worker),
						$("<td>", {class: "col-task-coworker"}).html(task.coworker),
						$("<td>", {class: "col-task-delegator"}).html(task.delegator),
						$("<td>", {class: "col-task-status"}).html(eval('statusMap.' + task.status)),

						/* $("<td>", {class: "col-task-"}).append( // status
								$("<select>", {class: "w-auto border-0 bg-light bg-transparent"}).append(
										$("<option>", {value: "unset"}).text("unset"),
										(function() {
											var options = [];
											$.each(statusMap, function(key, value) {
												options.push($("<option>", {selected: key === task.status, value: key}).text(value));
											});
											return options;
										}())
								).on("change", function() {
									task.status = $(this).val();
									restCall('/info/task', {data: task, method: "PUT"}, function() {
										console.log('update task status');
									});
								})
						), */
						
						$("<td>", {class: "col-task-created"}).html(formatDate(task.created)),
						$("<td>", {class: "col-task-startd"}).html(formatDate(task.startd)),
						$("<td>", {class: "col-task-deadline"}).html(formatDate(task.deadline)),
						$("<td>", {class: "col-task-completed"}).html(formatDate(task.completed)),
						$("<td>", {class: "col-task-modified"}).html(formatDate(task.modified)),

						$("<td>", {class: "col-task-position"}).html("L: " + task.position.left + " T: " + task.position.top),
						$("<td>", {class: "col-task-size"}).html("W: " + task.size.width + " H: " + task.size.height),
						$("<td>", {class: "col-task-color"}).append( // color
								$("<select>", {class: "w-auto border-0 bg-light bg-transparent"}).append(
										$("<option>", {value: "unset"}).text("unset"),
										(function() {
											var options = [];
											colorList.forEach(function(color) {
												options.push($("<option>", {selected: color === task.color, value: color}).text(color));
											});
											return options;
										}())
								).on("change", function() {
									task.color = $(this).val();
									restCall('/info/task', {data: task, method: "PUT"}, function() {
										console.log('update task color');
									});
								})
						),
						$("<td>", {class: "col-task-minimized"}).append( // windowMinimized
								$("<div>", {class: 'custom-control custom-switch'}).append(
										$("<input>", {type: 'checkbox', class: 'custom-control-input', id: 'task-' + task.id + '-mini', checked: task.windowMinimized}).on("change", function() {
											var val = $(this).prop("checked");
											task.windowMinimized = val;
											$(this).next().html(val ? 'mini' : 'max');
											restCall('/info/task', {data: task, method: "PUT"}, function() {
												console.log('update task windowMinimized');
											});
										}),
										$("<label>", {class: 'custom-control-label', for: 'task-' + task.id + '-mini'}).html(task.windowMinimized ? 'mini' : 'max')
								)
						),
						$("<td>", {class: "col-task-action"}).append( // action
								$("<button>", {class: 'bg-transparent border-0 text-danger'}).on("click", function() {
									if (confirm('sure?')) {
										var $thisNote = $(this).parent().parent();
										restCall('/info/task', {data: task, method: "DELETE"}, function() {
											console.log('delete task', $thisNote);
											$thisNote.remove();
										});
									}
								}).append(
										$("<i>", {class: "fa fa-trash-o mr-1"})
								),
						)
				)
		);
	});
}

function addEventListener() {
	$("#switchTitleInline").on("change", function() {
		var checked = $(this).prop("checked")
		console.log(checked);
		$("tbody > tr > td:nth-child(5)").each(function() {
			if (checked) {
				$(this).html($(this).html().replace(/<br>/g, '\n')).css("max-width", 600);
			} else {
				$(this).html($(this).html().replace(/\n/g, '<br>')).css("max-width", "none");
			}
		});
	});

	$("#listAll").on("change", function() {
		isListAll = $("#listAll").prop("checked");
	});

	$(".search-input").on("keyup", function(e) {
		if (e.keyCode === 13) {
			getList();
		}
	});
	$(".search-btn").on("click", getList).click();
	
	$(".new-task-btn").on("click", function() {
		new Task().show();
	});
}

function formatDate(time) {
	//console.log('formatDate', time, typeof time);
	if (time) {
		if (typeof time === 'string' && time !== '') {
			time = new Date(time);
		} else {
			return "";
		}
	} else {
		return "";
	}
	return $.datepicker.formatDate("yy-mm-dd", time);
}

$(document).ready(function() {
	addEventListener();
	$("#switchMode").on("change", function() {
		$("body").toggleClass("dark-mode", $(this).prop("checked"));
	});
});

