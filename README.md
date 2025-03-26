# Netlify Edge Function Webhook for Commercetools

## Overview

This project is a **Netlify Edge Function API** that listens for the `user.created` event from **Kinde**. When a new user is created, the webhook extracts the `jwt` token and uses it to create a custom entity in **Commercetools (CT)**.

## Features

- Listens for `user.created` webhook event from Kinde.
- Extracts `jwt` token from the event payload.
- Creates a custom entity in **Commercetools**.
- Deployed as a **Netlify Edge Function** for low-latency execution.

## Setup and Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **Netlify CLI** (`npm install -g netlify-cli`)
- **Commercetools API credentials**
- **Kinde Webhooks configured**

### Installation Steps

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. **Install Dependencies:**
   ```sh
   npm install
   ```
3. **Set Up Environment Variables:**
   Create a `.env` file in the project root and add the following:
   ```env
   CTP_PROJECT_KEY=your_project_key
   CTP_CLIENT_ID=your_client_id
   CTP_CLIENT_SECRET=your_client_secret
   CTP_API_URL=your_ct_api_url
   CTP_AUTH_URL=your_ct_auth_url
   CTP_SCOPES=your_ct_scopes
   KWH_STG_ORG_ID=your_stg_org_id
   KWH_PROD_ORG_ID=your_prod_org_id
   KWH_SITE_KEY=your_kwh_site_key
   ```
4. **Run Locally:**
   ```sh
   npm run start
   ```

## Build

To deploy the function to Netlify, use:

```sh
npm run build
```

## Deployment

To deploy the function to Netlify, use:

```sh
netlify deploy --prod
```

## API Endpoints

| Method | Endpoint       | Description                         |
| ------ | ----------     | ----------------------------------- |
| POST   | `/create-user` | Receives Kinde `user.created` event |

## Handling Webhooks

- Ensure your webhook is configured in **Kinde** to send `user.created` events to your Netlify function URL.
- The function verifies the webhook signature before processing the request.

## Contributing

1. Fork the repository.
2. Create a new branch (`feature-branch-name`).
3. Commit your changes.
4. Push to your fork.
5. Open a pull request.

## License

This project is licensed under the MIT License.# kinde_auth_webhook_be
