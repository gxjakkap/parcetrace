interface friends {
    userId: string,
    displayName: string,
    picLink: string
}

interface parcel {
    date: Date,
    carrier: string,
    status: 'available' | 'lost' | 'found',
    parcelId: string,
}

interface userData {
    userId: string,
    name: string,
    surname: string,
    room: string,
    phoneNumber: string
}

interface findUserWithPhoneNumberResponse {
    successful: boolean,
    statusCode: number,
    errorMessage?: string,
    userId?: string
}

export const dbSetOnFollow = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: friends) => {
    await ref.set(data)
}

export const dbRemoveDoc = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    await ref.delete()
}

export const dbRemoveOnUnfollow = async (friendDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, userDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    await friendDocRef.delete()
    const userDoc = await userDocRef.get()
    if (userDoc.exists) {
        await userDocRef.delete()
    }
}

export const dbSetOnParcelRegister = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: parcel) => {
    let userData = await ref.get()
    if (userData.exists) {
        let activeParcels = userData.data()?.activeParcels as parcel[] || []
        activeParcels.push(data)
        await ref.set(userData)
    }
}

export const dbSetOnUserRegister = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: userData) => {
    await ref.set(data)
}

export const checkIfDocumentExist = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    const doc = await ref.get()
    return doc.exists
}

export const findUserWithPhoneNumber = async (collection: FirebaseFirestore.CollectionReference, phoneNumber: number) => {
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

export const getUserActiveParcels = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    const doc = await ref.get()
    if (doc.exists) {
        return doc.data()?.parcels
    }
    else {
        return []
    }
}

export default { dbSetOnFollow, dbRemoveOnUnfollow, dbRemoveDoc, dbSetOnParcelRegister, dbSetOnUserRegister }
export type { friends, parcel, userData }