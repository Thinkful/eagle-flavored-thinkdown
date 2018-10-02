const _ = require('lodash');
const gutil = require('gulp-util');

const { getIframe } = require('../utils');

const codepenChain = ($, el) => {
  const source =
    `//codepen.io/team/thinkful/embed/` +
    `${$(el).attr('source')}?height="440"&theme-id=9607`;

  const codepenIframe = getIframe(source, 444);

  $(el).replaceWith($.parseHTML(codepenIframe));
};

module.exports = $ => {
  _.chain($('codepen[source]')).each(el => codepenChain($, el));

  const rogueCodepen = $('codepen').first();

  if (rogueCodepen.length) {
    gutil.log(
      `Warning: There seems to be a rogue codepen tag: ${rogueCodepen}`
    );
  }
};