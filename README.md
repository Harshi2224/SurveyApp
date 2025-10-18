# SurveyApp
A role-based survey web application built using React, Firebase Firestore, and Tailwind CSS.
This project allows admins to create and analyze surveys, while users can log in to fill out surveys assigned to them.

Features 

1)Email and Password-based authentication using Firebase Auth
Role-based login & signup:
Admin: Can create surveys and view response analytics.
User: Can fill out available surveys.

2)Admin Features
Dashboard (default tab): Displays key survey statistics.
Shows the latest 10 responses submitted by users.
Create Survey tab: Allows creation of custom surveys.
Supports multiple question types (text, multiple choice, etc.)
Automatically saves surveys to Firebase Firestore.
Surveys created by an admin are visible only to users.

3)User Features
Users can view and respond to all available surveys.
Responses are saved securely in Firestore.
User-friendly UI built with Tailwind CSS.
