create database pratyogita;
use pratyogita;

show tables;
---------------------------------------------- Roles ----------------------------------------------------------
create table roles (
	role_id int auto_increment primary key,
    role_name varchar(20) not null unique
);

describe roles;

---------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------

----------------------------------------------- Users ---------------------------------------------------------
create table users (
	user_id int auto_increment primary key,
    name varchar(100) not null,
    role_id int not null,
    email varchar(100) not null, 
    password varchar(100) not null,
    created_at timestamp default current_timestamp
);

alter table users 
add constraint foreign key (role_id) references roles(role_id);
-- we can also give name to foreign key but its optional

describe users;

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

---------------------------------------------- Contests -----------------------------------------------------------
create table contests (
	contest_id int auto_increment primary key,
    title varchar(200) not null,
    description text not null,
    created_by int not null,
    visibility enum('public', "private") default 'private'
);

alter table contests 
add constraint fk_contest foreign key (created_by) references users(user_id);

describe contests;

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

---------------------------------------------- Participants -------------------------------------------------------
create table participants (
	contest_id int not null,
    user_id int not null
);

alter table participants 
add constraint foreign key (contest_id) references contests(contest_id),
add constraint foreign key (user_id) references users(user_id);

describe participants;

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

----------------------------------------------- Questions ----------------------------------------------------------

create table questions (
	question_id int auto_increment primary key, 
    contest_id int not null,
    type enum('coding', 'mcq'),
    description text,
    marks int check(marks >= 0) default 0,
    created_at timestamp default current_timestamp
);

alter table questions
add constraint foreign key (contest_id) references contests(contest_id);

describe questions;

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

---------------------------------------------- Test_cases ---------------------------------------------------------

create table test_cases (
	test_case_id int auto_increment primary key,
    question_id int,
    input text, 
    expected_output text,
    is_sample boolean default false
);

alter table test_cases 
add constraint foreign key (question_id) references questions(question_id);

describe test_cases;

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

----------------------------------------------- Mcqs --------------------------------------------------------------

create table mcqs (
	mcq_id int auto_increment primary key,
    question_id int,
    option_text text,
    is_correct boolean default false
);

alter table mcqs 
add constraint foreign key (question_id) references questions(question_id);

describe mcqs;

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

-- TODO lang  

------------------------------------------------ Submissions -------------------------------------------------------

create table submissions (
	submission_id int auto_increment primary key,
    question_id int,
    submitted_by int,
    code text,
    submitted_at timestamp default current_timestamp,
    score int default 0
);

describe submissions;

alter table submissions 
add constraint foreign key (question_id) references questions(question_id),
add constraint foreign key (submitted_by) references users(user_id);

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------- Answers ---------------------------------------------------------

create table answers (
	answer_id int auto_increment primary key,
    question_id int,
    submitted_by int,
    option_id int,
    submitted_at timestamp default current_timestamp
);

alter table answers 
add constraint foreign key (question_id) references questions(question_id),
add constraint foreign key (submitted_by) references users(user_id);

describe answers;

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------

----------------------------------------------------- Results -----------------------------------------------------

create table results (
	user_id int,
    contest_id int,
    total_score int,
    ranking int,
    foreign key (user_id) references users(user_id),
    foreign key (contest_id) references contests(contest_id)
);


describe results;

-------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------






