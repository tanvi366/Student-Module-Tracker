const form = document.getElementById("application-form");
let editingId = null;
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const application = {
        company: document.getElementById("company").value,
        role: document.getElementById("role").value,
        location: document.getElementById("location").value,
        status: document.getElementById("status").value,
        application_date: document.getElementById("application-date").value,
        job_url: document.getElementById("job-url").value,
        notes: document.getElementById("notes").value
    };

    const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(application)
    });

    if (response.ok) {
        form.reset();
        loadApplications();
    } else {
        alert("Something went wrong!");
    }
});


async function loadApplications() {
    const response = await fetch("/api/applications");

    const applications = await response.json();

    const container = document.getElementById(
        "applications-container"
    );
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const selectedStatus = document.getElementById("status-filter").value;
    const filteredApplications = applications.filter(application => {
        const matchesSearch= (application.company.toLowerCase().includes(searchTerm) || application.role.toLowerCase().includes(searchTerm));
        const matchesStatus = (selectedStatus === "" || application.status === selectedStatus);

        return (matchesSearch && matchesStatus);
    });

    container.innerHTML = "";

    if (applications.length === 0) {
        container.innerHTML = `
            <p>No applications yet. Add your first application above!</p>
        `;
        return;
    }
    if (filteredApplications.length === 0) {
        container.innerHTML = `
            <p>No applications match your search.</p>
        `;
        return;
    }

    filteredApplications.forEach(application => {
        const card = document.createElement("div");

        card.classList.add("application-card");

        card.innerHTML = `
            <h3>${application.company}</h3>

    <p class="role">${application.role}</p>

    <p class="location">
        📍 ${application.location || "No location"}
    </p>

    <p class="status">
        ${application.status}
    </p>

    <p class="date">
        Applied: ${application.application_date}
    </p>

    <button onclick="deleteApplication(${application.id})">
        Delete
    </button>
        `;

        container.appendChild(card);
    });

}


async function deleteApplication(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    await fetch(
        `/api/applications/${id}`,
        {
            method: "DELETE"
        }
    );

    loadApplications();
}

document.getElementById("search").addEventListener("input", loadApplications);
document.getElementById("status-filter").addEventListener("change", loadApplications);

loadApplications();