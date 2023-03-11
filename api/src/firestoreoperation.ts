interface lineData {
    displayName: string,
    picLink: string
}

interface userParcel {
    date: number,
    sender: string,
    location: string,
    status: 'available' | 'lost' | 'found',
    parcelId: string,
}

interface allParcel {
    date: number,
    sender: string,
    location: string,
    status: 'available' | 'lost' | 'found',
    parcelId: string,
    userId: string,
}

interface userDataPreRegis {
    userId: string,
    lineData: lineData,
    isRegistered: boolean,
    name?: string,
    surname?: string,
    room?: string,
    phoneNumber?: string
}

interface userData {
    userId: string,
    lineData: lineData,
    isRegistered: true,
    name: string,
    surname: string,
    room: string,
    phoneNumber: string
}

interface userRegistrationData {
    userId: string,
    name: string,
    surname: string,
    phoneNumber: string,
    room: string
}

interface findUserWithPhoneNumberResponse {
    successful: boolean,
    statusCode: number,
    errorMessage?: string,
    userId?: string
}

interface findUserResponse {
    successful: boolean,
    statusCode: number,
    errorMessage?: string,
    user?: userData
}

export const dbSetOnFollow = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: userDataPreRegis) => {
    await ref.set(data)
}

export const dbRemoveDoc = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    await ref.delete()
}

export const dbRemoveOnUnfollow = async (userDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    const userDoc = await userDocRef.get()
    if (userDoc.exists) {
        await userDocRef.delete()
    }
}

export const dbSetOnParcelRegister = async (userRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, userParcelData: userParcel, allActiveRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, parcelData: allParcel) => {
    let userData = await userRef.get()
    if (userData.exists) {
        let activeParcels = userData.data()?.activeParcel as userParcel[] || []
        activeParcels.push(userParcelData)
        await userRef.update({ activeParcel: activeParcels })
    }
    await allActiveRef.set(parcelData)
}

export const dbRemoveParcelFromUserData = async (userRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, parcelId: string) => {
    let userData = await userRef.get()
    if (userData.exists) {
        let activeParcels = userData.data()?.activeParcel as userParcel[] || []
        activeParcels = activeParcels.filter(parcel => parcel.parcelId !== parcelId)
        await userRef.update({ activeParcel: activeParcels })
    }
}

export const dbSetOnUserRegister = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: userRegistrationData) => {
    let userData = await ref.get()
    if (userData.exists) {
        let userDataObj = userData.data() as userDataPreRegis
        userDataObj.name = data.name
        userDataObj.surname = data.surname
        userDataObj.phoneNumber = data.phoneNumber
        userDataObj.room = data.room
        userDataObj.isRegistered = true
        await ref.update(userDataObj)
    }
}

export const checkIfDocumentExist = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    const doc = await ref.get()
    return doc.exists
}

export const findUserWithPhoneNumber = async (collection: FirebaseFirestore.CollectionReference, phoneNumber: string) => {
    const snapshot = await collection.where('phoneNumber', '==', phoneNumber).get()
    let response: findUserWithPhoneNumberResponse = { successful: false, statusCode: 500 }
    if (!snapshot.empty) {
        let dataArray: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = []
        snapshot.forEach(doc => {
            dataArray.push(doc)
        })
        if (dataArray.length > 1) {
            response.errorMessage = "More than one user have the same phone number!"
        }
        else if (dataArray.length == 1) {
            response.successful = true
            response.statusCode = 200
            response.userId = dataArray[0].data().userId
        }
        else if (dataArray.length == 0) {
            response.successful = true
            response.statusCode = 404
        }
        else {
            response.statusCode = 500
            response.errorMessage = "Internal server error."
        }
    }
    else {
        response.statusCode = 404
        response.errorMessage = "User not found."
    }
    return response
}

