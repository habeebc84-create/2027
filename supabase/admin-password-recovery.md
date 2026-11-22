# Admin password recovery

The admin portal requests a recovery link for the existing admin account. Supabase Auth creates the recovery token and sends the email through its configured SMTP provider.

## Configure Brevo's free plan

1. In Brevo, verify a sender on an authenticated domain, then create an SMTP key under **SMTP & API**.
2. In Supabase, open **Authentication → Emails → SMTP Settings** and enable custom SMTP. Use the verified sender address, a sender name such as HSN Cement & Steel, host `smtp-relay.brevo.com`, port `587`, the SMTP login shown by Brevo, and the SMTP key as the password. Save the key only in Supabase's SMTP settings.
3. In **Authentication → URL Configuration**, allow the production site's exact admin portal URL (`https://hsncementandsteel-sigma.vercel.app/manage-portal-9f3a` for the default deployment). Keep the recovery email template's Supabase confirmation link and turn off link tracking for recovery mail.
4. Verify that the configured admin account exists under **Authentication → Users**. If this Supabase project serves only this site's admin login, disable public sign-ups and check that its existing Auth accounts are all intended. Custom SMTP applies to the entire Supabase Auth project. The portal targets the admin account, while the Supabase recovery API can independently serve any other existing Auth accounts.
5. Open the production admin portal and request a reset with a different email typed into the login field. Check Brevo's transactional logs and confirm delivery to the existing admin mailbox. Open the email in a signed-out browser and confirm that the link opens the admin portal. To reset the password, select **Security & Settings → Change**.

[Supabase custom SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp) · [Brevo SMTP setup](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP)
