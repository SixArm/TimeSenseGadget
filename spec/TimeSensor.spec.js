describe('TimeSensor', function() {
    describe('when created', function() {
        it('initializes with the given values for the sensor', function() {
            var expectedADate = new Date(2011, 11, 30);
            var expectedBDate = new Date(2012, 0, 1);
            var expectedFocus = 'New year!';
            
            var sensor = new TimeSensor({
                focus: expectedFocus,
                a: expectedADate,
                b: expectedBDate
            });
            
            expect(sensor.focus).toEqual(expectedFocus);
            expect(sensor.a).toEqual(expectedADate);
            expect(sensor.b).toEqual(expectedBDate);
        });

        it('initializes the tracker "max" to the milliseconds difference between a and b', function() {
            var sensor = new TimeSensor({
                a: new Date(2011, 0, 1),
                b: new Date(2011, 0, 30)
            });
            
            expect(sensor.tracker.max).toEqual(2505600000);
        });
    });

    describe('#tick', function() {        
        it('sets the tracker value to the number of milliseconds elapsed so far', function() {
            spyOn(Date, 'now').andReturn(new Date(2011, 11, 26));
            
            var sensor = new TimeSensor({
                a: new Date(2011, 11, 1),
                b: new Date(2012, 0, 1)
            });
            var tracker = sensor.tracker;
            spyOn(tracker, 'value');
            
            sensor.tick();
            
            expect(tracker.value).toHaveBeenCalledWith(518400000);
        });
    });

    describe('#toJSON', function() {        
        it('returns a JSON representation of the sensor and the tracker it uses', function() {
            var expectedFocus = 'New year!';
            var expectedADate = new Date(2011, 11, 1);
            var expectedBDate = new Date(2012, 0, 1);
            var sensor = new TimeSensor({
                focus: expectedFocus,
                a: expectedADate,
                b: expectedBDate
            });
            
            spyOn(Date, 'now').andReturn(new Date(2011, 11, 26));
            sensor.tick();
            
            expect(sensor.toJSON()).toEqual({
                params: {
                    focus: expectedFocus,
                    a: expectedADate,
                    b: expectedBDate
                },
                tracker: {
                    min: 0,
                    max: 2678400000,
                    percent: 20,
                    value: 518400000
                }
            });
        });
    });
});