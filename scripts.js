const API_TOKEN = 'YOUR_API_TOKEN'; // This should be replaced with actual token
const API_URL = 'https://api.momentum.ge';

function openModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
    
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('department').value = '';
    document.getElementById('avatarUpload').value = '';
    document.getElementById('avatarPreview').style.display = 'none';
    document.getElementById('uploadPrompt').style.display = 'block';
    
    document.getElementById('firstName').classList.remove('invalid', 'valid');
    document.getElementById('lastName').classList.remove('invalid', 'valid');
    document.getElementById('department').classList.remove('invalid', 'valid');
    document.getElementById('dropZone').classList.remove('invalid', 'valid');
}

function isValidNameCharacters(name) {
    const georgianPattern = /^[\u10A0-\u10FF\s]+$/;
    const englishPattern = /^[a-zA-Z\s]+$/;
    return georgianPattern.test(name) || englishPattern.test(name);
}

function isValidImageType(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
}

function isValidFileSize(file) {
    const maxSize = 600 * 1024; 
    return file.size <= maxSize;
}

function updateValidationUI(element, isValid) {
    if (isValid) {
        element.classList.remove('invalid');
        element.classList.add('valid');
    } else {
        element.classList.remove('valid');
        element.classList.add('invalid');
    }
    
    const container = element.closest('.input-container');
    if (container) {
        const indicators = container.querySelectorAll('.validation-item .validation-indicator');
        indicators.forEach(indicator => {
            indicator.classList.toggle('valid', isValid);
            indicator.classList.toggle('invalid', !isValid);
        });
    }
}

function validateForm() {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const department = document.getElementById('department');
    const avatarUpload = document.getElementById('avatarUpload');
    
    const isFirstNameValid = firstName.value.length >= 2 && 
                             firstName.value.length <= 255 && 
                             isValidNameCharacters(firstName.value);
    
    const isLastNameValid = lastName.value.length >= 2 && 
                            lastName.value.length <= 255 && 
                            isValidNameCharacters(lastName.value);
    
    const isDepartmentValid = department.value !== '';
    
    let isAvatarValid = false;
    if (avatarUpload.files.length > 0) {
        const file = avatarUpload.files[0];
        isAvatarValid = isValidImageType(file) && isValidFileSize(file);
    }
    
    const submitBtn = document.querySelector('.submit-btn');
    if (isFirstNameValid && isLastNameValid && isDepartmentValid && isAvatarValid) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
    }
    
    return {
        isFirstNameValid,
        isLastNameValid,
        isDepartmentValid,
        isAvatarValid,
        isFormValid: isFirstNameValid && isLastNameValid && isDepartmentValid && isAvatarValid
    };
}

async function fetchDepartments() {
    try {
        const response = await fetch(`${API_URL}/departments`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch departments');
        }
        
        const data = await response.json();
        const departmentSelect = document.getElementById('department');
        
        // Clear existing options except the first placeholder
        const firstOption = departmentSelect.options[0];
        departmentSelect.innerHTML = '';
        departmentSelect.append(firstOption);
        
        data.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error fetching departments:', error);
    }
}

