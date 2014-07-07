/// <reference path="../__all.d.ts" />

import model = require('app/model');
import storage = require('app/storage');


module service {
    'use strict';

    /**
     * This class represent the question informations that is used through out the app.
     */
    export class QuestionInfo {
        constructor(q: model.QuestionVM){
            this.question = q;
            this.mark = new model.Mark();
            this.mark.question_id = this.question.question._id;
        }
        public question: model.QuestionVM;
        public mark: model.Mark;
    }

    export class SEOInfoObject{
        private title: string = null;
        private  keywords: string[] = [];
        private  description: string = null;

        default_title = 'Life In the UK Test Real Test Questions and Practice';
        default_keywords : string[] = ['Life in the UK Test', 'Mock Exams', 'Practice Questions', 'Settlement', 'Immigration', 'Free', 'United Kingdom',
            'British', 'Naturalisation', 'Citizenship'];
        default_description: string = 'Best free web application to preparing the Life In the UK Test with practises and mock tests,' +
        ' and various information on the test itself. It keep tracks of your progress and help you preparing the test more easily.';

        private get(prop: string): any{
            if (this[prop]) return this[prop]
            else return this['default_'+prop];
        }

        private set(prop: string, value: any): any{
            this[prop]=value;
        }

        public getTitle(){
            if (this.title){
                return 'Life In the UK Test | ' + this.title;
            }else
                return this.default_title;
        }

        public getDescription(){
            return this.get('description');
        }

        public getKeywords(): string{

            var result = 'Mock Test';
            _(this.keywords).each((s)=>{
                result += ", "+s;
            })
            _(this.default_keywords).each((s)=>{
                result += ", "+s;
            })
            return result;
        }

        public setKeywords(kws: string[]){
            _(kws).each((s)=>{this.keywords.push(s)});
        }

        public setTitle(title: string){
            this.set('title', title)
        }

        public setDescription(de: string){
            this.set('description', de)
        }

        public reset(){
            this.title=null;
            this.keywords=[];
            this.description=null;
        }
    }
//
//    export interface IMessageDeliver{
//        displayMessage(message: string, type?: string, autoDismissTime?: number): void;
//    }

    //store some shared data among the controllers.
    export class TestService {

        private loginUser:model.User = null;
        private rootScope:ng.IScope;

        private questionRest:restangular.IElement;
        private markRest:restangular.IElement;
        private userRest:restangular.IElement;
        private logger:ng.ILogService;
        private interval:ng.IIntervalService;
        private rest:restangular.IService;
        private q:ng.IQService;
        //private msgDeliver:IMessageDeliver;
        private window:ng.IWindowService;

        private storage: storage.StorageService;

        //the buffered array to be used by browse with a buffer param.
        private buffer_for_browse_id:string[] = [];

        //holding the reference to the main controller.
        public mainControl:any;
        public sessionInfo: model.SessionInfo = new model.SessionInfo();
        public userInfo: model.UserProgress = new model.UserProgress();
        private seoObject: SEOInfoObject;


        //the primise tracker service. //see https://github.com/ajoslin/angular-promise-tracker

        //this will be sotred in local storage.
        private question_infos:{ [id: string]: QuestionInfo } = {};

        public static $inject = [
            '$rootScope',  'Restangular', '$log', '$interval', '$q', '$window'
        ];

        constructor($rootScope:ng.IScope, rest:restangular.IService, $log:ng.ILogService,
                    $interval:ng.IIntervalService, $q:ng.IQService, $window:ng.IWindowService) {
            this.logger = $log;
            this.rootScope = $rootScope;
            this.interval = $interval;
            this.q = $q;
            this.questionRest = rest.all("questions");
            this.markRest = rest.all("marks");
            this.userRest = rest.all("users");
            this.rest = rest;
            this.window = $window;

            this.storage = new storage.StorageService();

            this.seoObject = new SEOInfoObject();
            //while loading the question.
            (<any>$window).prerenderReady = false;

            this.initUser();
            this.initSession();


            _.defer(()=>{
                this.initializeService();
            })
        }

        public initializeService(){
            this.displayMessage("Start Initialization");

            this.initAllQuestions().then(
                //after get all the questions. update the marks.
                ()=> {
                    this.initMarks();
                    this.displayMessage("Initialization done!", 'info', 1000);
                    this.logger.debug("Initialization is done");
                }
            )

            //sending the marks automically every half miniutes.
            this.interval(()=>{
                this.updateSessionInfo();
                this.updateUserInfo();
                this.sendingMark();
                this.checkSessionTime();
                this.logger.debug("service background click");
            }, 30000);
        }

