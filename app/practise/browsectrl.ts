/// <reference path="../../__all.d.ts" />

import bootstrap = ng.ui.bootstrap;

import service=require('app/service');
import model=require('app/model');
import edit=require('app/question/editctrl');
import question=require('app/question/question');
import base=require('app/practise/commonctrl');

module practise {

    export class BrowseController {
        scope:IBrowseScope;
        logger:ng.ILogService;
        testService:service.TestService;
        locationService: ng.ILocationService;
        routeParams: IBrowseRouteParam;
        base: base.CommonControl;
        anchorScroll: ng.IAnchorScrollService;
        browseMode : string;

        private _type: string;
        private _value: string;
        //realtestquestion: boolean;

        public static $inject = [
            '$scope', '$log', 'testService', '$location', '$routeParams','$q',
            '$anchorScroll',  'promiseTracker','$interval', 'type'
        ];

        constructor($scope:IBrowseScope, $log:ng.ILogService, testSrv:service.TestService,
                    $location: ng.ILocationService, $routeParams: IBrowseRouteParam,
                    $q: ng.IQService, $anchorScroll: ng.IAnchorScrollService,
                    promiseTracker: ng.promisetracker.IPromiseTrackerService,
                    $interval: ng.IIntervalService, type: string
                    ) {
            this.scope = $scope;
            this.testService = testSrv;
            this.scope.vm = this;
            this.scope.questions = [];
            this.logger = $log;
            this.locationService = $location;
            this.routeParams = $routeParams;
            this.anchorScroll = $anchorScroll;
            this.scope.loadPromiseTracker = promiseTracker();
            this.base = new base.CommonControl($log, testSrv, $location, $q, $interval);

            this.browseMode = type;
            //this.realtestquestion = real;

            this.scope.pagination = model.Constance.Number_Of_Question;

            //new CommonControl($logger, testSrv)
            this.prepareQuestionsWithRoute();

            this.scope.$on('$routeUpdate', ()=>{
                this.logger.debug("route has been updated to: " + this.locationService.absUrl());
                this.prepareQuestionsWithRoute();
            });
        }


        public questionListener : question.IQuestionListener ={
            answerClicked : (question:model.QuestionVM)=>{
                this.base.answerIsGiven(question);
            },

            tagQuestion: (tag: string, question: model.QuestionVM)=>{
                this.base.tagQuestion(tag, question);
            }
        }

        public goto_top (){
            // set the location.hash to the id of
            // the element you wish to scroll to.
            this.locationService.hash('pagination_div');
            // call $anchorScroll()
            this.anchorScroll();
        }

        private prepareQuestionsWithRoute(){
            this.logger.debug("to preparing questions for display");
            this.resetScope();

            //prepare the with the route.
            //qid is a comma separated list.
            var promise: ng.IPromise<void> = null;

            if (this.browseMode==='all'){
                this._type = 'all';
                promise= this.browse_for_all(this.routeParams.page);
            }else if (this.browseMode==='type'){
                //defined by type.
               var type = this.routeParams.type;
               var value = this.routeParams.value;
               var page = this.routeParams.page;

               this._type = type;
               this._value = value;

               if (type==='search'){
                   this.browse_by_search(value, page);
               }else if (type==='report'){
                   this.browse_by_report(value, page);
               }else if (type==='tag'){
                   this.browse_by_tag(value, page);
               }else if (type==='ids'){
                   this.browse_by_id(value);
               }
            }

            //set prerender finish.
            if (promise!==null){
                promise.then(()=>{
                    _.delay( ()=>{
                        this.testService.setPrerenderDone();
                    }, 2000)
                })
            }
        }

        private browse_by_id(ids: string){
            return this.displayQuestionsByRetraval(()=> {
                    var split = ids.split(',');
                    return this.testService.findQuestionByIds(split);
                }, 1)
        }

        private browse_by_tag(tag: string, page: string){
            return this.displayQuestionsByRetraval(()=>{
                    return this.testService.getQuestionByTag(tag);
                }, page
            )
        }

        private browse_by_report(reporttype: string, page: string){
            return this.displayQuestionsByRetraval(()=> {
                return this.testService.getQuestionsToBrowseByType(reporttype);
            }, page)

        }

        private browse_by_search(search: string, page: string){
            return this.displayQuestionsByRetraval(()=> {
                return this.testService.searchQuestions(search);
            }, page)
        }

        private browse_for_all(page: string){
            this.logger.debug("browsing for page : " + page);
            return this.displayQuestionsByRetraval(()=>{
                var allQuestionVMs = this.testService.getAllQuestionVMs(false);

                if (allQuestionVMs===null)return null
                else {
                    allQuestionVMs.sort((a, b)=>{
                        return a.question._id.localeCompare(b.question._id);
                    })
                    return allQuestionVMs;
                }
            }, page);
        }

