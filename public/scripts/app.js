document.addEventListener('DOMContentLoaded', function() {
    const releases = [
        { image: "https://github.com/kingjulio8238/VLM-tests/blob/main/assets/shirt1v0.1.2.jpeg?raw=true", description: "Trump Ain't Going Anywhere", price: 29.99 },
        { image: "https://github.com/kingjulio8238/VLM-tests/blob/main/assets/shirt1v0.1.2.jpeg?raw=true", description: "Trump test", price: 29.99 },
        // Other releases...
    ];

    let currentReleaseIndex = 0;
    const currentReleaseElement = document.getElementById('currentRelease');
    const recentReleasesElement = document.getElementById('recentReleases');
    const payNowBtn = document.getElementById('payNowBtn');
    const itemsLeftSpan = document.getElementById('itemsLeft');
    const releaseHeading = document.getElementById('releaseHeading');
    let itemsLeft = localStorage.getItem('itemsLeft') ? parseInt(localStorage.getItem('itemsLeft')) : 80;

    let stripe;

    // Fetch the Stripe publishable key and initialize Stripe
    fetch('/config')
        .then(response => response.json())
        .then(config => {
            stripe = Stripe(config.publishableKey);
        })
        .catch(error => {
            console.error('Error fetching Stripe publishable key:', error);
        });

    function updateCurrentRelease() {
        if (currentReleaseIndex < releases.length) {
            //sizeButtons.style.display = 'flex'; // TODO
            document.querySelector('.size-buttons').style.display = 'flex';
            releaseHeading.style.display = 'block';
            itemsLeftSpan.parentNode.style.display = 'block'; // Show the "Items Left" display
            payNowBtn.classList.remove('button-large-centered'); // Ensure normal styling
            payNowBtn.textContent = 'Buy Now'; // Reset button text to "Buy Now"
            // payNowBtn.onclick = function() {
            //     window.location.href = 'thanks.html'; // Original buying link as normal
            // };

            const release = releases[currentReleaseIndex];
            currentReleaseElement.innerHTML = `
                <div class="main-image-wrapper">
                    <img class="main-image" src="${release.image}" alt="Political Merchandise">
                    <div class="main-image-overlay">Release Ended</div>
                </div>
                <p class="product-description">${release.description}</p>
                <div class="price-and-timer">
                    <h4><span class="price">$${release.price}. </span>Fast Delivery</h4>
                    <div class="timer-container">
                        <span class="timer-text">Release Ends In:</span>
                        <span class="timer" id="countdown"></span>
                    </div>
                </div>
            `;
            startCountdown(200); // Set countdown to 30 seconds

            payNowBtn.onclick = function() {
                if (itemsLeft > 0) {
                    createCheckoutSession(releases[currentReleaseIndex]);
                } else {
                    alert("Sorry, this item is sold out!");
                }
            };
        } else {
            // Modified functionality when there are no releases
            //sizeButtons.style.display = 'none';
            // releaseHeading.style.display = 'none';
            // itemsLeftSpan.parentNode.style.display = 'none'; // Hide the "Items Left" display
            // payNowBtn.classList.add('button-large-centered'); // Apply larger, centered styling
            // payNowBtn.textContent = 'Get Notified Of Next Release'; // Change button text
            // payNowBtn.onclick = function() {
            //     window.location.href = 'https://www.youtube.com/watch?v=yWeMWD-Yagg'; // Redirect to a different link
            // };
            document.querySelector('.size-buttons').style.display = 'none'; // Keep size buttons visible
            //releaseHeading.textContent = 'Releases coming soon! Stay tuned 🔥 for new news';
            releaseHeading.style.color = '#ff6b6b'; // Red color
            releaseHeading.style.display = 'none';
            itemsLeftSpan.parentNode.style.display = 'none';
            payNowBtn.classList.add('button-large-centered');
            payNowBtn.textContent = 'Get Notified Of Next Release';
            payNowBtn.onclick = function() {
                window.location.href = 'https://www.youtube.com/watch?v=yWeMWD-Yagg';
            };

            currentReleaseElement.innerHTML = '<h2 class="coming-soon">Releases coming soon! Stay tuned 🔥</h2>'; //

            // Change size buttons to black border and text
            const sizeButtons = document.querySelectorAll('.size-buttons button');
            sizeButtons.forEach(button => {
                button.style.border = '2px solid black';
                button.style.color = 'black';
            });
        }
    }

    function createCheckoutSession(release) {
        fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price: release.price,
                description: release.description,
            }),
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function(session) {
            return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(function(result) {
            if (result.error) {
                alert(result.error.message);
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            alert('There was an error processing your payment. Please try again.');
        });
    }

    function startCountdown(duration) {
        const countdownElement = document.getElementById('countdown');
        const mainImage = document.querySelector('.main-image');
        const mainImageOverlay = document.querySelector('.main-image-overlay');

        let timeLeft = duration;

        function updateCountdown() {
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                countdownElement.textContent = "00:00:00";
                mainImage.classList.add('hidden');
                mainImageOverlay.textContent = "Release Ended";
                moveToRecentReleases();
            } else {
                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                countdownElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                timeLeft--;
            }
        }

        const timerInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    function moveToRecentReleases() {
        const release = releases[currentReleaseIndex];
        const recentReleaseItem = document.createElement('div');
        recentReleaseItem.className = 'recent-release-item';
        recentReleaseItem.innerHTML = `
            <img src="${release.image}" alt="${release.description}">
            <p>${release.description}</p>
        `;
        recentReleasesElement.appendChild(recentReleaseItem);

        currentReleaseIndex++;
        updateCurrentRelease();
    }

    // payNowBtn.addEventListener('click', () => {
    //     if (itemsLeft > 0) {
    //         itemsLeft--;
    //         itemsLeftSpan.textContent = itemsLeft;

    //         // Redirect to thank you page
    //         window.location.href = 'thanks.html';
    //     }
    // });

    payNowBtn.addEventListener('click', () => {
        if (itemsLeft > 0) {
            itemsLeft--;
            localStorage.setItem('itemsLeft', itemsLeft);
            itemsLeftSpan.textContent = itemsLeft;
        }
    });

    const sizeButtons = document.querySelectorAll('.size-buttons button');
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            sizeButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
    });


    const joinCommunityButton = document.querySelector('.join-community');
    joinCommunityButton.addEventListener('click', function() {
        window.location.href = 'https://www.youtube.com/watch?v=3ENmAbpir-Y'; // Redirect to the YouTube link
    });

    // FAQ toggle functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            // Toggle answer visibility based on max-height
            if (answer.style.maxHeight && answer.style.maxHeight !== '0px') {
                answer.style.maxHeight = '0'; // Hide the answer
                this.querySelector('.faq-toggle').textContent = '+'; // Set toggle to '+'
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px'; // Show the answer
                this.querySelector('.faq-toggle').textContent = '-'; // Set toggle to '-'
            }
        });
    });

    // Initialize answers to be hidden on page load
    const faqAnswers = document.querySelectorAll('.faq-answer');
    faqAnswers.forEach(answer => {
        answer.style.maxHeight = '0'; // Ensure all answers are hidden initially
    });
    // Update the items left span on page load
    itemsLeftSpan.textContent = itemsLeft;

    updateCurrentRelease();
});