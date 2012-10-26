/** The entire page. */


/** Stores the state of the entire page. */
semanticify.Page = Backbone.Model.extend({
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
  },

  appendUrl: function(url) {
    console.log(url.get('url'));
    $('ul', this.el).append(
        '<li><a href="' + url.get('url') + '">' + url.get('url') + '</a>' +
        '<div id=' + url.get('id') + '></div>' + '</li>');
  },

  updateTags: function(url) {
    console.log('updateTags: '+url.get('url'));
    _.each(url.get('tags'), function(tag) {
      console.log(url.get('id'));
      $('#'+url.get('id')).append(tag+' ');
    });
  }
});
