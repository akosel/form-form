'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['public/js/*.js', '!public/js/*min.js']
    },

    sass: {
      dist: {
        files: {
          'public/css/stylesheet.css': 'public/sass/form/form.scss',
          'public/css/font-awesome.css': 'public/sass/font-awesome/font-awesome.scss'
        }
      }
    },

    watch: {
      scripts: {
        files: ['public/js/*.js'],
        tasks: ['jshint']
      },

      stylesheets: {
        files: ['public/sass/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.registerTask('default', ['jshint', 'sass']);
};
