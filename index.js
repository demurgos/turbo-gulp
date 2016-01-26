module.exports = {
  config: {
    Locations: require('./src/core/config/locations')
  },
  tasks: {
    build: require('./src/core/tasks/build'),
    install: require('./src/core/tasks/install'),
    project: require('./src/core/tasks/project'),
    test: require('./src/core/tasks/test')
  }
};