        //private promotingInShow = false;
        private checkSessionTime(){
            var sessionTime = this.getSessionTime();
            this.logger.debug("session time: " + sessionTime);
            if (!this.storage.getUserPromotionDone() && sessionTime > (1000*60*3) ){//3 mins into the session.
//                this.logger.debug("show the promoting box")
//                if (!this.storage.getUserPromotionDone()){
                  this.showUserPromotion();
//                }
            }
        }

        public showUserPromotion(){
            //display a modal window to show promotiong.
            //this.promotingInShow=true;
            var iScope: any = this.rootScope.$new(true);
            iScope.isLogin = this.isLogin();
            iScope.sessiongTime = (this.getSessionTime()/60000);

//            var setting:ng.ui.bootstrap.IModalSettings = {
//                templateUrl: 'app/user/promotion.html',
//                scope: iScope
//            };
//
//            this.modal.open(setting).result.
//                then(()=>{
//                    this.storage.setUserPromotionDone();
//                    this.logger.debug("Disable the promoting again.")
//                   // this.promotingInShow=false;
//                });
        }

        private getSessionTime(){
            var sessionStart = this.storage.getSessionStart();
            var date = new Date();
            var timeInSession =  date.getTime() -sessionStart.getTime();
            return timeInSession;
        }

        public setPrerenderDone() {
            (<any>this.window).prerenderReady = true;
            this.logger.debug("Prerender is set to ready");
        }

        private initSession() {
            //only init when the session has not started.
            //prevent manual refresh.
            if (!this.storage.getSessionStart()) {
                this.storage.setSessionStart();
                this.storage.setMarkLastSend();
            }
        }

        /**
         * get the text that has been searched recently.
         * @returns {*}
         */
        public getRecentSearch():string[] {
            return this.storage.getRecentSearches();
        }

        public addToRecentSearch(st:string) {
           this.storage.addRecentSearch(st);
        }

        public addToReview(q:model.QuestionVM) {
           this.storage.addQuestionToReview(q.question._id);
        }

        public removeFromReview(q:model.QuestionVM) {
            this.storage.removeQuestionFromReview(q.question._id);
        }

        /**
         * Show an warn message globally.
         */
        public displayMessage(message:string, type?:string, autoDismissTime?:number) {
            //TODO.
        }

        /*
        public setMessageDeliver(msgDeliver:IMessageDeliver) {
            this.logger.debug("Setting up message deliver : " + msgDeliver);
            this.msgDeliver = msgDeliver;
        }*/

        public initMarks() {
            this.logger.debug("Loading marks from session.");
            //first load the marks from session storage is there are any.
            if (this.isLogin()) {
                this.logger.debug("Loading marks for user from backend.");
                this.fetchMarkForUser().then((mm:model.Mark[])=> {
                    _(mm).each(this.updateQuestionInfoWithMark, this);
                    this.logger.debug("marks are updated from server: " + mm.length);
                }, (e)=> {
                    this.logger.warn("failed to update marks from server: " + (e || "no error msg"));
                }).finally(()=>{
                    this.restoreSessionMarks();
                    this.updateUserInfo();
                });
            } else {
                this.restoreSessionMarks();
                this.logger.debug("Marks is not updated because the user is not login yet.");
            }
        }

        private updateQuestionInfoWithMark(m:model.Mark) {
            var questionInfo = this.question_infos[m.question_id];
            if (questionInfo) {
                questionInfo.mark.updateFrom(m);
                //setting the flag.
                if (m.flag) {
                    questionInfo.question.flagged = true;
                }
            }
        }

        private initUser() {
            var loginUser = this.storage.getLoginUser();
            if (loginUser){
                this.rest.restangularizeElement(null, loginUser, "users", {});
                //set the loginUser id.
                this.loginUser = loginUser;
            }
        }

        private fetchMarkForUser():ng.IPromise<model.Mark[]> {
            var defer = this.q.defer<model.Mark[]>();

            if (this.loginUser) {
                var res:restangular.IElement = <any>  this.loginUser;
                var param = {};

//                if (this.mark_last_update) {
//                    param = _(param).extend({last_update: this.mark_last_update.toISOString()})
//                }

                res.getList('marks', param).then((marks:model.Mark[])=> {
//                    this.storage.setMarkLastUpdate();
                    defer.resolve(marks);
                }, (err)=> {
                    defer.reject(err);
                })

            } else {
                defer.reject();
            }
            return defer.promise;
        }

