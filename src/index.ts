import { CronJob } from 'cron';
import { CONFIG } from '../config';
import { load } from './game';

// While reusing is completely possible, starting a new session from browser kills other sessions.
async function gamesession() {
  const game = await load({
    username: CONFIG.username,
    password: CONFIG.password,
  });
  return game;
}

async function overview() {
  const game = await gamesession();
  const cities = await game.citiesFull();
  console.info('-- Overview --')
  cities.forEach((city) => {
    console.info(`${city.id} ${city.name} @ ${city.islandId} [${city.islandXCoord},${city.islandYCoord}]`);
  });
}

async function tradeRoutes() {
  console.info(`-> ${CONFIG.tradeRoutes.length} trade routes`);
  CONFIG.tradeRoutes.forEach((tradeRoute) => {
    new CronJob(tradeRoute.crontime, async () => {
      console.info('-- [Cron-start] Trade Route --');
      console.info(tradeRoute);
      const game = await gamesession();
      const cities = await game.citiesFull();
      const fromCity = cities.find(city => city.name === tradeRoute.from);
      const toCity = cities.find(city => city.name === tradeRoute.to);
      await game.loadTransporter({
        originCityId: fromCity.id,
        destinationCityId: toCity.id,
        destinationIslandId: toCity.islandId,
        ...tradeRoute.goods,
      });
      console.info('-- [Cron-end] Trade Route --');
    }, null, true, 'Europe/London');
  });
}

(async() => {
  await overview();
  await tradeRoutes();

  process.stdin.resume();
})();
