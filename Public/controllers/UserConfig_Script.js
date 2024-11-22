function updateUserConfig() {
    const firstName = document.getElementById("UpdateFirstName").value.trim();
    const lastName = document.getElementById("UpdateLastName").value.trim();
    const oldPassword = document.getElementById("OldPassword").value.trim();
    const password = document.getElementById("UpdatePassword").value.trim();
    const confirmPassword = document.getElementById("ConfirmPassword").value.trim();

    if (!firstName || !lastName || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    alert(`User information updated successfully:\n\nFirst Name: ${firstName}\nLast Name: ${lastName}`);

    const userData = {
        firstName: firstName,
        lastName: lastName,
        password: password,
    };

    console.log("Updated User Data:", userData);

    document.getElementById("UpdateFirstName").value = "";
    document.getElementById("UpdateLastName").value = "";
    document.getElementById("UpdatePassword").value = "";
    document.getElementById("ConfirmPassword").value = "";
}

function deleteUserAccount() {
    const popup = document.getElementById("deleteAccountPopup");
    popup.style.display = "flex";
}

function closePopup() {
    const popup = document.getElementById("deleteAccountPopup");
    popup.style.display = "none";
}

function confirmAccountDeletion() {
    alert("Your account has been deleted successfully.");
    console.log("User account deleted.");

    window.location.href = "../models/login.html";
}

