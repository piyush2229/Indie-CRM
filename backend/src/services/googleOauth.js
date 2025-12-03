import { google } from "googleapis";

export function getOAuthClient() {
  const o = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
  return o;
}

/**
 * Create an authenticated Gmail client for a specific user (will refresh tokens if needed)
 * @param {object} user - Mongoose user doc (must contain gmailRefreshToken and optionally gmailAccessToken)
 */
export async function getGmailForUser(user) {
  const oauth2Client = getOAuthClient();

  if (!user.gmailRefreshToken && !user.gmailAccessToken) {
    throw new Error("No Gmail tokens stored for user");
  }

  // set credentials with refresh token (if exists)
  oauth2Client.setCredentials({
    refresh_token: user.gmailRefreshToken,
    access_token: user.gmailAccessToken
  });

  // ensure we have a fresh access token
  try {
    const res = await oauth2Client.getAccessToken(); // triggers refresh if needed
    const token = res?.token || null;

    // update user access token in DB if we got one
    if (token && token !== user.gmailAccessToken) {
      user.gmailAccessToken = token;
      await user.save();
    }
  } catch (err) {
    // if token refresh fails, bubble up
    throw new Error("Failed to refresh Gmail token: " + (err.message || err));
  }

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  return { gmail, oauth2Client };
}
