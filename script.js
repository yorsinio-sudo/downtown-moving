document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // 1. Navbar Sticky & Scroll Effect
    // =========================================
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // =========================================
    // 2. Mobile Menu Toggle
    // =========================================
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuIcon.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuIcon.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // =========================================
    // 3. Scroll Animations (Intersection Observer)
    // =========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-element');
    fadeElements.forEach(el => observer.observe(el));

    // =========================================
    // 4. Interactive Moving Calculator & Anti-Abuse Form
    // =========================================
    
    // UI Elements
    const quoteForm = document.getElementById('quoteForm');
    const inputName = document.getElementById('inputName');
    const inputPhone = document.getElementById('inputPhone');
    const inputDate = document.getElementById('inputDate');
    const selectService = document.getElementById('selectService');
    const inputOrigin = document.getElementById('inputOrigin');
    const inputDestination = document.getElementById('inputDestination');
    const housingCards = document.querySelectorAll('.housing-card');
    const floorsContainer = document.querySelector('.floors-container');
    const inputFloorOrigin = document.getElementById('floorOrigin');
    const inputFloorDest = document.getElementById('floorDest');
    const elevatorOptions = document.querySelectorAll('.elevator-option');
    const inputCustomFurniture = document.getElementById('customFurniture');
    
    // Summary Panel Elements
    const summaryEmpty = document.querySelector('.summary-empty-state');
    const summaryContent = document.querySelector('.summary-content');
    const sumOriginText = document.getElementById('sumOriginText');
    const sumDestText = document.getElementById('sumDestText');
    const sumHousingVal = document.getElementById('sumHousingVal');
    const sumDistanceVal = document.getElementById('sumDistanceVal');
    const sumFloorsVal = document.getElementById('sumFloorsVal');
    const sumElevatorVal = document.getElementById('sumElevatorVal');
    const sumItemsList = document.getElementById('sumItemsList');
    const sumPriceVal = document.getElementById('sumPriceVal');

    // Calculator State
    let selectedHousing = 'house'; // default
    let elevatorAvailable = 'yes'; // default
    let furnitureInventory = {
        sofa: 0,
        cama: 0,
        mesa: 0,
        nevera: 0,
        lavadora: 0,
        tv: 0,
        caja: 0,
        armario: 0
    };
    
    // Furniture Configuration
    const furnitureConfig = {
        sofa: { label: 'Sofa / Armchair', price: 25 },
        cama: { label: 'Bed / Mattress', price: 30 },
        mesa: { label: 'Table / Dining Set', price: 15 },
        nevera: { label: 'Refrigerator', price: 35 },
        lavadora: { label: 'Washing Machine', price: 25 },
        tv: { label: 'Television', price: 15 },
        caja: { label: 'Boxes / Bags', price: 5 },
        armario: { label: 'Wardrobe / Closet', price: 35 }
    };

    // Initialize date picker minimum to today
    if (inputDate) {
        const today = new Date().toISOString().split('T')[0];
        inputDate.min = today;
    }

    // Housing Type Toggle
    housingCards.forEach(card => {
        card.addEventListener('click', () => {
            housingCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            const type = card.dataset.type;
            selectedHousing = type;

            if (type === 'apartment') {
                floorsContainer.classList.add('show');
                inputFloorOrigin.removeAttribute('disabled');
                inputFloorDest.removeAttribute('disabled');
            } else {
                floorsContainer.classList.remove('show');
                inputFloorOrigin.setAttribute('disabled', 'true');
                inputFloorDest.setAttribute('disabled', 'true');
                inputFloorOrigin.value = '1';
                inputFloorDest.value = '1';
                hideError(inputFloorOrigin);
                hideError(inputFloorDest);
            }
            updateEstimate();
        });
    });

    // Elevator Toggle
    elevatorOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            elevatorOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            elevatorAvailable = opt.dataset.value;
            updateEstimate();
        });
    });

    // Furniture Item Counters Click Handlers
    document.querySelectorAll('.furniture-item-card').forEach(card => {
        const itemKey = card.dataset.item;
        const btnMinus = card.querySelector('.minus');
        const btnPlus = card.querySelector('.plus');
        const counterVal = card.querySelector('.counter-val');

        if (btnPlus && btnMinus && counterVal) {
            btnPlus.addEventListener('click', (e) => {
                e.stopPropagation();
                furnitureInventory[itemKey]++;
                counterVal.textContent = furnitureInventory[itemKey];
                card.classList.add('has-items');
                updateEstimate();
            });

            btnMinus.addEventListener('click', (e) => {
                e.stopPropagation();
                if (furnitureInventory[itemKey] > 0) {
                    furnitureInventory[itemKey]--;
                    counterVal.textContent = furnitureInventory[itemKey];
                    if (furnitureInventory[itemKey] === 0) {
                        card.classList.remove('has-items');
                    }
                    updateEstimate();
                }
            });
        }
    });

    // Live Calculator Input Events
    const liveFields = [
        inputOrigin, inputDestination, inputFloorOrigin, 
        inputFloorDest, inputCustomFurniture
    ];
    liveFields.forEach(field => {
        if (field) field.addEventListener('input', updateEstimate);
    });

    // Calculate sum of furniture count
    function getFurnitureTotalCount() {
        return Object.values(furnitureInventory).reduce((a, b) => a + b, 0);
    }

    // Distance simulation based on string lengths
    function simulateDistance(str1, str2) {
        if (!str1 || !str2) return 0;
        const combinedLength = str1.length + str2.length;
        // Seed a distance between 5km and 55km based on lengths
        return 5 + (combinedLength % 51);
    }

    // Update quote estimate display
    function updateEstimate() {
        if (!inputOrigin || !inputDestination) return;

        const origin = inputOrigin.value.trim();
        const destination = inputDestination.value.trim();
        const furnitureCount = getFurnitureTotalCount();
        const customText = inputCustomFurniture.value.trim();

        // Reveal active summary if both addresses contain basic input
        if (origin.length > 3 && destination.length > 3) {
            if (summaryEmpty) summaryEmpty.style.display = 'none';
            if (summaryContent) summaryContent.classList.add('active');

            // 1. Update Route Details
            if (sumOriginText) sumOriginText.textContent = origin;
            if (sumDestText) sumDestText.textContent = destination;

            // 2. Housing Details
            if (sumHousingVal) {
                sumHousingVal.textContent = selectedHousing === 'house' ? 'House / Ground Floor' : 'Apartment';
            }

            // 3. Distance Calculation
            const distance = simulateDistance(origin, destination);
            if (sumDistanceVal) sumDistanceVal.textContent = `${distance} km`;

            // 4. Floors & Elevator Handling
            let floorsPrice = 0;
            if (selectedHousing === 'apartment') {
                const flOrigin = parseInt(inputFloorOrigin.value) || 1;
                const flDest = parseInt(inputFloorDest.value) || 1;
                if (sumFloorsVal) sumFloorsVal.textContent = `Floor ${flOrigin} (Origin) / Floor ${flDest} (Dest)`;
                
                const totalFloors = Math.max(0, flOrigin - 1) + Math.max(0, flDest - 1);
                if (elevatorAvailable === 'yes') {
                    if (sumElevatorVal) sumElevatorVal.textContent = 'Yes (Available)';
                    floorsPrice = totalFloors * 5; // $5 per floor elevator fee
                } else {
                    if (sumElevatorVal) sumElevatorVal.textContent = 'No (Stairs Only)';
                    floorsPrice = totalFloors * 15; // $15 per floor stairs fee (heavy labor)
                }
            } else {
                if (sumFloorsVal) sumFloorsVal.textContent = 'N/A (Ground Floor)';
                if (sumElevatorVal) sumElevatorVal.textContent = 'N/A';
            }

            // 5. Furniture Tags preview list
            if (sumItemsList) {
                sumItemsList.innerHTML = '';
                let furniturePrice = 0;
                
                Object.keys(furnitureInventory).forEach(key => {
                    const qty = furnitureInventory[key];
                    if (qty > 0) {
                        const config = furnitureConfig[key];
                        furniturePrice += config.price * qty;

                        const tag = document.createElement('div');
                        tag.className = 'summary-furniture-tag';
                        tag.innerHTML = `${config.label} <span>x${qty}</span>`;
                        sumItemsList.appendChild(tag);
                    }
                });

                // Custom comments items flat fee add-on
                if (customText.length > 0) {
                    const customItemsCount = Math.min(5, Math.ceil(customText.split(',').length));
                    furniturePrice += customItemsCount * 12; // $12 flat fee per custom item

                    const tag = document.createElement('div');
                    tag.className = 'summary-furniture-tag';
                    tag.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                    tag.innerHTML = `Special Items <span>Active</span>`;
                    sumItemsList.appendChild(tag);
                }

                if (furnitureCount === 0 && customText.length === 0) {
                    sumItemsList.innerHTML = '<span style="font-size:0.8rem;color:rgba(255,255,255,0.4)">No items selected</span>';
                }

                // 6. Cost Calculation
                const basePrice = 120; // Base vehicle & booking cost
                const distancePrice = distance * 2.5; // $2.50 per km
                const totalPrice = basePrice + distancePrice + floorsPrice + furniturePrice;

                if (sumPriceVal) sumPriceVal.textContent = `$${Math.round(totalPrice)}`;
            }
        } else {
            // Restore empty state
            if (summaryEmpty) summaryEmpty.style.display = 'block';
            if (summaryContent) summaryContent.classList.remove('active');
        }
    }

    // Validation styling helpers
    function showError(input, message) {
        if (!input) return;
        input.classList.add('invalid');
        const parent = input.closest('.form-group');
        if (parent) {
            const errMsg = parent.querySelector('.validation-error-msg');
            if (errMsg) {
                errMsg.textContent = message;
                errMsg.style.display = 'block';
            }
        }
    }

    function hideError(input) {
        if (!input) return;
        input.classList.remove('invalid');
        const parent = input.closest('.form-group');
        if (parent) {
            const errMsg = parent.querySelector('.validation-error-msg');
            if (errMsg) {
                errMsg.style.display = 'none';
            }
        }
    }

    // Clear validation error on input edit
    const fieldsToValidate = [
        inputName, inputPhone, inputDate, selectService,
        inputOrigin, inputDestination, inputFloorOrigin, inputFloorDest
    ];
    fieldsToValidate.forEach(field => {
        if (field) {
            field.addEventListener('input', () => {
                if (field.value.trim() !== '') {
                    hideError(field);
                }
            });
        }
    });

    // Form Submission & Anti-Abuse Validator
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // 1. Name Check
            const nameVal = inputName.value.trim();
            if (nameVal === '') {
                showError(inputName, 'Please enter your full name.');
                isValid = false;
            } else {
                hideError(inputName);
            }

            // 2. Phone Check
            const phoneVal = inputPhone.value.trim();
            if (phoneVal === '') {
                showError(inputPhone, 'Please enter your phone number.');
                isValid = false;
            } else if (!/^[0-9+\s-()]{7,20}$/.test(phoneVal)) {
                showError(inputPhone, 'Please enter a valid phone number.');
                isValid = false;
            } else {
                hideError(inputPhone);
            }

            // 3. Date Check
            const dateVal = inputDate.value.trim();
            if (dateVal === '') {
                showError(inputDate, 'Please select a moving date.');
                isValid = false;
            } else {
                hideError(inputDate);
            }

            // 4. Service Type Check
            const serviceVal = selectService.value;
            if (serviceVal === '') {
                showError(selectService, 'Please select a service type.');
                isValid = false;
            } else {
                hideError(selectService);
            }

            // 5. Origin Address Check
            const originVal = inputOrigin.value.trim();
            if (originVal === '') {
                showError(inputOrigin, 'Please enter your origin address.');
                isValid = false;
            } else if (originVal.length < 8) {
                showError(inputOrigin, 'Address is too short. Include street, number, and city.');
                isValid = false;
            } else {
                hideError(inputOrigin);
            }

            // 6. Destination Address Check
            const destVal = inputDestination.value.trim();
            if (destVal === '') {
                showError(inputDestination, 'Please enter your destination address.');
                isValid = false;
            } else if (destVal.length < 8) {
                showError(inputDestination, 'Address is too short. Include street, number, and city.');
                isValid = false;
            } else {
                hideError(inputDestination);
            }

            // 7. Floor Details validation if Apartment is selected
            if (selectedHousing === 'apartment') {
                const fOrigin = parseInt(inputFloorOrigin.value);
                if (isNaN(fOrigin) || fOrigin < 1) {
                    showError(inputFloorOrigin, 'Minimum floor is 1.');
                    isValid = false;
                } else {
                    hideError(inputFloorOrigin);
                }

                const fDest = parseInt(inputFloorDest.value);
                if (isNaN(fDest) || fDest < 1) {
                    showError(inputFloorDest, 'Minimum floor is 1.');
                    isValid = false;
                } else {
                    hideError(inputFloorDest);
                }
            }

            // 8. Anti-Abuse Inventory Check
            const furnitureCount = getFurnitureTotalCount();
            const customText = inputCustomFurniture.value.trim();
            const furnitureError = document.getElementById('furnitureError');

            if (furnitureCount === 0 && customText === '') {
                if (furnitureError) {
                    furnitureError.textContent = 'Anti-Abuse Rule: Please select at least 1 item or describe your belongings under "Other items".';
                    furnitureError.style.display = 'block';
                }
                isValid = false;
                // Scroll to furniture section to let user know
                const furnSection = document.querySelector('.furniture-section');
                if (furnSection) furnSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                if (furnitureError) furnitureError.style.display = 'none';
            }

            // If all elements are valid, display the success modal
            if (isValid) {
                showSuccessModal(nameVal, phoneVal, dateVal, originVal, destVal);
            }
        });
    }

    // Success Modal Overlay
    function showSuccessModal(name, phone, date, origin, destination) {
        const totalEstimate = sumPriceVal ? sumPriceVal.textContent : '$0';
        const itemsCount = getFurnitureTotalCount();
        const serviceText = selectService ? selectService.options[selectService.selectedIndex].text : '';
        
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        modal.style.backdropFilter = 'blur(10px)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.style.padding = '20px';
        modal.className = 'modal-success-overlay';

        modal.innerHTML = `
            <div style="background-color: #1a1a1a; max-width: 550px; width: 100%; border-radius: 16px; padding: 40px; border: 1.5px solid var(--accent); box-shadow: 0 25px 50px -12px rgba(212,175,55,0.25); text-align: center; transform: scale(0.8); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); opacity: 0; color: #fff;" class="modal-card">
                <div style="width: 70px; height: 70px; background-color: rgba(212, 175, 55, 0.1); color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 2.2rem; border: 1px solid rgba(212, 175, 55, 0.3);">
                    <i class="fa-solid fa-truck-ramp-box"></i>
                </div>
                <h3 style="font-size: 1.8rem; color: #fff; margin-bottom: 12px; font-weight: 800;">Booking Request Received!</h3>
                <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.95rem;">Thank you, <strong>${name}</strong>. Your estimate has been processed successfully. An advisor will contact you at <strong>${phone}</strong> within 15 minutes to verify building policies and confirm the quote.</p>
                
                <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; text-align: left; margin-bottom: 30px; font-size: 0.9rem; line-height: 1.5;">
                    <div style="margin-bottom: 8px; color: var(--text-muted);"><strong>Service:</strong> <span style="color:#fff;">${serviceText}</span></div>
                    <div style="margin-bottom: 8px; color: var(--text-muted);"><strong>Date:</strong> <span style="color:#fff;">${date}</span></div>
                    <div style="margin-bottom: 8px; color: var(--text-muted);"><strong>Route:</strong> <span style="color:#fff;">${origin} ➔ ${destination}</span></div>
                    <div style="margin-bottom: 8px; color: var(--text-muted);"><strong>Housing:</strong> <span style="color:#fff;">${selectedHousing === 'house' ? 'House / Ground Floor' : 'Apartment'}</span></div>
                    <div style="margin-bottom: 8px; color: var(--text-muted);"><strong>Inventory Size:</strong> <span style="color:#fff;">${itemsCount} main items selected</span></div>
                    <div style="border-top: 1px dashed rgba(255,255,255,0.1); margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color:#fff;">Estimated Total:</strong>
                        <span style="font-size: 1.4rem; color: var(--accent); font-weight: 800;">${totalEstimate}</span>
                    </div>
                </div>
                
                <button id="closeModalBtn" class="btn-primary" style="width: 100%; border: none; cursor: pointer; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 1.05rem;">Done, Return to Page</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate modal entry
        requestAnimationFrame(() => {
            const card = modal.querySelector('.modal-card');
            if (card) {
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
            }
        });

        // Close and reset form elements
        const closeBtn = modal.querySelector('#closeModalBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const card = modal.querySelector('.modal-card');
                if (card) {
                    card.style.transform = 'scale(0.8)';
                    card.style.opacity = '0';
                }
                setTimeout(() => {
                    modal.remove();
                    
                    // Reset Form
                    if (quoteForm) quoteForm.reset();
                    
                    // Reset State
                    selectedHousing = 'house';
                    elevatorAvailable = 'yes';
                    Object.keys(furnitureInventory).forEach(k => {
                        furnitureInventory[k] = 0;
                    });
                    
                    // Reset UI Counters
                    document.querySelectorAll('.counter-val').forEach(el => el.textContent = '0');
                    document.querySelectorAll('.furniture-item-card').forEach(el => el.classList.remove('has-items'));
                    
                    // Reset Housing Selection
                    const firstHousingCard = document.querySelector('.housing-card[data-type="house"]');
                    if (firstHousingCard) firstHousingCard.click();

                    // Reset Elevator Selector
                    const firstElevatorOpt = document.querySelector('.elevator-option[data-value="yes"]');
                    if (firstElevatorOpt) firstElevatorOpt.click();
                    
                    // Reset Cost Estimate Summary
                    updateEstimate();
                    
                    // Smooth scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 300);
            });
        }
    }

    // =========================================
    // 5. Chatbot Simulation Logic
    // =========================================
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');

    if (chatToggle && chatWindow) {
        function toggleChat() {
            chatWindow.classList.toggle('active');
            if (chatWindow.classList.contains('active')) {
                chatBody.scrollTop = chatBody.scrollHeight;
                setTimeout(() => chatInput.focus(), 100);
            }
        }

        chatToggle.addEventListener('click', toggleChat);
        if (closeChat) closeChat.addEventListener('click', toggleChat);

        function addMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('chat-message', sender);
            msgDiv.innerHTML = `<p>${text}</p>`;
            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function addTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.classList.add('typing-indicator');
            typingDiv.id = 'typing-indicator';
            typingDiv.innerHTML = '<span></span><span></span><span></span>';
            chatBody.appendChild(typingDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function removeTypingIndicator() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        function handleChatResponse(userText) {
            addMessage(userText, 'user');
            chatInput.value = '';
            addTypingIndicator();

            const lowerText = userText.toLowerCase();
            let botResponse = "Hi! To give you the best service and make sure I have all the details right, could you fill out the quick form on our page? Or if you prefer, give us a quick call at 416-837-2397!";
            
            setTimeout(() => {
                if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('quote') || lowerText.includes('cuanto') || lowerText.includes('precio')) {
                    botResponse = "Of course! Prices vary just a bit depending on whether it's a full move, furnishing, or just a delivery. To get a real-time price, check out our new interactive moving calculator right here on the page!";
                } else if (lowerText.includes('student') || lowerText.includes('estudiante')) {
                    botResponse = "Absolutely! We love helping students out with special discounts. Tell us what you need using our interactive calculator form on the page and we'll apply any student discounts.";
                } else if (lowerText.includes('deliver') || lowerText.includes('ikea') || lowerText.includes('marketplace') || lowerText.includes('entrega') || lowerText.includes('amoblar') || lowerText.includes('airbnb') || lowerText.includes('furnish')) {
                    botResponse = "Perfect! We do IKEA deliveries, furniture assembly, and even full Airbnb furnishings. Use our quote form to declare your items and get an instant cost estimate!";
                } else if (lowerText.includes('contact') || lowerText.includes('phone') || lowerText.includes('call') || lowerText.includes('numero') || lowerText.includes('telefono')) {
                    botResponse = "Sure thing! Feel free to call or shoot us a text at 416-837-2397 whenever you're ready to chat.";
                } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hola') || lowerText.includes('hey')) {
                    botResponse = "Hi there! 👋 Great to hear from you. Are you looking for help with a move, a delivery, or some furnishing?";
                } else if (lowerText.includes('insurance') || lowerText.includes('safe') || lowerText.includes('seguro')) {
                    botResponse = "No worries, we are fully insured to protect all your items. They're in good hands!";
                } else if (lowerText.includes('pay') || lowerText.includes('payment') || lowerText.includes('stripe') || lowerText.includes('deposit') || lowerText.includes('pagar') || lowerText.includes('deposito')) {
                    botResponse = "You can pay securely right here on our website! Check out our 'Payments' section to lock in your date with a deposit or settle an invoice via Stripe.";
                }

                removeTypingIndicator();
                addMessage(botResponse, 'bot');
            }, 1500);
        }

        function sendMessage() {
            const text = chatInput.value.trim();
            if (text !== '') {
                handleChatResponse(text);
            }
        }

        if (sendChat) {
            sendChat.addEventListener('click', sendMessage);
        }
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
    }
});
// Inicializar el autocompletado de Google Maps en los campos de dirección
function initAutocomplete() {
    // Use the actual input IDs from the HTML and restrict suggestions to Canada
    const pickupInput = document.getElementById('inputOrigin');
    const dropoffInput = document.getElementById('inputDestination');

    const options = {
        componentRestrictions: { country: 'ca' }, // Limit suggestions to Canada
        fields: ['address_components', 'geometry', 'name', 'formatted_address'],
        types: ['address']
    };

    if (window.google && google.maps && google.maps.places) {
        if (pickupInput) new google.maps.places.Autocomplete(pickupInput, options);
        if (dropoffInput) new google.maps.places.Autocomplete(dropoffInput, options);
    }
}

// Ejecutar cuando la página esté completamente cargada
window.addEventListener('load', initAutocomplete);