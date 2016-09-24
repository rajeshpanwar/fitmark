describe('addClass', function () {
    this.timeout(100000);
    var app;
    before(function (done) {
        require('nv-app').createAppForTestCase(function (tempapp) {
            app = tempapp;
            console.log('=====her==========');
            done();
        })
    });
    it('addClass', function (done) {
        var request = {
            entityName: 'nv.classes',
            data: {
                instructor_id: '570016157b11394119a5549e',
                classRecord: {
                    class_name: 'fitness',
                    class_start_time: '4',
                    time_zone: '5:30',
                    day: '1',
                    latitude: '22.826820',
                    longitude: '78.925781',
                    duration: '2',
                    cost: 12,
                    description: 'test',
                    keywords: '',
                    limit_class_size: 12,
                    weekly_repeat: 5
                }
            }
        };
        app.call('addClass', request, function (err, result) {
            console.log(err, JSON.stringify(result));
            done();
        });
    });
    it.skip('update Class', function (done) {
        console.log();
        var request = {
            entityName: 'nv.classes',
            data: {
                instructor_id: '56f58d361ed7468d2254fdc0',
                class_id: '56fabf59003da6e10d36dd83',
                data: {
                    class_start_time: '4:30'
                }
            }
        };
        app.call('updateClass', request, function (err, result) {
            console.log(err, result);
            //done();
        });
    });
    it.skip('get All Classes', function (done) {
        var request = {
            entityName: 'nv.classes',
            data: {
                instructor_id: '570017ee9c2e80a11a28943c'
            }
        };
        app.call('getAllClasses', request, function (err, result) {
            console.log(err, '=============result=========', result.data.data);
        });
    });
    it.skip('get Attendees', function (done) {
        console.log();
        var request = {
            entityName: 'nv.classes',
            data: {
                class_id: '56fabf59003da6e10d36dd84',
                instructor_id: '56f58d361ed7468d2254fdc0'
            }
        };
        app.call('getAllAttendees', request, function (err, result) {
            console.log(err, result);
            done();
        });
    });
    it.skip('delete class', function (done) {
        var request = {
            entityName: 'nv.classes',
            data: {
                class_id: '570019342e8fde4f1b277c7a',
                instructor_id: '570017ee9c2e80a11a28943c'
            }
        };
        app.call('deleteClass', request, function (err, result) {
            console.log(err, '=======result==========', result);
        });
    });
    it.skip('delete by group id', function (done) {
        var request = {
            entityName: 'nv.classes',
            data: {
                class_group_id: '57095032ff2f82da1085a619',
                instructor_id: '570017a1b210dc721a6b48ab'
            }
        };
        app.call('deleteClassGroup', request, function (err, result) {
            console.log(result, err);
        })
    })
});