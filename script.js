document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Sticky & Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Toggle icon entre barras y X
        const icon = menuIcon.querySelector('i');
        if(navLinks.classList.contains('active')){
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Cerrar menú al hacer clic en un enlace (Móvil)
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuIcon.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // 3. Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Dejar de observar una vez animado
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-element');
    fadeElements.forEach(el => observer.observe(el));


    // 4. Form Submission Simulation
    const form = document.getElementById('quote-form');
    const formMessage = document.getElementById('form-message');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Cambiar estilo botón a enviando...
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            // Simular petición a un servidor
            setTimeout(() => {
                formMessage.classList.remove('hidden');
                form.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;

                // Ocultar mensaje después de 5 segundos
                setTimeout(() => {
                    formMessage.classList.add('hidden');
                }, 5000);
            }, 1500);
        });
    }

    // 5. Chatbot Simulation Logic
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
        closeChat.addEventListener('click', toggleChat);

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
            
            // Simulación rápida basada en palabras clave
            setTimeout(() => {
                if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('quote') || lowerText.includes('cuanto') || lowerText.includes('precio')) {
                    botResponse = "Of course! Prices vary just a bit depending on whether it's a full move, furnishing, or just a delivery. To give you an exact number, could you fill out the form or give me a quick call at 416-837-2397?";
                } else if (lowerText.includes('student') || lowerText.includes('estudiante')) {
                    botResponse = "Absolutely! We love helping students out with special discounts. Tell me what you need in the form and I'll send you all the info.";
                } else if (lowerText.includes('deliver') || lowerText.includes('ikea') || lowerText.includes('marketplace') || lowerText.includes('entrega') || lowerText.includes('amoblar') || lowerText.includes('airbnb') || lowerText.includes('furnish')) {
                    botResponse = "Perfect! We do IKEA deliveries, furniture assembly, and even full Airbnb furnishings. Leave your details in the form and I'll reach out in a bit to sort out the details!";
                } else if (lowerText.includes('contact') || lowerText.includes('phone') || lowerText.includes('call') || lowerText.includes('numero') || lowerText.includes('telefono')) {
                    botResponse = "Sure thing! Feel free to call or shoot me a text at 416-837-2397 whenever you're ready to chat.";
                } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hola') || lowerText.includes('hey')) {
                    botResponse = "Hi there! 👋 Great to hear from you. Are you looking for help with a move, a delivery, or some furnishing?";
                } else if (lowerText.includes('insurance') || lowerText.includes('safe') || lowerText.includes('seguro')) {
                    botResponse = "No worries, we are fully insured to protect all your items. They're in good hands!";
                } else if (lowerText.includes('pay') || lowerText.includes('payment') || lowerText.includes('stripe') || lowerText.includes('deposit') || lowerText.includes('pagar') || lowerText.includes('deposito')) {
                    botResponse = "You can pay securely right here on our website! Check out our 'Payments' section to lock in your date with a deposit or settle an invoice via Stripe.";
                }

                removeTypingIndicator();
                addMessage(botResponse, 'bot');
            }, 1800); // Demora simulada de 1.8 segundos para parecer más humano escribiendo
        }

        function sendMessage() {
            const text = chatInput.value.trim();
            if (text !== '') {
                handleChatResponse(text);
            }
        }

        sendChat.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
