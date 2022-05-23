interface friends {
    userId: string,
    displayName: string,
    picLink: string
}

interface parcel {
    parcelId: string,
    ownerId: string,
    status: 'available' | 'lost'
}

interface userData {
    userId: string,
    name: string,
    surname: string,
    room: string,
    phoneNumber: string
}

export const dbSetOnFollow = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: friends) => {
    await ref.set(data)
}

export const dbRemoveOnUnfollow = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    await ref.delete()
}

export const dbSetOnParcelRegister = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: parcel) => {
    await ref.set(data)
}

export const dbSetOnUserRegister = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: userData) => {
    await ref.set(data)
}

export default { dbSetOnFollow, dbRemoveOnUnfollow, dbSetOnParcelRegister, dbSetOnUserRegister }
export type { friends, parcel, userData }