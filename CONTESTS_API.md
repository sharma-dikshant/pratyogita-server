# API Documentation: `/api/contests` Endpoints

---

## GET `/api/contests/all`
**Description:** Returns a list of contests, optionally filtered by user, sorted, paginated, or by visibility.

**Input:**
- Query params: `my`, `sorted`, `visibility`, `page`, `limit` (all optional)

**Output Example:**
```json
{
  "message": "sucess",
  "data": [
    {
      "CONTEST_ID": 1,
      "TITLE": "DSA Contest 1",
      "VISIBILITY": "public",
      "START_TIME": "2025-09-22 10:00:00",
      "END_TIME": "2025-09-22 12:00:00"
    },
    // ...more contests
  ]
}
```

---

## GET `/api/contests/:contestId`
**Description:** Returns basic details and questions for a specific contest.

**Input:**
- Path param: `contestId`

**Output Example:**
```json
{
  "message": "Successfully fetched contest",
  "data": {
    "contest_id": 1,
    "title": "DSA Contest 1",
    "description": "Description for contest 1",
    "questions": [
      {
        "question_id": 1,
        "type": "mcq",
        "description": "Question 1 for contest 1?",
        "marks": 1,
        "options": [
          { "mcq_id": 1, "option_text": "Option 1 for Q1" },
          // ...
        ]
      }
    ]
  }
}
```

---

## GET `/api/contests/:contestId/details`
**Description:** Returns detailed contest info, including user participation, result, and question status.

**Input:**
- Path param: `contestId`

**Output Example:**
```json
{
  "message": "success",
  "data": {
    "contest_id": 1,
    "title": "DSA Contest 1",
    "description": "Description for contest 1",
    "start_time": "2025-09-22 10:00:00",
    "end_time": "2025-09-22 12:00:00",
    "result": {
      "contest_id": 1,
      "total_score": 10,
      "ranking": 2
    },
    "questions": [
      {
        "question_id": 1,
        "type": "mcq",
        "description": "Question 1 for contest 1?",
        "marks": 1,
        "mcqs": [
          { "mcq_id": 1, "option_text": "Option 1 for Q1", "is_correct": false },
          // ...
        ],
        "marked": true,
        "selected_mcq_id": 1,
        "score": 1
      }
    ]
  }
}
```

---

## POST `/api/contests/:contestId/enroll`
**Description:** Enrolls the authenticated user in the specified contest.

**Input:**
- Path param: `contestId`
- No body required. User must be authenticated.

**Output Example:**
```json
{
  "message": "enrolled successfully with id 123",
  "data": null
}
```

---

## GET `/api/contests/:contestId/result`
**Description:** Returns the result (score, ranking, user info) for the specified contest.

**Input:**
- Path param: `contestId`

**Output Example:**
```json
{
  "message": "success",
  "data": [
    {
      "CONTEST_ID": 1,
      "RANKING": 1,
      "NAME": "Alice",
      "EMAIL": "alice@example.com",
      "TOTAL_SCORE": 10
    }
    // ...more users
  ]
}
```

---

## POST `/api/contests/:contestId/submission`
**Description:** Submits answers for the contest; calculates and stores scores for each question.

**Input Example:**
```json
{
  "userSubmissions": [
    { "mcq_id": 101, "question_id": 1 },
    { "mcq_id": 105, "question_id": 2 }
  ]
}
```
- `mcq_id`: ID of the selected option for the question.
- `question_id`: ID of the question.

**Output Example:**
```json
{
  "message": "Contest submitted successfully",
  "data": {
    "contest_id": 1,
    "total_question_attempted": 2
  }
}
```

---

## POST `/api/contests/` (Admin only)
**Description:** Creates a new contest from a CSV file (with questions and options).

**Input:**
- `multipart/form-data` with:
  - `file`: CSV file containing questions and options.
  - `title`: Contest title (string).
  - `description`: Contest description (string).
  - `visibility`: "public" or "private" (optional).

**CSV Format Example:**
```
question_no,type,description,option_1,option_2,option_3,option_4,correct_option_no,marks
1,MCQ,What is 2+2?,2,3,4,5,3,1
2,MCQ,What is the capital of France?,London,Paris,Berlin,Rome,2,1
```

**Output Example:**
```json
{
  "message": "contest created successfully",
  "data": {
    "contest_id": 5
  }
}
```

---

## PATCH `/api/contests/:contestId` (Admin only)
**Description:** Updates contest details (title, description, visibility, start/end time).

**Input Example:**
```json
{
  "title": "Updated Contest Title",
  "description": "New description",
  "visibility": "public",
  "start_time": "2025-09-22 10:00:00",
  "end_time": "2025-09-22 12:00:00"
}
```
- All fields are optional; only include those you want to update.

**Output Example:**
```json
{
  "message": "Contest updated successfully",
  "data": {
    "CONTEST_ID": 1,
    "TITLE": "Updated Contest Title",
    "DESCRIPTION": "New description",
    "VISIBILITY": "public",
    "START_TIME": "2025-09-22 10:00:00",
    "END_TIME": "2025-09-22 12:00:00"
    // ...other contest fields
  }
}
```

---

## GET `/api/contests/:contestId/evaluate` (Admin only)
**Description:** Calculates and stores contest results (scores and rankings).

**Input:**
- Path param: `contestId`

**Output Example:**
```json
{
  "message": "Results calculated successfully for contest 1",
  "data": {
    "contest_id": 1,
    "total_enroll": 10
  }
}
```

---
