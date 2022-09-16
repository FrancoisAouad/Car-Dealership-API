import authController from './auth/auth.controller';
import brandController from './brand/brand.controller';
import carController from './cars/cars.controller';
import countryController from './countries/country.controller';
import App from './app';
import './lib/db/mongo.connection';
import './lib/db/redis.connection';

const app = new App([
    new authController(),
    new brandController(),
    new carController(),
    new countryController(),
]);

app.listen();
