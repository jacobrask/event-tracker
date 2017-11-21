const scribe = new Scribe.Scribe({
  tracker: new Scribe.ConsoleTracker({ 'url': 'http://localhost:8080/api/v1/events' }),
  trackClicks: false,
  trackHashChanges: true,
  trackElementClicks: true,
  trackPageViews: true,
  waitOnTracker: false
}, {
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
  {
    'paywayId': '59d1d331996e590006001978',
    'userId': '59d1d331996e590006001978',
    'state': 'logged_in',
    'products': [
      'test-product'
    ],
    'position': {
      'lon': 1,
      'lat': 2
    },
    'location': 'Stockholm'
  },
  {
    'state': 'open',
    'articleId': '1234',
    'section': null,
    'keywords': [
      'test-product',
      'index'
    ]
  }
);