describe('Timekeeper', function() {
    describe('when created', function() {
        it('initializes with the given event, type, interval and onTick handler', function() {
            var expectedEvent = 'New Year!';
            var expectedType = 'texty';
            var expectedInterval = 1000 * 60;
            var expectedTickHandler = function () {}
            
            var clock = new Timekeeper({
                event: expectedEvent,
                type: expectedType,
                interval: expectedInterval,
                onTick: expectedTickHandler
            });
            
            expect(clock.event).toEqual(expectedEvent);
            expect(clock.type).toEqual(expectedType);
            expect(clock.interval).toBe(expectedInterval);
            expect(clock.onTick).toBe(expectedTickHandler);
        });
        
        it('initializes a TimeSlice with the reference and focus times', function() {
            var expectedReference = new Date(2011, 11, 1);
            var expectedFocus = new Date(2012, 0, 1);
            
            var clock = new Timekeeper({
                reference: expectedReference,
                focus: expectedFocus
            });
            
            var slice = clock.slice;
            expect(slice).not.toBeNull();
            expect(slice.reference).toEqual(expectedReference);
            expect(slice.focus).toEqual(expectedFocus);
        });

        it('initializes a ProgressTracker with "max" and "value" based on the span of the TimeSlice', function() {
            var clock = new Timekeeper({
                reference: new Date(2011, 11, 1),
                focus: new Date(2012, 0, 1)
            });
            
            var tracker = clock.tracker;
            expect(tracker).not.toBeNull();
            expect(tracker.max).toEqual(2678400000);
            expect(tracker.value()).toEqual(2678400000);
        });
    });

    describe('#tick', function() {
        
        it('sets the tracker value to the milliseconds remianing', function() {
            spyOn(Date, 'now').andReturn(new Date(2011, 11, 26));
            
            var clock = new Timekeeper({
                reference: new Date(2011, 11, 1),
                focus: new Date(2012, 0, 1)
            });
            
            var tracker = clock.tracker;
            spyOn(tracker, 'value');
            
            clock.tick();
            
            expect(tracker.value).toHaveBeenCalledWith(518400000);
        });
        
        describe('given an onTick handler', function() {
            it('calls the onTick handler', function() {
                var tickHandler = jasmine.createSpy();
                
                var clock = new Timekeeper({
                    reference: new Date(2011, 11, 1),
                    focus: new Date(2012, 0, 1),
                    onTick: tickHandler
                });
                
                clock.tick();
                
                expect(tickHandler).toHaveBeenCalled();
            });

            it('calls the onTick handler with the object as the context (this)', function() {
                var expectedEvent = 'Important event';
                
                var actualEvent = '';
                var tickHandler = function() {
                    actualEvent = this.event;
                };
                
                var clock = new Timekeeper({
                    event: expectedEvent,
                    reference: new Date(2011, 11, 1),
                    focus: new Date(2012, 0, 1),
                    onTick: tickHandler
                });
                
                clock.tick();
                
                expect(actualEvent).toEqual(expectedEvent);
            });
        });
    });

    describe('#start', function() {
        it('calls the tick function based on the interval specified at intialization', function() {
            var clock = new Timekeeper({
                reference: new Date(2011, 11, 1),
                focus: new Date(2012, 0, 1),
                interval: 150
            });
            jasmine.Clock.useMock();
            spyOn(clock, 'tick');
            
            clock.start();
            
            jasmine.Clock.tick(150);
            jasmine.Clock.tick(150);
            
            runs(function() {
                expect(clock.tick).toHaveBeenCalled();
                expect(clock.tick.callCount).toEqual(2);
            });
        });
    });
    
    describe('#toJSON', function() {        
        it('returns a JSON representation of the clock and its sub-components', function() {
            spyOn(Date, 'now').andReturn(new Date(2011, 11, 26));
            
            var expectedEvent = 'New Year!';
            var expectedType = 'texty';
            var expectedReference = new Date(2011, 11, 1);
            var expectedFocus = new Date(2012, 0, 1);

            var clock = new Timekeeper({
                event: expectedEvent,
                type: expectedType,
                reference: expectedReference,
                focus: expectedFocus
            });
            
            expect(clock.toJSON()).toEqual({
                event: expectedEvent,
                type: expectedType,
                slice: {
                    reference: expectedReference,
                    focus: expectedFocus,
                    span: 2678400000,
                    elapsed: 2160000000,
                    remaining: 518400000
                },
                tracker: {
                    min: 0,
                    max: 2678400000,
                    percent: 100,
                    value: 2678400000
                }
            });
        });
    });

    describe('#render', function() {
        var clock;
        var reference = new Date(2011, 11, 1);
        var focus = new Date(2012, 0, 1);
        
        beforeEach(function() {
            spyOn(Date, 'now').andReturn(new Date(2011, 11, 26));
            
            clock = new Timekeeper({
                event: 'An event',
                type: 'pure-text',
                reference: reference,
                focus: focus
            });
        });
        
        it('renders the given template with json representaion of the timer', function() {
            var output = clock.render('This is "{event}" as {type}');
            
            expect(output).toEqual('This is "An event" as pure-text');
        });
        
        it('renders the given template with json representaion of the slice sub-component', function() {
            var expectedOutput = 'A slice of time, from:' + reference + ' to:' + focus;
            expectedOutput += ' span:2678400000, elapsed:2160000000 and remaining:518400000';
            
            var template = 'A slice of time, from:{slice.reference} to:{slice.focus}';
            template += ' span:{slice.span}, elapsed:{slice.elapsed} and remaining:{slice.remaining}';
            
            var output = clock.render(template);
            
            expect(output).toEqual(expectedOutput);
        });
        
        it('renders the given template with json representaion of the tracker sub-component', function() {
            var expectedOutput = 'The range is 0 - 2678400000 current value is 2678400000 which is 100%';
            
            var template = 'The range is {tracker.min} - {tracker.max} current value is {tracker.value} which is {tracker.percent}%';
            
            var output = clock.render(template);
            
            expect(output).toEqual(expectedOutput);
        });
        
    });
});

describe('Timekeeper + viewModel generator', function() {

    describe('when created', function() {
        it('initializes with the given viewModel generator', function() {
            var expectedEvent = 'New Year!';
            var expectedViewModelGenerator = function () {}
            
            var clock = new Timekeeper({
                viewModel: expectedViewModelGenerator
            });
            
            expect(clock.viewModel).toBe(expectedViewModelGenerator);
        });
    });
        
    describe('#render', function() {
        it('calls the viewModel generator', function() {
            var viewModelGenerator = jasmine.createSpy();
                
            var clock = new Timekeeper({
                reference: new Date(2011, 11, 1),
                focus: new Date(2012, 0, 1),
                viewModel: viewModelGenerator
            });
            
            clock.render('');
            
            expect(viewModelGenerator).toHaveBeenCalled();
        });
        
        it('renders the given template with the json representaion provided by the viewModel generator', function() {
            spyOn(Date, 'now').andReturn(new Date(2011, 11, 26));
            
            clock = new Timekeeper({
                event: 'The new year',
                type: 'pure-text',
                reference: new Date(2011, 11, 25),
                focus: new Date(2012, 0, 1),
                viewModel: function() {
                    return {
                        event: this.event,
                        friendlyReminder: '5 days away'
                    };
                }
            });
            
            var expectedOutput = 'The new year is 5 days away!';
            
            var template = '{event} is {friendlyReminder}!';
            
            var output = clock.render(template);
            
            expect(output).toEqual(expectedOutput);
        });
    });
});
