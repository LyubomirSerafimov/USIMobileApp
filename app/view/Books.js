Ext.define("USIMobile.view.Books", {
	extend: 'Ext.dataview.List',
	xtype: 'books',

	config: {
		id: 'books',
		itemTpl: '<div class="title">{title}</div>'
					+'<div><span class="label">{[Ux.locale.Manager.get("label.author")]}</span>: {author}</div>'
					+'<div><span class="label">{[Ux.locale.Manager.get("label.signature")]}</span>: {signature}</div>'
					+'<div><span class="label">{[Ux.locale.Manager.get("label.publisher")]}</span>: {publisher}</div>'
					+'<div><span class="label">{[Ux.locale.Manager.get("label.publishdate")]}</span>: {publishdate}</div>',

		cls: 'books standard_font',
	},
});