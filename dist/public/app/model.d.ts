/// <reference path="../__all.d.ts" />
declare module model {
    class ModelClass {
        public _id: string;
    }
    class Constance {
        static Number_Of_Question: number;
        static Passing_Rate: number;
        static EventType_EditQuestion: string;
    }
    enum MODE {
        practise = 0,
        test = 1,
        review = 2,
    }
    enum Tag {
        history = 0,
        culture = 1,
        government = 2,
        society = 3,
        law = 4,
        real_test_question = 5,
    }
    enum ReportType {
        duplicate = 0,
        wrong = 1,
        format = 2,
    }
    enum QuestionType {
        yes_or_no = 0,
        right_or_wrong = 1,
        single = 2,
        multi = 3,
    }
    class Question extends ModelClass {
        public question: string;
        public type: string;
        public explanation: string;
        public difficulty: number;
        public category: string;
        public answers: Answer[];
        public answer: boolean;
        public deleted: boolean;
        public tags: string[];
    }
    class Answer {
        public text: string;
        public right: boolean;
    }
    class Mark extends ModelClass {
        public question_id: string;
        public user_id: string;
        public last_update: Date;
        public flag: boolean;
        private answered_right;
        private answered_wrong;
        public updateFrom(m: Mark): void;
        public beenAnsweredWrong(): boolean;
        public lastMarkedRight(): boolean;
        public lastMarkedWrong(): boolean;
        private _do_mark(prop, prop_oppo, sessionStart);
        public doFlag(f: boolean): void;
        public right(sessionStart: Date): void;
        public wrong(sessionStart: Date): void;
        public isDifficult(): boolean;
        public score(): number;
    }
    class MarkRecord {
        public repeat: number;
        public last_update: Date;
        public previous_update: Date;
        constructor();
        public increase(): void;
        public restore(): void;
    }
    class User extends ModelClass {
        public username: string;
        public _id: string;
    }
    class TagVM {
        public tag: string;
        public selected: boolean;
    }
    class QuestionVM {
        public question: Question;
        public answers: AnswerVM[];
        public tags: TagVM[];
        public questionText: string;
        constructor(q: Question);
        public success: boolean;
        public not_success: boolean;
        public flagged: boolean;
        public current: boolean;
        public explained: boolean;
        public answered: boolean;
        public to_review: boolean;
        public questionAnsweredCorrectly(): boolean;
        public reset(): void;
        public answerClicked: (ans: AnswerVM) => void;
    }
    class AnswerVM {
        public answer: Answer;
        constructor(a: Answer);
        public selected: boolean;
    }
    class SessionInfo {
        public session_start: Date;
        public session_time: number;
        public session_question_total: number;
        public session_question_answered: number;
        public session_question_to_review: number;
        public session_question_flagged: number;
        public session_question_right: number;
        public session_question_wrong: number;
        public right_percent: number;
        public session_question_flagged_no_answer: number;
    }
    class UserProgress {
        public total_time: number;
        public total_questions: number;
        public total_practised: number;
        public total_right: number;
        public total_wrong: number;
        public total_been_wrong: number;
        public total_difficult: number;
        public total_flag: number;
        public total_remain: number;
        public all_to_review: number;
        public right_percent: number;
        public wrong_percent: number;
        public all_percent: number;
    }
}
export = model;
