document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const fileInfo = document.getElementById("file-info");
    const uploadBox = document.getElementById("upload-box");
    const generateButton = document.querySelector(".generate-button-container");
    const sizeLimitMessage = document.getElementById("size-limit-message");
    const audio = document.getElementById('audio');
    const playPauseButton = document.getElementById('play-pause-button');
    const currentTimeSpan = document.getElementById('current-time');
    const totalDurationSpan = document.getElementById('total-duration');
    const upButton = document.getElementById('up-button');
    const audioElements = document.querySelector('.audio_elements');
    const bodyGap = document.body;
    const summaryText = document.getElementById('summary-box');
    const summaryButton = document.getElementById('summary-button');
    const transcriptButton = document.getElementById('transcript-button');
    const transcriptText = document.getElementById('transcript-box');
    const playbackSpeedButton = document.getElementById('playback-speed-button');
    const playbackSpeedText = document.getElementById('playback_speed');
    const backwardButton = document.getElementById('backward-button');
    const progressBar = document.getElementById('progress-bar');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const toast = document.getElementById('toast-container');
    const videoContainer = document.getElementById('video-container');
    const dialog = document.querySelector("dialog")
    const emailInput = document.getElementById("emailInput");
    const submitButton = document.getElementById("submitButton");
    const enteredEmail = emailInput.value;
    let emailEnteredPromise = null;
    let resolveEmailEntered = null;


    // Variable to track if a file has been uploaded
    let isFileUploaded = false;
    let isGenerated = false;
    let isGenerating = false;
    let isPlaying = false;
    let lastFileName = null;
    let playbackSpeed = 1.0; 
    let isEmailThere = false;

    function isEmailValid(email) {
        // Regular expression for a valid email
        const emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailPattern.test(email);
    }
    // Close the modal
    function closeAndCheckEmail() {
        const enteredEmail = emailInput.value;
        // Check if an email is entered
        if (enteredEmail.trim() !== "") {
            if (isEmailValid(enteredEmail)) {
                isEmailThere = true;
                dialog.close();
                // Resolve the promise here
                resolveEmailEntered();
            } else {
                alert("Please enter a valid email address.");
            }
            
        } else {
            alert("Please enter your email.");
        }
    }

    submitButton.addEventListener("click", () => {
        closeAndCheckEmail();
    });
    
    function showToast() {
        toast.style.display = 'block';

    }
    // Get the progress bar fill element
    // Update the progress bar as the audio plays
    let isDragging = false;

    // Add click event listener to the backward button
    backwardButton.addEventListener('click', () => {
        // Move the audio back by 10 seconds
        audio.currentTime -= 10;
    });

    summaryButton.addEventListener('click', () => {
        transcriptButton.style.backgroundColor = 'transparent';
        summaryButton.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        summaryText.textContent = summaryData;
        transcriptText.textContent = "";
    });

    transcriptButton.addEventListener('click', () => {
        summaryButton.style.backgroundColor = 'transparent';
        transcriptButton.style.backgroundColor = '#rgba(0, 0, 0, 0.4)';
        summaryText.textContent = "";
        transcriptText.textContent = transcriptData;
        isSummary = false;
    });

    playbackSpeedButton.addEventListener('click', () => {
        switch (playbackSpeed) {
            case 1.0:
                playbackSpeed = 1.5;
                break;
            case 1.5:
                playbackSpeed = 2.0;
                break;
            case 2.0:
                playbackSpeed = 1;
                break;
            default:
                playbackSpeed = 1.0;
        }
        audio.playbackRate = playbackSpeed;
    
        // Update the button text to reflect the current speed
        playbackSpeedText.textContent = `${playbackSpeed}x`;
    });

        // Update the progress bar as the audio plays
    audio.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const currentTime = audio.currentTime;
            const duration = audio.duration;

            // Calculate the progress percentage
            const progress = (currentTime / duration) * 100;

            // Update the width of the progress bar fill element
            progressBarFill.style.width = progress + '%';
        }
    });

    // Add click event listener to the progress bar
    progressBar.addEventListener('click', (event) => {
        handleProgressClick(event);
    });

    // Add mousedown event listener to the progress bar fill
    progressBarFill.addEventListener('mousedown', (event) => {
        isDragging = true;
        handleDrag(event);
    });

    // Add mousemove event listener to the document to handle drag
    document.addEventListener('mousemove', (event) => {
        if (isDragging) {
            handleDrag(event);
        }
    });

    // Add mouseup event listener to stop dragging
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Function to handle the click event on the progress bar
    function handleProgressClick(event) {
        const progressBarWidth = progressBar.clientWidth;
        const clickX = event.clientX - progressBar.getBoundingClientRect().left;

        // Calculate the new progress based on the click position
        const newProgress = (clickX / progressBarWidth) * 100;

        // Update the width of the progress bar fill element
        progressBarFill.style.width = newProgress + '%';

        // Update the audio playback position
        const newTime = (newProgress / 100) * audio.duration;
        audio.currentTime = newTime;

        // Update the time display
        const currentTimeDisplay = document.getElementById('current-time');
        currentTimeDisplay.textContent = formatTime(newTime);
    }

    // Function to handle the drag event
    function handleDrag(event) {
        const progressBarWidth = progressBar.clientWidth;
        const clickX = event.clientX - progressBar.getBoundingClientRect().left;

        // Calculate the new progress based on the drag position
        const newProgress = (clickX / progressBarWidth) * 100;

        // Update the width of the progress bar fill element
        progressBarFill.style.width = newProgress + '%';

        // Update the audio playback position in real-time
        const newTime = (newProgress / 100) * audio.duration;
        audio.currentTime = newTime;

        // Update the time display in real-time
        const currentTimeDisplay = document.getElementById('current-time');
        currentTimeDisplay.textContent = formatTime(newTime);
    }

    // Function to format time in MM:SS format
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    function downloadAudio() {
        const audioPlayer = document.getElementById("audio");
    
        if (audioPlayer.src) {
            const a = document.createElement("a");
            a.href = audioPlayer.src;
            a.download = "your_audio_file.mp3"; // Set the desired file name
    
            // Trigger a click event on the created <a> element to start the download
            a.click();
        }
    }

    upButton.addEventListener('click', function () {
        downloadAudio();
    });

    // Event listener for the Play/Pause button
    playPauseButton.addEventListener('click', () => {
        const audio = document.getElementById('audio');

        if (!isPlaying) {
            audio.play();
            playPauseButton.innerHTML = `
            <img src="icons/pause.svg" alt="Pause" class="pause-icon">`;
        } else {
            audio.pause();
            playPauseButton.innerHTML = `
            <img src="icons/play.svg" alt="Play" class="play-icon">`;
        }

        isPlaying = !isPlaying;
    });

    // Update the total duration when the audio metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;

        // Format the total duration in minutes and seconds
        const durationFormatted = formatTime(duration);

        // Update the total duration
        totalDurationSpan.textContent = durationFormatted;
    });

    // Update the time info
    audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime;
        const duration = audio.duration;

        // Format the time in minutes and seconds
        const currentTimeFormatted = formatTime(currentTime);
        const durationFormatted = formatTime(duration);

        // Update the time info
        currentTimeSpan.textContent = currentTimeFormatted;
        totalDurationSpan.textContent = durationFormatted;
    });

    // Function to format time in minutes and seconds
    function formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
    }

    // Function to handle file selection and display information
    function handleFileSelection(file) {
        const acceptedExtensions = [".pdf", ".doc", ".docx"];
        const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);

        // Check if the file extension is in the acceptedExtensions array

        if (acceptedExtensions.includes(`.${fileExtension.toLowerCase()}`)) {
            if (file.size > 1 * 1024 * 1024) {
                sizeLimitMessage.textContent = "File size exceeds the maximum limit of 1MB.";
                fileInfo.textContent = "";
                fileInput.value = null;
                isFileUploaded = false; // Reset the flag
            } else {
                sizeLimitMessage.textContent = "";
                fileInfo.textContent = `Selected File: ${file.name} (${formatSize(file.size)})`;
                lastfileUploadstate = fileInfo.textContent;
                isFileUploaded = true; // Set the flag
            }
        }

        else{
            fileInfo.textContent = "";
            sizeLimitMessage.textContent = "File type not supported";
            isFileUploaded = false; // Reset the flag
        }
    }

    // Add drag-and-drop functionality to the entire upload box
    uploadBox.addEventListener("dragover", function (e) {
        e.preventDefault();
        uploadBox.classList.add("dragover"); // Highlight the upload box on drag over
    });

    uploadBox.addEventListener("dragleave", function () {
        uploadBox.classList.remove("dragover"); // Remove highlight when the drag leaves
    });

    uploadBox.addEventListener("drop", function (e) {
        e.preventDefault();
        uploadBox.classList.remove("dragover"); // Remove highlight on drop

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const droppedFile = droppedFiles[0]; // Get the first dropped file
            handleFileSelection(droppedFile);
        }
    });


    fileInput.addEventListener("change", function (e) {
        e.preventDefault();
        const selectedFile = fileInput.files[0]; 
        // Get the first file selected by the user

        console.log(selectedFile);
        if (selectedFile) {
            // Check if file size exceeds 1MB
            if (selectedFile.size > 1 * 1024 * 1024) {
              // Display the message if the file size exceeds the limit
              sizeLimitMessage.textContent = "File size exceeds the maximum limit of 1MB.";
              fileInfo.textContent = ""; // Clear the file info
              fileInput.value = null; // Clear the file input
              isFileUploaded = false; // Reset the flag

            } else {
              // Hide the message and display the file name and size
              sizeLimitMessage.textContent = "";
              fileInfo.textContent = `Selected File: ${selectedFile.name} (${formatSize(selectedFile.size)})`;
                lastfileUploadstate = fileInfo.textContent;
                isFileUploaded = true; // Set the flag
            }
        } else {
            // Hide the message and clear the file info if no file is selected
            sizeLimitMessage.textContent = "";
            fileInfo.textContent = "";
            isFileUploaded = false; // Reset the flag
        }
    });

    uploadButton.addEventListener("click", function (e) {
        // Trigger the file input click event when the "Upload Files" button is clicked
        e.preventDefault();
        fileInput.click();
    });

    // Function to format file size in a human-readable format
    function formatSize(size) {
        const units = ["B", "KB", "MB", "GB"];
        let i = 0;
        while (size >= 1024 && i < units.length - 1) {
            size /= 1024;
            i++;
        }
        return size.toFixed(2) + " " + units[i];
    }

    async function sendFileToServer() {
        const formData = new FormData();
        const selectedFile = fileInput.files[0];
        formData.append("file", selectedFile);

        console.log(selectedFile);
        fetch("https://flask-production-c4af.up.railway.app/upload", {
                method: "POST",
                body: formData,
            })
            .then((response) => {
                const contentType = response.headers.get("content-type");
                
                if (contentType && contentType.includes("application/json")) {
                    console.log("JSON response");
                    return response.json();
                } else {
                    console.log("Blob response");
                    return response.blob(); // Treat as binary data
                }
            })
            .then((data) => {
                // Handle the response from the Flask backend
                console.log(data);
                if (data) {
                    isGenerating = false;
                    lastFileName = selectedFile.name;
                    const audioPlayer = document.getElementById("audio");
                    // If it's binary data, create a Blob URL
                    audioPlayer.src = URL.createObjectURL(data);
                    console.log("Blob URL:", audioPlayer.src);
                    audioPlayer.load();
                    sendEmailToServer(data);
                    bodyGap.style.gap = '35vh';
                    videoContainer.style.display = 'none';
                    toast.style.display = 'none';
                    audioElements.style.display = 'flex';
                }
            })
                .catch((error) => {
                    isGenerating = false;
                    lastFileName = null;
                    console.error("Error sending file to server:", error);
                    toast.style.display = 'none';
                    toast.textContent = 'Sorry, we are facing some issues. Please try again later.';
                    showToast();
                    setTimeout(function () {
                        toast.style.display = 'none';
                    }, 3000);
                });
    
    }

    async function sendEmailToServer(audioBlob) {
        const email = emailInput.value;
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("email", email);
    
        try {
            const response = await fetch("https://flask-production-c4af.up.railway.app/send_audio", {
                method: "POST",
                body: formData,
            });
            console.log(response);
            if (response.ok) {
                toast.textContent = 'Your podcast has been sent to your email.';
                showToast();
                setTimeout(function () {
                    toast.style.display = 'none';
                }, 3000);
                console.log("Email sent successfully");
            } else {
                toast.textContent = 'Your podcast could not be sent to your email.';
                showToast();
                setTimeout(function () {
                    toast.style.display = 'none';
                }, 3000);
                console.log("Email not sent");
                
            }
        } catch (error) {
            console.error("Error sending email to user:", error);
        }
    }
    
    
    generateButton.addEventListener("click", async function (e) {
        const selectedFile = fileInput.files[0];
        e.preventDefault();
        if (isFileUploaded) {
            console.log(isGenerating);
            if (!isEmailThere) {
                dialog.showModal();
                // Create a new promise for email entry
                emailEnteredPromise = new Promise((resolve) => {
                    resolveEmailEntered = resolve;
                });
                // Wait for the promise to resolve
                await emailEnteredPromise;
            }
            // Send the file to the server if the flag is set
            if (isGenerating) {
                console.log(isGenerating);
                toast.textContent = 'Your podcast is being generated. Please wait...';
                showToast();
            }
            if (!isGenerating) {
                if (lastFileName !== selectedFile.name) {
                    bodyGap.style.gap = '5vh';
                    videoContainer.style.display = 'flex';
                    audioElements.style.display = 'none';
                    isGenerating = true;
                    toast.textContent = 'Your podcast is being generated. Please wait...';
                    showToast();
                    await sendFileToServer();
                    console.log("File uploaded");
                }
                else {
                    toast.style.display = 'none';
                    toast.textContent = 'Your podcast was already generated.';
                            showToast();
                            setTimeout(function () {
                                toast.style.display = 'none';
                    }, 3000);
                }
                
            }
        } else {
            // Display the message if no file is uploaded
            fileInfo.textContent = "";
            sizeLimitMessage.textContent = "Please upload a file first.";
        }
    });

});
