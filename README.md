# Order Management Dashboard

A React + Supabase dashboard for managing customer orders.

This project was created to support a small business in northern Israel that was affected by the war. The business previously handled many orders through a messy, manual process, and this dashboard helps move that workflow into a clearer digital system with better visibility, fewer manual steps, and easier order review.

## What The System Does

The dashboard is part of a practical automation flow:

1. Make receives or processes incoming order emails.
2. AI extraction identifies structured order details from the email or attachment content.
3. Make sends the structured order data into Supabase.
4. The React dashboard displays the saved orders.
5. Users review orders, edit details, update statuses, and manage order information.
6. AI confidence and missing field indicators help identify orders that may need manual review.

## Main Features

- Order list
- Order details modal
- Customer details
- Delivery address
- Order items and products
- Status management
- Manual review workflow
- AI confidence indication
- Missing fields indication
- Product editing
- Supabase integration
- Make automation integration

## Tech Stack

- React
- Vite
- Supabase
- Make automation
- OpenAI / AI extraction as part of the upstream automation flow

## Environment Variables

Create a local environment file for frontend configuration and provide the public Supabase values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Only public frontend variables should be used in the React app. Do not add real values to this README.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Security Notes

- The frontend should use only the Supabase anon key.
- Sensitive database access should be protected with Supabase Row Level Security policies.
- Make webhooks should be protected separately with a secret or token.
- Secrets should not be committed to the repository.
- Supabase service role keys must never be used in frontend code.

## Project Purpose

The goal of this project is to reduce manual order-handling work, improve visibility into incoming orders, and help the business operate more efficiently during recovery. It is designed as a practical internal tool for reviewing and managing orders that arrive through an automated email-to-database workflow.
