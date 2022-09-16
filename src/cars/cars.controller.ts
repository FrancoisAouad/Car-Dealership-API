import express, { Router, Request, Response, NextFunction } from 'express';
import carService from './cars.services';
import verifyJwt from '../lib/jwt/verify.jwt';
const CarService = new carService();

class Controller {
    private router: Router;
    private path: string;

    constructor() {
        this.path = '/car';
        this.router = express.Router();
        this.initializeRoutes();
    }
    async addCar(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await CarService.addCar(req.body, req.headers);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async getListOfCars(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await CarService.getListOfCars(req.query, req.body);
            res.json({ cars: result, page: 1, totalpages: 2 });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async getListOfCarsByCountry(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await CarService.getListOfCarsByCountries(
                req.query,
                req.body
            );
            res.json({ cars: result });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async getCarByID(req: Request, res: Response, next: NextFunction) {
        try {
            const result: any = await CarService.getCarByID(req.params);
            res.json({ success: true, data: JSON.parse(result) });
        } catch (e) {
            next(e);
        }
    }
    async deleteCar(req: Request, res: Response, next: NextFunction) {
        try {
            await CarService.deleteCar(req.params, req.headers);
            res.json({ success: true, message: 'car deleted!' });
        } catch (e) {
            next(e);
        }
    }
    async editCar(req: Request, res: Response, next: NextFunction) {
        try {
            await CarService.editCar(req.params, req.headers, req.body);
            res.json({ success: true, message: 'car updated!' });
        } catch (e) {
            next(e);
        }
    }
    //FIX TOMORROW
    async getCarsByBrands(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await CarService.getCarsByBrands(
                req.headers,
                req.body
            );
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            return res.send(e);
        }
    }
    initializeRoutes() {
        this.router.get(
            `${this.path}/brand`,
            verifyJwt.verifyAccessToken,
            this.getCarsByBrands
        );
        this.router.post(
            `${this.path}`,
            verifyJwt.verifyAccessToken,
            this.addCar
        );
        this.router.get(
            `/list`,
            verifyJwt.verifyAccessToken,
            this.getListOfCars
        );
        this.router.get(
            `/group`,
            verifyJwt.verifyAccessToken,
            this.getListOfCarsByCountry
        );
        this.router.get(
            `${this.path}/:carId`,
            verifyJwt.verifyAccessToken,
            this.getCarByID
        );
        this.router.delete(
            `${this.path}/:carId`,
            verifyJwt.verifyAccessToken,
            this.deleteCar
        );
        this.router.put(
            `${this.path}/:carId`,
            verifyJwt.verifyAccessToken,
            this.editCar
        );
    }
}
export default Controller;
