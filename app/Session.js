Ext.define('USIMobile.Session', {
	singleton : true,

	constructor: function(config) {
  		this.initConfig(config);
  		return this;
	},

	config : {
		username: '',
		course: null,
		settingsStore: null,
		aaiAccountStore: null,
		updatesStore: null,
		coursesStore: null,
		peopleStore: null,
		academicCalendarStore: null,
		teachingTimetablesStore: null,
		examinationTimetablesStore: null,
		shortNewsStore: null,
		detailedNewsStore: null,
		menuMensaStore: null,
		sportActivityStore: null,
	}
	
});
