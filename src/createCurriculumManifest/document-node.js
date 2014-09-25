var through2 = require('through2');
var gutil = require('gulp-util');

var Q = require('q');

var _ = require('lodash');
var BeautifyHTML = require('js-beautify').html;

var createDOM = require('../create-dom');


/**
 * Initializes DocumentNode and creates tree with root and children
 * @param {Object} options {element, root?, parent?}
 */
var DocumentNode = function(options) {
    // Assigns element, other options and defaults
    _.assign(this, options);

    this.type = this.element.tagName.toLowerCase();

    // Initializes root
    if (_.isEmpty(this.parent)) {
        this.root = this;
    }

    var self = this;
    var promise = Q.all([
        Q.all(this.setChildren()),
        Q.all(
            _.map(this.operators, function(fn) {
                return fn(self);
            })
        )
    ]).then(_.constant(self));

    this.getPromise = _.constant(promise);
};


/**
 * Returns element > content when present, an idiosyncrasy of the root node
 * Otherwise returns element
 *
 * TODO legacy, remove
 *
 * @return {[type]} [description]
 */
DocumentNode.prototype.get$contentElement = function() {
    var $element = this.root.$(this.element);
    var $content = $element.children('content');
    return $content.size() === 0 ? $element : $content;
};


/* Returns array of promises for every child */
DocumentNode.prototype.setChildren = function() {
    var self = this;
    var children = this.get$contentElement().children().not('intro').toArray();
    // Creates node for each child element
    this.children = _( children )
        .map(function (element) {
            return new DocumentNode({
                root: self.root,
                parent: self,
                element: element
            });
        })
    .value();

    return _.map(this.children, function(child) {
        return child.getPromise();
    });
}

DocumentNode.prototype.toJSON = function() {
    var self = this;
    var obj = _(this)
        .omit('element', 'parent', 'root')
        .omit(function(value, key){
            return !_.has(self, key);
        })
    .value();

    obj.parent = this.parent ? this.parent.uuid : null;
    if (_.isEmpty(obj.children))
        obj.children = null;

    return obj;
};

var buildTree = module.exports = function(file, operators){
    var xmlStr = file.contents.toString('utf8');
    var $ = createDOM(xmlStr);

    DocumentNode.prototype.operators = operators || [function() {}];

    var doc = new DocumentNode({
        "$": $,
        "element": $("course")[0]
    });

    return doc.getPromise();
};
