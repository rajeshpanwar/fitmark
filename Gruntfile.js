module.exports = function (grunt) {
    grunt.registerTask('deploy', function (n) {
        grunt.task.run('pull', 'npmInstall', 'pm2Reload');
    });
    grunt.registerTask('pull', 'git pull into main directory', function () {
        var exec = require('child_process').exec;
        var done = this.async();
        var cmd = 'git pull ';
        exec(cmd, function (error, stdout, stderr) {
            if (!error) {
                console.log(stdout);
                console.log(stderr);
                done();
            }
            else {
                console.log(error);
            }
        })
    });
    grunt.registerTask('npmInstall', function () {
        var exec = require('child_process').exec;
        var done = this.async();
        var cmd = 'sudo npm install';
        exec(cmd, function (error, stdout, stderr) {
            if (!error) {
                console.log(stdout);
                console.log(stderr);
                done();
            }
            else {
                console.log(error);
            }
        })
    });

    grunt.registerTask('pm2Reload', function () {
        var exec = require('child_process').exec;
        var done = this.async();
        var cmd = 'pm2 restart all';
        exec(cmd, function (error, stdout, stderr) {
            if (!error) {
                console.log(stdout);
                console.log(stderr);
                done();
            }
            else {
                console.log(error);
            }
        })
    });
};