# Team Name
The Climbers

# Members

| Name | GitHub | LinkedIn |
|---|---|---|---|
| Steven Rocca    |  Product Owner | [@stevenrocca3](https://github.com/stevenrocca3) | [Steven Rocca](https://www.linkedin.com/in/steven-rocca3/)     |
| Denys Tsinyk    |   Scrum Master | [Github User Here](Github URL Here)              | [Denys Tsinyk](LinkedIn Link here)                             |
| Roger Torres    |    Developer   | [Github User Here](Github URL Here)              | [Roger Torres](LinkedIn Link here)                             |                        |
| Jayson Dang     |    Developer   | [@Zaku-Seven](https://github.com/Zaku-Seven)     | [Jayson Dang](https://www.linkedin.com/in/jbdang/)             |
| Samuel Gombiner |    Developer   | [@sgombiner](https://github.com/sgombiner)       | [Samuel Gombiner](https://www.linkedin.com/in/sam-gombiner/)   |

# Project Purpose
Help PittRec Center climbers by analyzing pictures of the climbing wall courses to display the most effective algorithm for completion.

# Build Plan
We plan to build ClimbAssist as a web app with a React and TypeScript frontend, so climbers can use it from their phone’s browser without installing anything. The backend will be in Python using FastAPI, with OpenCV for image processing and PyTorch for the hold detection model, and PostgreSQL to store accounts and climber profiles. The thing we are least sure about is whether a pretrained model can find at least 75% of holds (NFR2) on real gym photos. If it can’t, we will have to label our own wall images and fine-tune the model, which could take a big part of Sprints 3 and 4.
