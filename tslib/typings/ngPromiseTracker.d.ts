/// <reference path="angularjs/angular.d.ts" />

declare module ng.promisetracker {
    interface IPromiseTrackerService {
        (): IPromiseTracker
    }

    interface IPromiseTracker {
        active(): boolean;
        tracking(): boolean;
        addPromise(promise: ng.IPromise<any>): void;
        createPromise(): ng.IPromise<any>;
    }
}