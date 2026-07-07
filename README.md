Embeera Energy
==============

Saving Together. Living Better.

Embeera Energy is a Ugandan clean-energy savings platform that helps households transition from charcoal and firewood cooking to cleaner LPG cooking through community savings groups, mobile app access, USSD access, mock mobile money savings, rewards, ambassadors, and LPG delivery tracking.

Project Overview
----------------

Many Ugandan households still depend on charcoal and firewood for cooking. Although LPG is cleaner, many low-income households cannot afford an LPG stove and cylinder upfront. Embeera Energy solves this by helping households save gradually in trusted community groups called Oluganda Circles.

Project Goal
------------

To create a simple MVP that demonstrates how a household can register, join an Oluganda Circle, save money, track progress, learn about clean cooking, request LPG delivery, earn rewards, and receive an Enkola Certificate after successful transition.

Main MVP Features
-----------------

- User registration
- Oluganda Circle group joining
- Savings dashboard
- Mock MTN MoMo payment flow
- Mock Airtel Money payment flow
- USSD menu simulation for *284*88#
- Learning and transition tracking
- Rewards system
- Enkola Certificate status
- Omukwano Ambassador referrals
- LPG delivery tracking

Technology Stack
----------------

Frontend:

- React Native

Backend:

- Node.js
- Express.js

Database:

- MySQL

Payments:

- Mock MTN MoMo flow
- Mock Airtel Money flow

USSD:

- Simulated USSD menu for *284*88#

Project Structure
-----------------

embeera-energy-mvp/
  frontend/
  backend/
  database/
  docs/
  README.md

Main User Journey
-----------------

Register  
→ Join Oluganda Circle  
→ Save Money  
→ Track Progress  
→ Learn About Clean Energy  
→ Reach LPG Savings Target  
→ Request LPG Delivery  
→ Receive LPG Equipment  
→ Receive Enkola Certificate  
→ Earn Rewards

Planned API Routes
------------------

User Routes:

- POST /api/users/register
- GET /api/users/:user_id

Group Routes:

- POST /api/groups/create
- POST /api/groups/join
- GET /api/groups/:group_id

Savings Routes:

- POST /api/savings/add
- GET /api/savings/progress/:user_id

Payment Routes:

- POST /api/payments/mock

Rewards Routes:

- GET /api/rewards/:user_id

Ambassador Routes:

- POST /api/ambassadors/referral

Delivery Routes:

- POST /api/deliveries/request
- GET /api/deliveries/:user_id

Database Tables
---------------

The MVP database includes:

- users
- oluganda_groups
- group_members
- savings_transactions
- learning_progress
- rewards
- ambassadors
- referrals
- deliveries
- certificates

Demo Scenario
-------------

A household in Mukono hears about Embeera Energy through an Omukwano Ambassador. The user registers using the mobile app or USSD code *284*88#. The user joins the Mukono Clean Cooking Oluganda Circle and saves UGX 10,000 using mock MTN MoMo.

The system updates the user's savings balance and group savings progress. The user completes clean cooking and LPG safety learning. After reaching the LPG savings target, the user requests LPG delivery. The delivery status changes from Pending to In Transit to Delivered. After delivery is completed, the household receives an Enkola Certificate and earns reward points.

Milestones
----------

M1: Project Setup and MVP Scope  
M2: User Journey and System Flow  
M3: Database Design and ERD  
M4: Backend API Development  
M5: Mobile App Interface  
M6: USSD Flow Simulation  
M7: Savings Group Feature  
M8: Mock Payment Flow  
M9: Learning and Transition Tracking  
M10: Rewards and Enkola Certificate  
M11: Ambassador Referral Feature  
M12: LPG Delivery Tracking  
M13: Testing and Debugging  
M14: Documentation and README  
M15: Final Demo and Presentation

Future Improvements
-------------------

- Real MTN MoMo API integration
- Real Airtel Money API integration
- Live USSD deployment
- SMS notifications
- Push notifications
- GPS delivery tracking
- NGO partner dashboard
- Carbon credit verification
- Admin dashboard
- Supplier dashboard

Project Status
--------------

Current phase: MVP planning, setup, and classroom demonstration preparation.