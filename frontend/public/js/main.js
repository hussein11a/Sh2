/**
 * Main JavaScript File
 * الملف الرئيسي للوظائف التفاعلية
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ==================== Global Variables ====================
    let siteData = {};
    let servicesData = [];
    let buttonsData = {};
    let footerData = {};

    // ==================== Initialize App ====================
    async function initializeApp() {
        try {
            showLoadingScreen();
            
            // تحميل البيانات
            await loadAllData();
            
            // تطبيق السمة المحفوظة أو التلقائية
            initializeTheme();
            
            // تحديث المحتوى
            updateContent();
            
            // تهيئة الأحداث
            initializeEventListeners();
            
            // تهيئة الأنيميشن
            initializeAnimations();
            
            hideLoadingScreen();
            
            console.log('✅ تم تحميل الموقع بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تحميل الموقع:', error);
            hideLoadingScreen();
            showErrorMessage('حدث خطأ في تحميل الموقع. يرجى إعادة تحميل الصفحة.');
        }
    }

    // ==================== Data Loading ====================
    async function loadAllData() {
        try {
            // تحميل بيانات الموقع
            siteData = await loadJSONData('data/site.json');
            
            // تحميل بيانات الخدمات
            servicesData = await loadJSONData('data/services.json');
            
            // تحميل بيانات الأزرار
            buttonsData = await loadJSONData('data/buttons.json');
            
            // تحميل بيانات التذييل
            footerData = await loadJSONData('data/footer.json');
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            
            // استخدام بيانات افتراضية في حالة الخطأ
            useDefaultData();
        }
    }

    async function loadJSONData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`فشل في تحميل ${url}: ${response.status}`);
        }
        return await response.json();
    }

    // ==================== Default Data ====================
    function useDefaultData() {
        siteData = {
            title: "سطحة هيدروليك",
            description: "خدمات نقل السيارات الاحترافية باستخدام أحدث تقنيات السطحة الهيدروليكية",
            keywords: "سطحة هيدروليك, نقل السيارات, خدمات النقل",
            phone: "",
            whatsapp: ""
        };

        servicesData = [
            {
                id: 1,
                title: "نقل السيارات من وإلى مراكز الصيانة",
                description: "خدمة نقل احترافية للسيارات من وإلى مراكز الصيانة المعتمدة بأمان تام",
                icon: "fas fa-wrench"
            },
            {
                id: 2,
                title: "نقل السيارات من وإلى مراكز التقديرات",
                description: "نقل السيارات المتضررة لمراكز التقدير والتأمين بعناية فائقة",
                icon: "fas fa-clipboard-check"
            },
            {
                id: 3,
                title: "نقل السيارات من وإلى مراكز الفحص الدوري",
                description: "خدمة نقل سريعة وموثوقة للفحص الدوري والتجديدات",
                icon: "fas fa-search"
            },
            {
                id: 4,
                title: "نقل السيارات بين المدن",
                description: "خدمة نقل السيارات لمسافات طويلة بين المدن بأعلى معايير الأمان",
                icon: "fas fa-road"
            },
            {
                id: 5,
                title: "نقل السيارات الفاخرة",
                description: "خدمة مخصصة لنقل السيارات الفاخرة والكلاسيكية بعناية خاصة",
                icon: "fas fa-gem"
            },
            {
                id: 6,
                title: "نقل الدبابات",
                description: "خدمة نقل متخصصة للمعدات الثقيلة والدبابات",
                icon: "fas fa-truck-monster"
            },
            {
                id: 7,
                title: "زلاجات للسيارات المعطلة",
                description: "توفير زلاجات خاصة في حال عدم عمل القير أو الفرامل",
                icon: "fas fa-tools"
            }
        ];

        buttonsData = {
            phone: {
                number: "",
                display: "اتصل بنا",
                enabled: false
            },
            whatsapp: {
                number: "",
                display: "واتساب",
                enabled: false
            }
        };

        footerData = {
            description: "خدمات نقل السيارات الاحترافية بأعلى معايير الجودة والأمان",
            copyright: "2024 سطحة هيدروليك. جميع الحقوق محفوظة."
        };
    }

    // ==================== Content Updates ====================
    function updateContent() {
        updateSiteInfo();
        updateServices();
        updateFloatingButtons();
        updateSEO();
    }

    function updateSiteInfo() {
        // تحديث العنوان والوصف
        const siteTitle = document.getElementById('site-title');
        const siteDescription = document.getElementById('site-description');
        
        if (siteTitle && siteData.title) {
            siteTitle.textContent = siteData.title;
        }
        
        if (siteDescription && siteData.description) {
            siteDescription.textContent = siteData.description;
        }

        // تحديث معلومات الاتصال
        const phoneNumber = document.getElementById('phone-number');
        const whatsappNumber = document.getElementById('whatsapp-number');
        
        if (phoneNumber) {
            phoneNumber.textContent = siteData.phone || 'سيتم إضافة الرقم قريباً';
        }
        
        if (whatsappNumber) {
            whatsappNumber.textContent = siteData.whatsapp || 'سيتم إضافة الرقم قريباً';
        }
    }

    function updateServices() {
        const servicesGrid = document.getElementById('services-grid');
        if (!servicesGrid || !servicesData) return;

        servicesGrid.innerHTML = '';

        servicesData.forEach((service, index) => {
            const serviceCard = createServiceCard(service, index);
            servicesGrid.appendChild(serviceCard);
        });
    }

    function createServiceCard(service, index) {
        const card = document.createElement('div');
        card.className = 'service-card fade-in-up';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <i class="${service.icon} service-icon"></i>
            <h3 class="service-title">${service.title}</h3>
            <p class="service-description">${service.description}</p>
        `;

        return card;
    }

    function updateFloatingButtons() {
        const floatingButtons = document.getElementById('floating-buttons');
        if (!floatingButtons || !buttonsData) return;

        floatingButtons.innerHTML = '';

        // زر الهاتف
        if (buttonsData.phone && buttonsData.phone.enabled && buttonsData.phone.number) {
            const phoneBtn = createFloatingButton('phone', buttonsData.phone.number, 'fas fa-phone');
            floatingButtons.appendChild(phoneBtn);
        }

        // زر الواتساب
        if (buttonsData.whatsapp && buttonsData.whatsapp.enabled && buttonsData.whatsapp.number) {
            const whatsappBtn = createFloatingButton('whatsapp', buttonsData.whatsapp.number, 'fab fa-whatsapp');
            floatingButtons.appendChild(whatsappBtn);
        }
    }

    function createFloatingButton(type, number, icon) {
        const button = document.createElement('a');
        button.className = `floating-btn ${type}`;
        
        if (type === 'phone') {
            button.href = `tel:${number}`;
            button.setAttribute('aria-label', 'الاتصال بنا');
        } else if (type === 'whatsapp') {
            button.href = `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
            button.target = '_blank';
            button.setAttribute('aria-label', 'تواصل عبر الواتساب');
        }
        
        button.innerHTML = `<i class="${icon}"></i>`;
        
        return button;
    }

    function updateSEO() {
        if (!siteData) return;

        // تحديث عنوان الصفحة
        if (siteData.title) {
            document.title = siteData.title + ' - خدمات نقل السيارات الاحترافية';
        }

        // تحديث meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && siteData.description) {
            metaDescription.content = siteData.description;
        }

        // تحديث meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && siteData.keywords) {
            metaKeywords.content = siteData.keywords;
        }

        // تحديث Open Graph
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        
        if (ogTitle && siteData.title) {
            ogTitle.content = siteData.title;
        }
        
        if (ogDescription && siteData.description) {
            ogDescription.content = siteData.description;
        }
    }

    // ==================== Theme Management ====================
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentHour = new Date().getHours();
        const isNightTime = currentHour >= 20 || currentHour <= 6;

        let theme = savedTheme;
        
        if (!theme) {
            theme = (systemPrefersDark || isNightTime) ? 'dark' : 'light';
        }

        setTheme(theme);
        updateThemeIcon(theme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        setTheme(newTheme);
        updateThemeIcon(newTheme);
        
        // إضافة تأثير انتقال سلس
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    function updateThemeIcon(theme) {
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ==================== Event Listeners ====================
    function initializeEventListeners() {
        // زر تبديل السمة
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // روابط التنقل السلس
        initializeSmoothNavigation();

        // إدارة التمرير
        initializeScrollEffects();

        // إدارة الأحداث المتجاوبة
        initializeResponsiveEvents();
    }

    function initializeSmoothNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // تحديث الرابط النشط
                    updateActiveNavLink(this);
                }
            });
        });
    }

    function updateActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    function initializeScrollEffects() {
        let ticking = false;

        function updateOnScroll() {
            // تأثيرات التمرير
            const scrolled = window.pageYOffset;
            const header = document.querySelector('.header');
            
            if (header) {
                if (scrolled > 100) {
                    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
                    header.style.background = 'rgba(248, 250, 252, 0.95)';
                    header.style.backdropFilter = 'blur(10px)';
                } else {
                    header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    header.style.background = '';
                    header.style.backdropFilter = '';
                }
            }

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateOnScroll);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
    }

    function initializeResponsiveEvents() {
        // إدارة تغيير حجم النافذة
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // إعادة تطبيق التخطيط إذا لزم الأمر
                updateContent();
            }, 250);
        });

        // إدارة تغيير الاتجاه
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                updateContent();
            }, 500);
        });
    }

    // ==================== Animations ====================
    function initializeAnimations() {
        // Intersection Observer للأنيميشن
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // مراقبة العناصر
            const animatedElements = document.querySelectorAll('.service-card, .contact-item');
            animatedElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        }
    }

    // ==================== Utility Functions ====================
    function showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ef4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            font-family: 'Cairo', sans-serif;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
            <p>${message}</p>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // ==================== Initialize ====================
    initializeApp();

    console.log('🚀 تم تحميل السكريبت الرئيسي بنجاح');
});