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
    }, this));
  },

  addSelectedTag: function(tagName) {
    this.get('selectedTags')['tagName'] = true;
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
     }, this));
  },

  events: {
    'keyup #search-input': 'handleSearchKeyUp',
  },

  appendUrl: function(url) {
    $('ul', this.el).append(
        '<li><a href="' + url.get('url') + '">' + url.get('url') + '</a></li>');
  },

  handleSearchKeyUp: function(e) {
    var ENTER_KEY_CODE = 13;

    if (e.keyCode == ENTER_KEY_CODE) {
      this.addSelectedTag();
    }
  },

  addSelectedTag: function() {
    var currentValue = $('#search-input').val();

    // Update the model.
    this.model.addSelectedTag(currentValue);

    $('#selected-tag-container').append(
        '<div class="selected-tag">' + currentValue + '</div>'
    );

    // Clear the input.
    $('#search-input').val('');
  },
});
