/**
 * 
 */

var taskColors = ['yellow', 'red'], isListAll = false;

$(document).ready(function() {
	addEventListener();
});

function Task(data) {
	var self = this;
	
	var DEFAULTS = {
			id: new Date().getTime(),
			title: $.datepicker.formatDate("yy/mm/dd", new Date()),
			content: '',
			position: {
				left: Math.floor(Math.random() * ($(window).width() - 16 * 26)),
				top: Math.floor(Math.random() * ($(window).height() - 16 * 10))
			},
			size: {
				width: '26rem',
				height: '10rem'
			},
			created: new Date(),
			modified: new Date(),
			closed: null,
			windowMinimized: false,
			status: 'N',
			color: taskColors[Math.floor(Math.random() * 2)]
	};
	this.data = $.extend({}, DEFAULTS, data);

	this.$task = 
			$('<div class="task">'
			+ '  <div class="task-control">'
			+ '    <a href="#" class="task-minimize-btn"><i class="fa fa-window-minimize"></i></a>'
			+ '    <a href="#" class="task-restore-btn"><i class="fa fa-window-restore"></i></a>'
			+ '    <a href="#" class="task-delete-btn"><i class="fa fa-window-close"></i></a>'
			+ '  </div>'
			+ '  <div class="task-header">'
			+ '    <h5 class="task-title">' + this.data.title + '</h5>'
			+ '  </div>'
			+ '  <div class="task-body">'
			+ '    <textarea class="task-pad" placeholder="Memo content">' + this.data.content + '</textarea>'
			+ '  </div>'
			+ '  <div class="task-tail">'
			+ '    <label class="task-time">' + $.datepicker.formatDate("yy/mm/dd", new Date(this.data.modified)) + '</label>'
			+ '  </div>'
			+ '</div>').css({
				left: Math.min(this.data.position.left, $(window).width() - 16 * 16),
				top: Math.min(this.data.position.top, $(window).height() - 10 * 16),
				width: this.data.size.width,
				height: this.data.size.height
			}).addClass(this.data.color);

	this.$task.find(".task-minimize-btn").on("click", function() {
		$(this).parent().children().toggle();
		self.$task.addClass("task-minimize");
		self.$task.resizable("disable");
		self.minimizeCallback(true);
	});
	this.$task.find(".task-restore-btn").on("click", function() {
		$(this).parent().children().toggle();
		self.$task.removeClass("task-minimize");
		self.$task.resizable("enable");
		self.minimizeCallback(false);
	});
	this.$task.find(".task-delete-btn").on("click", function() {
		self.hideTask(function() {
			self.$task.remove();
		});
	});
	this.$task.find(".task-pad").on("blur", function() {
		var content = $(this).val();
		if (content !== '' && content !== self.data.content) {
			var title = content.substring(0, 8);
			self.$task.find(".task-title").html(title);
			self.data.title = title;
			self.data.content = content;
			self.data.modified = new Date().getTime();
			self.saveTask(getList);
		}
	}).on("keyup", function(e) {
		e.stopPropagation();
	});

	this.minimizeCallback = function(val) {
		self.data.windowMinimized = val;
		self.saveTask();
	};
	this.dragCallback = function(event, ui) {
		self.data.position = ui.position;
		self.saveTask();
	};
	this.resizeCallback = function(event, ui) {
		self.data.size = ui.size;
		self.saveTask();
	};

	this.saveTask = function(callback) {
		restCall('/info/task', {data: self.data, method: "PUT"}, callback);
		console.log('save task', self.data);
	}
	this.hideTask = function(callback) {
		self.data.status = 'D';
		restCall('/info/task', {data: self.data, method: "PUT"}, callback);
		console.log('hide task', self.data);
	}
	this.deleteTask = function(callback) {
		restCall('/info/task', {data: self.data, method: "DELETE"}, callback);
		console.log('delete task', self.data);
	}
	
	if (this.data.windowMinimized) {
		self.$task.addClass("task-minimize");
	}

}

Task.prototype.show = function() {
	var self = this;
	
	var wrapper = "taskWrapper";
	if ($("#" + wrapper).length === 0) {
		$("<div>", {id: wrapper}).appendTo($("body"));
	}
	
	this.$task.appendTo($("#" + wrapper));
	this.$task.draggable({
		stop: this.dragCallback
	});
	this.$task.resizable({
		stop: this.resizeCallback,
		disabled: this.data.windowMinimized
	});
	
	if (this.data.windowMinimized) {
		self.$task.find(".task-control").children().toggle();
	}

	console.log("task show");
};

function showList(list) {
	console.log('list', list.length);

	$("#taskList").empty();
	list.forEach(function(task, idx) {
		$("#taskList").append(
				$("<tr>").append(
						$("<td>").html(idx+1),
						$("<td>").html(task.id),
						$("<td>").html(task.author),
						$("<td>").html(task.title),
						$("<td>").html(task.content),
						$("<td>").html($.datepicker.formatDate("yy/mm/dd", new Date(task.created))),
						$("<td>").html($.datepicker.formatDate("yy/mm/dd", new Date(task.modified))),
						$("<td>").html($.datepicker.formatDate("yy/mm/dd", new Date(task.closed))),
						$("<td>").html("L: " + task.position.left + " T: " + task.position.top),
						$("<td>").html("W: " + task.size.width + " H: " + task.size.height),
						$("<td>").append(
								$("<select>", {class: "form-control form-control-sm w-auto border-0 bg-light bg-transparent"}).append(
										$("<option>", {value: "unset"}).text("unset"),
										(function() {
											var options = [];
											taskColors.forEach(function(color) {
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
						$("<td>").append(
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
						$("<td>").append(
								$("<div>", {class: 'custom-control custom-switch'}).append(
										$("<input>", {type: 'checkbox', class: 'custom-control-input', id: 'task-' + task.id + '-status', checked: (task.status == 'N')}).on("change", function() {
											var val = $(this).prop("checked") ? 'N' : 'D';
											task.status = val;
											$(this).next().html(val);
											restCall('/info/task', {data: task, method: "PUT"}, function() {
												console.log('update task status');
											});
										}),
										$("<label>", {class: 'custom-control-label', for: 'task-' + task.id + '-status'}).html(task.status)
								)
						),
						$("<td>").append(
								$("<button>", {class: 'btn btn-sm text-danger'}).on("click", function() {
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

function addEventListener() {
	$("#switchTitleInline").on("change", function() {
		var checked = $(this).prop("checked")
		$("tbody > tr > td:nth-child(5)").each(function() {
			if (checked) {
				$(this).html($(this).html().replace(/<br>/g, '\n'));
			} else {
				$(this).html($(this).html().replace(/\n/g, '<br>'));
			}
		});
	});

	$(".search-input").on("keyup", function(e) {
		if (e.keyCode === 13) {
			getList();
		}
	});

	$(".search-btn").on("click", getList).click();
	
	$("#listAll").on("change", function() {
		isListAll = $("#listAll").prop("checked");
		console.log("#listAll checked", isListAll);
	});

	$(".new-task-btn").on("click", function() {
		new Task().show();
	});
}
