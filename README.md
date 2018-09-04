# Event tracking library

Webpack based event tracking library (Input: ES6, Output: universal library)

## Getting started

1. Build library
  * Run `npm install` to get the project's dependencies
  * Run `npm run build` to produce minified version of the library.
2. Development mode
  * Having all the dependencies installed run `npm run dev`. This command will generate an non-minified version of the library and will run a watcher so you get the compilation on file change.
3. Running the tests
  * Run `npm run test`

## Scripts

* `npm run build` - produces production version of the library under the `dist` folder
* `npm run dev` - produces development version of the library and runs a watcher
* `npm run test` - well ... it runs the tests :)
* `npm run test:watch` - same as above but in a watch mode

## Using the EventTracker

```
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Some title</title>
  <meta name="description" content="Test description">
  <script src="http://some-cdn.com/dist/EventTracker.js"></script>
</head>
<body>
<h1>My headline</h1>

<div>
  <a id="some-link" href="./some-page.html">Go to some page</a>
</div>
<div>
  <a id="reload" href="./">Reload</a>
</div>

<button onclick="track();">Track custom event</button>
<button onclick="changeUser();">Change user</button>

<script language="JavaScript">
  eventTracker = new EventTracker.EventTracker({
    tracker: new EventTracker.HttpTracker({ 'url': 'http://some-event-recieving-endpoint.com/api/v1/events' }),
    trackClicks: false,
    trackHashChanges: true,
    trackElementClicks: true,
    trackPageViews: true,
    trackActiveTime: true,
    waitOnTracker: false
  }, {
    context: {
      'organizationId': 'test-organization',
      'productId': 'se.test.product',
      // Optional
      'application': {
        // site http status code
        'statusCode': 200,
        'controller': 'start',
        'action': 'index'
      }
    },
    user: {
      'paywayId': '59d1d331996e590006001978',
      'userId': '59d1d331996e590006001978',
      'states': ['logged_in'],
      'products': [
        'test-product'
      ],
      'position': {
        'lon': 1,
        'lat': 2
      },
      'location': 'Stockholm'
    },
    content: {
      'states': ['open'],
      'articleId': '1234',
      'section': null,
      'keywords': [
        'test-product',
        'index'
      ]
    }
  });
  
  function track() {
    eventTracker.track('customEvent', { content: { keywords: [ 'should', 'overwrite', 'initialized' ] } });
  }

  function changeUser() {
    eventTracker.setUser(
    {
      'paywayId': '2b2222222222222222222222',
      'userId': '2b2222222222222222222222',
      'states': ['logged_in'],
      'products': [
        'test-product-2'
      ],
      'position': {
        'lon': 2,
        'lat': 1
      },
      'location': 'Svalbard'
    })
  }
</script>
</body>
</html>
```

