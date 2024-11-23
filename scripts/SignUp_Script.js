const SignUp = async() => {
    const name = document.getElementById("SignUpName").value.trim();
    const lastName = document.getElementById("SignUpLastName").value.trim();
    const email = document.getElementById("SignUpEmail").value.trim();
    const password = document.getElementById("SignUpPassword").value.trim();
    const confirmPassword = document.getElementById("SignUpConfirmPassword").value.trim();
    const termsAccepted = document.getElementById("SignUpTerms").checked;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(estudiantec\.cr|gmail\.com)$/;

    if (!name || !lastName || !email || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
    }

    if (!emailRegex.test(email)) {
        alert("Email must be from @estudiantec.cr or @gmail.com.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (!termsAccepted) {
        alert("You must accept the terms and conditions.");
        return;
    }
    
    try {
        const checkProcedure = "sp_get_user_by_email";
        const checkParams = { Email: email };
        const checkResult = await executeProcedure(checkProcedure, checkParams);
        console.log("Check result:", checkResult);
        if (checkResult && checkResult.data && checkResult.data.length > 0) {
            alert("This email is already registered. Please use a different email.");
            return;
        }

        const procedureName = "sp_create_user";
        const params = {
            FirstName: name,
            LastName: lastName,
            Email: email,
            Password: password,
        };
        const result = await executeProcedure(procedureName, params);

        console.log("Result:", result);
        if (result && result.data) {
            alert(`Signed up successfully as ${email}`);
            sessionStorage.setItem("UserID", result.data[0][0].NewUserID);

            document.getElementById("SignUpName").value = "";
            document.getElementById("SignUpLastName").value = "";
            document.getElementById("SignUpEmail").value = "";
            document.getElementById("SignUpPassword").value = "";
            document.getElementById("SignUpConfirmPassword").value = "";
            //window.location.href = "../GUI/MainMenu.html";
        } else {
            alert("Error during sign-up. Please try again.");
        }
    } catch (error) {
        console.error("Error during sign-up:", error.message);
        alert("Error signing up. Please try again.");
    }
}



document.getElementById("SignUpButton").addEventListener("click", SignUp);
