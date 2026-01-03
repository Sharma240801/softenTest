// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyA-YLK-Na9HdnoM9kFBZNUieLHlujIiftY",
//     authDomain: "test-c8d9b.firebaseapp.com",
//     projectId: "test-c8d9b",
//     storageBucket: "test-c8d9b.firebasestorage.app",
//     messagingSenderId: "133394537964",
//     appId: "1:133394537964:web:79844faaba999bdfb074c9",
//     measurementId: "G-7VT54R7HH6"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);
// const auth = getAuth(app);
// const db = getDatabase(app);

// export {
//     app,
//     // analytics
//     db
// };
// export default auth;



import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyA-YLK-Na9HdnoM9kFBZNUieLHlujIiftY",
    authDomain: "test-c8d9b.firebaseapp.com",
    databaseURL: "https://test-c8d9b-default-rtdb.firebaseio.com",
    projectId: "test-c8d9b",
    storageBucket: "test-c8d9b.appspot.com",
    messagingSenderId: "133394537964",
    appId: "1:133394537964:web:79844faaba999bdfb074c9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export { app };