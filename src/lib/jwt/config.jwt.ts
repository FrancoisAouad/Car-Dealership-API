import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import client from '../db/redis.connection';

export const setAccessToken = (userId: string) => {
    //access token body
    const payload = {};
    const secret: any = process.env.SECRET_ACCESS_TOKEN;
    const options = {
        expiresIn: '55m',
        issuer: 'carDealership.com',
        audience: userId,
    };
    //we sign and create the token and return its value
    const token = jwt.sign(payload, secret, options);
    return token;
};

export const setRefreshToken = (userId: string) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret: any = process.env.SECRET_REFRESH_TOKEN;
        const options = {
            expiresIn: '1y',
            issuer: 'carDealership.com',
            audience: userId,
        };
        jwt.sign(payload, secret, options, (error, token) => {
            if (error) {
                console.log(error);
            }
            client.SET(
                userId,
                token,
                'EX',
                365 * 24 * 60 * 60,
                (err: any, reply: any) => {
                    if (err) {
                        console.log(err);
                    }
                    resolve(token);
                }
            );
        });
    });
};
//RESET PASSWORD TOKEN
export const setResetPasswordToken = async (userId: string) => {
    try {
        //reset password token body and payload
        const payload = {};
        const secret: any = process.env.SECRET_RESETPASSWORD_TOKEN;
        const options = {
            expiresIn: '10m',
            issuer: 'carDealership.com',
            audience: userId,
        };
        //we sign the token
        const token = jwt.sign(payload, secret, options);
        //we return its value
        return token;
    } catch (error: any) {
        return new createError.InternalServerError(error);
    }
};
export default {
    setAccessToken,
    setResetPasswordToken,
    setRefreshToken,
};
