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
| **[@jp-schl]** | [29.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/4fa484892b6a36defcaa91aee0dad376917b5da0] | [Cleaned some tests regarding the user status, which isn't used anymore. The same does apply for get all users.] | [The tests need to test the current, relevant code and needed to be updated] |
|                    | [29.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/1bb4a335b87b57a996f9a5e39fd2e08410915e5d] | [#37 Testing if when logging in, a token is generated and returned] | [toke is relevant for authorization] |
|                    | [29.03.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/f20a9cb332e3bdfd0bd541a1e8f5acfba4526cb7] | [#95 Test for if user doesnt exist trying to login, it throws exception (unathorized)] | [throwing exception as important information to know what is/ could be going on] |
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
| **[jp-schl]** | [05.04.26] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/ca176fd8e82cb83a5acd7ca32d246fc4d5cd9c96] | [#64 Implemented the option to join and leave an event (Also edited the user entity and the dto mapper)] | [As an user i want to join and leave an event so i can handle my decision if i want to play in the event or not (anymore).] |
|                    | [05.04.26] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/fbad46572def5838f3e6100fd5a85f6330380fa5] | [Created the EventControllerTest file to have a file for testing event-specific methods.] | [It is needed to test the implemented methods of the Eventcontroller to check if everything works as expected (same as for UserController).] |
| **[@BestAchilles]** | [03.04.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/95c6b0e1445410fad675bd7fed8435e03d7c9556] | [Created the Event entity class defining the data model for events with fields like title, start time, cooking duration and participants] | [Provides the core data structure that all event-related backend and frontend features build on] |
|                    | [05.04.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/85e75ccf634fffb902411b93f8a83e98c2ba0f63] | [Created separate events overview page with routing and layout (#13)] | [Provides the dedicated entry point for the event feature as required by user story #10] |
|                    | [05.04.2026] | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/7da98ee0d067fc394238026b08c3babf60961977] | [Implemented event card component showing three emojis, title, start time, cooking duration and participant count, displayed in a feed ordered by earliest start time (right now, only mock) (#14, #18, #72)] | [Lets users compare upcoming events at a glance and decide which one to join, fulfilling the core event discovery user story] |
| **@valentinfrlch** | 05.04.2026 | https://github.com/valentinfrlch/sopra-fs26-group-12-client/pull/64/commits/f1d468c1cb00daf7305ff777250befd901c87b7c | Implements "Create Events" page | Create events page is needed to allow users to create new events (#67) |
|                    | 05.04.2026 | https://github.com/valentinfrlch/sopra-fs26-group-12-server/pull/107/commits/21eb2ceaa51cba3f8d35cb5f1a030fd02685aea4 | Implements REST endpoints to create and delete an event | REST endpoints are needed to allow users to create and delete events (#71, #73, #74) |
---

## Contributions Week 3 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@FinnPrivateGit]** | [07.04.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/2faf143ac3ce357f76b24599ff3aaab270a18be2] | [While typing the recipe title, API requests get sent to TheMealDB to get similar recipe titles with a one second debounce.] | [Mainly this is used such that users can copy existing recipes from TheMealDB and don't have to type everything themselfs. The 1sec debounce is important, because else we would have to many API request and would have to pay.] |
| **[@FinnPrivateGit]** | [07.04.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/2fd2a343d8dfd7d73229a25b5a25b449e29b41ab] | [While typing the recipe title, the suggestions that we got from TheMealDB should get shown in a dropdown menu.] | [This is important, because the user should decide himself if he wants to use the existing recipe or not (and if a similar recipe even exists)] |
| **[@sushmstr]** | [09.04.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/pull/82/commits/935b90af4234bd1c2125f77070192080e5ee291a] | [Implemented participated events page showing past participated events using time-based filtering] | [Enables users to view events they have already participated in] |
| **[@sushmstr]**  | [09.04.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/pull/82/commits/dee910025a8c694af5f870dea9774b3254a07eed] | [Implemented registered events page showing upcoming events using time-based filtering] | [Allows users to view events they have registered for in the future] |
| **[@jp-schl]** | [10.04.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/335d817699e11248f1fbafc937d0b920ed5d121f] | [#126 Added test for user data return] | [Checks if when requesting from frontend user data, if it works] |
|                    | [10.04.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/c4b66dfe87cb3da3d358f332554fa37d4b647693] | [#118 Added feature that creator of event gets automatically added to own event] | [If an user creates an event, he must be also a participant. for that i added this.] |
|                    | [10.04.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/8e3ac5abf9cbf84dbb30432c9817534ed18c2f90] | [#120 Implementation of photo upload times in backend] | [while the event is going on, there will be time slots where photos need to be uploaded. for that the time has to be managed in the backend.] |
|                    | [10.04.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/b013480a5edb792f4dd8183f6ded92aa09088b86] | [#121 Implementation for uploading photos: also new strucuture for photo submissions] | [In the event, every user needs to upload photos. for that i needed to come up with a new structure in db and a method to upload photos.] |
|                    | [12.04.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/39c8f99f08ea1cdc1db2dedcdfde03826cc2cb65] | [#124 Updated eventcontroller and tests for new structure of photo upload] | [so the db gets updated correctly some fixed are needed. also a lot of tests needed to be updated because of new structure.] |
|                    | [12.04.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/02ee06fcf5d6f157c11af2b83eb5c569b5c907ef] | [#83 For consistency with naming in backend, updated progressPhotoTimes to eventPrompt] | [Regarding future work with code, a consistent naming is important so not only me understands the code] |
| **@valentinfrlch** |  12.04.26  | https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/beb9de0a6778b241cf7c97629ea8a47d51192e71 | Pull recipe details on selection and populate fields | Makes it easier to create recipes by using existing ones |
|                    | 12.04.26  | https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/beb9de0a6778b241cf7c97629ea8a47d51192e71 | Limit suggestions to 3 | We don't want the UI to be too overwhelming |
| **[@BestAchilles]** | [10.4.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/b6cc8b019ad9461f843c896850c2e0b25491c4c6] | [Implemented dynamic event state update (UPCOMING → ONGOING → FINISHED) in EventService (#39)] | [Backend needs to calculate event's current state so the frontend can show the right UI] |
|                    | [12.04.26]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/475f845764552bfb17d04cdd10aef27984957068] | [Improved event detail page with state-based UI, getting actual data from events rather than mock data (#26, #33)] | [Users should only access the cooking interface if registered and if the event is currently ongoing] |
---

## Contributions Week 4 - [Begin Date] to [End Date]
| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@FinnPrivateGit]** | [07.04.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/2b5585b7a8a560d65d11c0dd8a0b057e2e2fb00f] | [Adding a detail page for recipes.] | [This is important such that users can see their recipes and such that we can later implement the edit recipe user story.] |
| **[@FinnPrivateGit]** | [07.04.2026]   | [https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/18fc21aa0635724166dd67c1e6f3c3e34c436435] | [Adding a homepage for our cookREAL webapp for unregistered and not logged in users.] | [This contribution is relevant, because we want that not logged in users also see a welcoming homepage of our webapp (every other page the user has to be logged in).] |
| **@valentinfrlch** | 13.04.26   | https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/29e78abec517db9c9d37a1989a6ff5b5a9aad911 | Implement the `/recipe` endpoint | So we can retrieve recipe information #113 |
|                    | 13.04.26   | https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/29e78abec517db9c9d37a1989a6ff5b5a9aad911 | Sort recipe list in chronological order (newest first) | So order is deterministic #41 |
| **[@sushmstr]** | 2026-04-17 | https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/3b9f3bc | Implemented label display and filtering UI for recipes (#42, #43) | Enables users to view recipe metadata and interactively filter recipes based on labels |
| **[@sushmstr]** | 2026-04-17 | https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/4e7a270 | Implemented recipe filtering logic and improved rendering (#87, #89) | Ensures correct filtering behavior and improves usability of the cookbook page |

| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 5 - [Begin Date] to [End Date]
| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@valentinfrlch** | 17.04.26   | https://github.com/valentinfrlch/sopra-fs26-group-12-client/commit/0bf98034da6193d8fa59f025050d56d3949c27ea | Implement frontend to change username, name, and password | So the user can update their personal information #6, #7, #8 |
|                    | 17.04.26   | https://github.com/valentinfrlch/sopra-fs26-group-12-server/commit/c1ed1e83698fd08a9ffcb715d6077e2a9773e4df | Implement endpoints for PATCH requests  | So the user can change their information #22 |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 6 - [Begin Date] to [End Date]
| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
