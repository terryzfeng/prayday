//------------------------------------------------------------------------------
// GENERATE AN ACCOUNT KEY FOR A USER
//------------------------------------------------------------------------------
// import { generateNewKeys } from "./lib/utils/account/keys";
// import { uploadKeySettings } from "./lib/utils/firebase/users";
// async function generateAccountKeys(uid: string) {
//   const newKeys = await generateNewKeys();
//   const keySettings = newKeys.keySettings;
//   console.log(uid, keySettings);
//   await uploadKeySettings(uid, keySettings);
//   return true;
// }
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// (window as any).generateAccountKeys = generateAccountKeys;

//------------------------------------------------------------------------------
// ENCRYPT ALL PRAYERS FOR A USER, MAINTAINING PRAYER PLAINTEXT
//------------------------------------------------------------------------------
// import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
// import { importAccountKeys } from "./lib/utils/account/keys";
// import { db } from "./lib/utils/firebase/config";
// import { deserializeFirebaseKeySettings, type FirebaseKeySettings } from "./lib/utils/firebase/firebase-key-settings";
// import { deserializeFirebasePrayerRequest, serializePrayerRequest } from "./lib/utils/firebase/firebase-prayer-request";
// async function encryptAllPrayers(uid: string) {
//   // Get the account keySettings from firebase
//   const keySettingsRef = doc(db, "users", uid, "keys", "keySettings");
//   const keySettingsDoc = await getDoc(keySettingsRef);
//   const keySettings = deserializeFirebaseKeySettings(keySettingsDoc.data() as FirebaseKeySettings);
//   // Convert into keys
//   const keys = await importAccountKeys(keySettings);
//   console.log(keys);
//   // Get all prayers from firebase
//   const prayersRef = collection(db, "users", uid, "prayers");
//   const prayersSnapshot = await getDocs(prayersRef);
//   const fetchedPrayerRequests = prayersSnapshot.docs.map((doc) => {
//     const result = deserializeFirebasePrayerRequest(doc.data());
//     if (result.success) {
//       return result.data;
//     } else {
//       return null;
//     }
//   }).filter((prayerRequest) => prayerRequest !== null);
//   console.log(fetchedPrayerRequests);
//   // Encrypt them
//   if (keys.key === undefined) return;
//   for (const prayerRequest of fetchedPrayerRequests) {
//     await prayerRequest.encrypt(keys.key);
//   }
//   const encryptedPrayerRequests = fetchedPrayerRequests;
//   console.log(encryptedPrayerRequests);
//   // Serialize the prayerRequest
//   const serializedPrayerRequests = encryptedPrayerRequests.map((prayerRequest) => {
//     return serializePrayerRequest(prayerRequest).data;
//   });
//   console.log(serializedPrayerRequests);
//   // Upload to firebase
//   for (const serializedPrayerRequest of serializedPrayerRequests) {
//     const prayerRequestRef = doc(db, "users", uid, "prayers", serializedPrayerRequest.uuid);
//     await setDoc(prayerRequestRef, serializedPrayerRequest);
//   }
// }
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// (window as any).encryptAllPrayers = encryptAllPrayers;

//------------------------------------------------------------------------------
// REMOVE ALL PRAYER PLAINTEXT FOR A USER
//------------------------------------------------------------------------------
// import { collection, getDocs, updateDoc, deleteField } from "firebase/firestore";
// import { db } from "./lib/utils/firebase/config";
// async function removeAllPrayerPlaintext(uid: string) {
//   // Get all prayers from firebase
//   const prayersRef = collection(db, "users", uid, "prayers");
//   const prayersSnapshot = await getDocs(prayersRef);
//   for (const prayerDoc in prayersSnapshot.docs) {
//     const docRef = prayersSnapshot.docs[prayerDoc].ref;
//     await updateDoc(docRef, {
//       prayer: deleteField()
//     })
//   };
// };
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// (window as any).removeAllPrayerPlaintext = removeAllPrayerPlaintext;

export const inject = "inject";