        //initialize the questions from both backend and the local storage.
        public initAllQuestions():ng.IPromise<void> {
            this.question_infos = {};

            var questionLastUpdate = this.storage.getQuestionLastUpdate();
            //first check local storage.
            if (!questionLastUpdate) {
                this.logger.debug("No locally stored question, loading all question from server");
                return this.retrieveQuestions(false);
            } else {
                this.logger.debug("question last update :" + questionLastUpdate);

                //temp force an update for the user.
                var s = '2014-06-05T17:00:00.033Z';
                if (questionLastUpdate.toISOString() < s){
                    this.logger.debug("Locally stored questions need to be expired for date:" +s);
                    return this.retrieveQuestions(false);
                }

                //loading the question first from the local storage.
                var questions:model.Question[];
                try {
                    questions = this.storage.getQuestions();

                    if (questions && _.isArray(questions)) {
                        this.logger.debug("Found locally stored questions: " + questions.length);
                        _(questions).each((q)=> {
                            this.rest.restangularizeElement(null, q, "questions", {});
                            this.updateQuestionInfoWithQuestion(q)
                        });
                    }else{
                        this.logger.debug("Locally stored questions canot be restored. need to force an update!");
                        return this.retrieveQuestions(false);
                    }

                    //if the update happens in the 2 day, ignore further update.
                    if (new Date().getTime() - questionLastUpdate.getTime() < 1000*60*60*24*2 ) {
                        this.logger.debug("last time updated within the day, no update will be performed.")
                        var defer = this.q.defer<void>();
                        defer.resolve();
                        return defer.promise;
                    }else{
                        this.logger.debug("Loading updated question from server.");
                        return  this.retrieveQuestions(true);
                    }
                    // }
                }
                catch (err) {
                    this.logger.debug("Error while loading question from from local storage, it will be cleaned.");
                    return  this.retrieveQuestions(false);
                }
            };
        }

        private saveQuestionToLocalStorage(){
            var allQuestion = this.getAllQuestion();
            if (allQuestion.length > 0){
                this.storage.saveQuestions(allQuestion);
                this.logger.debug("Question has been stored in localstorage: "+ allQuestion.length);
            }else{
                this.logger.debug("No question to be stored");
            }
        }

        //update the local question info map with the question.
        private updateQuestionInfoWithQuestion(q:model.Question) {
            if (q.deleted === true) {
                delete this.question_infos[q._id];
                this.logger.debug("Question is deleted: " + q._id)
            } else {
                //update the question with the new question.
                var questionVM = new model.QuestionVM(q);
                this.transformQuestion(questionVM);
                //shullfe the answer so that the answer will be in random order.
                questionVM.answers = _(questionVM.answers).shuffle();

                var questionInfo2 = this.question_infos[q._id];
                if (questionInfo2){
                    questionInfo2.question = questionVM;
                }else{
                    var questionInfo = new service.QuestionInfo(questionVM);
                    this.question_infos[q._id] = questionInfo;
                }
            }
        }

        public resetQuestionFromServer(){
          this.retrieveQuestions(false, (nu)=>{
              this.displayMessage("Initialization of Question Done! Total Question: "+ nu, 'info', 1000);
              this.restoreSessionMarks();
          });
        }

