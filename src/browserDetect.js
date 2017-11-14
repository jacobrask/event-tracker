const BrowserDetect = ((() => {
  const BrowserDetect = {
    init() {
      this.browser = this.searchString(this.dataBrowser) || 'An unknown browser';
      this.version = this.searchVersion(navigator.userAgent) ||
        this.searchVersion(navigator.appVersion) ||
        'an unknown version';
      this.OS = this.searchString(this.dataOS) || 'an unknown OS';
    },
    searchString(data) {
      for (let i = 0;i < data.length;i++) {
        const dataString = data[i].string;
        const dataProp = data[i].prop;

        this.versionSearchString = data[i].versionSearch || data[i].identity;
        if (dataString) {
          if (dataString.includes(data[i].subString)) {
            return data[i].identity;
          }
        } else if (dataProp) {
          return data[i].identity;
        }
      }
      return null;
    },
    searchVersion(dataString) {
      const index = dataString.indexOf(this.versionSearchString);

      if (index === -1) return null;
      return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    },
    dataBrowser: [
      {
        string: navigator.userAgent,
        subString: 'Chrome',
        identity: 'Chrome'
      },
      { string: navigator.userAgent,
        subString: 'OmniWeb',
        versionSearch: 'OmniWeb/',
        identity: 'OmniWeb'
      },
      {
        string: navigator.vendor,
        subString: 'Apple',
        identity: 'Safari',
        versionSearch: 'Version'
      },
      {
        prop: window.opera,
        identity: 'Opera',
        versionSearch: 'Version'
      },
      {
        string: navigator.vendor,
        subString: 'iCab',
        identity: 'iCab'
      },
      {
        string: navigator.vendor,
        subString: 'KDE',
        identity: 'Konqueror'
      },
      {
        string: navigator.userAgent,
        subString: 'Firefox',
        identity: 'Firefox'
      },
      {
        string: navigator.vendor,
        subString: 'Camino',
        identity: 'Camino'
      },
      {   // for newer Netscapes (6+)
        string: navigator.userAgent,
        subString: 'Netscape',
        identity: 'Netscape'
      },
      {
        string: navigator.userAgent,
        subString: 'MSIE',
        identity: 'Explorer',
        versionSearch: 'MSIE'
      },
      {
        string: navigator.userAgent,
        subString: 'Gecko',
        identity: 'Mozilla',
        versionSearch: 'rv'
      },
      {     // for older Netscapes (4-)
        string: navigator.userAgent,
        subString: 'Mozilla',
        identity: 'Netscape',
        versionSearch: 'Mozilla'
      }
    ],
    dataOS: [
      {
        string: navigator.platform,
        subString: 'Win',
        identity: 'Windows'
      },
      {
        string: navigator.platform,
        subString: 'Mac',
        identity: 'Mac'
      },
      {
        string: navigator.userAgent,
        subString: 'iPod',
        identity: 'iPod'
      },
      {
        string: navigator.userAgent,
        subString: 'iPad',
        identity: 'iPad'
      },
      {
        string: navigator.userAgent,
        subString: 'iPhone',
        identity: 'iPhone'
      },
      {
        string: navigator.platform,
        subString: 'Linux',
        identity: 'Linux'
      }
    ]

  };

  BrowserDetect.init();
  return BrowserDetect;
}))();

export default BrowserDetect;
