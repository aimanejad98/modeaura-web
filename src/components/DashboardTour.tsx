'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

interface DashboardTourProps {
    userRole: 'Admin' | 'Manager' | 'Cashier'
}

export default function DashboardTour({ userRole }: DashboardTourProps) {
    const pathname = usePathname()
    const [language, setLanguage] = useState<'en' | 'ar'>('en')

    useEffect(() => {
        const savedLang = localStorage.getItem('tour_language') as 'en' | 'ar' | null
        if (savedLang) setLanguage(savedLang)

        // Guide ONLY opens when user clicks guide button - NO AUTO-START
    }, [pathname]) // pathname needed because getPageSteps() uses it

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en'
        setLanguage(newLang)
        localStorage.setItem('tour_language', newLang)
    }

    const getPageStepsForLang = (lang: 'en' | 'ar') => {
        const isArabic = lang === 'ar'

        // Dashboard Page
        if (pathname === '/dashboard') {
            return [
                {
                    popover: {
                        title: isArabic ? `مرحباً بك في لوحة القيادة!` : `Welcome to Dashboard!`,
                        description: isArabic
                            ? `هذه نظرة عامة على أعمالك. دعنا نريك الميزات الرئيسية.`
                            : `This is your business overview. Let's show you the key features.`,
                    }
                },
                {
                    element: '[data-tour="revenue-stats"]',
                    popover: {
                        title: isArabic ? 'إحصائيات الإيرادات' : 'Revenue Stats',
                        description: isArabic
                            ? 'تتبع إيراداتك اليومية والأسبوعية والشهرية هنا.'
                            : 'Track your daily, weekly, and monthly revenue here.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '[data-tour="low-stock"]',
                    popover: {
                        title: isArabic ? '⚠️ تنبيهات المخزون' : '⚠️ Stock Alerts',
                        description: isArabic
                            ? 'راقب المنتجات المنخفضة لإعادة الطلب في الوقت المناسب.'
                            : 'Monitor low products to reorder in time.',
                        side: 'left',
                        align: 'start'
                    }
                },
                {
                    popover: {
                        title: isArabic ? '✅ انتهى!' : '✅ Done!',
                        description: isArabic
                            ? 'استخدم زر "الدليل" في أي وقت للمساعدة!'
                            : 'Use the "Guide" button anytime for help!',
                    }
                }
            ]
        }

        // Inventory Page
        if (pathname === '/dashboard/inventory') {
            return [
                {
                    popover: {
                        title: isArabic ? `📦 إدارة المخزون` : `📦 Inventory Management`,
                        description: isArabic
                            ? `هنا يمكنك إدارة جميع منتجاتك، إضافة منتجات جديدة، وطباعة الباركود.`
                            : `Here you can manage all your products, add new items, and print barcodes.`,
                    }
                },
                {
                    element: '[data-tour="add-product-btn"]',
                    popover: {
                        title: isArabic ? '➕ إضافة منتج' : '➕ Add Product',
                        description: isArabic
                            ? 'انقر هنا لإضافة منتج جديد مع التفاصيل الكاملة.'
                            : 'Click here to add a new product with full details.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '.search-bar',
                    popover: {
                        title: isArabic ? '🔍 البحث والتصفية' : '🔍 Search & Filter',
                        description: isArabic
                            ? 'ابحث عن المنتجات حسب الاسم، الفئة، أو SKU. استخدم الفلاتر للتصنيف.'
                            : 'Search products by name, category, or SKU. Use filters to sort.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    popover: {
                        title: isArabic ? '🏷️ نصيحة: طباعة الباركود' : '🏷️ Tip: Print Barcodes',
                        description: isArabic
                            ? 'انقر على زر 🏷️ بجانب أي منتج لطباعة ملصق باركود احترافي.'
                            : 'Click the 🏷️ button next to any product to print a professional barcode label.',
                    }
                },
                {
                    popover: {
                        title: isArabic ? '✏️ تعديل المنتجات' : '✏️ Edit Products',
                        description: isArabic
                            ? 'انقر على أي منتج لتعديل التفاصيل، السعر، أو المخزون.'
                            : 'Click on any product to edit details, price, or stock.',
                    }
                }
            ]
        }

        // Categories Page
        if (pathname === '/dashboard/categories') {
            return [
                {
                    popover: {
                        title: isArabic ? `🗂️ إدارة الفئات` : `🗂️ Category Management`,
                        description: isArabic
                            ? `نظم منتجاتك في فئات لتسهيل البحث والإدارة.`
                            : `Organize your products into categories for easier management and browsing.`,
                    }
                },
                {
                    element: '[data-tour="add-category-btn"]',
                    popover: {
                        title: isArabic ? '➕ إضافة فئة جديدة' : '➕ Add New Category',
                        description: isArabic
                            ? 'أنشئ فئات مثل "عبايات"، "إكسسوارات"، "أحذية"، إلخ.'
                            : 'Create categories like "Abayas", "Accessories", "Shoes", etc.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    popover: {
                        title: isArabic ? '💡 نصيحة' : '💡 Tip',
                        description: isArabic
                            ? 'الفئات تساعد العملاء في العثور على المنتجات بسرعة في متجرك الإلكتروني.'
                            : 'Categories help customers find products quickly in your online store.',
                    }
                }
            ]
        }

        // Filters Page (Colors, Sizes, Materials)
        if (pathname === '/dashboard/filters') {
            return [
                {
                    popover: {
                        title: isArabic ? `🎨 إدارة الفلاتر` : `🎨 Filter Management`,
                        description: isArabic
                            ? `أضف ألوان، أحجام، وخامات للمنتجات.`
                            : `Add colors, sizes, and materials for your products.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? '🌈 الألوان' : '🌈 Colors',
                        description: isArabic
                            ? 'أضف خيارات الألوان المتاحة لمنتجاتك (أسود، أبيض، بيج، إلخ).'
                            : 'Add available color options for your products (Black, White, Beige, etc).',
                    }
                },
                {
                    popover: {
                        title: isArabic ? '📏 المقاسات' : '📏 Sizes',
                        description: isArabic
                            ? 'حدد المقاسات المتوفرة (صغير، متوسط، كبير، 38، 40، 42، إلخ).'
                            : 'Define available sizes (Small, Medium, Large, 38, 40, 42, etc).',
                    }
                },
                {
                    popover: {
                        title: isArabic ? '🧵 الخامات' : '🧵 Materials',
                        description: isArabic
                            ? 'أضف أنواع الأقمشة (حرير، قطن، كريب، إلخ).'
                            : 'Add fabric types (Silk, Cotton, Crepe, etc).',
                    }
                }
            ]
        }

        // POS Page
        if (pathname === '/dashboard/pos') {
            return [
                {
                    popover: {
                        title: isArabic ? `💳 نقطة البيع (POS)` : `💳 Point of Sale`,
                        description: isArabic
                            ? `معالجة المبيعات في المتجر بسهولة وسرعة.`
                            : `Process in-store sales quickly and easily.`,
                    }
                },
                {
                    element: '.product-search',
                    popover: {
                        title: isArabic ? '🔍 البحث عن المنتجات' : '🔍 Search Products',
                        description: isArabic
                            ? 'اكتب اسم المنتج أو امسح الباركود لإضافته إلى السلة.'
                            : 'Type product name or scan barcode to add to cart.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    popover: {
                        title: isArabic ? '� طرق الدفع' : '� Payment Methods',
                        description: isArabic
                            ? 'اقبل النقد💰 أو البطاقة💳. انقر على "Checkout" ثم اختر الطريقة.'
                            : 'Accept Cash💰 or Card💳. Click "Checkout" then select method.',
                    }
                },
                {
                    popover: {
                        title: isArabic ? '🖨️ طباعة الإيصال' : '🖨️ Print Receipt',
                        description: isArabic
                            ? 'بعد إتمام الدفع، يظهر الإيصال تلقائياً. اطبعه للعميل.'
                            : 'After payment, receipt appears automatically. Print for customer.',
                    }
                }
            ]
        }

        // Sales Campaigns
        if (pathname === '/dashboard/sales') {
            return [
                {
                    popover: {
                        title: isArabic ? `🔥 حملات التخفيضات` : `🔥 Sales Campaigns`,
                        description: isArabic
                            ? `أنشئ حملات تخفيض مخصصة لمنتجاتك. يمكنك تحديد نسبة مئوية أو مبلغ ثابت.`
                            : `Create custom discount campaigns for your products. You can specify percentage or fixed amount.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? `📅 التوقيت` : `📅 Timing`,
                        description: isArabic
                            ? `حدد تاريخ البدء والانتهاء للحملة. سيتم تفعيل التخفيض تلقائياً خلال هذه الفترة.`
                            : `Set start and end dates for the campaign. Discounts will be applied automatically during this period.`,
                    }
                }
            ]
        }

        // Orders Page
        if (pathname === '/dashboard/orders') {
            return [
                {
                    popover: {
                        title: isArabic ? `📋 إدارة الطلبات` : `📋 Order Management`,
                        description: isArabic
                            ? `تتبع جميع طلبات العملاء من الموقع والمتجر.`
                            : `Track all customer orders from website and store.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? '📦 حالات الطلب' : '📦 Order Status',
                        description: isArabic
                            ? 'حدّث حالة الطلب: معلق، قيد التجهيز، تم الشحن، تم التسليم.'
                            : 'Update status: Pending, Processing, Shipped, Delivered.',
                    }
                },
                {
                    popover: {
                        title: isArabic ? '🚚 معلومات الشحن' : '🚚 Shipping Info',
                        description: isArabic
                            ? 'أضف رقم التتبع وشركة الشحن لإعلام العملاء.'
                            : 'Add tracking number and courier to notify customers.',
                    }
                }
            ]
        }

        // Banners Management
        if (pathname === '/dashboard/website/banners') {
            return [
                {
                    popover: {
                        title: isArabic ? `🎞️ إدارة البنرات` : `🎞️ Banner Management`,
                        description: isArabic
                            ? `تحكم في الصور الرئيسية المتحركة بمتجرك. يمكنك اختيار تصاميم مختلفة لكل بنر.`
                            : `Control the main hero sliders on your store. You can choose different designs for each banner.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? `🎨 أنماط التصميم` : `🎨 Design Styles`,
                        description: isArabic
                            ? `اختر بين "الشاشة الكاملة"، "النص الجانبي"، أو "الزجاجي" لتنويع شكل واجهة متجرك.`
                            : `Choose between 'Full Background', 'Split Screen', or 'Glass' to vary your store's look.`,
                    }
                }
            ]
        }

        // AI Studio
        if (pathname === '/dashboard/ai-studio') {
            return [
                {
                    popover: {
                        title: isArabic ? `🪄 قاعة الذكاء الاصطناعي` : `🪄 AI Studio`,
                        description: isArabic
                            ? `استخدم قوة الذكاء الاصطناعي لتوليد أو تعديل صور المنتجات باحترافية.`
                            : `Use the power of AI to generate or edit product photos professionally.`,
                    }
                }
            ]
        }

        // Staff Management
        if (pathname === '/dashboard/staff') {
            return [
                {
                    popover: {
                        title: isArabic ? `👥 إدارة الموظفين` : `👥 Staff Management`,
                        description: isArabic
                            ? `أضف الموظفين، تتبع الدوام، واطبع بطاقات الموظفين مع باركود الدخول.`
                            : `Add staff, track attendance, and print staff ID cards with login barcodes.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? `🏷️ باركود الموظف` : `🏷️ Staff Barcode`,
                        description: isArabic
                            ? `يمكن للموظف تسجيل الدخول بلمسة واحدة عن طريق مسح الباركود الموجود على بطاقته.`
                            : `Staff can login with one tap by scanning the barcode on their ID card.`,
                    }
                }
            ]
        }

        // Finance Hub
        if (pathname === '/dashboard/finance') {
            return [
                {
                    popover: {
                        title: isArabic ? `💰 مركز المالية` : `💰 Finance Hub`,
                        description: isArabic
                            ? `قاعدة بيانات المصاريف والأرباح. راقب التدفق النقدي لنمو عملك.`
                            : `Expense and profit database. Monitor cash flow for your business growth.`,
                    }
                }
            ]
        }

        // Barcode Hub
        if (pathname === '/dashboard/barcodes') {
            return [
                {
                    popover: {
                        title: isArabic ? `🏷️ مركز الباركود` : `🏷️ Barcode Hub`,
                        description: isArabic
                            ? `اطبع ملصقات الباركود للمنتجات أو بطاقات تعريف الموظفين دفعة واحدة.`
                            : `Print barcode labels for products or staff IDs in bulk.`,
                    }
                }
            ]
        }

        // Branding & SEO
        if (pathname === '/dashboard/branding') {
            return [
                {
                    popover: {
                        title: isArabic ? `🌐 الهوية والسيو` : `🌐 Branding & SEO`,
                        description: isArabic
                            ? `تحكم في شعار المتجر، الألوان، وكلمات البحث لظهور متجرك في جوجل.`
                            : `Manage store logo, colors, and search keywords for Google ranking.`,
                    }
                }
            ]
        }

        // Newsletter
        if (pathname === '/dashboard/newsletter') {
            return [
                {
                    popover: {
                        title: isArabic ? `📩 النشرة الإخبارية` : `📩 Newsletter List`,
                        description: isArabic
                            ? `هنا تجد قائمة المشتركين في نشرتك الإخبارية. يمكنك تصدير القائمة لاستخدامها في حملاتك التسويقية.`
                            : `Here is the list of your newsletter subscribers. You can export the list for your marketing campaigns.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? `📥 تصدير البيانات` : `📥 Export Data`,
                        description: isArabic
                            ? `انقر هنا لتحميل ملف CSV يحتوي على جميع العناوين البريدية للمشتركين.`
                            : `Click here to download a CSV file containing all subscriber email addresses.`,
                    }
                }
            ]
        }

        // Gallery
        if (pathname === '/dashboard/gallery') {
            return [
                {
                    popover: {
                        title: isArabic ? `🖼️ مكتبة الوسائط` : `🖼️ Media Library`,
                        description: isArabic
                            ? `هذا هو مخزن الصور الخاص بك. ارفع صور المنتجات أو البنرات هنا لتكون متاحة دائماً.`
                            : `This is your image vault. Upload product or banner images here to keep them accessible.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? `🔗 روابط الصور` : `🔗 Image Links`,
                        description: isArabic
                            ? `يمكنك نسخ رابط أي صورة بلمسة واحدة لاستخدامه في أي مكان في المتجر.`
                            : `You can copy any image URL with one click to use it anywhere in the store.`,
                    }
                }
            ]
        }

        // Navigation
        if (pathname === '/dashboard/website/navigation') {
            return [
                {
                    popover: {
                        title: isArabic ? `🗺️ قائمة التنقل` : `🗺️ Navigation Menu`,
                        description: isArabic
                            ? `تحكم في القائمة الرئيسية لمتجرك. يمكنك إنشاء قوائم فرعية ومنسدلة.`
                            : `Control your store's main menu. You can create sub-menus and dropdowns.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? `📐 التسلسل الهرمي` : `📐 Menu Hierarchy`,
                        description: isArabic
                            ? `اختر "Parent Menu" عند إضافة رابط ليظهر كقائمة منسدلة تحت الرابط الأساسي.`
                            : `Select a 'Parent Menu' when adding a link to make it appear as a dropdown item.`,
                    }
                }
            ]
        }

        // Pages
        if (pathname === '/dashboard/website/pages') {
            return [
                {
                    popover: {
                        title: isArabic ? `📄 الصفحات المخصصة` : `📄 Custom Pages`,
                        description: isArabic
                            ? `أنشئ صفحات مثل "من نحن"، "سياسة الخصوصية"، أو "قصة العلامة التجارية".`
                            : `Create pages like 'About Us', 'Privacy Policy', or 'Brand Story'.`,
                    }
                },
                {
                    popover: {
                        title: isArabic ? `🌐 الرابط الثابت` : `🌐 URL Slug`,
                        description: isArabic
                            ? `حدد عنوان الرابط الذي سيظهر في المتصفح لهذه الصفحة.`
                            : `Define the URL address that will appear in the browser for this page.`,
                    }
                }
            ]
        }

        // Discounts
        if (pathname === '/dashboard/discounts') {
            return [
                {
                    popover: {
                        title: isArabic ? `🎟️ أكواد الخصم` : `🎟️ Discount Codes`,
                        description: isArabic
                            ? `أنشئ أكواد خصم (Promocode) لعملائك. يمكنك تحديد نسبة الخصم، الحد الأدنى للطلب، وتاريخ الانتهاء.`
                            : `Create promo codes for your customers. You can define discount percentage, minimum order, and expiry date.`,
                    }
                }
            ]
        }

        // Testimonials
        if (pathname === '/dashboard/testimonials') {
            return [
                {
                    popover: {
                        title: isArabic ? `💬 آراء العملاء` : `💬 Testimonials`,
                        description: isArabic
                            ? `إدارة والتحكم في تقييمات وآراء العملاء التي تظهر على موقعك.`
                            : `Manage and control customer reviews and testimonials displayed on your website.`,
                    }
                }
            ]
        }

        // Themes
        if (pathname === '/dashboard/themes') {
            return [
                {
                    popover: {
                        title: isArabic ? `🎨 الثيمات الموسمية` : `🎨 Seasonal Themes`,
                        description: isArabic
                            ? `غير شكل موقعك ليتناسب مع المناسبات (العيد، العطلات، إلخ) بضغطة واحدة.`
                            : `Change your website's appearance to match occasions (Eid, Holidays, etc.) with one click.`,
                    }
                }
            ]
        }

        // Default fallback
        return [
            {
                popover: {
                    title: isArabic ? `مرحباً!` : `Welcome!`,
                    description: isArabic
                        ? `استخدم زر "الدليل" في أي وقت للحصول على المساعدة في هذه الصفحة!`
                        : `Use the "Guide" button anytime to get help on this specific page!`,
                }
            }
        ]
    }

    useEffect(() => {
        const handleStartTour = (e: any) => {
            // Re-read language from localStorage at trigger time (not from stale state)
            const freshLang = (e?.detail?.language) || localStorage.getItem('guide_language') || localStorage.getItem('tour_language') || 'en';
            setLanguage(freshLang as 'en' | 'ar');
            // Small delay to let state update before starting tour
            setTimeout(() => startTourWithLang(freshLang as 'en' | 'ar'), 50);
        };
        window.addEventListener('start-dashboard-tour', handleStartTour);
        return () => window.removeEventListener('start-dashboard-tour', handleStartTour);
    }, [pathname]);

    const startTourWithLang = (lang: 'en' | 'ar') => {
        const driverObj = driver({
            showProgress: true,
            steps: getPageStepsForLang(lang) as any,
            nextBtnText: lang === 'ar' ? 'التالي' : 'Next',
            prevBtnText: lang === 'ar' ? 'السابق' : 'Previous',
            doneBtnText: lang === 'ar' ? 'تم' : 'Done',
            onDestroyStarted: () => {
                localStorage.setItem(`tour_completed_${pathname}_${userRole}`, 'true')
                driverObj.destroy()
            }
        })

        driverObj.drive()
    }

    const startTour = () => startTourWithLang(language);

    // Hide legacy legacy floating buttons - Integrated into Atelier Compass
    return null;
}

