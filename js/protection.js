/**
 * Content Protection System
 * يحمي المحتوى من النسخ والسحب والزر الأيمن
 */

(function() {
    'use strict';

    // تعطيل الزر الأيمن
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showProtectionWarning('تم تعطيل الزر الأيمن لحماية المحتوى');
        return false;
    });

    // تعطيل اختصارات لوحة المفاتيح الخطيرة
    document.addEventListener('keydown', function(e) {
        // منع F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            showProtectionWarning('تم تعطيل أدوات المطور لحماية المحتوى');
            return false;
        }

        // منع Ctrl+A (تحديد الكل)
        if (e.ctrlKey && e.keyCode === 65) {
            e.preventDefault();
            showProtectionWarning('تم تعطيل تحديد الكل لحماية المحتوى');
            return false;
        }

        // منع Ctrl+C (نسخ)
        if (e.ctrlKey && e.keyCode === 67) {
            e.preventDefault();
            showProtectionWarning('تم تعطيل النسخ لحماية المحتوى');
            return false;
        }

        // منع Ctrl+P (طباعة)
        if (e.ctrlKey && e.keyCode === 80) {
            e.preventDefault();
            showProtectionWarning('تم تعطيل الطباعة لحماية المحتوى');
            return false;
        }

        // منع Ctrl+S (حفظ)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            showProtectionWarning('تم تعطيل الحفظ لحماية المحتوى');
            return false;
        }
    });

    // تعطيل السحب والإفلات
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        showProtectionWarning('تم تعطيل السحب لحماية المحتوى');
        return false;
    });

    // تعطيل تحديد النص
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
    });

    // حماية من console
    function protectConsole() {
        if (typeof console !== 'undefined') {
            console.log('%cتحذير أمني!', 'color: red; font-size: 30px; font-weight: bold;');
            console.log('%cهذه ميزة مخصصة للمطورين. إذا أخبرك شخص ما بنسخ ولصق شيء هنا، فهذا احتيال وسيمنحه إمكانية الوصول إلى حسابك.', 'color: red; font-size: 16px;');
            console.log('%cراجع https://example.com/security للمزيد من المعلومات.', 'color: red; font-size: 16px;');
        }
    }

    // تشغيل حماية console
    protectConsole();

    // حماية من أدوات المطور
    function detectDevTools() {
        const threshold = 160;
        setInterval(function() {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                console.clear();
                protectConsole();
            }
        }, 500);
    }

    // تشغيل حماية أدوات المطور
    detectDevTools();

    // إظهار تحذير الحماية
    function showProtectionWarning(message) {
        // إنشاء عنصر التحذير
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease;
        `;

        warning.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-shield-alt"></i>
                <span>${message}</span>
            </div>
        `;

        // إضافة CSS للأنيميشن
        if (!document.querySelector('#protection-css')) {
            const style = document.createElement('style');
            style.id = 'protection-css';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(warning);

        // إزالة التحذير بعد 3 ثواني
        setTimeout(() => {
            warning.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.parentNode.removeChild(warning);
                }
            }, 300);
        }, 3000);
    }

    // حماية من النسخ عبر CSS (إضافية)
    const protectionCSS = document.createElement('style');
    protectionCSS.textContent = `
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-tap-highlight-color: transparent !important;
        }
        
        input, textarea {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }
        
        @media print {
            body { display: none !important; }
        }
    `;
    document.head.appendChild(protectionCSS);

    // تعطيل أدوات المطور المتقدمة
    (function() {
        const devtools = {
            open: false,
            orientation: null
        };

        setInterval(function() {
            if (window.devtools && window.devtools.open) {
                console.clear();
                protectConsole();
            }
        }, 100);
    })();

    // حماية إضافية عند تحميل الصفحة
    window.addEventListener('load', function() {
        protectConsole();
        
        // إزالة أي محاولات للوصول للكود المصدر
        document.addEventListener('keyup', function(e) {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                location.reload();
            }
        });
    });

    console.log('🔒 نظام الحماية مفعل - المحتوى محمي');

})();