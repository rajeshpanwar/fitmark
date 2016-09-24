describe('book class', function () {
    this.timeout(100000);
    var app;
    before(function (done) {
        require('nv-app').createAppForTestCase(function (tempapp) {
            app = tempapp;
            console.log('=====her==========');
            done();
        })
    });

    it('book Classes', function (done) {
        var request = {
            entityName: 'nv.classes',
            data: {
                class_id: '5716fdc61636db6c0c5d30d9',
                class_group_id: '5716fdc61636db6c0c5d30d8',
                user_id: '570017a1b210dc721a6b48ab',
                isRepeat:true
            }
        };
        app.call('bookClass', request, function (err, response) {
            console.log(response.data.data);
        });
    });
});