async function submitEmployeeData(formData) {
    try {
        const response = await fetch(`${API_URL}/employees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit employee data');
        }
        
        const data = await response.json();
        
        alert('თანამშრომელი წარმატებით დაემატა!');
        
        closeModal();
        
        return data;
    } catch (error) {
        console.error('Error submitting employee data:', error);
        alert('შეცდომა თანამშრომლის დამატებისას. გთხოვთ სცადოთ თავიდან.');
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchDepartments();
    
    document.getElementById('userModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    const firstNameValidationItems = document.querySelectorAll('#firstName + .validation-container .validation-item .validation-indicator');
    const lastNameValidationItems = document.querySelectorAll('#lastName + .validation-container .validation-item .validation-indicator');
    
    firstNameValidationItems.forEach(item => {
        item.classList.add('invalid');
    });
    
    lastNameValidationItems.forEach(item => {
        item.classList.add('invalid');
    });
    
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const department = document.getElementById('department');
    const avatarUpload = document.getElementById('avatarUpload');
    const submitBtn = document.querySelector('.submit-btn');
    const dropZone = document.getElementById('dropZone');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const avatarPreview = document.getElementById('avatarPreview');
    const previewImage = document.getElementById('previewImage');
    const removeAvatar = document.getElementById('removeAvatar');
    
    uploadPrompt.addEventListener('click', function() {
        avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            const isValidType = isValidImageType(file);
            const isValidSize = isValidFileSize(file);
            
            if (!isValidType) {
                alert('გთხოვთ აირჩიოთ სურათის ფაილი');
                avatarUpload.value = '';
                return;
            }
            
            if (!isValidSize) {
                alert('სურათის ზომა არ უნდა აღემატებოდეს 600KB-ს');
                avatarUpload.value = '';
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                previewImage.src = event.target.result;
                avatarPreview.style.display = 'block';
                uploadPrompt.style.display = 'none';
            };
            
            reader.readAsDataURL(file);
            
            updateValidationUI(dropZone, true);
            validateForm();
        }
    });
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.style.border = '2px dashed #8338EC';
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.style.border = '1px dashed #CED4DA';
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.style.border = '1px dashed #CED4DA';
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            
            const isValidType = isValidImageType(file);
            const isValidSize = isValidFileSize(file);
            
            if (!isValidType) {
                alert('გთხოვთ აირჩიოთ სურათის ფაილი');
                return;
            }
            
            if (!isValidSize) {
                alert('სურათის ზომა არ უნდა აღემატებოდეს 600KB-ს');
                return;
            }
            
            avatarUpload.files = e.dataTransfer.files;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImage.src = event.target.result;
                avatarPreview.style.display = 'block';
                uploadPrompt.style.display = 'none';
            };
            
            reader.readAsDataURL(file);
            
            updateValidationUI(dropZone, true);
            validateForm();
        }
    });
    
    removeAvatar.addEventListener('click', function() {
        avatarUpload.value = '';
        previewImage.src = '';
        avatarPreview.style.display = 'none';
        uploadPrompt.style.display = 'block';
        
        updateValidationUI(dropZone, false);
        validateForm();
    });
    
    firstName.addEventListener('input', function() {
        const isValid = this.value.length >= 2 && 
                       this.value.length <= 255 && 
                       isValidNameCharacters(this.value);
        updateValidationUI(this, isValid);
        validateForm();
    });
    
    lastName.addEventListener('input', function() {
        const isValid = this.value.length >= 2 && 
                       this.value.length <= 255 && 
                       isValidNameCharacters(this.value);
        updateValidationUI(this, isValid);
        validateForm();
    });
    
    department.addEventListener('change', function() {
        const isValid = this.value !== '';
        updateValidationUI(this, isValid);
        validateForm();
    });
    
    validateForm();
    
    const multiSelects = document.querySelectorAll('.multi-select');
    const selectedFiltersContainer = document.querySelector('.selected-filters-container');
    const clearAllButton = document.querySelector('.clear-all');
    
    function saveFiltersToStorage() {
        const selectedFilters = {
            'department-select': [],
            'priority-select': [],
            'employee-select': []
        };
        
        document.querySelectorAll('.filter-tag').forEach(tag => {
            const filterType = tag.dataset.filterType;
            const value = tag.dataset.value;
            if (filterType && value) {
                selectedFilters[filterType].push(value);
            }
        });
        
        localStorage.setItem('selectedFilters', JSON.stringify(selectedFilters));
    }
    
    function restoreFiltersFromStorage() {
        const savedFilters = localStorage.getItem('selectedFilters');
        if (!savedFilters) return;
        
        try {
            const filters = JSON.parse(savedFilters);
            
            Object.keys(filters).forEach(filterType => {
                const select = document.getElementById(filterType);
                if (!select) return;
                
                const values = filters[filterType];
                if (!values || !values.length) return;
                
                values.forEach(value => {
                    const option = select.querySelector(`.multi-select-option[data-value="${value}"]`);
                    if (option) {
                        option.classList.add('selected');
                        
                        const tag = document.createElement('div');
                        tag.className = 'filter-tag';
                        tag.dataset.filterType = filterType;
                        tag.dataset.value = value;
                        
                        const text = document.createElement('span');
                        text.textContent = option.querySelector('.option-text').textContent;
                        
                        const removeBtn = document.createElement('div');
                        removeBtn.className = 'remove-tag';
                        removeBtn.addEventListener('click', () => {
                            tag.remove();
                            option.classList.remove('selected');
                            applyFilters();
                            updateClearAllVisibility();
                            saveFiltersToStorage();
                        });
                        
                        tag.appendChild(text);
                        tag.appendChild(removeBtn);
                        selectedFiltersContainer.appendChild(tag);
                    }
                });
            });
            
            applyFilters();
            updateClearAllVisibility();
            
        } catch (error) {
            console.error('Error restoring filters:', error);
        }
    }
    
    function updateClearAllVisibility() {
        const hasSelectedFilters = selectedFiltersContainer.children.length > 0;
        if (hasSelectedFilters) {
            clearAllButton.classList.add('visible');
        } else {
            clearAllButton.classList.remove('visible');
        }
    }
    
    multiSelects.forEach(select => {
        const header = select.querySelector('.multi-select-header');
        const options = select.querySelectorAll('.multi-select-option');
        const applyBtn = select.querySelector('.apply-filter-btn');
        let selectedValues = new Set();
        
        header.addEventListener('click', function(e) {
            multiSelects.forEach(otherSelect => {
                if (otherSelect !== select) {
                    otherSelect.classList.remove('active');
                }
            });
            
            select.classList.toggle('active');
        });
        
        options.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = option.dataset.value;
                
                option.classList.toggle('selected');
                if (option.classList.contains('selected')) {
                    selectedValues.add(value);
                } else {
                    selectedValues.delete(value);
                }
            });
        });
        
        applyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const headerText = header.textContent.trim().split('\n')[0].trim();
            const selectedOptions = Array.from(select.querySelectorAll('.multi-select-option.selected'));
            
            const existingTags = selectedFiltersContainer.querySelectorAll(`[data-filter-type="${select.id}"]`);
            existingTags.forEach(tag => tag.remove());
            
            selectedOptions.forEach(option => {
                const tag = document.createElement('div');
                tag.className = 'filter-tag';
                tag.dataset.filterType = select.id;
                tag.dataset.value = option.dataset.value;
                
                const text = document.createElement('span');
                text.textContent = option.querySelector('.option-text').textContent;
                
                const removeBtn = document.createElement('div');
                removeBtn.className = 'remove-tag';
                removeBtn.addEventListener('click', () => {
                    tag.remove();
                    option.classList.remove('selected');
                    selectedValues.delete(option.dataset.value);
                    applyFilters();
                    updateClearAllVisibility();
                    saveFiltersToStorage();
                });
                
                tag.appendChild(text);
                tag.appendChild(removeBtn);
                selectedFiltersContainer.appendChild(tag);
            });
            
            applyFilters();
            
            updateClearAllVisibility();
            
            saveFiltersToStorage();
            
            select.classList.remove('active');
        });
    });
    
    clearAllButton.addEventListener('click', () => {
        selectedFiltersContainer.innerHTML = '';
        document.querySelectorAll('.multi-select-option').forEach(option => {
            option.classList.remove('selected');
        });
        applyFilters();
        updateClearAllVisibility();
        
        localStorage.removeItem('selectedFilters');
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.multi-select')) {
            multiSelects.forEach(select => {
                select.classList.remove('active');
            });
        }
    });
    
    function applyFilters() {
        const departmentValues = getSelectedValues('department-select');
        const priorityValues = getSelectedValues('priority-select');
        const employeeValues = getSelectedValues('employee-select');
        
        const taskCards = document.querySelectorAll('.task-card');
        
        taskCards.forEach(card => {
            let showCard = true;
            
            if (departmentValues.size > 0) {
                const cardDepartment = card.querySelector('.department-tag').classList[1];
                if (!departmentValues.has(cardDepartment)) {
                    showCard = false;
                }
            }
            
            if (priorityValues.size > 0) {
                const cardPriority = card.querySelector('.task-priority').classList[1];
                if (!priorityValues.has(cardPriority)) {
                    showCard = false;
                }
            }
            
            if (employeeValues.size > 0) {
                const cardAssignee = card.querySelector('.assignee-avatar').style.backgroundImage;
                const matchingEmployee = Array.from(employeeValues).some(value => {
                    const employeeOption = document.querySelector(`#employee-select .multi-select-option[data-value="${value}"]`);
                    const employeeAvatar = employeeOption.querySelector('.employee-avatar');
                    return cardAssignee.includes(employeeAvatar.src);
                });
                
                if (!matchingEmployee) {
                    showCard = false;
                }
            }
            
            card.style.display = showCard ? 'flex' : 'none';
        });
    }
    
    function getSelectedValues(selectId) {
        const select = document.getElementById(selectId);
        const selectedOptions = select.querySelectorAll('.multi-select-option.selected');
        return new Set(Array.from(selectedOptions).map(opt => opt.dataset.value));
    }
    
    restoreFiltersFromStorage();

    submitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const isFirstNameValid = firstName.value.length >= 2 && 
                                firstName.value.length <= 255 && 
                                isValidNameCharacters(firstName.value);
        
        const isLastNameValid = lastName.value.length >= 2 && 
                               lastName.value.length <= 255 && 
                               isValidNameCharacters(lastName.value);
        
        const isDepartmentValid = department.value !== '';
        
        let isAvatarValid = false;
        if (avatarUpload.files.length > 0) {
            const file = avatarUpload.files[0];
            isAvatarValid = isValidImageType(file) && isValidFileSize(file);
        }
        
        updateValidationUI(firstName, isFirstNameValid);
        updateValidationUI(lastName, isLastNameValid);
        updateValidationUI(department, isDepartmentValid);
        updateValidationUI(avatarUpload, isAvatarValid);
        
        if (isFirstNameValid && isLastNameValid && isDepartmentValid && isAvatarValid) {
            const formData = new FormData();
            formData.append('first_name', firstName.value);
            formData.append('last_name', lastName.value);
            formData.append('department_id', department.value);
            formData.append('avatar', avatarUpload.files[0]);
            
            try {
                await submitEmployeeData(formData);
            } catch (error) {
                console.error('Error adding employee:', error);
            }
        }
    });
});