        /**
         * Called to set the url properly in page.
         */
        public getSearchStringParam(page: number){
            //get current route
            var result = "";
            if (this.browseMode==='all'){
                result+= ("all/"+page);
            }else if (this.browseMode==='type'){
                result+=(this._type+
                    "/"+this._value +"/"+page)

            }
            return result;
//
//            var result = "?pg="+page;
//            var search:any = this.locationService.search();
//            if (search.review){
//                result = result +"&review";
//            }else if (search.st){
//                return result+"&st="+search.st;
//            }else if (search.tg){
//                return result+"&tg="+search.tg;
//            }else if (search.buf){
//                return result+"&buf="+search.buf;
//            }else
//                return result;
        }

        public search(){
            this.testService.addToRecentSearch(this.scope.search_text);
            this.toggle_display('search')
            this.locationService.path('/question-browse/search/'+this.scope.search_text);
        }

        public getRecentSearches(){
            return this.testService.getRecentSearch();
        }

        /**
         * This is the main entry to get the question needed to display
         * on the page.
         * @param retrival
         */
        private displayQuestionsByRetraval(retrival: ()=>model.QuestionVM[], page?: any ) : ng.IPromise<void>{
            this.logger.debug("To display with page number: "+ page);
            var then = this.base.displayQuestionsByRetraval(retrival, (qs:model.QuestionVM[])=> {
                this.logger.debug("Loading question for display success, question number: " + qs.length);
                this.scope.questions = qs;
                this.scope.totalQuestions = qs.length;

                //handel the pagination.
                var pageNumber = this.getTotalPagesNumber();
                this.scope.total_page = pageNumber;
                this.scope.page_index = [];

                for (var index = 0; index < pageNumber; index++) {
                    this.scope.page_index.push(index + 1);
                }

                if (pageNumber > 1) {
                    var pp : any= (page) || 1;
                    if (_.isString(pp)) {
                        pp = parseInt(pp);
                    }
                    this.setUpPageQuestions(pp);
                } else {
                    this.scope.page_questions = _.union(this.scope.questions);
                }
            });

            this.scope.loadPromiseTracker.addPromise(then);
            return then;
        }

        private setUpPageQuestions(page: number){
            //number of question per page.
            if (page <=0 || page > this.scope.total_page){
                this.logger.debug("page requested is out of range: "+ page);
                page = 1;
            }

            var questionPerPage  = this.scope.pagination || 0;
            if (questionPerPage===0){
                this.logger.warn("the pagination is not set.")
                return;
            }

            this.scope.page_questions = [];
            var start = (page-1) * questionPerPage;
            var end = Math.min(start + questionPerPage, this.scope.questions.length);
            for (var index = start; index<end ; index++){
                this.scope.page_questions.push(this.scope.questions[index]);
            }
            this.scope.current_page = page;
            this.logger.debug("set the current page to: "+page);
        }

        /**
         * determine how many pages based on the pagination and total number.
         */
        private getTotalPagesNumber() : number {
            var questionPerPage  = this.scope.pagination || 0;
            var totalNumer = this.scope.totalQuestions;
            if (questionPerPage===0) return 1;
            else{
                var v =  totalNumer / questionPerPage;
                return Math.ceil(v);
            }
        }

        public submitMark() {
            this.base.submitMark();
        }

        public toggle_display(name: string){
            var prop = name + "_collapse";
            this.scope[prop] = !this.scope[prop];
        }

        public displayHelp(){

        }

        //reset the scope to its initial state.
        private resetScope() {
            this.scope.search_collapse=true;
            this.scope.current_page = 1;
            this.scope.page_index = [];
            this.scope.total_page = 1;
            this.scope.questions = [];
            this.scope.page_questions = [];
        }
    }

    export interface  IBrowseRouteParam extends ng.route.IRouteParamsService {
        page: string;
        type: string;
        value: string;
    }

    /**
     * The View Model object
     */
    export interface IBrowseScope extends ng.IScope {
        vm: BrowseController;
        questions: model.QuestionVM[];
        page_questions: model.QuestionVM[];

        //1 based page index.
        current_page: number;
        //1 based.
        page_index: number[];
        total_page: number;

        //score: base.IQuestionScore;

        search_text: string;
        search_collapse: boolean;
        pagination: number;
        totalQuestions: number;

        loadPromiseTracker: ng.promisetracker.IPromiseTracker;
    }

}
export=practise;