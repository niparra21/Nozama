document.addEventListener("DOMContentLoaded", async function () {
    const firstNameField = document.getElementById("UpdateFirstName");
    const lastNameField = document.getElementById("UpdateLastName");
    const oldPasswordField = document.getElementById("OldPassword");
    const passwordField = document.getElementById("UpdatePassword");
    const confirmPasswordField = document.getElementById("ConfirmPassword");
    const confirmButtonPersonalInfo = document.getElementById("UpdateButton");
    const userID = sessionStorage.getItem("UserID");
    const currentUserData = await getCurrentUserData(userID);

    async function getCurrentUserData(userID) {
        try {
            const procedureName = "sp_get_user_by_id";
            const params = { UserID: userID };
            const result = await executeProcedure(procedureName, params);
            console.log("User data:", result);
            if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
                return result.data[0][0]; // Assuming the result structure is { data: [[user]] }
            } else {
                console.error("No user data found for the given ID.");
                alert("Unable to load user data. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error.message);
            alert("Error loading user data.");
        }
    }

    if (currentUserData) {
        firstNameField.value = currentUserData.FirstName;
        lastNameField.value = currentUserData.LastName;
    }

    confirmButtonPersonalInfo.addEventListener("click", async function () {
        const updatedFirstName = firstNameField.value.trim();
        const updatedLastName = lastNameField.value.trim();
        const oldPassword = oldPasswordField.value.trim();
        const newPassword = passwordField.value.trim();
        const confirmPassword = confirmPasswordField.value.trim();

        if (!updatedFirstName || !updatedLastName || !oldPassword || !newPassword || !confirmPassword) {
            alert("All fields are required.");
            return;
        }

        if (oldPassword !== currentUserData.Password) {
            alert("Incorrect old password.");
            return;
        }

        if(newPassword === oldPassword) {
            alert("New password must be different from the old password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        try {
            const updateProcedure = "sp_update_user";
            const updateResult = await executeProcedure(updateProcedure, {
                UserID: userID,
                FirstName: updatedFirstName,
                LastName: updatedLastName,
                Password: newPassword,
            });

            if (updateResult && updateResult.data) {
                alert("Your information has been updated successfully.");
                
                window.location.href = "../GUI/MainMenu.html";
                
            } else {
                alert("Failed to update information. Please try again.");
            }
        } catch (error) {
            console.error("Error updating user information:", error.message);
            alert("An error occurred while updating your information.");
        }
    });
});

function deleteUserAccount() {
    const popup = document.getElementById("deleteAccountPopup");
    popup.style.display = "flex";
}

function handleSearch() {
    const searchInput = document.getElementById("searchInput").value.trim();
    if (searchInput) {
      sessionStorage.setItem("searchQuery", searchInput); 
      window.location.href = "../GUI/Products.html"; 
    } else {
      alert("Please enter a search term!");
    }
  }

function closePopup() {
    const popup = document.getElementById("deleteAccountPopup");
    popup.style.display = "none";
}


async function confirmAccountDisable() {
    try {
        const userID = sessionStorage.getItem("UserID");

        const procedureName = "sp_delete_user";
        const params = { UserID: userID };

        const result = await executeProcedure(procedureName, params);

        if (result && result.data) {
            alert("Your account has been disabled successfully.");
            console.log("User account disabled:", userID);

            sessionStorage.removeItem("UserID");
            window.location.href = "../GUI/LogIn.html";
        } else {
            alert("Failed to disable the account. Please try again.");
        }
    } catch (error) {
        console.error("Error disabling account:", error.message);
        alert("An error occurred while disabling the account. Please try again.");
    }
}


document.getElementById("DeleteButton").addEventListener("click", deleteUserAccount);
document.getElementById("disableAccountConfirm").addEventListener("click", confirmAccountDisable);
document.getElementById("disableAccountCancel").addEventListener("click", closePopup);

document.getElementById("LogoutButton").addEventListener("click", function () {
    sessionStorage.removeItem("UserID");
    alert("You have been logged out.");
    window.location.href = "../GUI/LogIn.html";
});


async function isUserAdmin(userID) {
    try {
        const procedureName = "sp_get_user_by_id";
        const params = { UserID: userID };
        const result = await executeProcedure(procedureName, params);
        if (result.data[0][0].isAdmin === true) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error checking admin status:", error.message);
        return false;
    }
}
document.getElementById("AdminButton").addEventListener("click", function () {
    isUserAdmin(sessionStorage.getItem("UserID")).then(function (isAdmin) {
        if (isAdmin) {
            window.location.href = "../GUI/Admin.html";
        } else {
            alert("You do not have admin privileges.");
        }
    }).catch(function (error) {
        console.error("Error during admin check:", error.message);
        alert("An error occurred while checking admin permissions. Please try again.");
    });
});