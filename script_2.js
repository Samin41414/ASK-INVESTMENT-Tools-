document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadAgents();

    const form = document.getElementById('projectForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const projectId = document.getElementById('projectId').value;
            const salesperson = document.getElementById('salesperson').value;
            const customerName = document.getElementById('customerName').value;
            const projectName = document.getElementById('projectName').value;
            const customerPhone = document.getElementById('contactPerson').value;
            const liftQty = parseInt(document.getElementById('liftQty').value) || 0;
            const liftCapacity = document.getElementById('liftDetails').value;
            const status = document.getElementById('status').value;
            const targetDate = document.getElementById('targetDate').value;

            let projects = JSON.parse(localStorage.getItem('liftProjects')) || [];

            if (projectId) {
                const index = projects.findIndex(p => p.id == projectId);
                if (index !== -1) {
                    const oldStatus = projects[index].status;
                    projects[index] = {
                        id: Number(projectId),
                        salesperson, customerName, projectName, contactPerson: customerPhone,
                        liftQty, liftDetails: liftCapacity, status, targetDate
                    };

                    if (!oldStatus.includes('Confirmed') && (status.includes('Confirmed') || status.includes('Order') || status.includes('Delivery'))) {
                        sendEmailNotification(customerName, customerPhone, liftCapacity, status);
                    }
                }
            } else {
                const newProject = {
                    id: Date.now(), salesperson, customerName, projectName,
                    contactPerson: customerPhone, liftQty, liftDetails: liftCapacity, status, targetDate
                };
                projects.push(newProject);

                if (status.includes('Confirmed') || status.includes('Order') || status.includes('Delivery')) {
                    sendEmailNotification(customerName, customerPhone, liftCapacity, status);
                } else {
                    alert("Opportunity added successfully!");
                }
            }

            localStorage.setItem('liftProjects', JSON.stringify(projects));
            resetForm();
            loadProjects();
        });
    }

    const agentForm = document.getElementById('agentForm');
    if (agentForm) {
        agentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const agentId = document.getElementById('agentId').value;
            const name = document.getElementById('agentName').value;
            const phone = document.getElementById('agentPhone').value;

            const photoFile = document.getElementById('agentPhoto').files[0];
            const nidFile = document.getElementById('agentNid').files[0];
            const agreementFile = document.getElementById('agentAgreement').files[0];

            let agents = JSON.parse(localStorage.getItem('liftAgents')) || [];

            if (agentId) {
                const index = agents.findIndex(a => a.id == agentId);
                if (index !== -1) {
                    agents[index].name = name;
                    agents[index].phone = phone;

                    if (photoFile) agents[index].photo = await convertBase64(photoFile);
                    if (nidFile) agents[index].nid = await convertBase64(nidFile);
                    if (agreementFile) agents[index].agreement = await convertBase64(agreementFile);
                }
            } else {
                const photoBase64 = photoFile ? await convertBase64(photoFile) : '';
                const nidBase64 = nidFile ? await convertBase64(nidFile) : '';
                const agreementBase64 = agreementFile ? await convertBase64(agreementFile) : '';

                agents.push({ id: Date.now(), name, phone, photo: photoBase64, nid: nidBase64, agreement: agreementBase64 });
            }

            localStorage.setItem('liftAgents', JSON.stringify(agents));
            resetAgentForm();
            loadAgents();
            alert("Agent profile saved successfully!");
        });
    }
});

const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = (error) => reject(error);
    });
};

function openAgentListPage() {
    loadAgents();
    document.getElementById('agentListPage').classList.remove('hidden');
}

function closeAgentListPage() {
    document.getElementById('agentListPage').classList.add('hidden');
    resetAgentForm();
}

