const form = document.getElementById("application-form");

form.addEventListener("submit", async function(event){
    event.preventDefault();

    const application = {
        company: document.getElementById("company").value,
        role: document.getElementById("role").value,
        location: document.getElementById("location").value,
        status: document.getElementById("status").value,
        application_date: document.getElementById("application_date").value,
        job_url: document.getElementById("job_url").value,
        notes: document.getElementById("notes").value,
    };

    const response = await fetch("/api/applications", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(application)
    });

    if (response.ok){
        form.requestFullscreen();
        loadApplications();
    } else {
        alert("Something went wrong!");
    }
});

async function loadApplications(){
    const response = await fetch("/api/applications");
    const applications = await response.json();
    const container = document.getElementById("applications-containter");
    container.innerHTML = "";
    if (applications.length === 0){
        containter.innerHTML=`<p>No applications yet. Add your first application above!</p>`;
        return;
    }
    applications.forEach(application => {
        const card = document.createElement("div");
        card.classList.add("application-card");
        card.innerHTML = `
            <h3>${application.company}</h3>
            <p><strong>${application.role}</strong></p>
            <p>${application.location || "No location"}</p>
            <p class="status">${application.status}</p>
            <p>Applied:${application.application_date}</p>

            <button onclick="deleteApplication(${application.id})">Delete</button>
        `;
        containter.appendChild(card);
    });
}

async function deleteApplication(id){
    const confirmed = confirm("Are you sure you want to delete this application?");
    if (!confirmed) return;
    await fetch(
        `/api/applications/${id}`,
        {method:"DELETE"}
    );
    loadApplications();
}

loadApplications();