export const adminAppFindUserWithFullname = async (collection: FirebaseFirestore.CollectionReference, fullNameString: string) => {
    const fullName = fullNameString.split(" ")

    const snapshot = await collection.where('name', '==', fullName[0]).where('surname', '==', fullName[1]).get()
    let response: findUserResponse = { successful: false, statusCode: 500 }
    if (!snapshot.empty) {
        let dataArray: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = []
        snapshot.forEach(doc => {
            dataArray.push(doc)
        })
        if (dataArray.length > 1) {
            response.errorMessage = "User Duplication!"
        }
        else if (dataArray.length == 1) {
            response.successful = true
            response.statusCode = 200
            response.user = dataArray[0].data() as userData
        }
        else if (dataArray.length == 0) {
            response.successful = true
            response.statusCode = 404
        }
        else {
            response.statusCode = 500
            response.errorMessage = "Internal server error."
        }
    }
    else {
        response.statusCode = 404
        response.errorMessage = "User not found."
    }
    return response
}

export const adminAppFindUserWithPhoneNumber = async (collection: FirebaseFirestore.CollectionReference, phoneNumber: string) => {
    const snapshot = await collection.where('phoneNumber', '==', phoneNumber).get()
    let response: findUserResponse = { successful: false, statusCode: 500 }
    if (!snapshot.empty) {
        let dataArray: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = []
        snapshot.forEach(doc => {
            dataArray.push(doc)
        })
        if (dataArray.length > 1) {
            response.errorMessage = "User Duplication!"
        }
        else if (dataArray.length == 1) {
            response.successful = true
            response.statusCode = 200
            response.user = dataArray[0].data() as userData
        }
        else if (dataArray.length == 0) {
            response.successful = true
            response.statusCode = 404
        }
        else {
            response.statusCode = 500
            response.errorMessage = "Internal server error."
        }
    }
    else {
        response.statusCode = 404
        response.errorMessage = "User not found."
    }
    return response
}

export const adminAppFindUserWithFirstName = async (collection: FirebaseFirestore.CollectionReference, firstName: string) => {
    const snapshot = await collection.where('name', '==', firstName).get()
    let response: findUserResponse = { successful: false, statusCode: 500 }
    if (!snapshot.empty) {
        let dataArray: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = []
        snapshot.forEach(doc => {
            dataArray.push(doc)
        })
        if (dataArray.length > 1) {
            response.errorMessage = "User Duplication!"
        }
        else if (dataArray.length == 1) {
            response.successful = true
            response.statusCode = 200
            response.user = dataArray[0].data() as userData
        }
        else if (dataArray.length == 0) {
            response.successful = true
            response.statusCode = 404
        }
        else {
            response.statusCode = 500
            response.errorMessage = "Internal server error."
        }
    }
    else {
        response.statusCode = 404
        response.errorMessage = "User not found."
    }
    return response
}

export const getUserActiveParcels = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    const doc = await ref.get()
    if (doc.exists) {
        //return (doc.data()?.activeParcel !== undefined) ? doc.data()?.activeParcel : []
        const data = doc.data()
        return {
            userData: {
                name: (data?.name !== undefined) ? data?.name : "undefined", 
                surname: (data?.surname !== undefined) ? data?.surname : "undefined"
            },
            lineData: (data?.lineData !== undefined) ? data?.lineData : {},
            activeParcel: (data?.activeParcel !== undefined) ? data?.activeParcel : []
        }
    }
    else {
        return null
    }
}

export const getParcelDataFromAllParcel = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    const doc = await ref.get()
    return doc.exists ? doc.data() : null
}

export const checkForRegistrationEligibility = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    const doc = await ref.get()
    return (doc.exists && doc.data()?.isRegistered == false)
}

export const getAllParcel = async (allRef:FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>) => {
    const snap = await allRef.get()
    let ansArr: FirebaseFirestore.DocumentData[]|any[] = []
    if (!snap.empty){
        snap.forEach((doc) => {
            ansArr.push(doc.data())
        })
    }
    return ansArr
}

export default { dbSetOnFollow, dbRemoveOnUnfollow, dbRemoveDoc, dbSetOnParcelRegister, dbSetOnUserRegister, getParcelDataFromAllParcel, getUserActiveParcels, checkIfDocumentExist, findUserWithPhoneNumber, getAllParcel, adminAppFindUserWithFirstName, adminAppFindUserWithFullname, adminAppFindUserWithPhoneNumber }
export type { userParcel, allParcel, userData }