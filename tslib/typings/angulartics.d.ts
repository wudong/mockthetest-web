declare module ng.angulartics {
    interface IAnalyticsService {
        pageTrack(url: string): void;
        eventTrack(event: string): void;
        eventTrack(event: string, param: IParam): void;
    }

    interface IParam {
        category?: string;
        label? :string;
    }
}