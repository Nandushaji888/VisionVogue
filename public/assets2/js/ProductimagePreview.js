// script.js
document.getElementById('imageInput').addEventListener('change', function (event) {
    const imagePreview = document.getElementById('imagePreview');
    const imageLimitExceeded = document.getElementById('imageLimitExceeded');
    imagePreview.innerHTML = ''; // Clear previous previews
    imageLimitExceeded.textContent = ''; // Clear previous error messages

    const files = event.target.files;

    if (files.length > 4) {
        imageLimitExceeded.textContent = 'Maximum of 4 images allowed.';
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        const image = document.createElement('img');
        image.classList.add('preview-image');
        image.file = file;

        const reader = new FileReader();
        reader.onload = (function (aImg) {
            return function (e) {
                aImg.src = e.target.result;
            };
        })(image);

        reader.readAsDataURL(file);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            // Remove the image container when the "Remove" button is clicked
            imagePreview.removeChild(imageContainer);
        });

        imageContainer.appendChild(image);
        imageContainer.appendChild(removeButton);
        imagePreview.appendChild(imageContainer);
    }
});
