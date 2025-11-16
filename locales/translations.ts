export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  appSubtitle: string;

  profiles: {
    title: string;
    selectProfile: string;
    createNew: string;
    enterName: string;
    namePlaceholder: string;
    create: string;
    rename: string;
    delete: string;
    cancel: string;
    noProfiles: string;
    noProfilesSubtext: string;
    deleteTitle: string;
    deleteMessage: string;
    renameTitle: string;
    activeProfile: string;
    errorName: string;
  };

  home: {
    title: string;
    subtitle: string;
    addMedication: string;
    backupRestore: string;
    noMedications: string;
    noMedicationsSubtext: string;
    nextDose: string;
    lastTaken: string;
    notTakenYet: string;
    viewLogs: string;
    tomorrow: string;
    noScheduledTimes: string;
    language: string;
  };

  addMedication: {
    title: string;
    name: string;
    namePlaceholder: string;
    dose: string;
    dosePlaceholder: string;
    route: string;
    times: string;
    addTime: string;
    notes: string;
    notesPlaceholder: string;
    save: string;
    noTimes: string;
    errorName: string;
    errorDose: string;
    errorTimes: string;
    success: string;
    successMessage: string;
    error: string;
    errorMessage: string;
    required: string;
    optional: string;
  };

  routes: {
    tablet: string;
    syrup: string;
    intramuscular: string;
    intravenous: string;
    inhaler: string;
    drop: string;
    cream: string;
  };

  logs: {
    title: string;
    taken: string;
    notTaken: string;
    scheduled: string;
    completed: string;
    pending: string;
    tapToEdit: string;
    noLogs: string;
    noLogsSubtext: string;
  };

  editLog: {
    title: string;
    medication: string;
    scheduledTime: string;
    medicationTaken: string;
    medicationNotTaken: string;
    timeTaken: string;
    markNow: string;
    selectedTime: string;
    changeDate: string;
    changeTime: string;
    save: string;
    success: string;
    successMessage: string;
    error: string;
    errorMessage: string;
  };

  backup: {
    title: string;
    dataManagement: string;
    description: string;
    exportTitle: string;
    exportDescription: string;
    exportButton: string;
    importTitle: string;
    importDescription: string;
    importButton: string;
    dangerZone: string;
    dangerDescription: string;
    clearButton: string;
    noteTitle: string;
    note1: string;
    note2: string;
    note3: string;
    note4: string;
    exportSuccess: string;
    importSuccess: string;
    clearTitle: string;
    clearMessage: string;
    clearSuccess: string;
    cancel: string;
    delete: string;
    error: string;
    invalidFile: string;
  };

  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    error: string;
    success: string;
    loading: string;
    back: string;
    hour: string;
    minute: string;
    am: string;
    pm: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'MedicaTime',
    appSubtitle: 'Medication Manager',

    profiles: {
      title: 'Profiles',
      selectProfile: 'Select a profile to continue',
      createNew: 'Create New Profile',
      enterName: 'Enter profile name',
      namePlaceholder: 'e.g., Dad, Mom, Me',
      create: 'Create',
      rename: 'Rename',
      delete: 'Delete',
      cancel: 'Cancel',
      noProfiles: 'No profiles yet',
      noProfilesSubtext: 'Create a profile to start managing medications',
      deleteTitle: 'Delete Profile',
      deleteMessage: 'Are you sure you want to delete this profile? All medications and logs will be permanently deleted.',
      renameTitle: 'Rename Profile',
      activeProfile: 'Active Profile:',
      errorName: 'Please enter a profile name',
    },

    home: {
      title: 'MedicaTime',
      subtitle: 'Medication Manager',
      addMedication: 'Add Medication',
      backupRestore: 'Backup & Restore',
      noMedications: 'No medications added yet',
      noMedicationsSubtext: 'Tap the + button to add your first medication',
      nextDose: 'Next dose:',
      lastTaken: 'Last taken:',
      notTakenYet: 'Not taken yet',
      viewLogs: 'View Logs',
      tomorrow: 'tomorrow',
      noScheduledTimes: 'No scheduled times',
      language: 'Language',
    },

    addMedication: {
      title: 'Add Medication',
      name: 'Medication Name',
      namePlaceholder: 'e.g., Aspirin',
      dose: 'Dose Amount',
      dosePlaceholder: 'e.g., 100mg, 2 tablets, 5ml',
      route: 'Route of Administration',
      times: 'Times of Intake',
      addTime: 'Add Time',
      notes: 'Notes',
      notesPlaceholder: 'e.g., Take with food',
      save: 'Save Medication',
      noTimes: 'No times added yet',
      errorName: 'Please enter medication name',
      errorDose: 'Please enter dose amount',
      errorTimes: 'Please add at least one intake time',
      success: 'Success',
      successMessage: 'Medication added successfully',
      error: 'Error',
      errorMessage: 'Failed to save medication',
      required: '*',
      optional: '(Optional)',
    },

    routes: {
      tablet: 'Tablet',
      syrup: 'Spoon/Syrup',
      intramuscular: 'Intramuscular Injection',
      intravenous: 'Intravenous Injection',
      inhaler: 'Inhaler',
      drop: 'Drop',
      cream: 'Cream',
    },

    logs: {
      title: 'Medication Logs',
      taken: 'Taken',
      notTaken: 'Not Taken',
      scheduled: 'Scheduled:',
      completed: 'Completed',
      pending: 'Pending',
      tapToEdit: 'Tap to edit',
      noLogs: 'No logs found',
      noLogsSubtext: 'Logs will appear here once you add medications',
    },

    editLog: {
      title: 'Edit Log',
      medication: 'Medication',
      scheduledTime: 'Scheduled Time',
      medicationTaken: 'Medication Taken',
      medicationNotTaken: 'Medication Not Taken',
      timeTaken: 'Time Taken',
      markNow: 'Mark as Taken Now',
      selectedTime: 'Selected Time:',
      changeDate: 'Change Date',
      changeTime: 'Change Time',
      save: 'Save Changes',
      success: 'Success',
      successMessage: 'Log updated successfully',
      error: 'Error',
      errorMessage: 'Failed to update log',
    },

    backup: {
      title: 'Backup & Restore',
      dataManagement: 'Data Management',
      description: 'Backup your medications and logs to a JSON file, or restore from a previous backup.',
      exportTitle: 'Export Data',
      exportDescription: 'Create a backup file containing all your medications and logs.',
      exportButton: 'Export Data',
      importTitle: 'Import Data',
      importDescription: 'Restore your data from a previously exported backup file.',
      importButton: 'Import Data',
      dangerZone: 'Danger Zone',
      dangerDescription: 'Permanently delete all medications and logs. This action cannot be undone.',
      clearButton: 'Clear All Data',
      noteTitle: 'Note:',
      note1: '• Backup files are saved in TXT format',
      note2: '• Make sure to keep your backup files in a safe location',
      note3: '• Importing will merge with existing data',
      note4: '• Web version downloads files to your default download folder',
      exportSuccess: 'Backup file downloaded successfully',
      importSuccess: 'Data imported successfully',
      clearTitle: 'Clear All Data',
      clearMessage: 'Are you sure you want to delete all medications and logs? This action cannot be undone.',
      clearSuccess: 'All data has been cleared',
      cancel: 'Cancel',
      delete: 'Delete',
      error: 'Error',
      invalidFile: 'Invalid backup file format',
    },

    common: {
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      error: 'Error',
      success: 'Success',
      loading: 'Loading...',
      back: 'Back',
      hour: 'Hour',
      minute: 'Minute',
      am: 'AM',
      pm: 'PM',
    },
  },

  ar: {
    appName: 'ميديكا تايم',
    appSubtitle: 'مدير الأدوية',

    profiles: {
      title: 'الملفات الشخصية',
      selectProfile: 'اختر ملف شخصي للمتابعة',
      createNew: 'إنشاء ملف شخصي جديد',
      enterName: 'أدخل اسم الملف الشخصي',
      namePlaceholder: 'مثال: أب، أم، أنا',
      create: 'إنشاء',
      rename: 'إعادة تسمية',
      delete: 'حذف',
      cancel: 'إلغاء',
      noProfiles: 'لا توجد ملفات شخصية بعد',
      noProfilesSubtext: 'أنشئ ملف شخصي للبدء في إدارة الأدوية',
      deleteTitle: 'حذف الملف الشخصي',
      deleteMessage: 'هل أنت متأكد من رغبتك في حذف هذا الملف الشخصي؟ سيتم حذف جميع الأدوية والسجلات بشكل دائم.',
      renameTitle: 'إعادة تسمية الملف الشخصي',
      activeProfile: 'الملف النشط:',
      errorName: 'الرجاء إدخال اسم الملف الشخصي',
    },

    home: {
      title: 'ميديكا تايم',
      subtitle: 'مدير الأدوية',
      addMedication: 'إضافة دواء',
      backupRestore: 'النسخ الاحتياطي والاستعادة',
      noMedications: 'لم يتم إضافة أدوية بعد',
      noMedicationsSubtext: 'اضغط على زر + لإضافة أول دواء',
      nextDose: 'الجرعة التالية:',
      lastTaken: 'آخر جرعة:',
      notTakenYet: 'لم يتم تناوله بعد',
      viewLogs: 'عرض السجلات',
      tomorrow: 'غداً',
      noScheduledTimes: 'لا توجد أوقات محددة',
      language: 'اللغة',
    },

    addMedication: {
      title: 'إضافة دواء',
      name: 'اسم الدواء',
      namePlaceholder: 'مثال: أسبرين',
      dose: 'كمية الجرعة',
      dosePlaceholder: 'مثال: 100 ملغ، حبتان، 5 مل',
      route: 'طريقة الإعطاء',
      times: 'أوقات التناول',
      addTime: 'إضافة وقت',
      notes: 'ملاحظات',
      notesPlaceholder: 'مثال: يؤخذ مع الطعام',
      save: 'حفظ الدواء',
      noTimes: 'لم يتم إضافة أوقات بعد',
      errorName: 'الرجاء إدخال اسم الدواء',
      errorDose: 'الرجاء إدخال كمية الجرعة',
      errorTimes: 'الرجاء إضافة وقت تناول واحد على الأقل',
      success: 'نجح',
      successMessage: 'تم إضافة الدواء بنجاح',
      error: 'خطأ',
      errorMessage: 'فشل في حفظ الدواء',
      required: '*',
      optional: '(اختياري)',
    },

    routes: {
      tablet: 'حبة',
      syrup: 'ملعقة/شراب',
      intramuscular: 'حقن عضلي',
      intravenous: 'حقن وريدي',
      inhaler: 'بخاخ',
      drop: 'قطرة',
      cream: 'كريم',
    },

    logs: {
      title: 'سجلات الأدوية',
      taken: 'تم التناول',
      notTaken: 'لم يتم التناول',
      scheduled: 'الموعد المحدد:',
      completed: 'مكتمل',
      pending: 'معلق',
      tapToEdit: 'اضغط للتعديل',
      noLogs: 'لا توجد سجلات',
      noLogsSubtext: 'ستظهر السجلات هنا بعد إضافة الأدوية',
    },

    editLog: {
      title: 'تعديل السجل',
      medication: 'الدواء',
      scheduledTime: 'الوقت المحدد',
      medicationTaken: 'تم تناول الدواء',
      medicationNotTaken: 'لم يتم تناول الدواء',
      timeTaken: 'وقت التناول',
      markNow: 'تحديد كمتناول الآن',
      selectedTime: 'الوقت المحدد:',
      changeDate: 'تغيير التاريخ',
      changeTime: 'تغيير الوقت',
      save: 'حفظ التغييرات',
      success: 'نجح',
      successMessage: 'تم تحديث السجل بنجاح',
      error: 'خطأ',
      errorMessage: 'فشل في تحديث السجل',
    },

    backup: {
      title: 'النسخ الاحتياطي والاستعادة',
      dataManagement: 'إدارة البيانات',
      description: 'احتفظ بنسخة احتياطية من أدويتك وسجلاتك في ملف JSON، أو استعد من نسخة احتياطية سابقة.',
      exportTitle: 'تصدير البيانات',
      exportDescription: 'إنشاء ملف نسخة احتياطية يحتوي على جميع أدويتك وسجلاتك.',
      exportButton: 'تصدير البيانات',
      importTitle: 'استيراد البيانات',
      importDescription: 'استعادة بياناتك من ملف نسخة احتياطية سابق.',
      importButton: 'استيراد البيانات',
      dangerZone: 'منطقة الخطر',
      dangerDescription: 'حذف جميع الأدوية والسجلات بشكل دائم. لا يمكن التراجع عن هذا الإجراء.',
      clearButton: 'مسح جميع البيانات',
      noteTitle: 'ملاحظة:',
      note1: '• يتم حفظ ملفات النسخ الاحتياطي بصيغة TXT',
      note2: '• تأكد من الاحتفاظ بملفات النسخ الاحتياطي في مكان آمن',
      note3: '• الاستيراد سيدمج مع البيانات الموجودة',
      note4: '• النسخة على الويب تقوم بتنزيل الملفات إلى مجلد التنزيلات الافتراضي',
      exportSuccess: 'تم تنزيل ملف النسخة الاحتياطية بنجاح',
      importSuccess: 'تم استيراد البيانات بنجاح',
      clearTitle: 'مسح جميع البيانات',
      clearMessage: 'هل أنت متأكد من رغبتك في حذف جميع الأدوية والسجلات؟ لا يمكن التراجع عن هذا الإجراء.',
      clearSuccess: 'تم مسح جميع البيانات',
      cancel: 'إلغاء',
      delete: 'حذف',
      error: 'خطأ',
      invalidFile: 'صيغة ملف النسخة الاحتياطية غير صالحة',
    },

    common: {
      ok: 'حسناً',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      error: 'خطأ',
      success: 'نجح',
      loading: 'جاري التحميل...',
      back: 'رجوع',
      hour: 'ساعة',
      minute: 'دقيقة',
      am: 'صباحاً',
      pm: 'مساءً',
    },
  },
};
