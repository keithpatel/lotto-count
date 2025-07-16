import { auth } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut, 
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

const googleSigninButton = document.getElementById('google-signin');
if (googleSigninButton) {
    googleSigninButton.addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                window.location.href = 'index.html';
            }).catch((error) => {
                alert(error.message);
            });
    });
}

const forgotPasswordLink = document.getElementById('forgot-password');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt("Please enter your email address to reset your password.");
        if (email) {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    alert("Password reset email sent! Please check your inbox.");
                })
                .catch((error) => {
                    alert(error.message);
                });
        }
    });
}

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
            window.location.href = 'index.html';
        }
        const userEmailSpan = document.getElementById('user-email');
        if (userEmailSpan) {
            userEmailSpan.textContent = user.email;
        }
    } else {
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
            window.location.href = 'login.html';
        }
    }
});