function LogIn() {
    const email = document.getElementById("LoginEmail").value;
    const password = document.getElementById("LoginPassword").value;

    if (!email || !password) {
        alert("All fields are required!");
        return;
    }

    alert(`Logged in successfully as ${email}`);    
    console.log(`User logged in: ${email}`);

    window.location.href = "../models/MainMenu.html";
}