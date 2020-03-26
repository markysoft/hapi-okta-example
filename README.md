# markysoft
hapi-okta-example

This repository contains the [Bell Okta sample code](https://hapi.dev/module/bell/examples/#okta) updated for the changes in the `@hapi/cookie` API:
* a change in the structure of the config parameters and 
* use ` request.cookieAuth.set` rather than request.auth.session.set

To run this project you will need Node.js 12 installed, and an Okta account with an OpenID Connect Application set up with at least one user account added.

Sensitive information has been moved to environment variables:

`OKTA_DOMAIN` domain where your Okta app is available i.e. `mysite.okta.com`

`OKTA_CLIENT_ID`: the client ID in the application settings

`OKTA_CLIENT_SECRET`: the client secret from the application settings

the project uses `dotenv`. Environment variables can be set by creating a file named `.env` in the root of the project containing the env vars as key value pairs, i.e.

```
OKTA_DOMAIN=mydomain.okta.com
OKTA_CLIENT_ID=myclientid
OKTA_CLIENT_SECRET=myclientsecret
```

The example code demonstrates the problem in authentication.

run the application:
`npm start`

Open a browser in incognito mode and navigate to `http://localhost:3006`

At this point you should be redirected to tha Okta site for authentication.

Once logged in via an account you have associated with your application you will be redirected back to the local site.

The user has been authenticated correctly at this point, and the local site will write out the user authenticated to the console. The code then sets the auth cookie for the session authentication using `request.cookieAuth.set`.

Setting this cookie should authorise the `session`, but it seems the cookie is not available on subsequent requests, so each call to the site root requires re-authentication, which redirects to Okta again createin a loop of calling the Okta site over and over again.
