Ext.define('USIMobile.store.ShortNews', {
	extend: 'Ext.data.Store',

	requires: [
		'Ext.data.proxy.LocalStorage'
	],

	models: [
		'USIMobile.model.ShortNews',
	],

	config: {
		storeId: 'shortnews_store',
		model: 'USIMobile.model.ShortNews',
		autoLoad: true,
		autoSync: true,
		sorters: 'rank',
		proxy: {
			type: 'localstorage',	
			id: 'shortnews'
		},
	}
});
