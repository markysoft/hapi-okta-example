'use strict'

const Bell = require('@hapi/bell')
const Boom = require('@hapi/boom')
const Hapi = require('@hapi/hapi')

// Build config
const oktaConfig = {
  domain: process.env.OKTA_DOMAIN,
  clientId: process.env.OKTA_CLIENT_ID,
  clientSecret: process.env.OKTA_CLIENT_SECRET,
}
const internals = {}

internals.start = async function () {
  const server = Hapi.server({ port: 3006 })
  await server.register([require('@hapi/cookie'), Bell])

  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: 'sid-demo',
      password: 'cookie_encryption_password_secure',
      isSecure: false, // Should be set to true (which is the default) in production
      isSameSite: 'Lax',
      ttl: 24 * 60 * 60 * 1000 // Set session to 1 day
    },
    redirectTo: '/auth/okta' // If there is no session, redirect here
  })

  server.auth.strategy('okta', 'bell', {
    provider: 'okta',
    config: { uri: `https://${oktaConfig.domain}` },
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    location: 'http://localhost:3006',
    clientId: oktaConfig.clientId,
    clientSecret: oktaConfig.clientSecret
  })

  server.route({
    method: 'GET',
    path: '/auth/okta',
    options: {
      auth: {
        strategy: 'okta',
        mode: 'try'
      },
      handler: function (request, h) {
        console.log('/auth/okta')
        if (!request.auth.isAuthenticated) {
          throw Boom.unauthorized('Authentication failed: ' + request.auth.error.message)
        }

        console.log('authenticated', request.auth.credentials.profile.username)
        // Just store the third party credentials in the session as an example. You could do something
        // more useful here - like loading or setting up an account (social signup).

        request.cookieAuth.set(request.auth.credentials)
        return h.redirect('/')
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: 'session',
      handler: function (request, h) {
        // Return a message using the information from the session

        return 'Hello, ' + request.auth.credentials.profile.username + '!'
      }
    }
  })

  await server.start()
  console.log('Server started at:', server.info.uri)
}

internals.start()
