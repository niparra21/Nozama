function SignUp() {
    var name = document.getElementById("SignUpName").value;
    var lastName = document.getElementById("SignUpLastName").value;
    var email = document.getElementById("SignUpEmail").value;
    var password = document.getElementById("SignUpPassword").value;
    var confirmPassword = document.getElementById("SignUpConfirmPassword").value;

    if (!name || !lastName || !email || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    alert(`Signed up successfully as ${email}`);

    const userData = {
        name: name,
        lastName: lastName,
        email: email,
        password: password,
    };

    console.log("New User Data:", userData);

    document.getElementById("SignUpName").value = "";
    document.getElementById("SignUpLastName").value = "";
    document.getElementById("SignUpEmail").value = "";
    document.getElementById("SignUpPassword").value = "";
    document.getElementById("SignUpConfirmPassword").value = "";

    window.location.href = "../models/MainMenu.html";
}