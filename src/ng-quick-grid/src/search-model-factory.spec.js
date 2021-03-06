import angular from 'angular';
import 'angular-mocks';
import app from './app.js'

describe('ngQuickGrid', function() {
    var model;
    var scope;
    beforeEach(angular.mock.module('ngQuickGrid'));
    beforeEach(inject(function(SearchModel, $rootScope) {
        scope = $rootScope.$new();
        model = {
            search: new SearchModel(null, 'Name desc'),
            results: null
        };
    }));

    afterEach(function() {
        scope.$destroy();
    });

    it('should trigger a query when the model changes', function(done) {
        inject(function($rootScope, $compile, $q) {
            var q = $q.defer();
            q.reject('test');
            var weAreDone = false;

            function search(obj) {
                if (obj.model.name === 'Foo' && !weAreDone) {
                    weAreDone = true;
                    done();
                }

                return q.promise;
            }

            model.search.callback = search;
            model.search.watch(scope);
            scope.$digest();
            model.search.model.name = 'Foo';
            scope.$digest();
        });
    });

    it('should trigger a query when the filters change', function(done) {
        inject(function($rootScope, $compile, $q) {
            /* jshint sub: true */
            var q = $q.defer();
            q.reject('test');
            var weAreDone = false;

            function search(obj) {
                var filterSet = obj.filters && obj.filters.Name && obj.filters.Name.value === 'Foo';
                if (filterSet && !weAreDone) {
                    weAreDone = true;
                    done();
                }

                return q.promise;
            }

            model.search.addFilter('Name', '%', 'Fred');
            model.search.callback = search;
            model.search.watch(scope);
            scope.$digest();
            expect(model.search.filters['Name'].value).toBe('Fred');
            model.search.filters['Name'].value = 'Foo';
            scope.$digest();
        });
    });

    it('should trigger a query when the sorting changes', function(done) {
        inject(function($rootScope, $compile, $q) {
            /* jshint sub: true */
            var q = $q.defer();
            q.reject('test');
            var weAreDone = false;

            function search(obj) {
                var sortSet = obj.paging.sortBy === 'Name';
                if (sortSet && !weAreDone) {
                    weAreDone = true;
                    done();
                }

                return q.promise;
            }

            model.search.callback = search;
            model.search.watch(scope);
            scope.$digest();
            model.search.paging.sort('Name');
            scope.$digest();
        });
    });

    it('should add \'desc\' to the sort when the same sort is run twice', function(done) {
        inject(function($rootScope, $compile, $q) {
            /* jshint sub: true */
            var q = $q.defer();
            q.reject('test');
            var weAreDone = false;

            function search(obj) {
                var sortSet = obj.paging.sortBy === 'Foo desc';
                if (sortSet && !weAreDone) {
                    weAreDone = true;
                    done();
                }

                return q.promise;
            }

            model.search.callback = search;
            model.search.watch(scope);
            scope.$digest();
            model.search.paging.sort('Foo');
            model.search.paging.sort('Foo');
            scope.$digest();
        });
    });

    it('should set sort of undefined when sortby is null', function(done) {
        inject(function($rootScope, $compile, $q) {
            /* jshint sub: true */
            var q = $q.defer();
            q.reject('test');
            var weAreDone = false;

            function search(obj) {
                var sortSet = obj.paging.sortBy === undefined;
                if (sortSet && !weAreDone) {
                    weAreDone = true;
                    done();
                }

                return q.promise;
            }

            model.search.callback = search;
            model.search.watch(scope);
            scope.$digest();
            model.search.paging.sort(null);
            scope.$digest();
        });
    });

    it('should not change the pagecount when pagecount is null', function(done) {
        inject(function($rootScope, $compile, $q) {
            /* jshint sub: true */
            var q = $q.defer();

            function search() {
                q.resolve({
                    pageCount: null,
                    filterHash: 'test'
                });
                return q.promise;
            }
            model.search.pageCount.length = 27;
            model.search.addFilter('Name', '%', 'Fred');
            model.search.callback = search;
            model.search.watch(scope);
            scope.$digest();
            expect(model.search.filters['Name'].value).toBe('Fred');
            model.search.filters['Name'].value = 'Foo';
            scope.$watch(function() {
                return model.search.paging.filterHash;
            }, function() {
                expect(model.search.pageCount.length).toBe(27);
                done();
            });
            scope.$digest();
        });
    });

    it('should change the pagecount when pagecount is not value', function(done) {
        inject(function($rootScope, $compile, $q) {
            /* jshint sub: true */
            var q = $q.defer();

            function search() {
                q.resolve({
                    pageCount: 10,
                    filterHash: 'test'
                });

                //hacky
                setTimeout(function() {
                    expect(model.search.pageCount.length).toBe(10);
                    done();
                }, 500);
                return q.promise;
            }

            model.search.pageCount.length = 27;
            model.search.addFilter('Name', '%', 'Fred');
            model.search.callback = search;
            model.search.watch(scope);
            scope.$digest();
            expect(model.search.filters['Name'].value).toBe('Fred');
            model.search.filters['Name'].value = 'Foo';
            scope.$digest();
        });
    });

    it('should support serializing search model to uri querystring format', function() {
        inject(function() {
            model.search.addFilter('Foo', '=', 'Test');
            model.search.addFilter('Name', '%', 'Fred');
            var queryString = model.search.toQueryString();

            expect(queryString).toBe('filters[0].key=Foo&filters[0].value=%3DTest&filters[1].key=Name&filters[1].value=%25Fred%25&paging.pageIndex=0&paging.sortBy=Name%20desc&paging.filterHash=');
        });
    });

    it('should convert value when serializing to json', function() {
        inject(function() {
            /* jshint sub: true */
            model.search.addFilter('Name', '%', 'Fred');
            expect(model.search.filters['Name'].toJSON()).toBe('%Fred%');
        });
    });

    it('should convert contains value when serializing to json', function() {
        inject(function() {
            /* jshint sub: true */
            model.search.addFilter('Name', '%', 'Fred');
            expect(model.search.filters['Name'].toJSON()).toBe('%Fred%');
        });
    });

    it('should convert startswith value when serializing to json', function() {
        inject(function() {
            /* jshint sub: true */
            model.search.addFilter('Name', '~%', 'Fred');
            expect(model.search.filters['Name'].toJSON()).toBe('Fred%');
        });
    });

    it('should convert endswith value when serializing to json', function() {
        inject(function() {
            /* jshint sub: true */
            model.search.addFilter('Name', '%~', 'Fred');
            expect(model.search.filters['Name'].toJSON()).toBe('%Fred');
        });
    });

    it('should convert endswith value when serializing to json', function() {
        inject(function() {
            /* jshint sub: true */
            model.search.addFilter('Name', '()', ['Fred', 'Ted']);
            expect(model.search.filters['Name'].toJSON()).toBe('(Fred,Ted)');
        });
    });

    it('should convert equals value when serializing to json', function() {
        inject(function() {
            /* jshint sub: true */
            model.search.addFilter('Name', '=', 'Fred');
            expect(model.search.filters['Name'].toJSON()).toBe('=Fred');
        });
    });
});