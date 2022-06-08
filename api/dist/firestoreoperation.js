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
exports.getUserActiveParcels = exports.findUserWithPhoneNumber = exports.checkIfDocumentExist = exports.dbSetOnUserRegister = exports.dbSetOnParcelRegister = exports.dbRemoveOnUnfollow = exports.dbRemoveDoc = exports.dbSetOnFollow = void 0;
const dbSetOnFollow = (ref, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.set(data);
});
exports.dbSetOnFollow = dbSetOnFollow;
const dbRemoveDoc = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.delete();
});
exports.dbRemoveDoc = dbRemoveDoc;
const dbRemoveOnUnfollow = (friendDocRef, userDocRef) => __awaiter(void 0, void 0, void 0, function* () {
    yield friendDocRef.delete();
    const userDoc = yield userDocRef.get();
    if (userDoc.exists) {
        yield userDocRef.delete();
    }
});
exports.dbRemoveOnUnfollow = dbRemoveOnUnfollow;
const dbSetOnParcelRegister = (ref, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let userData = yield ref.get();
    if (userData.exists) {
        let activeParcels = ((_a = userData.data()) === null || _a === void 0 ? void 0 : _a.activeParcel) || [];
        activeParcels.push(data);
        yield ref.set(userData);
    }
});
exports.dbSetOnParcelRegister = dbSetOnParcelRegister;
const dbSetOnUserRegister = (ref, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.set(data);
});
exports.dbSetOnUserRegister = dbSetOnUserRegister;
const checkIfDocumentExist = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield ref.get();
    return doc.exists;
});
exports.checkIfDocumentExist = checkIfDocumentExist;
const findUserWithPhoneNumber = (collection, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield collection.where('phoneNumber', '==', phoneNumber.toString()).get();
    let response = { successful: false, statusCode: 500 };
    if (!snapshot.empty) {
        let dataArray = [];
        snapshot.forEach(doc => {
            dataArray.push(doc);
        });
        if (dataArray.length > 1) {
            response.errorMessage = "More than one user have the same phone number!";
        }
        else if (dataArray.length == 1) {
            response.successful = true;
            response.statusCode = 200;
            response.userId = dataArray[0].data().userId;
        }
        else if (dataArray.length == 0) {
            response.successful = true;
            response.statusCode = 404;
        }
        else {
            response.statusCode = 500;
            response.errorMessage = "Internal server error.";
        }
    }
    else {
        response.statusCode = 404;
        response.errorMessage = "User not found.";
    }
    return response;
});
exports.findUserWithPhoneNumber = findUserWithPhoneNumber;
const getUserActiveParcels = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const doc = yield ref.get();
    if (doc.exists) {
        return (_b = doc.data()) === null || _b === void 0 ? void 0 : _b.activeParcel;
    }
    else {
        return [];
    }
});
exports.getUserActiveParcels = getUserActiveParcels;
exports.default = { dbSetOnFollow: exports.dbSetOnFollow, dbRemoveOnUnfollow: exports.dbRemoveOnUnfollow, dbRemoveDoc: exports.dbRemoveDoc, dbSetOnParcelRegister: exports.dbSetOnParcelRegister, dbSetOnUserRegister: exports.dbSetOnUserRegister };
