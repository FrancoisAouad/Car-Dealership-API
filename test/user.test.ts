// import PingController from "./ping.controller";
// import userController from '../../src/user/user.controller';
// import { Response, Request, NextFunction } from 'express';
// import userService from '../../src/user/user.services';
const userService = require('../../src/user/user.services');

test('should return created user', async () => {
    // const UserController = new userController();

    const UserService = new userService();
    const response = UserService.signup();
    expect(response).toBe('User Created!');
});
