/// <reference path="../../__all.d.ts" />

import bootstrap = ng.ui.bootstrap;

import service=require('app/service');
import model=require('app/model');
import report=require('app/practise/reportctrl');
import edit=require('app/question/editctrl');
import question=require('app/question/question');
import browse=require('app/practise/browsectrl');

module practise {

    export class IQuestionScore{
        totalQuestions: number
        correctlyAnsweredQuestions: number
        answeredQuestions: number
        passed: boolean

        public allAnswered():boolean {
            return this.totalQuestions === this.answeredQuestions;
        }
    }

    export class CommonControl {
        logger:ng.ILogService;
        testService:service.TestService;
        locationService: ng.ILocationService;
        q: ng.IQService;
        interval: ng.IIntervalService;

        constructor($log:ng.ILogService, testSrv:service.TestService,

                    $location: ng.ILocationService,
                    $q: ng.IQService, $interval: ng.IIntervalService
                    ) {
            this.testService = testSrv;
            this.logger = $log;

            this.q = $q;
            this.locationService = $location;
            this.interval = $interval;
        }

        public tagQuestion(tag: string, question: model.QuestionVM){
            this.testService.tagQuestion(tag, question,
                (success, msg)=>{
                    if (success){
                        //mark the tag to be true.
                        _(question.tags).each((t: model.TagVM)=>{
                            if (t.tag === tag){
                                t.selected = true;
                            }
                        })
                    }
            });
        }

        public updateQuestions(){
            this.testService.retrieveQuestions(true, (n: number)=>{
                if (n>=0){
                    this.testService.displayMessage(n + " questions are updated from server", "info")
                }else if (n==-1){
                    this.testService.displayMessage("Update questions from server failed")
                }
            });
        }

        /**
         * This is the main entry to get the question needed to display
         * on the page.
         * @param retrival
         */
        public retrieveQuestionForDisplay(retrival: ()=>model.QuestionVM[]
            ): ng.IPromise<model.QuestionVM[]> {

            var deferred = this.q.defer<model.QuestionVM[]>();

            var start_time = Date.now();

            var cancel=this.interval(()=> {
                    var qs = retrival();

                    //null means the result is not ready yet.
                    if (qs !== null) {
                        this.logger.debug("Question retrieved from service: " + qs.length);

                        _(qs).each((q: model.QuestionVM)=> {
                             q.reset();
                        });

                        var currentTime = Date.now() - start_time;
                        this.logger.debug("Time (milliseconds) used to retrieve questions: " + currentTime);
                        this.interval.cancel(cancel);
                        deferred.resolve(qs);
                    }else{
                        var currentTime = Date.now() - start_time;
                        if (currentTime > 20*1000){
                            this.logger.debug("Cannot found any questions, and time out");
                            this.testService.displayMessage("Cannot retrieve any question, please try to refresh the page", "warn", 6000)
                            this.interval.cancel(cancel);
                            deferred.reject();
                        }else{
                            this.logger.debug("Initialization is not ready. will retry in 300 miliseconds");
                        }
                    }
            }, 100);

            return deferred.promise
        }

        public calculateScore(qs: model.QuestionVM[]):IQuestionScore {
            var result: IQuestionScore = new IQuestionScore();
            var rightCount:number = 0;
            var answerdCount:number = 0;
            _(qs).each(
                (q:model.QuestionVM)=> {
                    if (q.success === true) {
                        rightCount++;
                    }

                    if (q.success || q.not_success) {
                        answerdCount++;
                    }
                }
            )
            result.totalQuestions = qs.length;
            result.correctlyAnsweredQuestions = rightCount;
            result.answeredQuestions = answerdCount;
            result.passed = (result.correctlyAnsweredQuestions / result.totalQuestions)
                >= model.Constance.Passing_Rate;
            return result;
        }

