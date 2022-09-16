import error from 'http-errors';
import carsModel from '../cars/cars.model';
import countryModel from './country.model';
import brandModel from './country.model';
import client from '../lib/db/redis.connection';
//ADMIN ADDS COUNTRIES
class Service {
    constructor() {}
    async addCountry(body: any) {
        return await brandModel.create({
            name: {
                en: body.en,
                ar: body.ar,
            },
            value: body.value,
        });
    }
    async deleteCountry(params: any) {
        const country = await countryModel.findOne({ _id: params.countryId });
        if (!country) throw new error.NotFound('country not found..');
        const check: any = await carsModel.find({
            soldIn: params.countryId,
        });
        if (check.length > 0) {
            await carsModel.deleteMany({ soldIn: params.countryId });
            await countryModel.deleteOne({ _id: params.countryId });
        }
        await countryModel.deleteOne({ _id: params.countryId });
        return;
    }
    async editCountry(body: any, params: any) {
        return countryModel.updateOne(
            { _id: params.countryId },
            {
                $set: {
                    name: {
                        en: body.en,
                        ar: body.ar,
                    },
                    value: body.value,
                },
            }
        );
    }
    async getCountryByID(params: any) {
        return new Promise((resolve, reject) => {
            client.GET(params.countryId, (err: any, data: any) => {
                if (err) {
                    console.log(err);
                }
                //CACHE HIT: data already stored inside redis cache
                if (data) {
                    console.log('hit 1');
                    resolve(data);
                    return JSON.parse(data);
                    //CACHE MISS: get data from mongo db+store data in redis to fetch later
                } else if (!data) {
                    console.log('hit 2');
                    const country = this.getCountryByIdHelper(params);
                    console.log(country);
                    resolve(country);
                    return country;
                }
            });
        });
    }
    async getAllCountries(body: any) {
        return await countryModel.aggregate([
            {
                $project: {
                    _id: 0,
                    name: 1,
                    value: 1,
                },
            },
        ]);
    }
    //helper function for getcarbyid to implement read through cache
    async getCountryByIdHelper(params: any) {
        console.log(params.countryId);
        const countrydata = await countryModel.findOne({
            _id: params.countryId,
        });
        const id: string = params.countryId.toString();
        const ob: string = JSON.stringify(countrydata);
        await client.SET(id, ob, 'EX', 365 * 24 * 60 * 60);
        return JSON.stringify(countrydata);
    }
}
export default Service;
