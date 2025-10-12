// Assume you have an HTML element with id="image-display" to show the images
let dogs = []; // Array to store fetched image URLs
let currentImageIndex = 0;

// Function to fetch image URLs from your API
async function fetchImageUrls() {
    try {
        const response = await fetch('https://new.shelterluv.com/api/v3/available-animals/13458?saved_query=1908&embedded=1&iframeId=shelterluv_wrap_1757291549&columns=1'); // Replace with your API endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        slResponse = await response.json(); // Assuming your API returns an array of URLs
        console.log(slResponse["animals"]);
        let animals = slResponse["animals"];
        animals.forEach(animal => {
            console.log("dog: " + JSON.stringify(animal));
            let dog = [];
            dog["name"] = animal["name"];
            dog["location"] = animal["location"];
            dog["id"] = animal["uniqueId"];
            console.log("wtf");
            let images = animal["photos"];
            if (Array.isArray(images)) {
              images.forEach(image => {
                  if (image["isCover"]) {
                      dog["imageUrl"] = image["url"];
                  }
              
              })
            } else if (typeof images === 'object' && images !== null && Object.hasOwn(images, "1")) {
                              console.log("ADAM: " + Object.keys(images));

              for (const key of Object.keys(images)) {
                image = images[key];
                if (image["isCover"]) {
                  console.log("has cover");
                  console.log("image: " + image["url"]);
                    dog["imageUrl"] = image["url"];
                }
              
              }
            }
            console.log("dog: " + JSON.stringify(dog));

            dogs.push(dog);
            
        });
        // You might need to adjust this based on your API's response structure
        // For example, if it returns an object with a 'data' array: imageUrls = data.data;
    } catch (error) {
        console.error('Error fetching image URLs:', error);
        // Handle error, e.g., display a placeholder or retry
    }
}

// Function to display the next image
function displayNextImage() {
    if (dogs.length === 0) {
        console.warn('No image URLs available to display.');
        return;
    }

    let imageDisplay = document.getElementById('image-display');
    let dogName = document.getElementById('dog-name');
    let dogLocation = document.getElementById('dog-location');
    let dogId = document.getElementById('dog-id');
    let dateField = document.getElementById('date');
    dog = dogs[currentImageIndex];
    imageDisplay.src = dog["imageUrl"];
    dogName.textContent = dog["name"];
    dogLocation.textContent = dog["location"];
    dogId.textContent = dog["id"];
    const today = new Date();

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const formattedDate = today.toLocaleDateString('en-US', options);
    dateField.textContent = today.toLocaleDateString('en-US', options);

    
    
    currentImageIndex = (currentImageIndex + 1) % dogs.length; // Loop back to the beginning
}

// Initialize the process
async function startImageSlideshow() {
    await fetchImageUrls(); // Fetch URLs first

    if (dogs.length > 0) {
        displayNextImage(); // Display the first image immediately
        setInterval(displayNextImage, 30000); // Change image every 30 seconds
    } else {
        console.error('Could not start slideshow: No image URLs fetched.');
    }
}

// Call the function to start the slideshow when the DOM is loaded
document.addEventListener('DOMContentLoaded', startImageSlideshow);
