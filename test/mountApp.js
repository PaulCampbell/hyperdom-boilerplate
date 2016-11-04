const createTestDiv = require('./createTestDiv');
const App = require('../app/app');
const hyperdom = require('hyperdom');

var hyperdomAttachment;

class MountApp {
  andVisitUrl(options){
    var url = options && options.href ? options.href : undefined;

    setUrl(url);

    var div = createTestDiv();

    if (hyperdomAttachment) {
      hyperdomAttachment.remove();
    }

    hyperdomAttachment = hyperdom.append(div, new App({}));
    return this;
  }
}

function setUrl(url) {
  if (url) {
    location.hash = url.replace(/^\//, '');
  }
}

module.exports = function mountApp(api, options) {
  const mount = new MountApp(api, options);
  mount.andVisitUrl();
}

