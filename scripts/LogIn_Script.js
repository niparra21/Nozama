const LogIn = async () => {
    const email = document.getElementById("LoginEmail").value.trim();
    const password = document.getElementById("LoginPassword").value.trim();

    console.log("Logging in with email:", email);

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {
        const procedureName = 'sp_get_user_by_email';
        const params = { Email: email };
        const result = await executeProcedure(procedureName, params);

        if (
            !result || 
            !result.data || 
            !Array.isArray(result.data) || 
            result.data.length === 0 || 
            !Array.isArray(result.data[0]) || 
            result.data[0].length === 0
        ) {
            alert("Invalid email or password. Please try again.");
            return;
        }

        const user = result.data[0][0];

        if (user.Password !== password) {
            alert("Invalid email or password. Please try again.");
            return;
        }

        alert(`Logged in successfully as ${user.FirstName} ${user.LastName}`);
        console.log(`User logged in: ${user.Email}`);

        document.getElementById("LoginEmail").value = "";
        document.getElementById("LoginPassword").value = "";
        window.location.href = "../GUI/MainMenu.html";
    } catch (error) {
        console.error("Error during login:", error.message);
        alert("Error logging in. Please try again.");
    }
}

document.getElementById("LoginButton").addEventListener("click", LogIn);
