Ext.define('USIMobile.WebService', {
	singleton: true,

	constructor: function(config) {
  		this.initConfig(config);
  		return this;
	},

	config: { },
	
	//************************************  
	// Generic webservice request function
	//************************************  
	request: function(url, params, rmodel) {
		// prepare the parameters
		var url_encoded_params = '?';
		Ext.iterate(params, function(key, value){
				url_encoded_params += key+'='+value+'&';
		});
		// remove the last & char
		url_encoded_params = url_encoded_params.slice(0,-1);
		// build the url_request
		var url_request = url + url_encoded_params;
		// send the request for content
		var content_store = Ext.create('Ext.data.Store', {
				model: rmodel,
				proxy: {
						type: 'ajax',
						url: url_request,
						pageParam: false,
						startParam: false,
						limitParam: false,
						noCache: false,
						reader: {
								type: 'json',
								rootProperty: 'response',
						}
				}
		});

		// get the content
		return content_store.load({
				callback: function(records, operation, success) {
						// check if there are any exceptions 
						if( this.first() != undefined && this.first().raw.exception != undefined ) {
								Ext.Msg.alert(
										this.first().raw.error.title,
										this.first().raw.error.message
								);
						}
				}
		});
	},


	//***************************** 
	// Web Service Request Wrappers
	//***************************** 
	getShortNews: function() {
		var url = USIMobile.Config.getShortNewsUrl();
		// set parameters
		var params = new Object();
		// request
		var short_news_store = this.request(url, params, 'USIMobile.model.ShortNews');
		return short_news_store;
	},

	getDetailedNews: function(id) {
		var url = USIMobile.Config.getDetailedNewsUrl();
		// set parameters
		var params = new Object();
		params.id = id;
		// request
		var detailed_news_store = this.request(url, params, 'USIMobile.model.DetailedNews');
		return detailed_news_store;
	},
});
