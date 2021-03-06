Ext.define('USIMobile.controller.Library', {
	extend: 'Ext.app.Controller',

	requires: [
	],

	config: {
		views: [
			'Library',
			'Books',
			'Journals',
		],

		models: [
			'SearchLibraryResult',
			'Journal',
			'Book',
		],

		refs: {
			home: 'home',
			homeLibraryButton: 'button#library_home_button',
			books: 'books',
			booksNextPage: 'books button[action=nextPage]',
			booksPreviousPage: 'books button[action=previousPage]',
			journals: 'journals',
			journalsNextPage: 'journals button[action=nextPage]',
			journalsPreviousPage: 'journals button[action=previousPage]',
			library: 'library',
			searchButton: 'library button[action=search]',
		},

		control: {
			homeLibraryButton: { tap: 'showLibrary' },
			searchButton: { tap: 'search' },
			books: { itemtap: 'checkBookInAleph', },
			booksNextPage: { tap: function() { this.navigateBooks('down'); } },
			booksPreviousPage: { tap: function() {this.navigateBooks('up');} },
			journals: { itemtap: 'checkJournal', },
			journalsNextPage: { tap: function() {this.navigateJournals('down');} },
			journalsPreviousPage: { tap: function() {this.navigateJournals('up');} },
		}
	},
	
	init: function(){
		Ext.l = this;
		this.books={};
		this.books.numberOfResults;
		this.books.nextOffset;
		this.books.currentOffset;

		this.journals={};
		this.journals.numberOfResults;
		this.journals.nextOffset;
	},

	showLibrary: function() {
		if(typeof this.getLibrary() == 'object') {
			this.getHome().push(this.getLibrary());
		} else {
			this.getHome().push({
				xtype: 'library',	
				title: Ux.locale.Manager.get('title.library'),
			});
		}
	},

	search: function(btn) {
		USIMobile.app.showLoadMask(Ux.locale.Manager.get('message.searching'));
		var data = this.getLibrary().getValues();
		// check what to search
		if(data.doc == 'journal') {
			this.searchJournals(data);
		} else {
			this.searchBooks(data);
		}
	},

	searchJournals: function(data) {
		var journals_store = USIMobile.WebService.searchJournals(data);

		journals_store.on('load', function(store){
			USIMobile.app.hideLoadMask();
			if(store.first().raw.error == undefined) {
				if(store.first().get('numberofresults') == 0) {
					Ext.Msg.alert(
						Ux.locale.Manager.get('title.noResults'),
						Ux.locale.Manager.get('message.noJournalsFound')
					);
				} else {
					this.listJournals(store);
				}
			} else {
				this.displayError(store.first().raw.error.code, store.first().raw.error.message);
			}
		}, this);
	},

	listJournals: function(search_library_outcome_store) {
		this.journals.numberOfResults = search_library_outcome_store.first().get('numberofresults');
		this.journals.nextOffset = search_library_outcome_store.first().get('nextoffset');
		var number_of_pages = Math.ceil(this.journals.numberOfResults / 10);
		var current_page = Math.floor(this.journals.nextOffset / 10);
		if(current_page == 0) { current_page = number_of_pages; }
		var pagination = '<div class="pagination"> (' + current_page + '/'+ number_of_pages + ')</div>';
		var journals_store = Ext.create('Ext.data.Store', {
			model: 'USIMobile.model.Journal',
			data: search_library_outcome_store.first().get('results')
		});
		if(typeof this.getJournals() == 'object') {
			this.getJournals().setStore(journals_store);
			this.getJournals().setHtml(pagination);
			this.getHome().push(this.getJournals());
		} else {
			this.getHome().push({
				xtype: 'journals',
				title: Ux.locale.Manager.get('title.journals'),
				store: journals_store,
				html: pagination,
			});
		}
		// set the pagination buttons
		this.getJournalsPreviousPage().hide();
		this.getJournalsNextPage().hide();
		if(this.journals.currentOffset > 10) {
			this.getJournalsPreviousPage().show();
		}
		if(this.journals.nextOffset > 0) {
			this.getJournalsNextPage().show();
		}
	},

	searchBooks: function(data) {
		var books_store = USIMobile.WebService.searchBooks(data);

		books_store.on('load', function(store){
			USIMobile.app.hideLoadMask();
			if(store.first().get('noresults') == true) {
				Ext.Msg.alert(
					Ux.locale.Manager.get('title.noResults'),
					Ux.locale.Manager.get('message.noBooksFound')
				);
			} else {
				this.listBooks(store);
			}
		}, this);
	},

	listBooks: function(search_library_outcome_store) {
		this.books.numberOfResults = search_library_outcome_store.first().get('numberofresults');
		this.books.nextOffset = search_library_outcome_store.first().get('nextoffset');
		var number_of_pages = Math.ceil(this.books.numberOfResults / 10);
		var current_page = Math.floor(this.books.nextOffset / 10);
		if(current_page == 0) { current_page = number_of_pages; }
		var pagination = '<div class="pagination"> (' + current_page + '/'+ number_of_pages + ')</div>';
		var books_store = Ext.create('Ext.data.Store', {
			model: 'USIMobile.model.Book',
			data: search_library_outcome_store.first().get('results')
		});
		if(typeof this.getBooks() == 'object') {
			this.getBooks().setStore(books_store);
			this.getBooks().setHtml(pagination);
			this.getHome().push(this.getBooks());
		} else {
			this.getHome().push({
				xtype: 'books',
				title: Ux.locale.Manager.get('title.books'),
				store: books_store,
				html: pagination,
			});
		}
		// set the pagination buttons
		this.getBooksPreviousPage().hide();
		this.getBooksNextPage().hide();
		if(this.books.currentOffset > 10) {
			this.getBooksPreviousPage().show();
		}
		if(this.books.nextOffset > 0) {
			this.getBooksNextPage().show();
		}
	},

	//navigateBooks: function(view, index, target, record, event, options) {
	navigateBooks: function(direction) {
		var data = this.getLibrary().getValues();
		if(direction == "down") { // next page
			if(this.books.nextOffset > 0) {
				USIMobile.app.showLoadMask(Ux.locale.Manager.get('message.loading'));
				this.books.currentOffset = this.books.nextOffset;
				data.offset = this.books.currentOffset;
				this.searchBooks(data);
			}
		} else { // previous page
			if(this.books.currentOffset > 10) {
				USIMobile.app.showLoadMask(Ux.locale.Manager.get('message.loading'));
				this.books.currentOffset -= 10;
				data.offset = this.books.currentOffset;
				this.searchBooks(data);
			}
		}
	},

	//navigateJournals: function(view, index, target, record, event, options) {
	navigateJournals: function(direction) {
		var data = this.getLibrary().getValues();
		if(direction == "down") { // next page
			if(this.journals.nextOffset > 0) {
				USIMobile.app.showLoadMask(Ux.locale.Manager.get('message.loading'));
				this.journals.currentOffset = this.journals.nextOffset;
				data.offset = this.journals.currentOffset;
				this.searchJournals(data);
			}
		} else { // previous page
			if(this.journals.currentOffset > 10) {
				USIMobile.app.showLoadMask(Ux.locale.Manager.get('message.loading'));
				this.journals.currentOffset -= 10;
				data.offset = this.journals.currentOffset;
				this.searchJournals(data);
			}
		}
	},

	displayError: function(code, message) {
		switch(code) {
			case 7:
				Ext.Msg.alert(Ux.locale.Manager.get('title.error'), Ux.locale.Manager.get('message.serverConnectionFailed'));
			break;
			default:
				Ext.Msg.alert(
					Ux.locale.Manager.get('title.errorCode') + code,
					Ux.locale.Manager.get('message.serverErrorMessage') + message
				);
			break;
		}
	},

	checkJournal: function(view, index, target, record) {
		// open url if available
		if(record.get('url') != null) {
			USIMobile.app.openURL(record.get('url'));
		}
	},

	checkBookInSwissBib: function(view, index, target, record) {
		var data = this.getLibrary().getValues();
		var params = '?q=' + record.get('id');
		if(data.usilib == true) {
			params += '&library=LUBUL';
		}
		params += '&language='+Ux.locale.Manager.getLanguage();
		USIMobile.app.openURL(USIMobile.Config.getSwissBibUrl() + params);
	},

	checkBookInAleph: function(view, index, target, record) {
		var data = this.getLibrary().getValues();
		var params = '&doc_library=SBT01&doc_number=00' + record.get('sbtnumber');
		if(data.usilib == true) {
			params += '&sub_library=LUBUL';
		}
		USIMobile.app.openURL(USIMobile.Config.getAlephUrl() + params);
	},
});
