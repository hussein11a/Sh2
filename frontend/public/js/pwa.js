/**
 * Progressive Web App (PWA) Functionality
 * وظائف تطبيق الويب التقدمي
 */

(function() {
    'use strict';

    // ==================== Service Worker Registration ====================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('✅ Service Worker مسجل بنجاح:', registration.scope);
                    
                    // التحقق من التحديثات
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(function(error) {
                    console.error('❌ فشل في تسجيل Service Worker:', error);
                });

            // الاستماع لرسائل Service Worker
            navigator.serviceWorker.addEventListener('message', function(event) {
                if (event.data && event.data.type) {
                    handleServiceWorkerMessage(event.data);
                }
            });
        });
    }

    // ==================== Install Prompt ====================
    let deferredPrompt;
    let installButton;

    window.addEventListener('beforeinstallprompt', function(e) {
        console.log('💾 PWA قابل للتثبيت');
        
        // منع عرض التثبيت التلقائي
        e.preventDefault();
        
        // حفظ الحدث للاستخدام لاحقاً
        deferredPrompt = e;
        
        // إظهار زر التثبيت المخصص
        showInstallButton();
    });

    window.addEventListener('appinstalled', function(e) {
        console.log('✅ تم تثبيت PWA بنجاح');
        hideInstallButton();
        showInstalledNotification();
        
        // إرسال إحصائية التثبيت
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'APP_INSTALLED'
            });
        }
    });

    // ==================== Network Status ====================
    function initializeNetworkStatus() {
        function updateNetworkStatus() {
            if (navigator.onLine) {
                hideOfflineNotification();
                syncWhenOnline();
            } else {
                showOfflineNotification();
            }
        }

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        
        // التحقق من الحالة الحالية
        updateNetworkStatus();
    }

    // ==================== Background Sync ====================
    function registerBackgroundSync(tag) {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(function(registration) {
                return registration.sync.register(tag);
            }).catch(function(error) {
                console.error('فشل في تسجيل Background Sync:', error);
            });
        }
    }

    function syncWhenOnline() {
        if (navigator.onLine) {
            registerBackgroundSync('background-sync');
        }
    }

    // ==================== Push Notifications ====================
    function requestNotificationPermission() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    console.log('✅ تم منح إذن الإشعارات');
                    subscribeToNotifications();
                } else {
                    console.log('❌ تم رفض إذن الإشعارات');
                }
            });
        }
    }

    function subscribeToNotifications() {
        navigator.serviceWorker.ready.then(function(registration) {
            if ('pushManager' in registration) {
                registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: null // سيتم إضافة المفتاح لاحقاً
                }).then(function(subscription) {
                    console.log('✅ تم الاشتراك في الإشعارات:', subscription);
                    // إرسال الاشتراك للخادم
                }).catch(function(error) {
                    console.error('فشل في الاشتراك في الإشعارات:', error);
                });
            }
        });
    }

    // ==================== UI Functions ====================
    function showInstallButton() {
        if (installButton) return;

        installButton = document.createElement('button');
        installButton.className = 'install-button';
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            تثبيت التطبيق
        `;
        
        installButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(30, 64, 175, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideInUp 0.5s ease;
        `;

        installButton.addEventListener('click', handleInstallClick);
        installButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 25px rgba(30, 64, 175, 0.4)';
        });
        installButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(30, 64, 175, 0.3)';
        });

        document.body.appendChild(installButton);

        // إضافة CSS للأنيميشن
        if (!document.querySelector('#pwa-css')) {
            const style = document.createElement('style');
            style.id = 'pwa-css';
            style.textContent = `
                @keyframes slideInUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideOutDown {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(100px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function hideInstallButton() {
        if (installButton) {
            installButton.style.animation = 'slideOutDown 0.5s ease';
            setTimeout(() => {
                if (installButton && installButton.parentNode) {
                    installButton.parentNode.removeChild(installButton);
                }
                installButton = null;
            }, 500);
        }
    }

    function handleInstallClick() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('✅ المستخدم قبل تثبيت PWA');
                } else {
                    console.log('❌ المستخدم رفض تثبيت PWA');
                }
                deferredPrompt = null;
                hideInstallButton();
            });
        }
    }

    function showUpdateNotification() {
        const notification = createNotification(
            'تحديث متاح',
            'يتوفر إصدار جديد من التطبيق. انقر للتحديث.',
            'fas fa-sync-alt',
            '#10b981',
            function() {
                // إعادة تحميل الصفحة للحصول على التحديث
                window.location.reload();
            }
        );
        
        document.body.appendChild(notification);
    }

    function showOfflineNotification() {
        const notification = createNotification(
            'وضع عدم الاتصال',
            'لا يوجد اتصال بالإنترنت. التطبيق يعمل في الوضع المحفوظ.',
            'fas fa-wifi',
            '#f59e0b'
        );
        
        notification.id = 'offline-notification';
        document.body.appendChild(notification);
    }

    function hideOfflineNotification() {
        const notification = document.getElementById('offline-notification');
        if (notification) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    function showInstalledNotification() {
        const notification = createNotification(
            'تم التثبيت بنجاح',
            'تم تثبيت التطبيق على جهازك بنجاح!',
            'fas fa-check-circle',
            '#10b981'
        );
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    }

    function createNotification(title, message, icon, color, onClick) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #1e293b;
            padding: 16px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 350px;
            border-left: 4px solid ${color};
            animation: slideInRight 0.5s ease;
            cursor: ${onClick ? 'pointer' : 'default'};
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="color: ${color}; margin-top: 2px;">
                    <i class="${icon}" style="font-size: 18px;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px; color: #1e293b;">
                        ${title}
                    </div>
                    <div style="color: #64748b; line-height: 1.4;">
                        ${message}
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; padding: 0; margin-left: 8px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        if (onClick) {
            notification.addEventListener('click', onClick);
        }

        return notification;
    }

    // ==================== Service Worker Messages ====================
    function handleServiceWorkerMessage(data) {
        switch (data.type) {
            case 'CACHE_UPDATED':
                console.log('✅ تم تحديث الذاكرة المؤقتة');
                break;
            case 'BACKGROUND_SYNC':
                console.log('🔄 تم تشغيل المزامنة في الخلفية');
                break;
            default:
                console.log('📨 رسالة من Service Worker:', data);
        }
    }

    // ==================== Performance Monitoring ====================
    function initializePerformanceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', function() {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                    
                    console.log(`⚡ وقت تحميل الصفحة: ${loadTime}ms`);
                    
                    // إرسال البيانات لService Worker للتحليل
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({
                            type: 'PERFORMANCE_DATA',
                            loadTime: loadTime,
                            timing: perfData
                        });
                    }
                }, 0);
            });
        }
    }

    // ==================== Battery API ====================
    function initializeBatteryOptimization() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                function updateBatteryStatus() {
                    const batteryLevel = battery.level * 100;
                    const isCharging = battery.charging;
                    
                    // تفعيل وضع توفير الطاقة عند انخفاض البطارية
                    if (batteryLevel < 20 && !isCharging) {
                        enablePowerSavingMode();
                    } else {
                        disablePowerSavingMode();
                    }
                }

                battery.addEventListener('chargingchange', updateBatteryStatus);
                battery.addEventListener('levelchange', updateBatteryStatus);
                updateBatteryStatus();
            });
        }
    }

    function enablePowerSavingMode() {
        document.documentElement.classList.add('power-saving');
        console.log('🔋 تم تفعيل وضع توفير الطاقة');
        
        // تقليل الأنيميشن والتأثيرات
        const style = document.createElement('style');
        style.id = 'power-saving-style';
        style.textContent = `
            .power-saving * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
        `;
        document.head.appendChild(style);
    }

    function disablePowerSavingMode() {
        document.documentElement.classList.remove('power-saving');
        const powerSavingStyle = document.getElementById('power-saving-style');
        if (powerSavingStyle) {
            powerSavingStyle.remove();
        }
    }

    // ==================== Initialize PWA ====================
    function initializePWA() {
        initializeNetworkStatus();
        initializePerformanceMonitoring();
        initializeBatteryOptimization();
        
        // طلب إذن الإشعارات بعد 5 ثواني
        setTimeout(requestNotificationPermission, 5000);
        
        console.log('🚀 تم تهيئة PWA بنجاح');
    }

    // تشغيل PWA عند تحميل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePWA);
    } else {
        initializePWA();
    }

})();