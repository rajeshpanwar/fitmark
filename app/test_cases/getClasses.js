describe('getClasses', function () {
    this.timeout(100000);
    var app;
    before(function (done) {
        require('nv-app').createAppForTestCase(function (tempapp) {
            app = tempapp;
            console.log('=====her==========');
            done();
        })
    });

    it('get Classes', function (done) {
        var request = {
            entityName: 'nv.classes',
            data: {
                latitude: '28.5015801',
                longitude: '77.0701349',
                /*keywords: 'ghb',*/
                day: '1',
                radius: '40'
            }
        };
        app.call('getClasses', request, function (err, response) {

        });
    });
});