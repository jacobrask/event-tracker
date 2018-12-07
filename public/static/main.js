/* global EventTracker */
const eventTracker = new EventTracker.EventTracker({
  tracker: new EventTracker.ConsoleTracker({
    url: 'http://localhost:8080/api/v1/events',
    filters: [
      () => true,
      //(event) => event.source.browser.bot !== true,
      EventTracker.Filters.BotFilter
    ]
  }),
  trackClicks: true,
  trackActiveTime: true,
  trackHashChanges: true,
  trackElementClicks: true,
  trackPageViews: true,
  waitOnTracker: false,
  postProcessors: [
    function (event) { event.source.browser.foo = 'bar'; }
  ]
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

