import Dropzone from "dropzone";

// Utils functions
function checkEmptyValues(formValues: Object) {
    // Aux variables
    let notComplete = false;
    const formKeys = Object.keys(formValues);

    // Check each key and value
    formKeys.forEach((key) => {
        if (!formValues[key]) {
            notComplete = true;
        }
    });

    return notComplete;
}

async function getUserPreview(userForm: any, imgThumbnail: Element) {
    // Get the token
    const userToken = localStorage.getItem("webToken");

    // Check if the user has a token
    if (!userToken) {
        return;
    }

    // Get user data
    const options = { headers: { Authorization: `bearer ${userToken}` } };
    const res = await fetch(`/profile`, options);
    const { foundUser } = await res.json();

    if (!foundUser) {
        return;
    }

    // Get the user properties
    const { profile_image_URL: imageURL, username, bio } = foundUser;

    // Put the form values
    userForm.username.value = username;
    userForm.userbio.value = bio;
    imgThumbnail.setAttribute("src", imageURL);
}

// Main function
(function () {
    // Aux variables
    const userFormEl = document.querySelector(".user-form");
    const thumbnail = document.querySelector(".image-drop__display");
    const dropzoneElClass = ".image-drop";
    let imageURL: string;

    // Get the user
    getUserPreview(userFormEl, thumbnail);

    // Dropzone implementation
    const myDropzone = new Dropzone(dropzoneElClass, {
        url: "/not-working",
        autoProcessQueue: false,
        uploadMultiple: false,
        clickable: true,
        disablePreviews: true,
        maxFiles: 1,
    });

    // Dropzone event
    myDropzone.on("thumbnail", (file) => {
        // Get the image URL
        imageURL = file.dataURL;

        // Create an image to display
        thumbnail.setAttribute("src", imageURL);
    });

    // Get data from the form
    userFormEl.addEventListener("submit", (e: any) => {
        // Prevent default behaviour
        e.preventDefault();

        // Get the form values
        const formData = new FormData(e.target);
        let dataValues = Object.fromEntries(formData.entries());

        // Add the imageURL to the values object
        dataValues = { ...dataValues, imageURL };

        // Check if some value is empty
        const notCompleteForm: boolean = checkEmptyValues(dataValues);

        if (notCompleteForm) {
            alert("No completaste con todos los datos pedidos!");

            return;
        }

        // Send data to the backend
        fetch(`/profile`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(dataValues),
        })
            // Resolve the promise
            .then((res) => res.json())
            .then((data) => {
                // Check if the user was created
                if (!data.createdFlag) {
                    alert("Ya existe un usuario con ese nombre!");

                    return;
                }

                // Save token to the localStorage
                localStorage.setItem("webToken", data.webToken);
            });
    });
})();