        /**
         * Load question from the backend, This is only and center place to load question.
         * all transformation will be done here.
         * @param numberOfQuestions
         */
        public retrieveQuestions(last_update:boolean, callback?:(number)=>void, numberOfQuestions?:number, skip?:number):ng.IPromise<void> {
            var param = {compress: 1};
            if (last_update) {
                var lastUpdate = this.storage.getQuestionLastUpdate();
                if (lastUpdate) {
                    param = _.extend(param, {last_update: lastUpdate.getTime()});
                    this.logger.debug(lastUpdate)
                }
            }

            if (numberOfQuestions) {
                param = _.extend(param, {limit: numberOfQuestions})

                if (skip) {
                    param = _.extend(param, {skip: skip})
                }
            }

            this.logger.debug("To load new questions with parameters: " + JSON.stringify(param));

            //should check with local storage first.
            return this.questionRest.getList(param)
                .then((qs:any[])=> {
                    //uncompress.
                    this.logger.debug("Questions retrieved from backend: " + qs.length);

                    var count: number = 0;
                    /* uncompress
                    _(qs).each((q: any)=> {
                        var qsCompress: string = q.questions;
                        var s = LZString.decompressFromBase64(qsCompress);
                        var qsArray: model.Question[] = JSON.parse(qsCompress);
                        _(qsArray).each((q1:model.Question)=>{
                            count++;
                            this.updateQuestionInfoWithQuestion(q1)
                        })
                    });*/
                    _(qs).each((q:any)=>{
                        count++;
                        this.updateQuestionInfoWithQuestion(q);
                    });

                    this.storage.setQuestionLastUpdate();

                    //save all the questions locally.
                    if (count > 0) { //if there are new changes.
                        this.saveQuestionToLocalStorage();
                    }

                    if (callback) {
                        callback(count);
                    }
                },
                (failMsg)=> {
                    this.logger.debug("Request questions from server failed: " + JSON.stringify(failMsg));
                    //return -1;
                    if (callback) {
                        callback(0);
                    }
                });
        }

        public getAllQuestionVMs(sort?:boolean):model.QuestionVM[] {
            var filterQuestionVM = this.filterQuestionVM();

            if (filterQuestionVM === null)return null;
            if (sort === true) {
                return _(filterQuestionVM).sortBy(this.calculateScoreForQuestion, this);
            } else {
                return filterQuestionVM;
            }
        }

        private getAllQuestion():model.Question[] {
            var result:model.Question[] = [];
            _(this.question_infos).each((value:any, key:string, obj:any)=> {
                var q = <QuestionInfo>value;
                if (q && q.question && q.question.question) {
                    result.push(q.question.question);
                }
            });
            return result;
        }

        public isLogin():boolean {
            return this.loginUser !== undefined && this.loginUser !== null;
        }

        public login_user(user:model.User, loadMark?:boolean) {
            this.logger.debug("user login" + user.username);
            this.loginUser = user;
            this.storage.saveLoginUser(user);

            if (loadMark === true) {
                this.initMarks();
            }
        }

        public logout_user() {
            this.loginUser = null;
            this.storage.removeLoginUser();
        }

        /**
         * Transform the question according to the question type.
         */
        public transformQuestion(q:model.QuestionVM) {
            if (q.question.type === model.QuestionType[model.QuestionType.yes_or_no]) {
                q.answers = [];

                var ans = new model.Answer();
                ans.text = 'True';
                ans.right = q.question.answer;
                q.answers.push(new model.AnswerVM(ans))

                var ans2 = new model.Answer();
                ans2.text = 'False';
                ans2.right = !q.question.answer;
                q.answers.push(new model.AnswerVM(ans2))
            }
        }

        public getQuestionsForReview() {
            var questionToReview = this.storage.getQuestionToReview();
            return this.filterQuestionVM((q)=> {
                if (q.to_review === true) return true;
                else {
                    q.to_review = (questionToReview.indexOf(q.question._id) >= 0);
                    return q.to_review;
                }
            });
        }

        public getQuestionByTag(tag:string) {
            return this.filterQuestionVM((q)=> {
                return _(q.tags).any((t:model.TagVM)=> {
                    return t.selected && t.tag === tag;
                })
            });
        }

        /**
         * Search the question with the
         * @param text
         * @returns {model.QuestionVM[]}
         */
        public searchQuestions(text:string):model.QuestionVM[] {
            return this.filterQuestionVM((q)=> {
                var questionMatch = (q.question.question && q.question.question.toLowerCase().indexOf(text.toLowerCase()) > -1);
                var answerMatch = false;

                if (q.question.answers) {
                    answerMatch = _(q.question.answers).some((a)=> {
                        return a.text.toLowerCase().indexOf(text.toLowerCase()) > -1
                    })
                }

                return questionMatch || answerMatch;
            });
        }

        /**
         * Find the questionVM that satisfy the predict.
         * it return NULL when the initilaization is not done yet.
         * @param predict
         * @returns {model.QuestionVM[]}
         */
        private filterQuestionVM(predict?:(q:model.QuestionVM)=>boolean):model.QuestionVM[] {
            if (!_.isEmpty(this.question_infos)) {
                var result:model.QuestionVM[] = [];
                _(this.question_infos).each((value:any, key:string, obj:any)=> {
                    var q = <QuestionInfo>value;
                    if (q && q.question && (predict === undefined || predict(q.question))) {
                        result.push(q.question);
                    }
                });
                return result;
            } else {
                this.logger.debug("Empty Question list, looks like the Initialization is not done yet.")
                return null;
            }
        }

