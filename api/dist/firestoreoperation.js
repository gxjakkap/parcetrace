"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfUserIsEligible = exports.dbSetOnUserRegister = exports.dbSetOnParcelRegister = exports.dbRemoveOnUnfollow = exports.dbSetOnFollow = void 0;
const dbSetOnFollow = (ref, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.set(data);
});
exports.dbSetOnFollow = dbSetOnFollow;
const dbRemoveOnUnfollow = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.delete();
});
exports.dbRemoveOnUnfollow = dbRemoveOnUnfollow;
const dbSetOnParcelRegister = (ref, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.set(data);
});
exports.dbSetOnParcelRegister = dbSetOnParcelRegister;
const dbSetOnUserRegister = (ref, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.set(data);
});
exports.dbSetOnUserRegister = dbSetOnUserRegister;
const checkIfUserIsEligible = (ref, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield ref.get();
    if (doc.exists) {
        let json = doc.data;
        console.log(Object.keys(json));
        return true;
    }
    else {
        return false;
    }
});
exports.checkIfUserIsEligible = checkIfUserIsEligible;
exports.default = { dbSetOnFollow: exports.dbSetOnFollow, dbRemoveOnUnfollow: exports.dbRemoveOnUnfollow, dbSetOnParcelRegister: exports.dbSetOnParcelRegister, dbSetOnUserRegister: exports.dbSetOnUserRegister };