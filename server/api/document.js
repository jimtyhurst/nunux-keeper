var when       = require('when'),
    logger     = require('../helpers').logger,
    errors     = require('../helpers').errors,
    sanitize   = require('validator').sanitize,
    validators = require('validator').validators,
    Document   = require('../models').Document;

var checkForHex = new RegExp("^[0-9a-fA-F]{24}$");

module.exports = {
  /**
   * Get a document.
   */
  get: function(req, res, next) {
    if (!checkForHex.test(req.params.id)) {
      return next(new errors.BadRequest());
    }
    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (doc) {
        return when.resolve(doc);
      } else {
        return when.reject(new errors.NotFound('Document not found.'));
      }
    })
    .then(res.json, next);
  },

  /**
   * Search documents.
   */
  search: function(req, res, next) {
    if (!req.query.q) {
      return next(new errors.BadRequest());
    }
    Document.search(req.query.q)
    .then(function(data) {
      res.json(data);
    }, next);
  },


  /**
   * Post new document.
   */
  create: function(req, res, next) {
    // Sanitize and validate query params
    var title = sanitize(req.query.title).trim();
    title = sanitize(title).entityEncode();
    var url = req.query.url;
    if (url && !validators.isUrl(url)) {
      return next(new errors.BadRequest(e.message));
    }

    var doc = {
      title:       title,
      content:     req.rawBody,
      contentType: req.header('Content-Type'),
      link:        url,
      owner:       req.user.uid,
      files:       req.files
    };
    // Extract content
    Document.extract(doc)
    .then(function(_doc) {
      // Create document
      return Document.create(_doc);
    })
    .then(function(_doc) {
      res.status(201).json(_doc);
    }, next);
  },

  /**
   * Delete a document.
   */
  del: function(req, res, next) {
    if (!checkForHex.test(req.params.id)) {
      return next(new errors.BadRequest());
    }

    Document.findById(req.params.id).exec()
    .then(function(doc) {
      if (!doc) return when.reject(new errors.NotFound('Document not found.'));
      if (doc.owner === req.user.uid) {
        return Document.remove(doc).exec();
      } else {
        return when.reject(new errors.Forbidden());
      }
    })
    .then(function() {
      res.send(205);
    }, next);
  }
};