function loadAgents() {
    const agents = JSON.parse(localStorage.getItem('liftAgents')) || [];
    const container = document.getElementById('agentCardsContainer');

    if (!container) return;
    container.innerHTML = '';

    if (agents.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-10 text-center text-slate-500 text-xs font-medium bg-[#0b0f17] rounded-xl border border-slate-800">
                No agent profiles registered yet. Fill out the form above to add an agent.
            </div>
        `;
        return;
    }

    agents.forEach(agent => {
        const placeholderImg = "https://via.placeholder.com/150/0b0f17/94a3b8?text=Agent";
        const photoSrc = agent.photo || placeholderImg;

        const card = document.createElement('div');
        card.className = "bg-[#0b0f17] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between transition duration-200 shadow-lg group";
        
        card.innerHTML = `
            <div class="flex items-center gap-3 cursor-pointer" onclick="openAgentDetailModal(${agent.id})">
                <img src="${photoSrc}" class="w-14 h-14 rounded-xl object-cover border border-cyan-500/30 group-hover:border-cyan-400 shadow-md">
                <div class="overflow-hidden">
                    <h4 class="text-sm font-bold text-white group-hover:text-cyan-400 transition truncate">${escapeHtml(agent.name)}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(agent.phone)}</p>
                    <span class="inline-block mt-2 text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-semibold">View Profile →</span>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 mt-3 border-t border-slate-800 text-xs">
                <button onclick="editAgent(${agent.id})" class="text-cyan-400 hover:text-cyan-300 font-semibold">Edit</button>
                <button onclick="deleteAgent(${agent.id})" class="text-rose-400 hover:text-rose-300 font-semibold">Delete</button>
            </div>
        `;

        container.appendChild(card);
    });
}

function editAgent(id) {
    const agents = JSON.parse(localStorage.getItem('liftAgents')) || [];
    const agent = agents.find(a => a.id === id);

    if (agent) {
        document.getElementById('agentId').value = agent.id;
        document.getElementById('agentName').value = agent.name;
        document.getElementById('agentPhone').value = agent.phone;

        document.getElementById('agentFormTitle').textContent = "✓ Edit Agent Profile";
        document.getElementById('agentSubmitBtn').textContent = "✓ Update Profile";
        document.getElementById('cancelAgentEditBtn').classList.remove('hidden');

        document.getElementById('agentListPage').scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetAgentForm() {
    const form = document.getElementById('agentForm');
    if (form) form.reset();
    document.getElementById('agentId').value = '';
    document.getElementById('agentFormTitle').textContent = "+ Add New Agent";
    document.getElementById('agentSubmitBtn').textContent = "+ Save Agent Profile";
    document.getElementById('cancelAgentEditBtn').classList.add('hidden');
}

function deleteAgent(id) {
    if (confirm("Are you sure you want to delete this agent profile?")) {
        let agents = JSON.parse(localStorage.getItem('liftAgents')) || [];
        agents = agents.filter(a => a.id !== id);
        localStorage.setItem('liftAgents', JSON.stringify(agents));
        loadAgents();
    }
}

function openAgentDetailModal(id) {
    const agents = JSON.parse(localStorage.getItem('liftAgents')) || [];
    const agent = agents.find(a => a.id === id);

    if (!agent) return;

    const placeholderImg = "https://via.placeholder.com/300x200/0b0f17/94a3b8?text=No+Document";
    const profileImg = agent.photo || placeholderImg;
    const nidImg = agent.nid || placeholderImg;
    const agreementImg = agent.agreement || placeholderImg;

    const content = document.getElementById('agentDetailContent');
    content.innerHTML = `
        <div class="flex flex-col sm:flex-row items-center gap-6 bg-[#0b0f17] p-6 rounded-2xl border border-slate-800">
            <img src="${profileImg}" onclick="openImageModal('${profileImg}')" class="w-28 h-28 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg cursor-pointer hover:opacity-90 transition">
            <div class="space-y-2 text-center sm:text-left">
                <h3 class="text-2xl font-bold text-white">${escapeHtml(agent.name)}</h3>
                <p class="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full inline-block">Registered Sales Agent</p>
                <p class="text-xs text-slate-300">Phone: <span class="font-bold text-white">${escapeHtml(agent.phone)}</span></p>
            </div>
        </div>

        <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Legal Documents</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-[#0b0f17] p-4 rounded-xl border border-slate-800 space-y-2">
                    <span class="text-xs font-semibold text-slate-300 block">National ID (NID) Card</span>
                    <div class="relative group cursor-pointer overflow-hidden rounded-lg bg-[#111827] aspect-video flex items-center justify-center border border-slate-800" onclick="openImageModal('${nidImg}')">
                        <img src="${nidImg}" class="w-full h-full object-cover">
                    </div>
                </div>

                <div class="bg-[#0b0f17] p-4 rounded-xl border border-slate-800 space-y-2">
                    <span class="text-xs font-semibold text-slate-300 block">Agent Agreement Form</span>
                    <div class="relative group cursor-pointer overflow-hidden rounded-lg bg-[#111827] aspect-video flex items-center justify-center border border-slate-800" onclick="openImageModal('${agreementImg}')">
                        <img src="${agreementImg}" class="w-full h-full object-cover">
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('agentListPage').classList.add('hidden');
    document.getElementById('agentDetailModal').classList.remove('hidden');
}

function backToAgentDirectory() {
    document.getElementById('agentDetailModal').classList.add('hidden');
    document.getElementById('agentListPage').classList.remove('hidden');
}

function closeAgentDetailModal() {
    document.getElementById('agentDetailModal').classList.add('hidden');
}

function openImageModal(imageSrc) {
    document.getElementById('fullViewImage').src = imageSrc;
    document.getElementById('imageModal').classList.remove('hidden');
}

function closeImageModal() {
    document.getElementById('imageModal').classList.add('hidden');
}

function loadProjects() {
    const tableBody = document.getElementById('salesTableBody');
    const projects = JSON.parse(localStorage.getItem('liftProjects')) || [];
    
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    let totalDemand = 0;
    let inProgressCount = 0;
    let confirmedCount = 0;
    let ordersCount = 0;

    const statuses = [
        "Initial Contact / Inquiry",
        "Quotation / Negotiation",
        "Awaiting Confirmation",
        "Confirmed / Order Placed",
        "Delivery Planning"
    ];

    if (projects.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="py-8 text-center text-slate-500 font-medium">
                    No active project records found. Add a new opportunity above.
                </td>
            </tr>
        `;
    } else {
        projects.forEach((proj, index) => {
            totalDemand += proj.liftQty;

            if (proj.status.includes('Initial') || proj.status.includes('Quotation') || proj.status.includes('Awaiting')) {
                inProgressCount += proj.liftQty;
            } else if (proj.status.includes('Confirmed')) {
                confirmedCount += proj.liftQty;
            } else if (proj.status.includes('Order') || proj.status.includes('Delivery')) {
                ordersCount += proj.liftQty;
            }

            let statusOptionsHtml = '';
            statuses.forEach(s => {
                const selected = proj.status === s ? 'selected' : '';
                statusOptionsHtml += `<option value="${s}" ${selected}>${s}</option>`;
            });

            let selectStyle = "bg-[#0b0f17] text-slate-300 border-slate-800";
            if (proj.status.includes('Initial')) selectStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
            else if (proj.status.includes('Quotation')) selectStyle = "bg-sky-500/10 text-sky-400 border-sky-500/30";
            else if (proj.status.includes('Awaiting')) selectStyle = "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30";
            else if (proj.status.includes('Confirmed') || proj.status.includes('Order') || proj.status.includes('Delivery')) selectStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

            const row = document.createElement('tr');
            row.className = "hover:bg-[#131b2e]/40 transition duration-150";
            row.innerHTML = `
                <td class="py-3.5 px-4 font-medium text-slate-400">${index + 1}</td>
                <td class="py-3.5 px-4 font-semibold text-slate-200">${escapeHtml(proj.salesperson)}</td>
                <td class="py-3.5 px-4">
                    <div class="font-semibold text-white">${escapeHtml(proj.customerName)}</div>
                    <div class="text-[11px] text-slate-400">${escapeHtml(proj.projectName)}</div>
                </td>
                <td class="py-3.5 px-4 text-slate-300">${escapeHtml(proj.contactPerson)}</td>
                <td class="py-3.5 px-4 text-center font-bold text-cyan-400">${proj.liftQty}</td>
                <td class="py-3.5 px-4 text-slate-300">${escapeHtml(proj.liftDetails)}</td>
                <td class="py-3.5 px-4">
                    <select onchange="updateProjectStatus(${proj.id}, this.value)" class="text-xs rounded-lg px-2.5 py-1 border font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 ${selectStyle}">
                        ${statusOptionsHtml}
                    </select>
                </td>
                <td class="py-3.5 px-4 text-slate-400">${proj.targetDate}</td>
                <td class="py-3.5 px-4 text-right space-x-2">
                    <button onclick="editProject(${proj.id})" class="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline text-[11px]">
                        Edit
                    </button>
                    <button onclick="deleteProject(${proj.id})" class="text-rose-400 hover:text-rose-300 font-semibold hover:underline text-[11px]">
                        Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('totalLifts').textContent = totalDemand;
    document.getElementById('inProgressLifts').textContent = inProgressCount;
    document.getElementById('confirmedLifts').textContent = confirmedCount;
    document.getElementById('ordersReceived').textContent = ordersCount;
}

function updateProjectStatus(id, newStatus) {
    let projects = JSON.parse(localStorage.getItem('liftProjects')) || [];
    const index = projects.findIndex(p => p.id === id);

    if (index !== -1) {
        const oldStatus = projects[index].status;
        projects[index].status = newStatus;
        localStorage.setItem('liftProjects', JSON.stringify(projects));

        if (!oldStatus.includes('Confirmed') && (newStatus.includes('Confirmed') || newStatus.includes('Order') || newStatus.includes('Delivery'))) {
            sendEmailNotification(
                projects[index].customerName,
                projects[index].contactPerson,
                projects[index].liftDetails,
                newStatus
            );
        } else {
            loadProjects();
        }
    }
}

function sendEmailNotification(customerName, customerPhone, liftCapacity, status) {
    const templateParams = {
        customer_name: customerName,
        customer_phone: customerPhone,
        lift_capacity: liftCapacity,
        status: status
    };

    emailjs.send("service_xq47tsa", "template_md4vla7", templateParams)
        .then(function(response) {
            alert(`Status updated to "${status}" & Email notifications sent successfully!`);
            loadProjects();
        }, function(error) {
            alert("Status updated, but email notification failed: " + JSON.stringify(error));
            loadProjects();
        });
}

function editProject(id) {
    const projects = JSON.parse(localStorage.getItem('liftProjects')) || [];
    const proj = projects.find(p => p.id === id);

    if (proj) {
        document.getElementById('projectId').value = proj.id;
        document.getElementById('salesperson').value = proj.salesperson;
        document.getElementById('customerName').value = proj.customerName;
        document.getElementById('projectName').value = proj.projectName;
        document.getElementById('contactPerson').value = proj.contactPerson;
        document.getElementById('liftQty').value = proj.liftQty;
        document.getElementById('liftDetails').value = proj.liftDetails;
        document.getElementById('status').value = proj.status;
        document.getElementById('targetDate').value = proj.targetDate;

        document.getElementById('formTitle').textContent = "Edit Lift Opportunity";
        document.getElementById('submitBtn').textContent = "✓ Update Opportunity";
        document.getElementById('cancelEditBtn').classList.remove('hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetForm() {
    const form = document.getElementById('projectForm');
    if (form) form.reset();
    document.getElementById('projectId').value = '';
    document.getElementById('formTitle').textContent = "Add New Lift Opportunity";
    document.getElementById('submitBtn').textContent = "+ Add Opportunity";
    document.getElementById('cancelEditBtn').classList.add('hidden');
}

function deleteProject(id) {
    if (confirm("Are you sure you want to delete this project?")) {
        let projects = JSON.parse(localStorage.getItem('liftProjects')) || [];
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem('liftProjects', JSON.stringify(projects));
        loadProjects();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}