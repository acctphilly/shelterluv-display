// Configuration for the slideshow
// The HTML file should define a global SLIDESHOW_CONFIG object if it needs to override these defaults
const DEFAULT_CONFIG = {
    dogInterval: 15000,        // Total time to show each dog
    photoInterval: 4000,       // Time to show each photo if multiple exist
    transitionSpeed: 500,      // Fade transition speed in ms
    rotateMultiplePhotos: true, // Set to false to only show the cover/first photo
    apiUrl: '',                // API URL to fetch from
    pageTitle: 'Available Dogs' // Fallback title
};

// Merge defaults with user config
const CONFIG = { ...DEFAULT_CONFIG, ...(window.SLIDESHOW_CONFIG || {}) };

let dogs = []; 
let currentDogIndex = -1;
let currentPhotoIndex = 0;
let dogTimer = null;
let photoTimer = null;

// Function to fetch image URLs from your API
async function fetchImageUrls() {
    try {
        if (!CONFIG.apiUrl) {
            console.error('No API URL provided in CONFIG');
            return;
        }
        const response = await fetch(CONFIG.apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const slResponse = await response.json();
        const animals = slResponse["animals"] || [];
        
        dogs = animals.map(animal => {
            let photos = [];
            const rawPhotos = animal["photos"];
            
            if (Array.isArray(rawPhotos)) {
                // Sort to put cover first
                const sorted = [...rawPhotos].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0));
                photos = sorted.map(p => p.url);
            } else if (typeof rawPhotos === 'object' && rawPhotos !== null) {
                const keys = Object.keys(rawPhotos);
                const sortedKeys = keys.sort((a, b) => (rawPhotos[b].isCover ? 1 : 0) - (rawPhotos[a].isCover ? 1 : 0));
                photos = sortedKeys.map(k => rawPhotos[k].url);
            }

            return {
                name: animal["name"],
                location: animal["location"],
                id: animal["uniqueId"],
                photos: photos.length > 0 ? photos : [null]
            };
        });
    } catch (error) {
        console.error('Error fetching image URLs:', error);
    }
}

function updateDisplay(isNewDog = false) {
    if (dogs.length === 0) return;

    const container = document.querySelector('.full-screen-container');
    const imageDisplay = document.getElementById('image-display');
    const dogName = document.getElementById('dog-name');
    const dogLocation = document.getElementById('dog-location');
    const dogId = document.getElementById('dog-id');
    const dateField = document.getElementById('date');

    const dog = dogs[currentDogIndex];
    const photoUrl = dog.photos[currentPhotoIndex];

    if (isNewDog) {
        container.style.opacity = '0';
        setTimeout(() => {
            if (photoUrl) imageDisplay.style.backgroundImage = `url('${photoUrl}')`;
            dogName.textContent = dog.name;
            dogLocation.textContent = dog.location;
            dogId.textContent = dog.id;
            
            const today = new Date();
            dateField.textContent = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            
            container.style.opacity = '1';
        }, CONFIG.transitionSpeed);
    } else {
        imageDisplay.style.opacity = '0';
        setTimeout(() => {
            if (photoUrl) imageDisplay.style.backgroundImage = `url('${photoUrl}')`;
            imageDisplay.style.opacity = '1';
        }, CONFIG.transitionSpeed);
    }
}

function showNextDog() {
    if (dogs.length === 0) return;

    currentDogIndex = (currentDogIndex + 1) % dogs.length;
    currentPhotoIndex = 0;
    
    clearInterval(photoTimer);
    updateDisplay(true);
    
    const dog = dogs[currentDogIndex];
    if (CONFIG.rotateMultiplePhotos && dog.photos.length > 1) {
        photoTimer = setInterval(() => {
            currentPhotoIndex = (currentPhotoIndex + 1) % dog.photos.length;
            updateDisplay(false);
        }, CONFIG.photoInterval);
    }
}

async function startImageSlideshow() {
    await fetchImageUrls();

    if (dogs.length > 0) {
        showNextDog();
        dogTimer = setInterval(showNextDog, CONFIG.dogInterval);
    } else {
        console.error('Could not start slideshow: No dogs fetched.');
    }
}

document.addEventListener('DOMContentLoaded', startImageSlideshow);
