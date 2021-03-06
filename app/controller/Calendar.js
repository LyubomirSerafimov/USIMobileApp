Ext.define('USIMobile.controller.Calendar', {
	extend: 'Ext.app.Controller',

	config: {
		views: [
			'Calendar',
			'Faculties',
			'TeachingTimetables',
			'ExaminationTimetables',
		],

		refs: {
			home: 'home',
			calendarButton: 'button#calendar_home_button',
			calendar: 'calendar',
			faculties: 'faculties',
			teachingTimetables: 'teachingtimetables',
			examinationTimetables: 'examinationtimetables',
		},

		control: {
			calendarButton: { tap: 'showCalendar' },
			calendar: { itemtap: 'selectCalendar' },
			faculties: { itemtap: 'selectFaculties' },
			teachingTimetables: { itemtap: 'selectTeachingTimetable' },
			examinationTimetables: { itemtap: 'selectExaminationTimetable' },
		}
	},
	
	init: function(){
		Ext.t = this;
		this.filter = { calendar: null, faculty: null, level: null };
	},

	showCalendar: function(btn, e, eOpts){
		var localized_data = [
			{ 
				id: 'academiccalendar',
				title: Ux.locale.Manager.get('list.calendar.academicCalendar')
			},
			{ 
				id: 'teaching',
				title: Ux.locale.Manager.get('list.calendar.teachingTimetables')
			},
			{ 
				id: 'examination',
				title: Ux.locale.Manager.get('list.calendar.examinationTimetables')
			},
		];

		// display caledar
		if(typeof this.getCalendar() == 'object') {
			this.getCalendar().setData(localized_data);
			this.getCalendar().refresh();
			this.getCalendar().setEmptyText(Ux.locale.Manager.get('message.noinfo'));
			this.getHome().push(this.getCalendar());
		} else {
			this.getHome().push({
				xtype: 'calendar',
				title: Ux.locale.Manager.get('title.calendar'),
				emptyText: Ux.locale.Manager.get('message.noinfo'),
				data: localized_data
			});
		}
	},

	selectCalendar: function(view, index, target, record) {
		// record the faculty choice
		if(record.get('id') == 'academiccalendar') {
			this.showAcademicCalendar();
		} else {
			this.filter.calendar = record.get('id');
			this.showFaculties();
		}
	},

	showAcademicCalendar: function(){
		var data = USIMobile.Session.getAcademicCalendarStore().first().getData();
		if(Ux.locale.Manager.getLanguage() == 'it') {
			USIMobile.app.openURL(data.url_it);
		} else {
			USIMobile.app.openURL(data.url_en);
		}
	},

	showFaculties: function() {
		if(typeof this.getFaculties() == 'object') {
			this.getHome().push(this.getFaculties());
		} else {
			this.getHome().push({
				xtype: 'faculties',	
				title: Ux.locale.Manager.get('title.faculty'),
			});
		}
	},

	selectFaculties: function(view, index, target, record) {
		// record the faculty choice
		this.filter.faculty = record.get('faculty');
		this.filter.level = record.get('level');
		switch(this.filter.calendar) {
			case 'teaching':	
				this.showTeachingTimetables();
				break;
			case 'examination':	
				this.showExaminationTimetables();
				break;
		}

	},

	showTeachingTimetables: function() {
		if(typeof this.getTeachingTimetables() == 'object') {
			this.getTeachingTimetables().store = this.getFilteredTeachingTimetablesStore();
			this.getHome().push(this.getTeachingTimetables());
		} else {
			this.getHome().push({
				xtype: 'teachingtimetables',
				title: Ux.locale.Manager.get('title.teachingTimetables'),
				store: this.getFilteredTeachingTimetablesStore()
			});
		}
	},

	getFilteredTeachingTimetablesStore: function(){
		USIMobile.Session.getTeachingTimetablesStore().clearFilter();
		USIMobile.Session.getTeachingTimetablesStore().filterBy(
			function(record) {
					return record.get('faculty') === this.filter.faculty && record.get('level') === this.filter.level;
			},
			this
		);
		return USIMobile.Session.getTeachingTimetablesStore();
	},

	selectTeachingTimetable: function(view, index, target, record) {
		// record the faculty choice
		if(record.get('mime') == 'website') {
			USIMobile.app.openURL(record.get('url'));	
		} else {
			USIMobile.app.getFile(record.get('url'), record.get('filename'), record.get('mime'));	
		}
	},

	showExaminationTimetables: function() {
		if(typeof this.getExaminationTimetables() == 'object') {
			this.getExaminationTimetables().store = this.getFilteredExaminationTimetablesStore();
			this.getHome().push(this.getExaminationTimetables());
		} else {
			this.getHome().push({
				xtype: 'examinationtimetables',
				title: Ux.locale.Manager.get('title.examinationTimetables'),
				emptyText: Ux.locale.Manager.get('message.noTimeTables'),
				store: this.getFilteredExaminationTimetablesStore()
			});
		}
	},

	getFilteredExaminationTimetablesStore: function(){
		USIMobile.Session.getExaminationTimetablesStore().clearFilter();
		USIMobile.Session.getExaminationTimetablesStore().filterBy(
			function(record) {
					return record.get('faculty') === this.filter.faculty && record.get('level') === this.filter.level;
			},
			this
		);
		return USIMobile.Session.getExaminationTimetablesStore();
	},

	selectExaminationTimetable: function(view, index, target, record) {
		// record the faculty choice
		if(record.get('url') == null || record.get('filename') == null || record.get('mime') == null) {
			Ext.Msg.alert('File not available','This timetable has not been provided yet.');
		}else if(record.get('mime') == 'website') {
			USIMobile.app.openURL(record.get('url'));	
		} else {
			USIMobile.app.getFile(record.get('url'), record.get('filename'), record.get('mime'));	
		}
	},
});
