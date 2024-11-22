async function LogIn() {
    const email = document.getElementById("LoginEmail").value;
    const password = document.getElementById("LoginPassword").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {
        // Use the globally available executeProcedure function
        const result = await executeProcedure('sp_getAllUsers', {});
        console.log('Stored procedure result:', result);
        /*Empezar aqui*/
        alert(`Logged in successfully as ${email}`);
        console.log(`User logged in: ${email}`);

        // Redirect to the main menu
        // window.location.href = "../GUI/MainMenu.html";
    } catch (error) {
        console.error('Error during login:', error.message);
        alert('Error logging in. Please try again.');
    }
}

// Attach the function to the button's click event
document.getElementById("LoginButton").addEventListener('click', LogIn);
