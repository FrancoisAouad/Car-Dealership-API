import brandModel from './brand.model';
import globalService from '../utils/global.services';
import mongoose from 'mongoose';
import error from 'http-errors';
import client from '../lib/db/redis.connection';
const GlobalService = new globalService();

class Service {
    constructor() {}
    async addBrand(body: any, header: any) {
        const id = GlobalService.getUser(header.authorization);

        return await brandModel.create({
            name: {
                en: body.en,
                ar: body.ar,
            },
            creatorID: id,
        });
    }
    async deleteBrand(header: any, params: any) {
        const id = GlobalService.getUser(header.authorization);

        return await brandModel.deleteOne({
            _id: params.brandID,
            creatorID: id,
        });
    }
    async editBrand(body: any, params: any, header: any) {
        const id = GlobalService.getUser(header.authorization);

        return await brandModel.updateOne(
            { _id: params.brandID, creatorID: id },
            {
                $set: {
                    name: {
                        en: body.en,
                        ar: body.ar,
                    },
                },
            }
        );
    }
    async getAllBrands(body: any, query: any, header: any) {
        const id = GlobalService.getUser(header.authorization);
        let pipeline: any = [
            {
                $match: {
                    creatorID: new mongoose.Types.ObjectId(id),
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
                $project: {
                    _id: 0,
                    name: {
                        en: '$name.en',
                        ar: '$name.ar',
                    },
                    created: '$createdDate',
                    updated: '$updatedDate',
                    creatorName: { $arrayElemAt: ['$creatorID.name', 0] },
                    creatorEmail: { $arrayElemAt: ['$creatorID.email', 0] },
                },
            },
            { $sort: { updated: -1 } },
        ];
        if (query.title) {
            let titleObj: any = {
                $match: {
                    $or: [
                        { 'name.en': query.title },
                        { 'name.ar': query.title },
                    ],
                },
            };
            pipeline.push(titleObj);
        }

        return await brandModel.aggregate(pipeline);
    }
    async getBrandByID(body: any, params: any, header: any) {
        return new Promise((resolve, reject) => {
            client.get(params.brandId, (err: any, data: any) => {
                if (err) {
                    console.log(err);
                }
                //CACHE HIT: data already stored inside redis cache
                if (data) {
                    resolve(data);
                    return JSON.parse(data);

                    //CACHE MISS: get data from mongo db+store data in redis to fetch later
                } else if (!data) {
                    const brand = this.getBrandByIdHelper(params);
                    resolve(brand);
                    return brand;
                }
            });
        });
    }
    async getBrandByIdHelper(params: any) {
        const branddata = await brandModel.findOne({ _id: params.brandId });
        if (!branddata) throw new error.NotFound('no such car found');
        const result = await brandModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(params.brandId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creatorID',
                    foreignField: '_id',
                    as: 'creatorID',
                },
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        en: '$name.en',
                        ar: '$name.ar',
                    },
                    created: '$createdDate',
                    updated: '$updatedDate',
                    creatorName: { $arrayElemAt: ['$creatorID.name', 0] },
                    creatorEmail: { $arrayElemAt: ['$creatorID.email', 0] },
                },
            },
        ]);
        console.log('aggregation result', result);
        const id: string = params.brandId.toString();
        const ob: string = JSON.stringify(result);

        await client.SET(id, ob, 'EX', 365 * 24 * 60 * 60);
        return ob;
    }
}
export default Service;
