"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
/* eslint-disable no-console */
const config_1 = __importDefault(require("../../config"));
const user_constant_1 = require("../modules/User/user.constant");
const user_model_1 = require("../modules/User/user.model");
// import { User } from '../modules/User/user.model';
const seed = async () => {
    try {
        const admin = await user_model_1.User.findOne({
            role: user_constant_1.USER_ROLE.ADMIN,
            email: config_1.default.admin_email,
            status: user_constant_1.USER_STATUS.ACTIVE,
        });
        if (!admin) {
            console.log('Seeding started...');
            await user_model_1.User.create({
                name: 'Admin',
                role: user_constant_1.USER_ROLE.ADMIN,
                email: config_1.default.admin_email,
                // password: config.admin_password,
                // profilePhoto: config.admin_profile_photo,
                // mobileNumber: config.admin_mobile_number,
                status: user_constant_1.USER_STATUS.ACTIVE,
            });
            console.log('Admin created successfully...');
            console.log('Seeding completed...');
        }
    }
    catch (error) {
        console.log('Error in seeding', error);
    }
};
exports.seed = seed;
//# sourceMappingURL=seeding.js.map