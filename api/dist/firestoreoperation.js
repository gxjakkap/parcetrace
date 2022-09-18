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
exports.getAllParcel = exports.checkForRegistrationEligibility = exports.getParcelDataFromAllParcel = exports.getUserActiveParcels = exports.findUserWithPhoneNumber = exports.checkIfDocumentExist = exports.dbSetOnUserRegister = exports.dbRemoveParcelFromUserData = exports.dbSetOnParcelRegister = exports.dbRemoveOnUnfollow = exports.dbRemoveDoc = exports.dbSetOnFollow = void 0;
const dbSetOnFollow = (ref, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.set(data);
});
exports.dbSetOnFollow = dbSetOnFollow;
const dbRemoveDoc = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.delete();
});
exports.dbRemoveDoc = dbRemoveDoc;
const dbRemoveOnUnfollow = (userDocRef) => __awaiter(void 0, void 0, void 0, function* () {
    const userDoc = yield userDocRef.get();
    if (userDoc.exists) {
        yield userDocRef.delete();
    }
});
exports.dbRemoveOnUnfollow = dbRemoveOnUnfollow;
const dbSetOnParcelRegister = (userRef, userParcelData, allActiveRef, parcelData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let userData = yield userRef.get();
    if (userData.exists) {
        let activeParcels = ((_a = userData.data()) === null || _a === void 0 ? void 0 : _a.activeParcel) || [];
        activeParcels.push(userParcelData);
        yield userRef.update({ activeParcel: activeParcels });
    }
    yield allActiveRef.set(parcelData);
});
exports.dbSetOnParcelRegister = dbSetOnParcelRegister;
const dbRemoveParcelFromUserData = (userRef, parcelId) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let userData = yield userRef.get();
    if (userData.exists) {
        let activeParcels = ((_b = userData.data()) === null || _b === void 0 ? void 0 : _b.activeParcel) || [];
        activeParcels = activeParcels.filter(parcel => parcel.parcelId !== parcelId);
        yield userRef.update({ activeParcel: activeParcels });
    }
});
exports.dbRemoveParcelFromUserData = dbRemoveParcelFromUserData;
const dbSetOnUserRegister = (ref, data) => __awaiter(void 0, void 0, void 0, function* () {
    let userData = yield ref.get();
    if (userData.exists) {
        let userDataObj = userData.data();
        userDataObj.name = data.name;
        userDataObj.surname = data.surname;
        userDataObj.phoneNumber = data.phoneNumber;
        userDataObj.room = data.room;
        userDataObj.isRegistered = true;
        yield ref.update(userDataObj);
    }
});
exports.dbSetOnUserRegister = dbSetOnUserRegister;
const checkIfDocumentExist = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield ref.get();
    return doc.exists;
});
exports.checkIfDocumentExist = checkIfDocumentExist;
const findUserWithPhoneNumber = (collection, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield collection.where('phoneNumber', '==', phoneNumber).get();
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
    const doc = yield ref.get();
    if (doc.exists) {
        //return (doc.data()?.activeParcel !== undefined) ? doc.data()?.activeParcel : []
        const data = doc.data();
        return {
            userData: {
                name: ((data === null || data === void 0 ? void 0 : data.name) !== undefined) ? data === null || data === void 0 ? void 0 : data.name : "undefined",
                surname: ((data === null || data === void 0 ? void 0 : data.surname) !== undefined) ? data === null || data === void 0 ? void 0 : data.surname : "undefined"
            },
            lineData: ((data === null || data === void 0 ? void 0 : data.lineData) !== undefined) ? data === null || data === void 0 ? void 0 : data.lineData : {},
            activeParcel: ((data === null || data === void 0 ? void 0 : data.activeParcel) !== undefined) ? data === null || data === void 0 ? void 0 : data.activeParcel : []
        };
    }
    else {
        return null;
    }
});
exports.getUserActiveParcels = getUserActiveParcels;
const getParcelDataFromAllParcel = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield ref.get();
    return doc.exists ? doc.data() : null;
});
exports.getParcelDataFromAllParcel = getParcelDataFromAllParcel;
const checkForRegistrationEligibility = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const doc = yield ref.get();
    return (doc.exists && ((_c = doc.data()) === null || _c === void 0 ? void 0 : _c.isRegistered) == false);
});
exports.checkForRegistrationEligibility = checkForRegistrationEligibility;
const getAllParcel = (allRef) => __awaiter(void 0, void 0, void 0, function* () {
    const snap = yield allRef.get();
    let ansArr = [];
    if (!snap.empty) {
        snap.forEach((doc) => {
            ansArr.push(doc.data());
        });
    }
    return ansArr;
});
exports.getAllParcel = getAllParcel;
exports.default = { dbSetOnFollow: exports.dbSetOnFollow, dbRemoveOnUnfollow: exports.dbRemoveOnUnfollow, dbRemoveDoc: exports.dbRemoveDoc, dbSetOnParcelRegister: exports.dbSetOnParcelRegister, dbSetOnUserRegister: exports.dbSetOnUserRegister, getParcelDataFromAllParcel: exports.getParcelDataFromAllParcel, getUserActiveParcels: exports.getUserActiveParcels, checkIfDocumentExist: exports.checkIfDocumentExist, findUserWithPhoneNumber: exports.findUserWithPhoneNumber, getAllParcel: exports.getAllParcel };