        /**
         * Find the Mark that satisfy the predict.
         * @param predict
         * @returns {model.Mark[]}
         */
        private filterMark(predict?:(q:model.Mark)=>boolean):model.Mark[] {
            var result:model.Mark[] = [];
            _(this.question_infos).each((value:any, key:string, obj:any)=> {
                var q = <QuestionInfo>value;
                if (q && q.mark && (predict === undefined || predict(q.mark))) {
                    result.push(q.mark);
                }
            });
            return result;
        }

        public getSessionAllMarks():model.Mark[] {
            return this.filterMark((m)=> {
                return m.last_update > this.storage.getSessionStart();
            })
        }

        public getQuestionsToBrowseByType(type:string):model.QuestionVM[] {
            if (type === 'session-all') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.last_update > this.storage.getSessionStart();
                    })
            }
            ;

            if (type === 'session-wrong') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.last_update > this.storage.getSessionStart() && m.lastMarkedWrong();
                    })
            }
            ;


            if (type === 'session-right') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.last_update > this.storage.getSessionStart() && m.lastMarkedRight();
                    })
            }
            ;

            if (type === 'session-flag') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.last_update > this.storage.getSessionStart() && m.flag;
                    })
            }

            if (type === 'session-review') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.last_update > this.storage.getSessionStart() && (m.flag || m.lastMarkedWrong());
                    })
            }
            ;

            if (type === 'user-flag') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.flag;
                    })
            }
            ;

            if (type === 'user-review') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.flag || m.lastMarkedWrong();
                    })
            }
            ;

            if (type === 'user-been_wrong') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.beenAnsweredWrong();
                    })
            }
            ;

            if (type === 'user-not-answered') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return !m.lastMarkedRight() && !m.lastMarkedWrong();
                    })
            }
            ;

            if (type === 'user-difficult') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.isDifficult();
                    })
            }
            ;

            if (type === 'user-right') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.lastMarkedRight();
                    })
            }
            ;

            if (type === 'user-wrong') {
                return this.retrieveQuestionsByMarks(
                    (m)=> {
                        return m.lastMarkedWrong();
                    })
            }
            ;

            return [];
        }

        private retrieveQuestionsByMarks(markFilter:(m:model.Mark)=>boolean):model.QuestionVM[] {
            var filterMark = this.filterMark(markFilter);
            return _(filterMark).map((m)=> {
                return this.question_infos[m.question_id].question;
            })
        }

        public findQuestionById(id:string):model.QuestionVM[] {
            return this.filterQuestionVM((q)=> {
                return q.question._id === id;
            })
        }

        public findQuestionByIds(ids:string[]):model.QuestionVM[] {
            return this.filterQuestionVM((q)=> {
                return ids.indexOf(q.question._id) >= 0;
                ;
            })
        }

        public getLoginUser() {
            return this.loginUser;
        }

        //the score is higher the better.
        //the score is added with a normal distribution random number.
        private calculateScoreForQuestion(q:model.QuestionVM):number {
            var questionInfo = this.question_infos[q.question._id];
            var number2 = this.random();
            return questionInfo.mark.score() + number2;
        }

        private  random():number {
            var u1 = Math.random();
            var u2 = Math.random();
            var normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            return normal;
        }

        public sendingMark(callback?:(number)=>void) {
            //sending the marks to the server.
            if (this.isLogin()) {
                var uid = this.loginUser._id;
                //only sending to server the ones updated after the last send.
                var marked = this.filterMark((m:model.Mark)=> {
                    return (m.last_update && (m.last_update > this.storage.getMarkLastSend()));
                });

                //send to server.
                if (marked.length > 0) {
                    this.logger.debug("Send marks to server: " + marked.length);
                    var res:restangular.IElement = <any>  this.loginUser;
                    res.post("marks", marked).then((succ)=> {
                        this.logger.debug("post marks for user success.");
                        this.storage.setMarkLastSend();
                        if (callback) callback(marked.length);
                    })
                } else {
                    if (callback) callback(marked.length);
                    this.logger.debug("no new marks to save.");
                }
            } else {
                this.logger.debug("No login, marks is not send");
            }
        }

        public markQuestion(q:model.QuestionVM, right:boolean) {
            if (!q.answered) return;

            if (this.question_infos[q.question._id]) {
                var theMark = this.question_infos[q.question._id].mark;
                if (right === true) {
                    theMark.right(this.storage.getSessionStart());
                } else if (right === false) {
                    theMark.wrong(this.storage.getSessionStart());
                }
            }
        }

        //flag the question to be saved on server.
        public flagQuestion(q:model.QuestionVM, flag:boolean) {
            if (this.question_infos[q.question._id]) {
                var theMark = this.question_infos[q.question._id].mark;
                // prevent multiple mark on the same question..
                theMark.doFlag(flag);
            }
        }

        public reportQuestion(q:model.QuestionVM, type:model.ReportType, callback?:(boolean, string?)=>void) {
            var qm:any = q.question;
            qm.customPUT({type: model.ReportType[type]}, "report", {}, {})
                .then((succ)=> {
                    if (callback)
                        callback(true, succ);
                }, (err)=> {
                    if (callback)
                        callback(false, err);
                });
        }


        public tagQuestion(tag:string, q:model.QuestionVM, callback?:(b:boolean, s:string)=>void) {
            if (this.isLogin()) {
                this.logger.debug("To tag the question " + q.question._id +
                    " with tag : " + tag);
                var qm:any = q.question;
                qm.customPUT({tag: tag}, "tag", {user_id: this.loginUser._id}, {})
                    .then((succ)=> {
                        this.logger.debug("tag success");
                        if (callback)
                            callback(true, succ);
                    }, (err)=> {
                        this.logger.debug("tag fail");
                        if (callback)
                            callback(false, JSON.stringify(err));
                    });
            } else {
                callback(false, "Not Login");
            }
        }

        public saveQuestion(q:model.QuestionVM, callback:(boolean, string?)=>void) {
            if (this.isLogin()) {
                var qm:any = q.question;
                qm.save({user_id: this.loginUser._id})
                    .then(
                    (succ)=> {
                        callback(true);
                    }, (fail_msg)=> {
                        this.logger.warn("Saving Question fail_msg", JSON.stringify(fail_msg));
                        callback(false, fail_msg);
                    });
            } else {
                callback(false, "Not Login");
            }
        }

        public createQuestion(q:model.Question, callback:(boolean, string?)=>void) {
            if (this.isLogin()) {
                this.questionRest.post(q,
                    {user_id: this.loginUser._id})
                    .then(
                    (savedQuestion)=> {
                        this.logger.info("Question Saved");
                        this.updateQuestionInfoWithQuestion(savedQuestion);
                        callback(true);
                    }, (fail_msg)=> {
                        this.logger.warn("Saving Question fail_msg", JSON.stringify(fail_msg));
                        callback(false, fail_msg);
                    });
            } else {
                callback(false, "Not Login");
            }
        }

        public deleteQuestion(q:model.QuestionVM, callback:(boolean, string?)=>void) {
            if (this.isLogin()) {
                var qm:any = q.question;
                qm.deleted = true;
                qm.save({user_id: this.loginUser._id})
                    .then(
                    (succ)=> {
                        //remove it from the question_info.
                        delete this.question_infos[q.question._id];
                        callback(true);
                    }, (fail_msg)=> {
                        this.logger.warn("Deleting Question fail_msg: ", JSON.stringify(fail_msg));
                        callback(false, fail_msg);
                    });
            } else {
                callback(false, "Not Login");
            }
        }

        public signUp(email:string, password:string, callback?:(boolean)=>void) {
            this.userRest.post({
                username: email,
                password: password
            }).then((result:model.User)=> {
                //login in the user.
                this.logger.debug("user signup successful: " + result.username)
                callback(result);
            }, (err)=> {
                this.logger.debug("user signup failed with message: " + (err || ""))
                callback(null);
            });
        }

        public login(email:string, password:string, callback?:(any)=>void) {
            this.userRest.customPOST(
                {email: email, password: password}, 'login')
                .then((result:model.User)=> {
                    this.logger.debug("user login successful: " + result.username)
                    callback(result);
                }, (error:any)=> {
                    this.logger.debug("user login failed with message: " + (error || ""))
                    callback(null);
                });
        }

        public checkUsername(username:string, callback?:(boolean)=>void) {
            this.userRest.customGET(
                'check', {email: username})
                .then((result:string)=> {
                    if (result === 'true') {
                        callback(true)
                    } else {
                        callback(false)
                    }
                }, (error:any)=> {

                });
        }

        public saveSessionMarks(){
            var sessionStart = this.storage.getSessionStart();
            var filterMark = this.filterMark((m)=> {
                return (m.last_update) && m.last_update >sessionStart;
            });
            this.storage.saveSessionMarks(filterMark);
            this.logger.debug("Marks saved for the session: "+ filterMark ? filterMark.length: 0);
        }

        public restoreSessionMarks(){
            var sessionMarks = this.storage.getSessionMarks();
            _(sessionMarks).each((m:model.Mark)=>{
                this.updateQuestionInfoWithMark(m);
            });
            this.logger.debug("Restore Marks from Session: "+ sessionMarks ? sessionMarks.length: 0);
        }

        public updateSessionInfo(){
            var sessionInfo = this.sessionInfo;
            sessionInfo.session_start = this.storage.getSessionStart();

            var sessionMarks = this.filterMark((m)=> {
                return m.last_update && m.last_update > sessionInfo.session_start;
            });

            sessionInfo.session_question_total = sessionMarks.length;
            var flag:number = 0;
            var countBy:any = _(sessionMarks).countBy((m)=> {
                if (m.flag) flag++;

                if (m.lastMarkedRight())return 'right';
                if (m.lastMarkedWrong())return 'wrong';
                return 'flag_no_answer';
            });

            sessionInfo.session_question_answered = (countBy.right || 0) + (countBy.wrong || 0);
            sessionInfo.session_question_right = (countBy.right) || 0;
            sessionInfo.session_question_wrong = (countBy.wrong) || 0;
            sessionInfo.session_question_flagged_no_answer = countBy.flag_no_answer || 0;

            sessionInfo.session_question_flagged = flag;
            sessionInfo.session_question_to_review = this.storage.getQuestionToReview().length;
            sessionInfo.right_percent =
                (sessionInfo.session_question_answered === 0 ? 0 : (sessionInfo.session_question_right / sessionInfo.session_question_answered))
                * 100;

            return sessionInfo;
        }

        public retrieveSessionInfo():model.SessionInfo {
            this.updateSessionInfo();
            //save the marks first.
            return this.sessionInfo;
        }

        public getBrowseBufferedQuestions():model.QuestionVM[] {
            return
            _(this.buffer_for_browse_id).map((qid:string)=> {
                return this.question_infos[qid].question;
            });
        }


        public setBrowseBufferedQuestions(ids:string[]) {
            this.buffer_for_browse_id = ids;
        }

        public retrieveUserProgress():model.UserProgress {
            this.updateUserInfo();
            return this.userInfo;
        }

        public updateUserInfo(){
            if (!this.isLogin())return;

            var userProgress = this.userInfo;
            //get all the marks.
            var marks = this.filterMark((m)=> {
                return true
            });
            userProgress.total_questions = marks.length;

            var flag:number = 0;
            var review:number = 0;
            var difficult:number = 0;
            var beenWrong:number = 0;
            var countBy:any = _(marks).countBy((m:model.Mark)=> {
                var to_review = false;
                var result = 'no_answered';

                if (m.isDifficult()) {
                    difficult++;
                }
                if (m.beenAnsweredWrong()) {
                    beenWrong++;
                }

                if (m.flag) {
                    flag++;
                    to_review = true;
                }

                if (m.lastMarkedRight()) {
                    result = 'right'
                } else if (m.lastMarkedWrong()) {
                    to_review = true;
                    result = 'wrong'
                }
                ;

                if (to_review) review++;

                return result;
            });

            userProgress.total_practised = (countBy.right || 0 + countBy.wrong || 0);
            userProgress.total_flag = flag;
            userProgress.total_right = (countBy.right) || 0;
            userProgress.total_wrong = (countBy.wrong) || 0;
            userProgress.total_remain = (countBy.no_answered) || 0;

            userProgress.all_to_review = review;
            userProgress.total_difficult = difficult;
            userProgress.total_been_wrong = beenWrong;

            userProgress.right_percent = (userProgress.total_right / userProgress.total_questions ) * 100;
            userProgress.wrong_percent = (userProgress.total_wrong / userProgress.total_questions ) * 100;
            userProgress.all_percent = ((userProgress.total_right + userProgress.total_wrong) / userProgress.total_questions) * 100;

            return userProgress;

        }
    }
}
export=service;
