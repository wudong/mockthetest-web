/// <reference path="../__all.d.ts" />
import model = require('app/model');
declare module storage {
    class StorageService {
        private sessionStorage;
        private localStorage;
        public saveQuestions(questions: model.Question[]): void;
        public getUserPromotionDone(): boolean;
        public setUserPromotionDone(done?: boolean): void;
        public getQuestions(): any;
        public getQuestionLastUpdate(): Date;
        public setQuestionLastUpdate(): void;
        public saveLoginUser(user: model.User): void;
        public getLoginUser(): any;
        public removeLoginUser(): void;
        public saveSessionMarks(marks: model.Mark[]): void;
        public getSessionMarks(): model.Mark[];
        public setSessionStart(): void;
        public getMarkLastSend(): Date;
        public setMarkLastSend(): void;
        public getSessionStart(): Date;
        public addQuestionToReview(qid: string): void;
        public removeQuestionFromReview(qid: string): void;
        public getQuestionToReview(): string[];
        public addRecentSearch(qid: string): void;
        public removeRecentSearch(qid: string): void;
        public getRecentSearches(): string[];
        private addToSessionArray(qid, key);
        private removeFromSessionArray(qid, key);
        private getSessionArray(key);
        private getDate(storage, key);
        private setDate(storage, key, date?);
    }
}
export = storage;
