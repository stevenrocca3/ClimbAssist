# E1: Route analysis
Climbers submit a photo of a climbing wall and get a step-by-step route solution.

## US1: Submit a wall image
As a climber, I want to take or upload a photo of the climbing wall so that ClimbAssist can analyze the route I want to climb.
FR: FR1
Priority: Must
MVP: yes

- [ ] The climber can take a photo with their phone camera or upload an image file from the browser.
- [ ] JPEG and PNG files up to 10 MB are accepted, and other files show an error message explaining why.
- [ ] The climber sees a preview of the image and can replace it before the analysis starts.

## US2: Detect holds in the image
As a climber, I want the system to find the holds in my photo so that I don't have to mark them myself.
FR: FR2
Priority: Must
MVP: yes

- [ ] Detected holds are outlined on the image.
- [ ] At least 75% of visible holds are detected on our labeled test set of 20 wall images (NFR2).
- [ ] If no holds are found, the climber is asked to retake the photo.

## US3: Select the route to climb
As a climber, I want to choose which route on the wall I'm climbing so that the solution only uses holds from that route.
FR: FR13
Priority: Must
MVP: yes

- [ ] Tapping a hold selects all detected holds of the same color, and the climber can tap holds to add or remove them.
- [ ] The climber can mark one or two start holds and one finish hold.
- [ ] The climber can't generate a route solution until a start hold and a finish hold are marked.

## US4: Generate a sequence of movements
As a climber, I want the system to generate a sequence of movements from start to finish so that I know one way to complete the route.
FR: FR3
Priority: Must
MVP: yes

- [ ] The sequence starts at the start holds, ends at the finish hold, and only uses holds from the selected route.
- [ ] The route solution is ready within 10 seconds on a stable connection (NFR1).
- [ ] If no sequence can be found, the climber sees a message instead of a partial result.

## US5: View the route solution step by step
As a climber, I want to see the moves as numbered steps on my photo so that I can follow them while I climb.
FR: FR4
Priority: Must
MVP: yes

- [ ] Each hold in the sequence is numbered on the image in the order it is used.
- [ ] The climber can go forward and back one move at a time, and the current move is highlighted.
- [ ] The image and the current step fit on a phone screen without scrolling sideways.

## US6: Read guidance for each movement
As a climber, I want a short description of each move so that I know which limb to move and how to position my body.
FR: FR5
Priority: Must
MVP: yes

- [ ] Every move has a description that names the limb and the target hold, like "Right hand to hold 4".
- [ ] By default, every description includes at least one body positioning tip.

## US7: Get an alternative for a specific hold
As a climber, I want to ask for a different move at a specific hold so that I have another option when a move doesn't work for me.
FR: FR6
Priority: Should
MVP: no

- [ ] The climber can pick any move and request an alternative.
- [ ] The alternative uses a different hold or a different limb, and the rest of the sequence still ends at the finish hold.
- [ ] If there is no alternative, the climber is told and the original move stays the same.

# E2: Climber profile
Climbers enter their experience and measurements so route solutions fit them.

## US8: Select my experience level
As a climber, I want to select my experience level so that the guidance matches what I already know.
FR: FR7, FR9
Priority: Should
MVP: no

- [ ] The climber can choose Beginner, Intermediate, or Advanced, and Beginner is the default.
- [ ] Beginner guidance includes a positioning tip for every move.
- [ ] Intermediate guidance shows the limb and target hold, with positioning tips available on request.
- [ ] Advanced guidance only shows the limb and target hold.

## US9: Create an account
As a climber, I want to create an account and log in so that my profile stays private and is saved for next time.
FR: FR14
Priority: Should
MVP: no

- [ ] The climber can register with an email and a password of at least 8 characters, and can log in and out.
- [ ] An email that is already registered is rejected.
- [ ] Climbers who are not logged in can still get route solutions.

## US10: Enter my height and wingspan
As a climber, I want to enter my height and wingspan so that the route solution only suggests moves I can reach.
FR: FR8, FR9
Priority: Should
MVP: no

- [ ] The climber can enter height and wingspan in cm or ft/in, and values outside 100-250 cm are rejected.
- [ ] On a test image with a known wall size, no suggested move is longer than the climber's reach.
- [ ] For logged-in climbers, the values are saved to their profile and no other climber can see them (NFR6).

# E3: Feedback
Climbers can tell us how well ClimbAssist works.

## US11: Report whether a route solution worked
As a climber, I want to report whether the route solution worked for me so that the team can improve the route suggestions.
FR: FR12
Priority: Should
MVP: no

- [ ] The climber can mark a route solution as "Completed" or "Did not complete".
- [ ] If not completed, the climber can choose the step where they got stuck.
- [ ] Reports are stored so we can calculate how many route solutions were completed (NFR3).

## US12: Send general feedback
As a climber, I want to send feedback about the app so that I can report problems or suggest improvements.
FR: FR12
Priority: Should
MVP: no

- [ ] A feedback form can be opened from any page, with or without logging in.
- [ ] Empty messages can't be submitted, and messages are limited to 1000 characters.
- [ ] The climber sees a confirmation after sending.