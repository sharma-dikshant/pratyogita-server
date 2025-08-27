create database pratyogita;
use pratyogita;

---------------------------------------------- Roles ----------------------------------------------------------
create table roles (
    role_id int auto_increment primary key,
    role_name varchar(20) not null unique
);

----------------------------------------------- Users ---------------------------------------------------------
create table users (
    user_id int auto_increment primary key,
    name varchar(100) not null,
    role_id int not null,
    email varchar(100) not null, 
    password varchar(100) not null,
    created_at timestamp default current_timestamp,
    constraint fk_users_role foreign key (role_id) 
        references roles(role_id)
        on delete cascade
        on update cascade
);

---------------------------------------------- Contests -----------------------------------------------------------
create table contests (
    contest_id int auto_increment primary key,
    title varchar(200) not null,
    description text not null,
    created_by int not null,
    visibility enum('public', 'private') default 'private',
    constraint fk_contest_creator foreign key (created_by) 
        references users(user_id)
        on delete cascade
        on update cascade
);

---------------------------------------------- Participants -------------------------------------------------------
create table participants (
    contest_id int not null,
    user_id int not null,
    primary key (contest_id, user_id),
    constraint fk_participant_contest foreign key (contest_id) 
        references contests(contest_id)
        on delete cascade
        on update cascade,
    constraint fk_participant_user foreign key (user_id) 
        references users(user_id)
        on delete cascade
        on update cascade
);

----------------------------------------------- Questions ----------------------------------------------------------
create table questions (
    question_id int auto_increment primary key, 
    contest_id int not null,
    type enum('coding', 'mcq'),
    description text not null,
    marks int check(marks >= 0) default 0,
    created_at timestamp default current_timestamp,
    constraint fk_question_contest foreign key (contest_id) 
        references contests(contest_id)
        on delete cascade
        on update cascade
);

---------------------------------------------- Test_cases ---------------------------------------------------------
create table test_cases (
    test_case_id int auto_increment primary key,
    question_id int not null,
    input text not null, 
    expected_output text not null,
    is_sample boolean default false,
    constraint fk_testcase_question foreign key (question_id) 
        references questions(question_id)
        on delete cascade
        on update cascade
);

----------------------------------------------- Mcqs --------------------------------------------------------------
create table mcqs (
    mcq_id int auto_increment primary key,
    question_id int not null,
    option_text text not null,
    is_correct boolean default false,
    constraint fk_mcq_question foreign key (question_id) 
        references questions(question_id)
        on delete cascade
        on update cascade
);

------------------------------------------------ Submissions -------------------------------------------------------
create table submissions (
    submission_id int auto_increment primary key,
    question_id int not null,
    submitted_by int not null,
    code text not null,
    submitted_at timestamp default current_timestamp,
    score int default 0,
    constraint fk_submission_question foreign key (question_id) 
        references questions(question_id)
        on delete cascade
        on update cascade,
    constraint fk_submission_user foreign key (submitted_by) 
        references users(user_id)
        on delete cascade
        on update cascade
);

-------------------------------------------------- Answers ---------------------------------------------------------
create table answers (
    answer_id int auto_increment primary key,
    question_id int not null,
    submitted_by int not null,
    option_id int not null,
    submitted_at timestamp default current_timestamp,
    constraint fk_answer_question foreign key (question_id) 
        references questions(question_id)
        on delete cascade
        on update cascade,
    constraint fk_answer_user foreign key (submitted_by) 
        references users(user_id)
        on delete cascade
        on update cascade,
    constraint fk_answer_mcq foreign key (option_id) 
        references mcqs(mcq_id)
        on delete cascade
        on update cascade
);

----------------------------------------------------- Results -----------------------------------------------------
create table results (
    user_id int not null,
    contest_id int not null,
    total_score int,
    ranking int,
    primary key (user_id, contest_id),
    constraint fk_result_user foreign key (user_id) 
        references users(user_id)
        on delete cascade
        on update cascade,
    constraint fk_result_contest foreign key (contest_id) 
        references contests(contest_id)
        on delete cascade
        on update cascade
);
