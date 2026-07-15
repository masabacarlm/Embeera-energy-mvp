Embeera Energy API Routes
=========================

Purpose
-------

This document lists the backend API routes for the Embeera Energy MVP.

The backend supports user registration, Oluganda Circle group joining, savings tracking, mock mobile money payments, rewards, ambassador referrals, and LPG delivery tracking.

Base URL
--------

http://localhost:5000

1. Backend Home Route
---------------------

Method:
GET

Route:
/

Purpose:
Checks whether the backend server is running.

Expected Response:
Embeera Energy Backend is running

2. User Registration
--------------------

Method:
POST

Route:
/api/users/register

Purpose:
Registers a household user on Embeera Energy.

Sample Request Body:

{
  "full_name": "Amina Nakato",
  "phone_number": "0700000001",
  "location": "Mukono",
  "user_type": "household"
}

Expected Response:
User registered successfully

3. Join Oluganda Circle
-----------------------

Method:
POST

Route:
/api/groups/join

Purpose:
Allows a user to join an Oluganda Circle savings group.

Sample Request Body:

{
  "user_id": 1,
  "group_id": 1
}

Expected Response:
User joined Oluganda Circle successfully

4. Mock Payment
---------------

Method:
POST

Route:
/api/payments/mock

Purpose:
Simulates an MTN MoMo or Airtel Money savings transaction.

Sample Request Body:

{
  "user_id": 1,
  "group_id": 1,
  "amount": 10000,
  "payment_method": "MTN MoMo"
}

Expected Response:
Mock payment successful

5. Savings Progress
-------------------

Method:
GET

Route:
/api/savings/progress/:user_id

Example:
GET /api/savings/progress/1

Purpose:
Shows the user's savings progress toward the LPG target.

Expected Response:
- User ID
- Amount saved
- Savings target
- Progress percentage
- Remaining amount

6. Rewards
----------

Method:
GET

Route:
/api/rewards/:user_id

Example:
GET /api/rewards/1

Purpose:
Shows user reward points and Enkola Certificate status.

Expected Response:
- User ID
- Reward points
- Certificate status

7. LPG Delivery Request
-----------------------

Method:
POST

Route:
/api/deliveries/request

Purpose:
Creates an LPG stove and cylinder delivery request.

Sample Request Body:

{
  "user_id": 1,
  "group_id": 1,
  "item_name": "LPG Stove and Cylinder",
  "delivery_location": "Mukono"
}

Expected Response:
LPG delivery request created

8. Learning Progress
--------------------

Method:
POST

Route:
/api/learning/update

Purpose:
Saves a user's learning topic completion status.

Sample Request Body:

{
  "user_id": 1,
  "topic_name": "Benefits of LPG",
  "completion_status": "completed"
}

Expected Response:
Learning progress updated

9. Admin Overview
-----------------

Method:
GET

Route:
/api/admin/overview

Purpose:
Returns local MVP operating metrics for the admin overview.

Expected Response:
- Total households
- Active groups
- Total savings
- Pending deliveries
- Certificates issued
- Active ambassadors

10. Future API Routes
---------------------

These routes can be added later:

POST /api/groups/create
GET /api/groups/:group_id
POST /api/savings/add
POST /api/ambassadors/referral
GET /api/deliveries/:user_id

Conclusion
----------

These API routes support the Embeera Energy MVP by connecting users, savings groups, mock payments, learning, rewards, LPG delivery tracking, and admin overview metrics.
# Authentication and health additions

- `GET /api/health` returns application/database availability without connection details; HTTP 503 when MySQL is unavailable.
- `GET /api/auth/me` validates the bearer token and returns the current database identity.
- `PATCH /api/auth/me/password` changes the authenticated user's PIN/password. Body: `current_password`, `new_password`.

Malformed JSON returns HTTP 400. Validation, duplicate, authentication, role, and unexpected failures use HTTP 400, 409, 401, 403, and 500 respectively. Error responses never include SQL text, credentials, or stack traces.