        public reportResult(qs: model.QuestionVM[]) {
             var result:any = _(qs).countBy(function (q:model.QuestionVM) {
                return q.success ? 'right' : 'wrong';
            });

            //preparing the result report.
            result.time_used = 10000;

            if (!result.right) result.right = 0;
            if (!result.wrong) result.wrong = 0;

            //result.mode = this.getModeString();

            //display a modal window to show the report.
            var setting:ng.ui.bootstrap.IModalSettings = {
                templateUrl: '/app/practise/report.html',
                controller: report.ResultReportController,

                //to inject this into the controller as parameter rest.
                resolve: {
                    result: () => {
                        return result;
                    }
                }
            };

//            this.modal.open(setting).result.
//                then((option:string)=> {
////                    if (option==='review'){
////                        if (this.inTestMode()) {
////                            this.review_the_test();
////                        }else if (this.inPractiseMode()){
////                            this.review_practise();
////                        }
////                    }else if (option==='another'){
////                        this.resetQuestions();
////                    }
//                });
        }


        public submitMark() {
            if (this.testService.isLogin()){

                this.testService.sendingMark((n:number)=> {
                    if (n > 0) {
                        this.testService.displayMessage(n + " questions submitted.");
                    }else{
                        this.testService.displayMessage("No new marks to be send.");
                    }
                });
            }else{
                this.testService.displayMessage("Saving mark and track history is only for registered user!");
            }
        }

        public flag(q:model.QuestionVM) {
            var qvm = <model.QuestionVM> q;
            qvm.flagged = !qvm.flagged;
            if (qvm.flagged===true){
                qvm.to_review=true;
                this.testService.addToReview(q);
            }
            this.testService.flagQuestion(qvm, qvm.flagged);
        }

        public answerIsGiven(q: model.QuestionVM){
            if (q.answered===true){
                if (q.success && !q.flagged){
                    this.testService.removeFromReview(q);
                }else if (q.not_success && !q.flagged){
                    this.testService.addToReview(q);
                }

                this.testService.markQuestion(q, q.success);
                this.testService.updateSessionInfo();
            }
        }

        /**
         * can return a promise if need to do more after
         * @param q
         * @returns {IPromise<TResult>|IPromise<undefined>}
         */
        public edit(q:model.QuestionVM): any {
            if (this.testService.isLogin()){
                //pop up.
                //display a modal window to show the report.
                var setting:ng.ui.bootstrap.IModalSettings = {
                    templateUrl: '/app/question/questionform.html',
                    controller: edit.QuestionEditController,

                    //to inject this into the controller as parameter rest.
                    resolve: {
                        question: () => {
                            return q;
                        }
                    }
                };

//                return this.modal.open(setting).result.
//                    then((option:any)=> {
//                        if (option==='save'){
//                            this.save(q);
//                        }else if (option==='delete'){
//                            this.delete(q);
//                        }else if (_.isObject(option)){
//                            if (option.operation ==='create' && option.question){
//                                this.create(option.question);
//                            }
//                        }
//                    });
            }else{
                this.testService.displayMessage("No privilege to edit question.")
            }
        }

        /**
         * This is the main entry to get the question needed to display
         * on the page.
         * @param retrival
         */
        public displayQuestionsByRetraval(retrival: ()=>model.QuestionVM[], callback: (qs:model.QuestionVM[])=>void ) : ng.IPromise<void>{
            var promise = this.retrieveQuestionForDisplay(retrival);

            var then = promise.then((qs:model.QuestionVM[])=> {
                this.logger.debug("Loading question for display success, loaded questions: " + qs.length);
                callback(qs);
            }, ()=> {
                this.logger.debug("Cannot found any questions");
                this.testService.displayMessage("Cannot retrieve any question, please try to refresh the page", "warn", 6000)
            });

            return then;
        }

        //record the
        public report(q: model.QuestionVM, type: string){
            this.logger.debug("Question of ID %s is been reported need improvement with type %s.", q.question._id, model.ReportType[type]);

            //TODO
        }

    }
}
export=practise;