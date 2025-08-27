-- Roles

insert into roles (role_name) values 
('admin'),
('creator'),
('participant');



-- Users 
INSERT INTO users (name, role_id, email, password) VALUES
('test admin', 1, 'test@admin.com', 'test1234'),
('test user', 1, 'test@user.com', 'test1234'),
('Bob Smith', 2, 'bob@creator.com', 'test1234'),
('Charlie Brown', 3, 'charlie@user.com', 'test1234'),
('Daisy Ridley', 3, 'daisy@user.com', 'test1234'),
('Ethan Hunt', 2, 'ethan@creator.com', 'test1234');


-- Contests
INSERT INTO contests (title, description, created_by, visibility) VALUES
('DSA Challenge', 'A contest focusing on Data Structures and Algorithms', 2, 'public'),
('Frontend Sprint', 'Test your frontend development skills', 5, 'private'),
('SQL Showdown', 'A SQL-based contest for database lovers', 2, 'public');



-- Participants
INSERT INTO participants (contest_id, user_id) VALUES
(1, 3),
(1, 4),
(2, 3),
(3, 4),
(3, 3);


-- Questions
INSERT INTO questions (contest_id, type, description, marks) VALUES
(1, 'coding', 'Write a program to find the longest palindromic substring.', 20),
(1, 'mcq', 'Which data structure uses LIFO?', 5),
(2, 'coding', 'Build a responsive navbar using HTML/CSS/JS.', 15),
(2, 'mcq', 'Which HTML tag is used to define a table row?', 5),
(3, 'mcq', 'What does the SQL command `GROUP BY` do?', 5);


-- Test Cases
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(1, 'babad', 'bab', true),
(1, 'cbbd', 'bb', false),
(3, '', 'Navbar with dropdown and mobile responsive toggle', true);

-- mcqs
INSERT INTO mcqs (question_id, option_text, is_correct) VALUES
-- Q2: Which data structure uses LIFO?
(2, 'Queue', false),
(2, 'Stack', true),
(2, 'Array', false),
(2, 'LinkedList', false),

-- Q4: HTML tag for table row?
(4, '<th>', false),
(4, '<tr>', true),
(4, '<td>', false),
(4, '<table>', false),

-- Q5: GROUP BY usage
(5, 'Sorts the result set', false),
(5, 'Groups rows sharing the same value', true),
(5, 'Deletes duplicate values', false),
(5, 'Limits result set', false);



-- submissions
INSERT INTO submissions (question_id, submitted_by, code, score) VALUES
(1, 3, 'def longestPalindrome(s): ...', 18),
(3, 3, '<nav>...</nav>', 14),
(1, 4, 'function findPalindrome(str) { ... }', 10);


-- answers
INSERT INTO answers (question_id, submitted_by, option_id) VALUES
(2, 3, 6), -- Stack
(2, 4, 6), -- Stack
(4, 3, 10), -- <tr>
(5, 4, 14); -- GROUP BY

-- results
INSERT INTO results (user_id, contest_id, total_score, ranking) VALUES
(3, 1, 23, 1),
(4, 1, 15, 2),
(3, 2, 14, 1),
(4, 3, 5, 1);











