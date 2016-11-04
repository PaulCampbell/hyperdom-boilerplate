module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['browserify',  'mocha'],
    files: [
      'test/**/*Spec.js',
    ],
    preprocessors: {
      'test/**/*.js': ['browserify']
    },
    browserify: {
      debug: true,
      extensions: ['.jsx'],
      transform: ['babelify', 'brfs'],
    },
    urlRoot: '/karma/',
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};

