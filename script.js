// Check if a username is stored in localStorage
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (!username && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    } else if (username) {
        const headerElement = document.querySelector('header h3');
        if (headerElement) {
            headerElement.textContent = `${username}`;
        }
    }

    // Initialize the balance and update image
    updateBalance();
    updateImageBasedOnBalance();
    updateCountdown();
    setInterval(updateCountdown, 1000);
});

// Existing balance and last claim
let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
let lastClaim = localStorage.getItem('lastClaim') ? new Date(localStorage.getItem('lastClaim')) : null;
let claimTime = 10 * 60 * 60 * 1000; // 10 hours in milliseconds

// Task rewards tracking
let taskRewards = localStorage.getItem('taskRewards') ? JSON.parse(localStorage.getItem('taskRewards')) : {};

// Function to update balance on page load
function updateBalance() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = balance;
    }
}

// Handle claim button and countdown timer
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    const claimButton = document.getElementById('claimButton');

    if (lastClaim) {
        const now = new Date();
        const elapsed = now - lastClaim;
        const remaining = claimTime - elapsed;
        if (remaining > 0) {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            if (countdownElement) {
                countdownElement.textContent = `${hours} hours ${minutes} minutes`;
            }
            if (claimButton) {
                claimButton.disabled = true;
                claimButton.src = "hours.png"; // Change image to hours.png when disabled
            }
        } else {
            if (countdownElement) {
                countdownElement.textContent = '';
            }
            if (claimButton) {
                claimButton.disabled = false;
                claimButton.src = "hours2.png"; // Change image to hours2.png when enabled
            }
        }
    }
}

// Claim hours when the claim button is clicked
function claimHours() {
    const now = new Date();
    const claimButton = document.getElementById('claimButton');

    if (!lastClaim || now - lastClaim >= claimTime) {
        // Trigger the flip animation
        if (claimButton) {
            claimButton.classList.add('flip');
            setTimeout(() => {
                claimButton.classList.remove('flip');
            }, 3000); // Duration matches the animation time
        }

        // Update balance and save to localStorage
        balance += 10;
        updateBalance();
        lastClaim = new Date();
        localStorage.setItem('lastClaim', lastClaim);
        localStorage.setItem('balance', balance);

        updateCountdown();
        updateImageBasedOnBalance();  // Update image based on new balance
    }
}

// Custom message display function with specific styles for verifying message
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.position = 'fixed';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.padding = '10px 30px';
    messageElement.style.borderRadius = '15px'; // Blunt edges
    messageElement.style.zIndex = '1000';
    messageElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';

    // Apply specific styles for verifying message
    if (message === "Verifying tasks... please complete it fairly") {
        messageElement.style.color = 'green';
        messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'; // Transparent background
        messageElement.style.border = '2px solid red';
    } else {
        // Default styles for other messages
        messageElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Transparent white background
        messageElement.style.border = '2px solid red';
        messageElement.style.color = '#000';
    }

    document.body.appendChild(messageElement);

    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 10000); // Message will disappear after 10 seconds
}

// Handle task completion
function startTask(taskId, url) {
    const taskButton = document.querySelector(`button[onclick*="startTask('${taskId}',"]`);
    const taskLink = document.querySelector(`a[href="${url}"]`);

    // Check if URL has changed
    if (taskRewards[taskId] && taskLink && taskLink.href !== url) {
        delete taskRewards[taskId];
        localStorage.setItem('taskRewards', JSON.stringify(taskRewards));
        if (taskButton) {
            taskButton.textContent = "Start Task";
            taskButton.disabled = false;
        }
    }

    // If task already completed, show a message and remove the link
    if (taskRewards[taskId]) {
        displayMessage("You have already completed this task and received the reward.");
        return;
    }

    window.open(url, '_blank');

    // After 10 seconds, display "Verifying tasks... please complete it fairly"
    setTimeout(() => {
        displayMessage("Verifying tasks... please complete it fairly");
    }, 10000);

    setTimeout(() => {
        displayMessage("You have received 10 hours for completing the task!");
        balance += 10;
        taskRewards[taskId] = true;
        localStorage.setItem('balance', balance);
        localStorage.setItem('taskRewards', JSON.stringify(taskRewards));
        updateBalance();

        // Show completed message and move the task to the bottom
        const taskList = document.getElementById('taskList');
        if (taskList) {
            const taskItem = taskButton.parentNode;
            taskList.appendChild(taskItem); // Move completed task to bottom
        }

        if (taskLink) {
            taskLink.remove();
            const completionText = document.createElement('span');
            completionText.textContent = "You have completed this task.";
            taskLink.parentNode.appendChild(completionText);
        }

        if (taskButton) {
            taskButton.disabled = true;
            taskButton.textContent = "Completed";
        }

        updateImageBasedOnBalance();  // Update image after task completion
    }, 30000); // 30 seconds delay
}

// Function to update image based on balance
function updateImageBasedOnBalance() {
    const balanceElement = document.getElementById("balance");
    const dynamicImage = document.getElementById("dynamicImage");

    const balance = parseInt(balanceElement.textContent, 10);
    let imageSrc = "1a.png";

    if (balance <= 200) imageSrc = "1a.png";
    else if (balance <= 250) imageSrc = "1b.png";
    else if (balance <= 400) imageSrc = "1c.png";
    else if (balance <= 1000) imageSrc = "1d.png";
    else if (balance <= 1400) imageSrc = "1e.png";
    else if (balance <= 1800) imageSrc = "1f.png";
    else if (balance <= 2500) imageSrc = "1g.png";
    else if (balance <= 4000) imageSrc = "1h.png";
    else if (balance <= 8000) imageSrc = "1i.png";
    else if (balance <= 12000) imageSrc = "1j.png";
    else if (balance <= 20000) imageSrc = "1k.png";
    else imageSrc = "1l.png";

    dynamicImage.src = imageSrc;
}
