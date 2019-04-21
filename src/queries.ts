import fetch, { Response } from 'node-fetch';

async function index(): Promise<Response> {
  return fetch('https://s1-en.ikariam.gameforge.com/index.php', {
      'headers': {
          'accept': '*/*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'cookie': '',
          'x-requested-with': 'XMLHttpRequest',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
      },
      'method': 'GET',
  });
}

async function login({
  username,
  password,
}): Promise<Response> {
  return fetch('https://s1-en.ikariam.gameforge.com/index.php?action=loginAvatar&function=login', {
      'headers': {
          'accept': '*/*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'cookie': '',
          'x-requested-with': 'XMLHttpRequest',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
      },
      'body': `uni_url=s1-en.ikariam.gameforge.com&name=${username}&password=${password}&pwat_uid=&pwat_checksum=&startPageShown=1&detectedDevice=1&kid=&autoLogin=on`,
      'method': 'POST',
  });
}

async function viewCity({
  cookie
}: {
  cookie: string,
}): Promise<Response> {
  return fetch('https://s1-en.ikariam.gameforge.com/index.php?view=city', {
    'headers': {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'cookie': cookie,
        'x-requested-with': 'XMLHttpRequest',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
    },
    'method': 'GET',
  });
}

/**
 * City information
 * Feedback: false
 */
async function viewCityAjax({
  cookie,
  actionRequest,
  cityId
}: {
  cookie: string,
  actionRequest: string,
  cityId: number | string,
}) {
  return fetch('https://s1-en.ikariam.gameforge.com/index.php', {
    'headers': {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'cookie': cookie,
        'x-requested-with': 'XMLHttpRequest',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
    },
    'body': `action=header&function=changeCurrentCity&actionRequest=${actionRequest}&cityId=${cityId}&backgroundView=city&ajax=1`,
    'method': 'POST',
  });
}

/**
 * Send good to another city
 * Feedback: true
 * There's no origin city, it relies on the last action
 */
async function loadTransportAjax({
  cookie,
  actionRequest,
  destinationCityId,
  destinationIslandId,
  wood,
  wine,
  marble,
  crystal,
  sulphur,
}: {
  cookie: string,
  actionRequest: string,
  destinationCityId: number | string,
  destinationIslandId: number | string,
  wood: number,
  wine: number,
  marble: number,
  crystal: number,
  sulphur: number,
}) {
  const params = {
    action: 'transportOperations',
    function: 'loadTransportersWithFreight',
    destinationCityId,
    islandId: destinationIslandId, // Destination island ID
    oldView: '',
    position: '',
    avatar2Name: '',
    city2Name: '',
    type: '',
    activeTab: '',
    transportDisplayPrice: 0,
    premiumTransporter: 0,
    minusPlusValue: 500,
    cargo_resource: wood, // Wood
    cargo_tradegood1: wine, // Wine
    cargo_tradegood2: marble, // Marble
    cargo_tradegood3: crystal, // Crystal
    cargo_tradegood4: sulphur, // Sulphur
    capacity: 5, // Capacity per merchant ship (in-game)
    max_capacity: 5,
    jetPropulsion: 0,
    transporters: 1, // Has no effect, seems like #ships is automatically calculated by server
    backgroundView: 'city', // Returns updated city -> backgroundData (required?)
    currentCityId: '', // Like a history, but redundant for the action itself
    templateView: 'transport',
    currentTab: 'tabSendTransporter',
    actionRequest,
    ajax: 1,
  };
  return fetch('https://s1-en.ikariam.gameforge.com/index.php', {
    'headers': {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'cookie': cookie,
        'x-requested-with': 'XMLHttpRequest',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
    },
    'body': Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&'),
    'method': 'POST',
  });
}

export {
  index,
  login,
  viewCity,
  viewCityAjax,
  loadTransportAjax,
};
