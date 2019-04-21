import { DOMParser } from 'xmldom';
import { Response } from 'node-fetch';
import * as queries from './queries';
import { parseCookie } from './utils/fetch';
import { sequentially } from './utils/promise';

const domParser = new DOMParser({
  // Ikariam HTML is half broken; ignore warnings
  errorHandler: {
    warning: () => {},
    error: console.error,
    fatalError: console.error,
  },
});

interface City {
  id: number;
  name: string;
  coords: string;
  tradegood: string;
  relationship: string;
}

interface CityFull {
  name: string;
  id: string;
  phase: number;
  isCapital: boolean;
  ownerId: string;
  ownerName: string;
  islandId: string;
  islandName: string;
  islandXCoord: string;
  islandYCoord: string;
  // ...
}

async function Game(cookie: string) {

  /**
   * One-time request token for AJAX calls.
   */
  async function actionRequest(): Promise<string> {
    const viewCityResponse = await queries.viewCity({ cookie });
    const viewCityText = await viewCityResponse.text();
    const cityDocument: Document = domParser.parseFromString(viewCityText, 'text/html');
    const actionRequestElement: Element = Array.prototype.filter.call(
      cityDocument.getElementsByTagName('input'),
      (element: Element) => element.getAttribute('name') === 'actionRequest'
    )[0];
    const actionRequest: string = actionRequestElement.getAttribute('value');
    return actionRequest;
  }

  /**
   * Throws if action was unsuccessful.
   * provideFeedback -> type !== 10
   */
  async function validateAjaxWithFeedback(response: Response): Promise<void> {
    const transportText = await response.text();
    const transportJson = JSON.parse(transportText);
    const feedback = transportJson.find(row => row[0] === 'provideFeedback')[1][0];
    const success = feedback.type === 10;
    if (!success) {
      throw new Error(feedback.text);
    }
  }

  async function switchToCity({
    cityId,
  }: {
    cityId: number | string,
  }): Promise<void> {
    const response = await queries.viewCityAjax({
      cookie,
      actionRequest: await actionRequest(),
      cityId,
    });
    // validateAjaxResponse(response);
  }
  
  /**
   * Retrieves your own cities.
   * Relies on the initial HTML version returned by the server; no AJAX call can replace this one.
   */
  async function cities(): Promise<City[]> {
    const viewCityResponse = await queries.viewCity({ cookie });
    const viewCityText = await viewCityResponse.text();
    const citiesRaw = viewCityText.match(/relatedCityData: JSON\.parse\('(.*?)'\),/)[1];
    const cities = Object.values(JSON.parse(citiesRaw.replace(/\\/g, '')));
    const ownCities: City[] =
      cities.filter(city => typeof city === 'object' && city['relationship'] === 'ownCity') as City[];
    return ownCities;
  }

  async function citiesFull(): Promise<CityFull[]> {
    const resolvedCities = await cities();
    const toCitiesFull = resolvedCities.map((city: City) => {
      return async () => {
        const cityFullResponse = await queries.viewCityAjax({
          cookie,
          actionRequest: await actionRequest(),
          cityId: city.id,
        });
        const cityFullText = await cityFullResponse.text();
        return JSON.parse(cityFullText).find(row => row[0] === 'updateGlobalData')[1]['backgroundData'];
      };
    });
    const ownCitiesFull: CityFull[] = await sequentially(toCitiesFull);
    return ownCitiesFull;
  }

  async function loadTransporter({
    originCityId,
    destinationCityId,
    destinationIslandId,
    wood = 0,
    wine = 0,
    marble = 0,
    crystal = 0,
    sulphur = 0,
  }: {
    originCityId: number | string,
    destinationCityId: number | string,
    destinationIslandId: number | string,
    wood?: number,
    wine?: number,
    marble?: number,
    crystal?: number,
    sulphur?: number,
  }): Promise<void> {
    await switchToCity({ cityId: originCityId });
    const transportRequest = await queries.loadTransportAjax({
      cookie,
      actionRequest: await actionRequest(),
      destinationCityId,
      destinationIslandId,
      wood,
      wine,
      marble,
      crystal,
      sulphur,
    });
    await validateAjaxWithFeedback(transportRequest);
  }

  return {
    cities,
    citiesFull,
    loadTransporter,
  };
}

async function load({
  username,
  password,
}: {
  username: string,
  password: string,
}) {
  const loginResponse = await queries.login({ username, password });
  const loginCookie = parseCookie(loginResponse);
  return Game(loginCookie);
}

export {
  Game,
  load,
}