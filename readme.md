# Hyperdom boilerplate

A minimal [Hyperdom](https://github.com/featurist/hyperdom "hyperdom") application starter kit.

## What you get

A simple single page app starting point to kick off your hyperdom app.

There's no server... This is just for your front ends.

  * Hyperdom single page app with a couple of views
  * Testing setup with [browser-monkey](https://github.com/featurist/browser-monkey "Browser Monkey") (It's fast and it's ace!)
  * Less for styles
  * ES6 transpiling and JSX transformations using Babel
  * Module bundling with Browserify


## Get started

**Clone the repo**

`git clone http://github.com/paulcampbell/hyperdom-boilerplate`

**Install the dependencies**

`npm install`

**Run the tests**

`npm test`

**Development mode with live reload**

`npm start`

(hit up http://localhost:8080, yeah?)

**Deploy it to a github pages**

got it in a github repository? Excellent. Run this to publish your app to gihub pages:

`npm run deploy`

now check it out... somewhere like this [https://paulcampbell.github.io/hyperdom-boilerplate/](https://paulcampbell.github.io/hyperdom-boilerplate/)

## Folder structure

```
  |- dist            # built application ends up here
  |
  |- src             # html and javascripts... write your code here
  |  |- styles       # less stylesheets... add your styles here
  |
  |- test            # specs... write your tests here
```

