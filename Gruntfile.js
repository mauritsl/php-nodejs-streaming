var util = require('util');

module.exports = function(grunt) {
  var config = {
    pkg: grunt.file.readJSON('nodejs/package.json'),

    shell: {
      options: {
        stdout: true,
        stderr: true,
        failOnError: true,
        options: {
          execOptions: {
            maxBuffer: 2097152
          }
        }
      },

      downloadCredis: {
        command: [
          'mkdir -p php/lib/credis',
          'git clone https://github.com/colinmollenhour/credis.git php/lib/credis'
        ].join(' && ')
      }
    },
  };


  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['shell:downloadCredis']);
};
