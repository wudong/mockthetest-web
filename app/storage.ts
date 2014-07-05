/// <reference path="../__all.d.ts" />

import model = require('app/model');

module storage {
    'use strict';


    export class StorageService {
        private sessionStorage : amplifyStorageTypeStore= amplify.store.sessionStorage;
        private localStorage : amplifyStorageTypeStore = amplify.store.localStorage;

        public saveQuestions(questions: model.Question[]){
            var s = JSON.stringify(questions);
            var s2 = LZString.compressToBase64(s);
            this.localStorage("questions", s2);
        }

        public getUserPromotionDone(): boolean{
            var any = this.localStorage("user_promotion");
            if (any===true)return true;
            else return false;
        }

        public setUserPromotionDone(done?: boolean){
            if (done){
                this.localStorage("user_promotion", done);
            } else
                this.localStorage("user_promotion", true);
        }

        public getQuestions(){
            var ss = this.localStorage("questions");
            if (!ss) return [];
            var s2 = LZString.decompressFromBase64(ss);
            return JSON.parse(s2);
        }

        public getQuestionLastUpdate(): Date{
            var time = this.localStorage("question_last_update");
            return this.getDate(this.localStorage, "question_last_update");
        }

        public setQuestionLastUpdate(){
            this.setDate(this.localStorage, "question_last_update");
        }

        public saveLoginUser(user: model.User){
            this.localStorage("login_user", user);
        }

        public getLoginUser(){
            var uu = this.localStorage("login_user");
            if (uu){
                return _.extend(new model.User(), uu);
            }else{
                return null;
            }
        }

        public removeLoginUser(){
            this.localStorage("login_user", null);
        }

        public saveSessionMarks(marks: model.Mark[]){
            this.sessionStorage("session_marks", marks);
        }

        public getSessionMarks(): model.Mark[]{
            return this.getSessionArray("session_marks");
        }

        public setSessionStart(){
            if (!this.sessionStorage("session_start")){
                this.setDate(this.sessionStorage, "session_start");
            }
        }

        public getMarkLastSend(){
            return this.getDate(this.sessionStorage, "mark_last_send");
        }

        public setMarkLastSend(){
            this.setDate(this.sessionStorage, "mark_last_send");
        }

        public getSessionStart(): Date{
            return this.getDate(this.sessionStorage, "session_start");
        }

        public addQuestionToReview(qid: string){
            this.addToSessionArray(qid, "session_question_to_review");
        }

        public removeQuestionFromReview(qid: string){
            this.removeFromSessionArray(qid, "session_question_to_review");
        }

        public getQuestionToReview(): string[]{
            return this.getSessionArray("session_question_to_review");
        }

        public addRecentSearch(qid: string){
            this.addToSessionArray(qid, "session_recent_search");
        }

        public removeRecentSearch(qid: string){
            this.removeFromSessionArray(qid, "session_recent_search");
        }

        public getRecentSearches(): string[]{
            return this.getSessionArray("session_recent_search");
        }

        private addToSessionArray(qid: any, key: string){
            var qs = this.sessionStorage(key);
            var ss: any[] = _.isArray(qs)?qs:[];
            if (ss.indexOf(qid) <=0){
                ss.push(qid);
                this.sessionStorage(key, ss);
            }
        }

        private removeFromSessionArray(qid: any, key: string){
            var qs = this.sessionStorage(key);
            var ss: any[] = _.isArray(qs)?qs:[];
            var ind = ss.indexOf(qid);
            if ( ind>0){
                ss.splice(ind, 1);
                this.sessionStorage(key, ss);
            }
        }

        private getSessionArray( key: string): any[]{
            var qs = this.sessionStorage(key);
            var ss: any[] = _.isArray(qs)?qs:[];
            return ss;
        }

        private getDate(storage:amplifyStorageTypeStore, key: string){
            var time = storage(key);
            if (time)
                return new Date(time);
            else
                return null;
        }

        private setDate(storage:amplifyStorageTypeStore, key: string, date?: Date){
            storage(key, (date ||new Date()).getTime());
        }
    }

}

export=storage;