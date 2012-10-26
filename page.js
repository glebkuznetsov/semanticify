/** The entire page. */


/** Stores the state of the entire page. */
semanticify.Page = Backbone.Model.extend({
  defaults: {
    'selectedTags': {},
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

      // Make all the tags selected.
      _.each(rawUrlObj.tags, _.bind(function(tagName) {
        this.addSelectedTag(tagName);
      }, this));
    }, this));
  },

  addSelectedTag: function(tagName) {
    this.get('selectedTags')[tagName] = true;
  },
});


/** Updates the view of the page based on the model. */
semanticify.PageView = Backbone.View.extend({
  el: '#container',


  initialize: function() {
    this.render();
  },


  render: function() {
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
  },


  appendUrl: function(url) {
    $('ul', this.el).append(
        '<li><a href="' + url.get('url') + '">' + url.get('url') + '</a>' +
        '<div id=' + url.get('id') + '></div>' + '</li>');

  },


  updateTags: function(url) {
    console.log('updateTags: '+url.get('url'));
    _.each(url.get('tags'), function(tag) {
      console.log(url.get('id'));
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

    // Update the view.
    this.updateSelectedTagView(tagName);

    // Clear the input.
    $('#search-input').val('');
  },


  /** Draw the newly selected tag to the view. */
  updateSelectedTagView: function(tagName) {
    $('#selected-tag-container').append(
        '<div class="selected-tag">' + tagName + '</div>'
    );
  }
});
