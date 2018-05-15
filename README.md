# Manifester

_Dead simple headless CMS_

## Status

Under leisure development.

## Tech
* https://www.npmjs.com/package/jsonpath
* https://github.com/BigstickCarpet/json-schema-ref-parser
* https://www.npmjs.com/package/awilix
* https://www.npmjs.com/package/awilix-express
* jSend

## Knowledge
* https://spacetelescope.github.io/understanding-json-schema/basics.html
* http://objectpath.org/reference.html
* https://github.com/pillarjs/understanding-csrf
* https://github.com/auth0/node-jsonwebtoken
* https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage

## Usage

* Clone repo
```
git clone https://github.com/gnimmelf/manifester.git
```

* Make global npm link
```
cd manifester
npm link
```

* Change directory to where you want to build your app, then run
```
manifest-a-site
```
to start the (very simple) site generator.

* Cd into the created app directory, if you chose to `mkdir` it during generation and
```
npm start
```
the ExpressJs app.

## Development

Your created app, `<your app>/app.js`, is an ExpressJs app which is mounted onto the `manifester` ExpressJs app.
  * It is "mounted" *last*, so your app-routes will have precedence.
  * It will by default have all props of the `manifester` ExpressJs App, including the `awilix` container.

## Disclaimer & motivation

This is above all a proof of concept using the technoloigies listed above.

The motivation is to start with minimum CPU-, RAM- and ca$h-overhead. The database is therefor a simple JSON-file storage, because most DBs are overkill for a small Wordpress-scale CMS. On par with that, this is also an antempt at making something I would love to use when friends ask me if I can help out with a website: Then I can say "Yes, I can, but only if you accept my terms", instead of sending them off to Wordpress (Which I hate to work with), or SquareWixSpace, any of which is pointless when their requirements are so simple.

### Ultimate disclaimer

Use at own risk! This is a pet project, so it is justified according to my internal mental structure.

---

# HttPie

## Login
```
http --session=~/tmp/session.json :3000/api/user/current
http --session=~/tmp/session.json POST :3000/api/auth/request email=gnimmelf@gmail.com
http --session=~/tmp/session.json POST :3000/api/auth/exchange
http --session=~/tmp/session.json POST :3000/api/auth/exchange email=gnimmelf@gmail.com code=06856
http --session=~/tmp/session.json :3000/api/user/current
http --session=~/tmp/session.json :3000/api/auth/logout

http --session=~/tmp/session.json :3000/api/data/
```