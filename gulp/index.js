'use strict';
const gulp = require('gulp');
const gutil = require('gulp-util');

module.exports = function (tasks) {
    tasks.forEach(function (name) {
        const task = require('./tasks/' + name);

        // Task function only
        if (typeof task === 'function') {
            gulp.task(name, task);
            return;
        }

        // Task dependencies or task function and dependencies
        if (task instanceof Array && task.length > 0) {
            // Task function with dependencies
            if (task.length >= 2 && task[0] instanceof Array && typeof task[task.length - 1] === 'function') {
                gulp.task(name, task[0], task[task.length - 1]);
                return;
            }

            // Task dependencies only
            gulp.task(name, task);
            return;
        }

        gutil.log(gutil.colors.cyan('Task ' + name + ' is not a valid task, please fix!'));
    });

    return gulp;
};
