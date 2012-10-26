/** The entire page. */


/** Stores the state of the entire page. */
semanticify.Page = Backbone.Model.extend({
  defaults: {
    // Key indicates that a tag is selected, value is true by default
    'selectedTags': {},
    'selectedUrls': {}
  },

  initialize: function() {
    this.urlCollection = new semanticify.UrlCollection();

    _.each(data, _.bind(function(rawUrlObj) {
      var url = new semanticify.Url({
        'id': rawUrlObj.id,
        'url': rawUrlObj.url,
        'tags': rawUrlObj.tags
      });

      this.urlCollection.add(url);
    }, this));
  },

  addSelectedTag: function(tagName) {
    this.get('selectedTags')[tagName] = true;

    this.updateSelectedUrls();
  },

  removeSelectedTag: function(tagName) {
    delete this.get('selectedTags')[tagName];
    console.log('selectedTags', this.get('selectedTags'));

    this.updateSelectedUrls();
  },

  /** Update which urls are in the selected region. */
  updateSelectedUrls: function() {
    var urlMap = this.get('selectedUrls');
    urlMap = {};

    // Initial implementation: Loop over all the urls and cross reference.
    _.each(this.urlCollection.models, _.bind(function(url) {
      _.each(url.get('tags'), _.bind(function(tagName) {
        if (tagName in this.get('selectedTags')) {
          alert(tagName);
          this.get('selectedUrls')[url.get('id')] = url;
        }
      }, this));
    }, this));

    console.log('urlMap', urlMap);

    this.trigger('urls-updated');
  },
});


/** Updates the view of the page based on the model. */
semanticify.PageView = Backbone.View.extend({
  el: '#container',


  initialize: function() {
    this.render();

    this.model.on('urls-updated', _.bind(function() {
      this.render();
    }, this));
  },


  render: function() {
    // Wipe anything drawn previously.
    $('#selected-tag-container').empty();
    $('#selected-urls', this.el).empty();
    $('#unselected-urls', this.el).empty();

     _.each(this.model.urlCollection.models, _.bind(function(url) {
      this.appendUrl(url);
      this.updateTags(url);
     }, this));

    _.each(_.keys(this.model.get('selectedTags')), _.bind(function(tagName) {
      this.updateSelectedTagView(tagName);
     }, this));
  },


  events: {
    'keyup #search-input': 'handleSearchKeyUp',
    'click .selected-tag': 'handleRemoveTag',
    'click .original-tag-container': 'updateSearch',
  },


  appendUrl: function(url) {
    var urlElementHtml =
        '<li><a href="' + url.get('url') + '">' + url.get('url') + '</a>' +
        '<div id=' + url.get('id') + '></div>' + '</li>';

    if (url.get('id') in this.model.get('selectedUrls')) {
      $('#selected-urls', this.el).append(urlElementHtml);
    } else {
      $('#unselected-urls', this.el).append(urlElementHtml);
    }
  },


  updateTags: function(url) {
    _.each(url.get('tags'), function(tag) {
      $('#'+url.get('id')).append('<span class="original-tag-container">'+tag+'</span> ');
    });
  },


  handleSearchKeyUp: function(e) {
    var ENTER_KEY_CODE = 13;

    if (e.keyCode == ENTER_KEY_CODE) {
      this.addSelectedTag();
    }
  },


  addSelectedTag: function() {
    var tagName = $('#search-input').val();

    // Update the model.
    this.model.addSelectedTag(tagName);

    // Clear the input.
    $('#search-input').val('');
  },


  /** Draw the newly selected tag to the view. */
  updateSelectedTagView: function(tagName) {
    $('#selected-tag-container').append(
      '<div class="selected-tag">' + tagName + '</div>'
    );
  },

  updateSearch: function(e) {
    var tagName = $(e.target).html()
    if (!(this.model.get('selectedTags')[tagName])) {
      this.model.addSelectedTag(tagName);
    }
  },


  handleRemoveTag: function(e) {
    $(e.target).fadeOut(400);
    var tagName = $(e.target).html()
    this.model.removeSelectedTag(tagName);
  },
});
