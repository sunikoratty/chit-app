---
description: How to run and use the Chits-Mobile application
---

# Chits-Mobile Workflow Guide

This guide explains how to start the application, access it, and use its features.

## 1. Starting the Application
To run the website locally for development and testing:

1.  Open your terminal in the project directory: `d:\2026-Projects\Chits-Mobile`
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  The terminal will provide a URL (usually `http://localhost:5173` or `http://localhost:5174`). Open this in your browser.

## 2. Login Credentials
For security and consistency, use the following administrator credentials to access the dashboard:

| Field | Value |
| :--- | :--- |
| **Username** | `Admin` |
| **Password** | `admin` |

## 3. Application Workflow

### Step 1: Dashboard
After logging in, you will see the **Dashboard**. 
- It lists all active and completed chits.
- Click **"Register Chit"** to create a new one.
- Click any **Chit Card** to view its specific details and calculations.

### Step 2: Chit Registration
When registering a new chit:
- Enter the **Chit Name**, **Total Amount**, and **Duration**.
- Configure the **Lucky Draws** (default 8) and **Auctions** (default 8).
- The system automatically calculates the **Estimated Final Amount** based on commission and charges.

### Step 3: Chit Details (Payments & Calculations)
Inside a specific chit, you have two tabs:

#### A. Payments Tab
- Shows a list of all monthly installments.
- Click **"Update Payment"** on any pending month.
- Enter the **Received By** name (collector) and confirm. The system will automatically record the **Entered Time** and mark it as Paid.

#### B. Calculation (Lelam) Tab
- This is where you enter the results of the monthly auction (Lelam).
- When you enter an amount in the **Auction Amount** column, the system **automatically recalculates** the current installment for that month.
- This calculation is then reflected back in the **Payments Tab**.

## 4. Mobile App Workflow
If you want to run this as a real mobile app:
1.  Open **Android Studio**.
2.  Open the `android` folder in the project.
3.  Connect your phone and press **Run**.
4.  If you change the code, run `npm run build` and `npx cap sync android` to update the mobile app.
