// Submit event handler
document.getElementById("bookingForm").addEventListener("submit", function(event) {
    // Retrieve selected information
    var selectedFaculty = document.getElementById("faculty").value;
    var selectedEvent = document.getElementById("event").value;
    var selectedVenue = document.getElementById("venue").value;
    var selectedTime = document.getElementById("time").value;

    // Store selected information in localStorage
    localStorage.setItem("selectedFaculty", selectedFaculty);
    localStorage.setItem("selectedEvent", selectedEvent);
    localStorage.setItem("selectedVenue", selectedVenue);
    localStorage.setItem("selectedTime", selectedTime);

    // Determine the destination page based on the selected event
    var destinationPage = "";
    switch(selectedEvent) {
        case "Mock GD":
            destinationPage = "mockGD.html";
            break;
        case "Mock INTERVIEW":
            destinationPage = "mockINTERVIEW.html";
            break;
        case "Mock SELFINTRODUCTION":
            destinationPage = "mockSELFINTODUCTION.html";
            break;
        default:
            break;
    }
    if (destinationPage !== "") {
        // Navigate to the corresponding page
        window.location.href = destinationPage;
        event.preventDefault(); // Prevent default form submission behavior
    }
});
