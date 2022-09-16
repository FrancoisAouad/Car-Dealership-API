import carsModel from './cars.model';
import client from '../lib/db/redis.connection';
import error from 'http-errors';
import globalService from '../utils/global.services';
import mongoose from 'mongoose';
const GlobalService = new globalService();

class Service {
    constructor() {}

    async addCar(body: any, header: any) {
        const userid = GlobalService.getUser(header.authorization);
        const addedCar = await carsModel.create({
            title: {
                ar: body.ar,
                en: body.en,
            },
            brandID: body.brand,
            color: body.color,
            engine: body.engine,
            creatorID: new mongoose.Types.ObjectId(userid),
            soldIn: body.soldIn,
        });
        const id: string = addedCar._id.toString();
        const ob: string = JSON.stringify(addedCar);

        await client.SET(id, ob, 'EX', 365 * 24 * 60 * 60);
        return addedCar;
    }
    async getListOfCars(query: any, body: any) {
        let pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy',
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    engine: 1,
                    createdBy: {
                        email: '$createdBy.email',
                        name: '$createdBy.name',
                    },
                    color: 1,
                },
            },
        ];
        if (query.title) {
            let search: any = {
                $match: {
                    $or: [
                        { 'title.en': query.title },
                        { 'title.ar': query.title },
                    ],
                },
            };
            pipeline.unshift(search);
        }
        if (body.brands) {
        }
        const total = await carsModel.aggregate(pipeline);
        return total;
    }
    async getListOfCarsByCountries(query: any, body: any) {
        let pipeline: any = [
            {
                $group: {
                    _id: '$soldIn',
                    totalCar: { $sum: 1 },
                    cars: {
                        $push: {
                            _id: '$id',
                            title: '$title',
                            engine: '$engine',
                            color: '$color',
                        },
                    },
                },
            },
        ];

        const total = await carsModel.aggregate(pipeline);
        return total;
    }
    async getCarByID(params: any) {
        return new Promise((resolve, reject) => {
            client.get(params.carId, (err: any, data: any) => {
                if (err) {
                    console.log(err);
                }
                //CACHE HIT: data already stored inside redis cache
                if (data) {
                    resolve(data);
                    return JSON.parse(data);

                    //CACHE MISS: get data from mongo db+store data in redis to fetch later
                } else if (!data) {
                    const car = this.getCarByIdHelper(params);
                    resolve(car);
                    return car;
                }
            });
        });
    }
    //helper function for getcarbyid to implement read through cache
    async getCarByIdHelper(params: any) {
        const cardata = await carsModel.findOne({ _id: params.carId });
        const id: string = params.carId.toString();
        const ob: string = JSON.stringify(cardata);
        await client.SET(id, ob, 'EX', 365 * 24 * 60 * 60);
        return JSON.stringify(cardata);
    }
    async deleteCar(params: any, header: any) {
        const id = GlobalService.getUser(header.authorization);
        const deletedCar = await carsModel.deleteOne({
            _id: params.carId,
            createdBy: id,
        });

        if (!deletedCar) throw new error.NotFound('No such car found..');
    }
    async editCar(params: any, header: any, body: any) {
        const id = GlobalService.getUser(header.authorization);
        const updatedCar = await carsModel.updateOne(
            {
                _id: params.carId,
                createdBy: id,
            },
            {
                $set: {
                    title: {
                        ar: body.ar,
                        en: body.en,
                    },
                    brandID: body.brand,
                    color: body.color,
                    engine: body.engine,
                    createdBy: body.creator,
                    soldIn: body.soldIn,
                },
            }
        );

        if (!updatedCar) throw new error.NotFound('No such car found..');
    }
    async getCarsByBrands(header: any, body: any) {
        const id: string = GlobalService.getUser(header.authorization);
        let pipeline = [
            { $match: { creatorID: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brandID',
                    foreignField: '_id',
                    as: 'brandID',
                },
            },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    engine: 1,
                    color: 1,
                    creatorID: 1,
                    soldIn: 1,
                    brand: '$brandID.name',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creatorID',
                    foreignField: '_id',
                    as: 'creatorID',
                },
            },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'soldIn',
                    foreignField: '_id',
                    as: 'soldIn',
                },
            },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    engine: 1,
                    color: 1,
                    soldIn: {
                        name: { $arrayElemAt: ['$soldIn.name', 0] },
                        value: { $arrayElemAt: ['$soldIn.value', 0] },
                    },
                    brand: 1,
                    creatorName: { $arrayElemAt: ['$creatorID.name', 0] },
                    creatorEmail: { $arrayElemAt: ['$creatorID.email', 0] },
                },
            },
            {
                $group: {
                    _id: '$brand',
                    totalCars: { $sum: 1 },
                    cars: {
                        $push: {
                            _id: '$id',
                            title: '$title',
                            engine: '$engine',
                            color: '$color',
                            soldIn: '$soldIn',
                            brand: '$brand',
                            creatorName: '$creatorName',
                            creatorEmail: '$creatorEmail',
                        },
                    },
                },
            },
        ];

        if (body.brand) {
            const brandObj: any = {
                $match: {
                    $or: [
                        { 'brand.en': body.brand },
                        { 'brand.ar': body.brand },
                    ],
                },
            };
            pipeline.push(brandObj);
        }
        return await carsModel.aggregate(pipeline);
    }
}
export default Service;
