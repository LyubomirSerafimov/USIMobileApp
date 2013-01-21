Ext.define('USIMobile.controller.StoreFeed', {
    extend: 'Ext.app.Controller',
    
    config: {
        refs: {
        },
        control: {
        }
    },
    
    init: function() {
		Ext.sf = this;
		//this.self = this;
		// start updates only if the usageagreemnt has been accepted and the aai account has been set
		if(USIMobile.Session.getSettingsStore().first().get('usageagreement') && USIMobile.Session.getSettingsStore().first().get('accountset')) {
			// get hash updates
			var updates = USIMobile.WebService.getUpdates();
			updates.on('load', function(server_updates_store){ this.checkUpdates(server_updates_store); }, this, {single: true});
		}
	},

	syncUpdatesStore: function(server_updates_store) {
		if(server_updates_store.getCount() > 0) {
			USIMobile.Session.getUpdatesStore().removeAll();
			USIMobile.Session.getUpdatesStore().getProxy().clear();
			server_updates_store.first().setDirty();
			USIMobile.Session.getUpdatesStore().add(server_updates_store.first());
			USIMobile.Session.getUpdatesStore().sync();
		}
	},

	checkUpdates: function(server_updates_store) {
		USIMobile.app.showLoadMask('Sync data.');
		// if updates store is empty then initialize the local store
		if(USIMobile.Session.getUpdatesStore().getCount() == 0) {
			this.syncUpdatesStore(server_updates_store);
			var scope = this;
			// wait for the loadmask to be displayed
			setTimeout(function() {
				scope.initLocalStores(server_updates_store);
			}, 100);
		} else {
			var scope = this;
			// wait for the loadmask to be displayed
			setTimeout(function() {
				scope.updateLocalStores(server_updates_store);
			}, 100);
		}
	},

	// hides the Loading Mask whena all flags in the store_update_status are true
	checkUpdateProgress: function() {
		this.store_update_status = {
			'check_interval': null,
			'courses': false,
			'academic_calendar': false,
			'teaching_timetables': false,
			'examination_timetables': false,
			'people': false,
			'short_news': false,
			'menu_mensa': false,
			'sport_activity': false,
		};
		// check
		var scope = this;
		this.store_update_status.check_interval = setInterval(function() {
			if(
				scope.store_update_status.courses == true &&
				scope.store_update_status.academic_calendar == true &&
				scope.store_update_status.teaching_timetables == true &&
				scope.store_update_status.examination_timetables == true &&
				scope.store_update_status.people == true &&
				scope.store_update_status.short_news == true &&
				scope.store_update_status.menu_mensa == true &&
				scope.store_update_status.sport_activity == true
			) {
				clearInterval(scope.store_update_status.check_interval);
				USIMobile.app.hideLoadMask();
			}
		}, 500);
	},

	initLocalStores: function(server_updates_store) {
		this.checkUpdateProgress();
		// courses store
		this.updateCoursesStore();
		// academiccalendar store
		this.updateAcademicCalendarStore();
		// people store
		this.updatePeopleStore();
		// teaching timetables store
		this.updateTeachingTimetablesStore();
		// examination timetables store
		this.updateExaminationTimetablesStore();
		// usinews store
		this.updateShortNewsStore();
		// menumensa store
		this.updateMenuMensaStore();
		// sportactivity store
		this.updateSportActivityStore();
		// write to updates store
		this.syncUpdatesStore(server_updates_store);
	},


	updateLocalStores: function(server_updates_store) {
		this.checkUpdateProgress();

		// courses store
		if(server_updates_store.first().get('courses') != USIMobile.Session.getUpdatesStore().first().get('courses')) {
			this.updateCoursesStore();
		} else {
			if(USIMobile.Session.getCoursesStore().getCount() == 0){
				// once the store is loaded set the update status flag
				// this makes the loadmask block the application until the application
				// has loaded all of data
				USIMobile.Session.getCoursesStore().on('load', function(){
					this.store_update_status.courses = true;
				}, this, {single: true});
				USIMobile.Session.getCoursesStore().load();
			}
		}

		// academiccalendar store
		if(server_updates_store.first().get('academiccalendar') != USIMobile.Session.getUpdatesStore().first().get('academiccalendar')) {
			this.updateAcademicCalendarStore();
		} else {
			if(USIMobile.Session.getAcademicCalendarStore().getCount() == 0){
				USIMobile.Session.getAcademicCalendarStore().on('load', function(){
					this.store_update_status.academic_calendar = true;
				}, this, {single: true});
				USIMobile.Session.getAcademicCalendarStore().load();
			}
		}

		// people store
		if(server_updates_store.first().get('people') != USIMobile.Session.getUpdatesStore().first().get('people')) {
			this.updatePeopleStore();
		} else {
			if(USIMobile.Session.getPeopleStore().getCount() == 0){
				USIMobile.Session.getPeopleStore().on('load', function(){
					this.store_update_status.people = true;
				}, this, {single: true});
				USIMobile.Session.getPeopleStore().load();
			}
		}

		// teaching timetables store
		if(server_updates_store.first().get('teachingtimetables') != USIMobile.Session.getUpdatesStore().first().get('teachingtimetables')) {
			this.updateTeachingTimetablesStore();
		} else {
			if(USIMobile.Session.getTeachingTimetablesStore().getCount() == 0){
				USIMobile.Session.getTeachingTimetablesStore().on('load', function(){
					this.store_update_status.teaching_timetables = true;
				}, this, {single: true});
				USIMobile.Session.getTeachingTimetablesStore().load();
			}
		}

		// examination timetables store
		if(server_updates_store.first().get('examinationtimetables') != USIMobile.Session.getUpdatesStore().first().get('examinationtimetables')) {
			this.updateExaminationTimetablesStore();
		} else {
			if(USIMobile.Session.getExaminationTimetablesStore().getCount() == 0){
				USIMobile.Session.getExaminationTimetablesStore().on('load', function(){
					this.store_update_status.examination_timetables = true;
				}, this, {single: true});
				USIMobile.Session.getExaminationTimetablesStore().load();
			}
		}

		// usinews store
		if(server_updates_store.first().get('usinews') != USIMobile.Session.getUpdatesStore().first().get('usinews')) {
			this.updateShortNewsStore();
		} else {
			if(USIMobile.Session.getShortNewsStore().getCount() == 0){
				USIMobile.Session.getShortNewsStore().on('load', function(){
					this.store_update_status.short_news = true;
				}, this, {single: true});
				USIMobile.Session.getShortNewsStore().load();
			}
		}

		// menumensa store
		if(server_updates_store.first().get('menumensa') != USIMobile.Session.getUpdatesStore().first().get('menumensa')) {
			this.updateMenuMensaStore();
		} else {
			if(USIMobile.Session.getMenuMensaStore().getCount() == 0){
				USIMobile.Session.getMenuMensaStore().on('load', function(){
					this.store_update_status.menu_mensa = true;
				}, this, {single: true});
				USIMobile.Session.getMenuMensaStore().load();
			}
		}


		// sportactivity store
		if(server_updates_store.first().get('sportactivity') != USIMobile.Session.getUpdatesStore().first().get('sportactivity')) {
			this.updateSportActivityStore();
		} else {
			if(USIMobile.Session.getSportActivityStore().getCount() == 0){
				USIMobile.Session.getSportActivityStore().on('load', function(){
					this.store_update_status.sport_activity = true;
				}, this, {single: true});
				USIMobile.Session.getSportActivityStore().load();
			}
		}

		this.syncUpdatesStore(server_updates_store);
	},

	updateCoursesStore: function() {
		USIMobile.WebService.getCourses().on('load',
			function(store, records, success) {
				// check if there are any exceptions
				// check for errors here
				if(store.getProxy().getReader().rawData.error == null){
					this.store_update_status.courses = true;
					// remove old entries
					USIMobile.Session.getCoursesStore().removeAll();
					USIMobile.Session.getCoursesStore().getProxy().clear();
					store.each(function(course_entry) {
						// insert the new entry
						//course_entry.setDirty();
						USIMobile.Session.getCoursesStore().add(course_entry);
					});

					// store data
					USIMobile.Session.getCoursesStore().sync();
				} else {
					Ext.Msg.alert(
						store.getProxy().getReader().rawData.title,
						store.getProxy().getReader().rawData.message + '; Code: ' + store.getProxy().getReader().rawData.code
					);
				}
			},
			this,
			{single: true}
		);
	},	

	updateAcademicCalendarStore: function() {
		USIMobile.WebService.getAcademicCalendar().on('load',
			function(store, records, success) {
				// check if there are any exceptions
				// check for errors here
				if(store.getProxy().getReader().rawData.error == null){
					this.store_update_status.academic_calendar = true;
					// remove old entries
					USIMobile.Session.getAcademicCalendarStore().removeAll();
					USIMobile.Session.getAcademicCalendarStore().getProxy().clear();
					// insert the new entry
					USIMobile.Session.getAcademicCalendarStore().add(store.first());

					// store data
					USIMobile.Session.getAcademicCalendarStore().sync();
				} else {
					Ext.Msg.alert(
						store.getProxy().getReader().rawData.title,
						store.getProxy().getReader().rawData.message + '; Code: ' + store.getProxy().getReader().rawData.code
					);
				}
			},
			this,
			{single: true}
		);
	},

	updateTeachingTimetablesStore: function() {
		USIMobile.WebService.getTeachingTimetables().on('load',
			function(store, records, success) {
				// check if there are any exceptions
				// check for errors here
				if(store.getProxy().getReader().rawData.error == null){
					this.store_update_status.teaching_timetables = true;
					// remove old entries
					USIMobile.Session.getTeachingTimetablesStore().removeAll();
					USIMobile.Session.getTeachingTimetablesStore().getProxy().clear();
					// insert the entries
					store.each(function(entry){
						entry.setDirty();
						USIMobile.Session.getTeachingTimetablesStore().add(entry);
					});
					// store data
					USIMobile.Session.getTeachingTimetablesStore().sync();
				} else {
					Ext.Msg.alert(
						store.getProxy().getReader().rawData.title,
						store.getProxy().getReader().rawData.message + '; Code: ' + store.getProxy().getReader().rawData.code
					);
				}
			},
			this,
			{single: true}
		);
	},

	updateExaminationTimetablesStore: function() {
		USIMobile.WebService.getExaminationTimetables().on('load',
			function(store, records, success) {
				// check if there are any exceptions
				// check for errors here
				if(store.getProxy().getReader().rawData.error == null){
					this.store_update_status.examination_timetables = true;
					// remove old entries
					USIMobile.Session.getExaminationTimetablesStore().removeAll();
					USIMobile.Session.getExaminationTimetablesStore().getProxy().clear();
					// insert the entries
					store.each(function(entry){
						entry.setDirty();
						USIMobile.Session.getExaminationTimetablesStore().add(entry);
					});
					// store data
					USIMobile.Session.getExaminationTimetablesStore().sync();
				} else {
					Ext.Msg.alert(
						store.getProxy().getReader().rawData.title,
						store.getProxy().getReader().rawData.message + '; Code: ' + store.getProxy().getReader().rawData.code
					);
				}
			},
			this,
			{single: true}
		);
	},

	updatePeopleStore: function() {
		USIMobile.WebService.getPeople().on('load',
			function(store, records, success) {
				// check if there are any exceptions
				// check for errors here
				if(store.getProxy().getReader().rawData.error == null){
					this.store_update_status.people = true;
					// remove old entries
					USIMobile.Session.getPeopleStore().removeAll();
					USIMobile.Session.getPeopleStore().getProxy().clear();
					store.each(function(people_entry) {
						// insert the new entry
						people_entry.setDirty();
						USIMobile.Session.getPeopleStore().add(people_entry);
					});
					// store data
					USIMobile.Session.getPeopleStore().sync();
				} else {
					Ext.Msg.alert(
						store.getProxy().getReader().rawData.title,
						store.getProxy().getReader().rawData.message + '; Code: ' + store.getProxy().getReader().rawData.code
					);
				}
			},
			this,
			{single: true}
		);
	},

	updateShortNewsStore: function() {
		USIMobile.WebService.getShortNews().on('load',
			function(store, records, success) {
				// check if there are any exceptions
				// check for errors here
				if(store.getProxy().getReader().rawData.error == null){
					this.store_update_status.short_news = true;
					// remove old entries
					USIMobile.Session.getShortNewsStore().removeAll();
					USIMobile.Session.getShortNewsStore().getProxy().clear();

					store.each(function(news_entry) {
						news_entry.setDirty();
						USIMobile.Session.getShortNewsStore().add(news_entry);
					});

					// update the detailed news store
					USIMobile.Session.getShortNewsStore().on('write', this.updateDetailedNewsStore, this, {single: true});
					// store data
					USIMobile.Session.getShortNewsStore().sync();
				} else {
					Ext.Msg.alert(
						store.getProxy().getReader().rawData.title,
						store.getProxy().getReader().rawData.message + '; Code: ' + store.getProxy().getReader().rawData.code
					);
				}
			},
			this,
			{single: true}
		);
	},
	
	updateDetailedNewsStore: function(){
		USIMobile.Session.getShortNewsStore().each(function(entry){
			USIMobile.WebService.getDetailedNews(entry.get('id')).on('load', function(store){
				var news_entry = store.first();
				news_entry.setDirty();
				USIMobile.Session.getDetailedNewsStore().add(news_entry);
				USIMobile.Session.getDetailedNewsStore().sync();
			});
		}, this);
	},

	updateMenuMensaStore: function() {
		USIMobile.WebService.getMenuMensa().on('load',
			function(store, records, success) {
				// check if there are any exceptions
				// check for errors here
				if(store.getProxy().getReader().rawData.error == null){
					this.store_update_status.menu_mensa = true;
					// remove old entries
					USIMobile.Session.getMenuMensaStore().removeAll();
					USIMobile.Session.getMenuMensaStore().getProxy().clear();
					// insert the new entry
					USIMobile.Session.getMenuMensaStore().add(store.first());
					// store data
					USIMobile.Session.getMenuMensaStore().sync();
				} else {
					Ext.Msg.alert(
						store.getProxy().getReader().rawData.title,
						store.getProxy().getReader().rawData.message + '; Code: ' + store.getProxy().getReader().rawData.code
					);
				}
			},
			this,
			{single: true}
		);
	},

	updateSportActivityStore: function() {
		USIMobile.WebService.getSportActivities().on('load',
			function(store, records, success) {
				// check if there are any exceptions
				// check for errors here
				if(store.getProxy().getReader().rawData.error == null){
					this.store_update_status.sport_activity = true;
					// remove old entries
					USIMobile.Session.getSportActivityStore().removeAll();
					USIMobile.Session.getSportActivityStore().getProxy().clear();
					store.each(function(activity) {
						// insert the new entry
						activity.setDirty();
						USIMobile.Session.getSportActivityStore().add(activity);
					});
					// store data
					USIMobile.Session.getSportActivityStore().sync();
				} else {
					Ext.Msg.alert(
						store.getProxy().getReader().rawData.title,
						store.getProxy().getReader().rawData.message + '; Code: ' + store.getProxy().getReader().rawData.code
					);
				}
			},
			this,
			{single: true}
		);
	},
});
