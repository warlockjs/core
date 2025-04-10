import { groupedTranslations } from "@mongez/localization";

groupedTranslations("validation", {
  required: {
    en: "The :input field is required.",
    ar: ":input مطلوب.",
  },
  egyptianPhoneNumber: {
    en: "Make sure the :input is a valid Egyptian phone number.",
    ar: ":input يجب أن يكون رقم هاتف صالح.",
  },
  missing: {
    en: "The :input field can not be present.",
    ar: ":input لا يمكن أن يكون موجود.",
  },
  unique: {
    en: "The :input has already been taken.",
    ar: ":input مستخدم من قبل.",
  },
  object: {
    en: ":input must be an object.",
    ar: ":input يجب أن يكون كائن.",
  },
  uploadable: {
    en: ":input must be a uploadable type, upload hash must be passed.",
    ar: ":input يجب أن يكون من نوع قابل للتحميل، يجب تمرير هاش التحميل.",
  },
  exists: {
    en: "The selected :input does not exist in our database records.",
    ar: ":input المحدد غير موجود في سجلات قاعدة البيانات الخاصة بنا.",
  },
  confirmed: {
    en: ":input must match :confirmationInput.",
    ar: ":input يجب أن يتطابق مع :confirmationInput.",
  },
  min: {
    en: ":input must be at least :min.",
    ar: ":input يجب أن يكون على الأقل :min.",
  },
  file: {
    en: ":input must be a file.",
    ar: ":input يجب أن يكون ملف.",
  },
  files: {
    en: ":input must be an array of files.",
    ar: ":input يجب أن يكون مجموعة من الملفات.",
  },
  image: {
    en: ":input must be an image.",
    ar: ":input يجب أن يكون صورة.",
  },
  images: {
    en: ":input must be an array of images.",
    ar: ":input يجب أن يكون مجموعة من الصور.",
  },
  max: {
    en: ":input must be at most :max.",
    ar: ":input يجب أن يكون على الأكثر :max.",
  },
  minLength: {
    en: ":input must be at least :minLength characters.",
    ar: ":input يجب أن يكون على الأقل :minLength حرف.",
  },
  maxLength: {
    en: ":input must be at most :maxLength characters.",
    ar: ":input يجب أن يكون على الأكثر :maxLength حرف.",
  },
  email: {
    en: "The :input must be a valid email address.",
    ar: ":input يجب أن يكون بريد إلكتروني صالح.",
  },
  localized: {
    en: ":input must be a an array of objects, each object has localeCode and text properties.",
    ar: ":input يجب أن يكون مصفوفة من الكائنات، كل كائن يحتوي على خصائص localeCode و text.",
  },
  in: {
    en: ":input accepts only the following values: :options.",
    ar: ":input يقبل القيم التالية فقط: :options.",
  },
  string: {
    en: ":input must be a string.",
    ar: ":input يجب أن يكون سلسلة.",
  },
  number: {
    en: ":input must be a number.",
    ar: ":input يجب أن يكون رقم.",
  },
  integer: {
    en: ":input must be an integer.",
    ar: ":input يجب أن يكون عدد صحيح.",
  },
  float: {
    en: ":input must be a float.",
    ar: ":input يجب أن يكون عدد عائم.",
  },
  boolean: {
    en: ":input must be a boolean.",
    ar: ":input يجب أن يكون منطقي.",
  },
  pattern: {
    en: ":input must match the following pattern: :pattern.",
    ar: ":input يجب أن يتطابق مع النمط التالي: :pattern.",
  },
  array: {
    en: ":input must be an array.",
    ar: ":input يجب أن يكون مصفوفة.",
  },
  arrayOf: {
    en: ":input must be an array of :type.",
    ar: ":input يجب أن يكون مصفوفة من :type.",
  },
  url: {
    en: ":input must be a valid URL.",
    ar: ":input يجب أن يكون رابط صالح.",
  },
  length: {
    en: ":input must be :length characters.",
    ar: ":input يجب أن يكون :length حرف.",
  },
  scalar: {
    en: ":input must be a string, number or boolean",
    ar: ":input يجب أن يكون رقم أو نص أو قيمة منطقية",
  },
  stringify: {
    en: ":input must be number, string",
    ar: ":input يجب أن يكون رقم أو نص ",
  },
  unknownKey: {
    en: "unknown key :key",
    ar: "مفتاح غير معروف :key",
  },
  forbidden: {
    en: "The :input can not be present.",
    ar: ":input لا يمكن أن يكون موجود.",
  },
  enum: {
    en: ":input must be one of the following values: :enum, given value :value.",
    ar: ":input يجب أن يكون أحد القيم التالية: :enum, القيمة المعطاة :value.",
  },
});
