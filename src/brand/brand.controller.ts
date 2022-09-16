import express, { Router, Request, Response, NextFunction } from 'express';
import brandService from './brand.services';
import verifyJwt from '../lib/jwt/verify.jwt';
const BrandService = new brandService();

class Controller {
    private router: Router;
    private path: string;

    constructor() {
        this.path = '/brand';
        this.router = express.Router();
        this.initializeRoutes();
    }
    async addBrand(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await BrandService.addBrand(req.body, req.headers);
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            next(e);
        }
    }
    async deleteBrand(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await BrandService.deleteBrand(
                req.headers,
                req.params
            );
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            next(e);
        }
    }
    async editBrand(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await BrandService.editBrand(
                req.body,
                req.params,
                req.headers
            );
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            next(e);
        }
    }
    async getAllBrands(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await BrandService.getAllBrands(
                req.body,
                req.query,
                req.headers
            );
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            next(e);
        }
    }
    async getBrandByID(req: Request, res: Response, next: NextFunction) {
        try {
            const result: any = await BrandService.getBrandByID(
                req.body,
                req.params,
                req.headers
            );

            res.status(200).json({ success: true, data: JSON.parse(result) });
        } catch (e) {
            next(e);
        }
    }

    initializeRoutes() {
        this.router.post(
            `${this.path}`,
            verifyJwt.verifyAccessToken,
            this.addBrand
        );
        this.router.delete(
            `${this.path}/:brandId`,
            verifyJwt.verifyAccessToken,
            this.deleteBrand
        );
        this.router.put(
            `${this.path}/:brandId`,
            verifyJwt.verifyAccessToken,
            this.editBrand
        );
        this.router.get(
            `${this.path}`,
            verifyJwt.verifyAccessToken,
            this.getAllBrands
        );
        this.router.get(
            `${this.path}/:brandId`,
            verifyJwt.verifyAccessToken,
            this.getBrandByID
        );
    }
}
export default Controller;
