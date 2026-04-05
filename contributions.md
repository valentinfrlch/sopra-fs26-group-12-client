# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@sushmstr]**    | [29.03.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/94aaab3] | [Implemented cookbook page with sidebar, avatar, filter tags, recipe grid (#38 #39 #40)] | [Allows logged-in users to access their cookbook and recipes immediately after login] |
|                    | [27.03.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/d6c3ea7] | [Fixed post-login redirect to /cookbook and resolved conflicts (#80)] | [Ensures users land on their cookbook after login as per user story requirement] |
| **[@jp-schl]** | [29.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/pull/97/commits] | [Cleaned some tests regarding the user status, which isn't used anymore. The same does apply for get all users.] | [The tests need to test the current, relevant code and needed to be updated] |
|                    | [29.03.2026]   | [(https://github.com/valentinfrlch/sopra-fs26-group-12-server/pull/98/commits)] | [Testing if when logging in, a token is generated and returned] | [toke is relevant for authorization] |
|                    | [29.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/pull/99/commits] | [Test for if user doesnt exist trying to login, it throws exception (unathorized)] | [throwing exception as important information to know what is/ could be going on] |
| **[@FinnPrivateGit]** | [29.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/b7962936bfb537cac25f5a5238b83b1b5cad6aaa] | [Implemented the UI for creating a recipe as described in the dev tasks #15 and #16.] | [This is a critical feature for our WebApp and is used such that users can create and save recipes in their own cookbook.] |
| **[@FinnPrivateGit]** | [29.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/394a5abeef7d48d260184e0609a5de623c476fd0] | [Fixed some isues with the API request when creating a recipe] | [Without this change, the created recipe wouldn't get sent to the backend and it can't be added to the users list of recipes.] |
| **[@FinnPrivateGit]** | [29.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/e282741953669a1518ce021f84969ac4d9375070] | [Implemented the whole backend structure such that a recipe that a user creates in the frontend gets saved as a recipe entity to the users list of recipes for dev task #37.] | [This is a critical feature for our WebApp, because else the user wouldn't have a possibility to see past saved recipes.] |
| **[@valentinfrlch]** | [27.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/c0973792b6a895f77bc7284b45b8fbf30338ea10] | [Implement login and signup pages] | [Handles user registration and authentication (#22, #23).] |
|     | [26.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/a6900fbdae287b090f57dd7fb150f4e62e52d61b] | [Implement User class and `UserController`] | [Implement REST API endpoints to create, edit, login and logout according to REST spec (#58, #59).] |
| **[@BestAchilles]** | [29.03.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/09065a132b800f8d3446e098ce29d088e365765f] | [Wrote a test for the UserController to check if a valid login returns a HTTP 200 OK status.] | [Ensures the /users/login API endpoint works and accepts valid user inputs.] |
|     | [29.03.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/064eb0b91933b8be4ea8809c534f77130262146b] | [Added a UserController test to check if the login response contains the user ID, username and token.] | [Ensures the frontend gets the correct token and user info.] |
|     | [29.03.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/f325c4e308fe16edd2947e7329af77206a885183] | [Wrote a UserService test to check if logging in with correct credentials returns the right user.] | [Checks if the backend logic correctly finds and logs in the existing user.] |
|     | [29.03.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/5c13f0efe54840160ca47b7f207e3a4dbaa38fe4] | [Added a UserService test to verify that a completly new token is generated when a user logs in.] | [Important for system security so users get a fresh session token every time they log in.] |
---

## Contributions Week 2 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |

| **[@FinnPrivateGit]** | [05.04.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/3ed4adc169b1f126c910c5730b8d77f162bd1fc0] | [Created tests for the user Story #15 - creating events] | [Tests are critical for a working code basis and can be used to check if old code still works with new changes added.] |

| **[@FinnPrivateGit]** | [05.04.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/786a29c4efbc147f48e2fca58907ce7d0303a2d4] | [Did some bug fixes for user story #15 - creating events] | [Without these changes, the code wouldn't work according to our user storys and not as intended.] |


| **[@sushmstr]** | [03.04.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/f614de8] | [Add event detail page with ingredients list and register/participate buttons (#19 #20)] | [Created the event details page with event information and allowing user to register & join an event] |

|                    | [04.04.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/97f5ad8] | [Reduced code duplication, redundancy & complexity(nesting)] | [Helps the code meet quality benchmarks] |


| **[@githubUser3]** | [date] | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date] | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser4]** | [date] | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date] | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 3 - [Begin Date] to [End Date]

| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 4 - [Begin Date] to [End Date]

| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 5 - [Begin Date] to [End Date]

| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 6 - [Begin Date] to [End Date]

| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |


| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |

|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
