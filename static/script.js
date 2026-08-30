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
        deadline: document.getElementById("deadline").value,
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
    updateDeadlineNotifications(applications);

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
    updateDashboard(applications);
    updateChart(applications);
    filteredApplications.forEach(application => {

        const  card = document.createElement("div");

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

function updateDashboard(applications){
    document.getElementById("total-applications").textContent = applications.length;
    const interviews = applications.filter(application => application.status.trim().toLowerCase() === "interview").length;
    document.getElementById("interviews").textContent = interviews;
    const offers = applications.filter(application => application.status.trim().toLowerCase() === "offer").length;
    document.getElementById("offers").textContent = offers;
}

let statusChart;
function updateChart(applications){
    const statuses = ["Applied", "Online Assessment", "Interview", "Offer", "Rejected"];
    const counts = statuses.map(status => {return applications.filter(application => 
        application.status.trim().toLowerCase() === status.toLowerCase()).length;
    });

    if (statusChart){
        statusChart.destroy();
    }
    const ctx = document.getElementById("status-chart");
    statusChart = new Chart(ctx, {
        type: "doughnut",
        data: {labels: statuses, datasets: [{data: counts, backgroundColor: ["blue","orange","purple","green","red"], borderColor:"#ffffff", borderWidth: 2}]},
        options:{responsive: true, plugins: {legend: {position: "bottom"}}}
    });
}

function updateDeadlineNotifications(applications){
    const notificationContainer = document.getElementById("deadline-notifications");
    const today = new Date();
    today.setHours(0,0,0,0);

    const urgentApplications = applications.filter(application => {
        if(!application.deadline){
            return false;
        }
        const deadline = new Date(application.deadline);
        deadline.setHours(0,0,0,0);
        const differenceInMilliseconds = deadline - today;
        const daysUntilDeadline = Math.ceil(differenceInMilliseconds/(1000*60*60*24));
        return(daysUntilDeadline >= 0 && daysUntilDeadline <= 3);
    });
    notificationContainer.innerHTML = "";
    if (urgentApplications.length === 0){
        return;
    }
    notificationContainer.innerHTML = `<h3>⚠️ Upcoming Deadlines</h3>`;

    urgentApplications.forEach(application => {
        const deadline = new Date(application.deadline);
        const today = new Date();
        const differenceInMilliseconds = deadline - today;
        const daysUntilDeadline = Math.ceil(differenceInMilliseconds/(1000*60*60*24));

        let message;
        if(daysUntilDeadline === 0){
            message = "Deadline is today!";
        } else if (daysUntilDeadline === 1){
            message = "Deadline is tomorrow!";
        } else {
            message = `${daysUntilDeadline} days remaining`;
        }
        notificationContainer.innerHTML += `
        <div class="deadline-alert">
        <strong>${application.company}</strong> 
        - ${application.role} 
        <span>${message}</span>
        </div>`;

    });
}

document.getElementById("search").addEventListener("input", loadApplications);
document.getElementById("status-filter").addEventListener("change", loadApplications);

loadApplications();