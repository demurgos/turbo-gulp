module.exports = {
  config: {
    Locations: require('./config/locations')
  },
  tasks: {
    build: require('./tasks/build'),
    install: require('./tasks/install'),
    project: require('./tasks/project'),
    test: require('./tasks/test')
  }
};
