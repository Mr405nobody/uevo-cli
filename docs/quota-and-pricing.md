# Gemini CLI: Quotas and Pricing

Your Gemini CLI quotas and pricing depend on the type of account you use to authenticate with Google. Additionally, both quotas and pricing may be calculated differently based on the model version, requests, and tokens used. A summary of model usage is available through the `/stats` command and presented on exit at the end of a session. See [privacy and terms](./tos-privacy.md) for details on Privacy policy and Terms of Service. Note: published prices are list price; additional negotiated commercial discounting may apply.

This article outlines the specific quotas and pricing applicable to the Gemini CLI when using different authentication methods.

## 1. Log in with Google (Gemini Code Assist Free Tier)

For users who authenticate by using their Google account to access Gemini Code Assist for individuals:

- **Quota:**
  - 60 requests per minute
  - 1000 requests per day
  - Token usage is not applicable
- **Cost:** Free
- **Details:** [Gemini Code Assist Quotas](https://developers.google.com/gemini-code-assist/resources/quotas#quotas-for-agent-mode-gemini-cli)
- **Notes:** A specific quota for different models is not specified; model fallback may occur to preserve shared experience quality.

## 2. Gemini API Key (Unpaid)

If you are using a Gemini API key for the free tier:

- **Quota:**
  - Flash model only
  - 10 requests per minute
  - 250 requests per day
- **Cost:** Free
- **Details:** [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

## 3. Gemini API Key (Paid)

If you are using a Gemini API key with a paid plan:

- **Quota:** Varies by pricing tier.
- **Cost:** Varies by pricing tier and model/token usage.
- **Details:** [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits), [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)

## 4. Login with Google (for Workspace or Licensed Code Assist users)

For users of Standard or Enterprise editions of Gemini Code Assist, quotas and pricing are based on a fixed price subscription with assigned license seats:

- **Standard Tier:**
  - **Quota:** 120 requests per minute, 1500 per day
- **Enterprise Tier:**
  - **Quota:** 120 requests per minute, 2000 per day
- **Cost:** Fixed price included with your Gemini for Google Workspace or Gemini Code Assist subscription.
- **Details:** [Gemini Code Assist Quotas](https://developers.google.com/gemini-code-assist/resources/quotas#quotas-for-agent-mode-gemini-cli), [Gemini Code Assist Pricing](https://cloud.google.com/products/gemini/pricing)
- **Notes:**
  - Specific quota for different models is not specified; model fallback may occur to preserve shared experience quality.
  - Members of the Google Developer Program may have Gemini Code Assist licenses through their membership.

## 5. Google One and Ultra plans, Gemini for Workspace plans

These plans currently apply only to the use of Gemini web-based products provided by Google-based experiences (for example, the Gemini web app or the Flow video editor). These plans do not apply to the API usage which powers the Gemini CLI. Supporting these plans is under active consideration for future support.
