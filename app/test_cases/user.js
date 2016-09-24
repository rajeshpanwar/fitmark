var assert = require('assert');
describe('user', function () {
    this.timeout(1000000);
    var app;
    before(function (done) {
        require('nv-app').createAppForTestCase(function (tempapp) {
            app = tempapp;
            done();
        })
    });
    it('user login', function (done) {
        var request = {
            entityName: 'nv.users',
            data: {
                email: 'nitesh.jin@hippoinnovations.com',
                password: '1321232',
                role: 'gym_owner'
            }
        };

        app.call('login_new', request, function (err, result) {
            console.log(result, '========err=======', err)
        })
    })
});