const mockTasks = {
    "1": {
        id: "1",
        title: "Redberry-ს საიტის ლენდინგის დიზაინი",
        description: "მიზანია რომ შეიქმნას თანამედროვე, სუფთა და ფუნქციონალური დიზაინი, რომელიც უზრუნველყოფს მარტივ ნავიგაციას და მკაფიო ინფორმაციის გადაცემას.",
        priority: "high",
        department: "design",
        status: "to-do",
        assignee: {
            name: "ელაია ბაგრატიონი",
            department: "design",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        dueDate: "2025-02-02",
        comments: [
            {
                author: {
                    name: "ემილია მორგანი",
                    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
                },
                text: "დიზაინი სუფთად ჩანს, მაგრამ კოდირებისას მნიშვნელოვანი იქნება, რომ ელემენტებს ჰქონდეს შესაბამისი რეზოლუცია."
            }
        ]
    },
    "2": {
        id: "2",
        title: "ფუნქციონალის განახლება",
        description: "ფილტრების სექციის განახლება და ახალი ფუნქციონალის დამატება პროექტის მოთხოვნების შესაბამისად. საჭიროა ახალი ფილტრების დამატება და არსებული ფილტრების ოპტიმიზაცია.",
        priority: "medium",
        department: "dev",
        status: "in-progress",
        assignee: {
            name: "გიორგი დათუაშვილი",
            department: "dev",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        dueDate: "2025-02-15",
        comments: [
            {
                author: {
                    name: "ნინო კვარაცხელია",
                    avatar: "https://randomuser.me/api/portraits/women/22.jpg"
                },
                text: "ფილტრების ლოგიკა კარგად არის გაწერილი, თუმცა საჭიროა დამატებითი ტესტირება მობილურ ვერსიაზე."
            }
        ]
    }
};

async function fetchTasks() {
    try {
        // Group tasks by status
        const tasksByStatus = {
            'to-do': [],
            'in-progress': [],
            'testing': [],
            'done': []
        };
        
        Object.values(mockTasks).forEach(task => {
            if (tasksByStatus[task.status]) {
                tasksByStatus[task.status].push(task);
            }
        });
        
        const frames = document.querySelectorAll('.status-frame');
        
        const statusMap = ['to-do', 'in-progress', 'testing', 'done'];
        
        frames.forEach((frame, index) => {
            const status = statusMap[index];
            const statusTasks = tasksByStatus[status] || [];
            
            frame.innerHTML = ''; 
            
            statusTasks.forEach(task => {
                const card = document.createElement('a');
                card.className = 'task-card';
                card.href = `task-details.html?id=${task.id}`;
                
                const meta = document.createElement('div');
                meta.className = 'task-meta';
                
                const taskInfo = document.createElement('div');
                taskInfo.className = 'task-info';
                
                const priority = document.createElement('div');
                priority.className = `task-priority ${task.priority}`;
                
                const priorityIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                priorityIcon.setAttribute('width', '16');
                priorityIcon.setAttribute('height', '16');
                priorityIcon.setAttribute('viewBox', '0 0 16 16');
                priorityIcon.setAttribute('fill', 'none');
                
                if (task.priority === 'high') {
                    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path1.setAttribute('d', 'M8 4L8 12');
                    path1.setAttribute('stroke', '#FA4D4D');
                    path1.setAttribute('stroke-width', '2');
                    path1.setAttribute('stroke-linecap', 'round');
                    
                    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path2.setAttribute('d', 'M4 8L8 4L12 8');
                    path2.setAttribute('stroke', '#FA4D4D');
                    path2.setAttribute('stroke-width', '2');
                    path2.setAttribute('stroke-linecap', 'round');
                    
                    priorityIcon.appendChild(path1);
                    priorityIcon.appendChild(path2);
                    priority.textContent = 'მაღალი';
                } else if (task.priority === 'medium') {
                    const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect1.setAttribute('x', '4');
                    rect1.setAttribute('y', '5.5');
                    rect1.setAttribute('width', '8');
                    rect1.setAttribute('height', '2');
                    rect1.setAttribute('rx', '1');
                    rect1.setAttribute('fill', '#FFBE0B');
                    
                    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect2.setAttribute('x', '4');
                    rect2.setAttribute('y', '9.5');
                    rect2.setAttribute('width', '8');
                    rect2.setAttribute('height', '2');
                    rect2.setAttribute('rx', '1');
                    rect2.setAttribute('fill', '#FFBE0B');
                    
                    priorityIcon.appendChild(rect1);
                    priorityIcon.appendChild(rect2);
                    priority.textContent = 'საშუალო';
                } else {
                    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path1.setAttribute('d', 'M8 12L8 4');
                    path1.setAttribute('stroke', '#08A508');
                    path1.setAttribute('stroke-width', '2');
                    path1.setAttribute('stroke-linecap', 'round');
                    
                    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path2.setAttribute('d', 'M12 8L8 12L4 8');
                    path2.setAttribute('stroke', '#08A508');
                    path2.setAttribute('stroke-width', '2');
                    path2.setAttribute('stroke-linecap', 'round');
                    
                    priorityIcon.appendChild(path1);
                    priorityIcon.appendChild(path2);
                    priority.textContent = 'დაბალი';
                }
                
                const deptTag = document.createElement('div');
                deptTag.className = `department-tag ${task.department}`;
                deptTag.textContent = task.department === 'design' ? 'დიზაინი' : 
                                     task.department === 'dev' ? 'დეველოპმენტი' : 
                                     task.department === 'marketing' ? 'მარკეტინგი' : 'HR';
                
                const dateEl = document.createElement('div');
                dateEl.className = 'task-date';
                
                const dueDateDate = new Date(task.dueDate);
                const dueDateDay = dueDateDate.getDate();
                const dueDateMonth = ['იანვ', 'თებ', 'მარტ', 'აპრ', 'მაის', 'ივნ', 'ივლ', 'აგვ', 'სექტ', 'ოქტ', 'ნოემ', 'დეკ'][dueDateDate.getMonth()];
                const dueDateYear = dueDateDate.getFullYear();
                dateEl.textContent = `${dueDateDay} ${dueDateMonth}, ${dueDateYear}`;
                
                const content = document.createElement('div');
                content.className = 'task-content';
                
                const title = document.createElement('h3');
                title.className = 'task-title';
                title.textContent = task.title;
                
                const description = document.createElement('p');
                description.className = 'task-description';
                description.textContent = task.description;
                
                priority.insertBefore(priorityIcon, priority.firstChild);
                
                taskInfo.appendChild(priority);
                taskInfo.appendChild(deptTag);
                meta.appendChild(taskInfo);
                meta.appendChild(dateEl);
                
                content.appendChild(title);
                content.appendChild(description);
                
                const footer = document.createElement('div');
                footer.className = 'task-footer';
                
                const assignee = document.createElement('div');
                assignee.className = 'task-assignee';
                
                const avatar = document.createElement('div');
                avatar.className = 'assignee-avatar';
                avatar.style.backgroundImage = `url('${task.assignee.avatar}')`;
                
                const comments = document.createElement('div');
                comments.className = 'task-comments';
                
                const commentIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                commentIcon.setAttribute('width', '22');
                commentIcon.setAttribute('height', '22');
                commentIcon.setAttribute('viewBox', '0 0 22 22');
                commentIcon.setAttribute('fill', 'none');
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M18.444 14.3333C18.444 14.7845 18.2648 15.217 17.9468 15.5345C17.6288 15.8519 17.1955 16.03 16.7434 16.03H7.12208L3.72217 19.42V6.41992C3.72217 5.96862 3.90112 5.53608 4.21898 5.21843C4.53683 4.90079 4.97001 4.7222 5.42217 4.7222H16.7434C17.1955 4.7222 17.6288 4.90033 17.9468 5.21773C18.2648 5.53514 18.444 5.96759 18.444 6.41881V14.3333Z');
                path.setAttribute('stroke', '#212529');
                path.setAttribute('stroke-width', '1.5');
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('stroke-linejoin', 'round');
                
                const commentCount = document.createElement('span');
                commentCount.textContent = task.comments.length;
                
                commentIcon.appendChild(path);
                comments.appendChild(commentIcon);
                comments.appendChild(commentCount);
                
                assignee.appendChild(avatar);
                
                footer.appendChild(assignee);
                footer.appendChild(comments);
                
                card.appendChild(meta);
                card.appendChild(content);
                card.appendChild(footer);
                
                frame.appendChild(card);
            });
        });
        
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchTasks);

