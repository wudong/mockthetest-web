/// <reference path="../../__all.d.ts" />


import service=require('app/service');
import model=require('app/model');

module info
{
    export class InfoController {
        scope:IInfoPageScope;
        testService: service.TestService;
        logger: ng.ILogService;
        location: ng.ILocationService;

        public static $inject = [
            '$scope',  '$log', '$location', 'testService'
        ];

        constructor($scope:IInfoPageScope, $log: ng.ILogService, $location: ng.ILocationService,
                    testService: service.TestService
            ) {
            this.testService = testService;
            this.logger = $log;
            this.location = $location;
            this.scope = $scope;
            this.scope.vm = this;

            this.scope.show_info = false;
            this.scope.session = this.testService.retrieveSessionInfo();
            this.scope.user = this.testService.retrieveUserProgress();
        }

        public toggle_info(){
            this.scope.show_info = !this.scope.show_info;
        }

        public uploadMarks(){
            this.testService.sendingMark((n: number)=>{
                this.testService.displayMessage("practise results has been saved: "+ n);
            });
        }

        public reset(){
            this.testService.resetQuestionFromServer();
            this.location.url(this.location.url());
        }

        public refreshContent(target?: string){
            if (!target || target==='session') {
                this.testService.updateSessionInfo();
            }

            if (!target || target==='user') {
                this.testService.updateUserInfo();
            }
        }

        public isLogin(): boolean {
            return this.testService.isLogin();
        }

        public show_session_all() {
            var sessionAllMarks = this.testService.getSessionAllMarks();
            var map = _(sessionAllMarks).map((m)=> {
                return m.question_id
            });

            this.testService.setBrowseBufferedQuestions(map);
            this.location.path("browse").search("buf");
        }
    }

    export interface IInfoPageScope extends ng.IScope {
        vm: InfoController;
        show_info: boolean;

        user: model.UserProgress;
        session: model.SessionInfo;
    }
}

export=info;