const App = require('./app');
const hyperdom = require('hyperdom');

hyperdom.append(document.body, new App({}));

