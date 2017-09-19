# Manifester

_Dead simple headless CMS_

## Status

Under leisure development.

## Tech
* Riot.js
* https://www.npmjs.com/package/jsonpath
* https://github.com/BigstickCarpet/json-schema-ref-parser
* http://brutusin.org/json-forms/
* https://www.npmjs.com/package/awilix
* https://www.npmjs.com/package/awilix-express

### Additional

* https://github.com/chmln/flatpickr

## Knowledge
* https://spacetelescope.github.io/understanding-json-schema/basics.html
* http://objectpath.org/reference.html

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

Your created app, `<your app>/app.js`, is an express app which is mounted onto the `manfiester` Express app. It is mounted *last*, so your app-routes will have precedence.

## Disclaimer & motivation

This is above all a proof of concept using the technoloigies listed above.

The motivation is to start with minimum CPU-, RAM- and ca$h-overhead. The database is therefor a simple JSON-file storage, because most DBs are overkill for a small Wordpress-scale CMS. On par with that, this is also an atempt at making something I would love to use when friends ask me if I can help out with a website: Then I can say "Yes, I can, but only if you accept my terms", instead of sending them off to Wordpress (Which I hate to work with), SquareWixSpace, which is pointless when their requirements are so simple.
