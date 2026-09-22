import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PUROKS = [
  'Purok 1',
  'Purok 2',
  'Purok 3',
  'Purok 4',
  'Purok 5',
  'Purok 6',
  'Purok 7',
  'Purok 8'
];

const LOWER_MAX = 24060;
const MIDDLE_MAX = 144360;

const ACCEPTED = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// ======================================================
// INCOME CLASSIFICATION
// ======================================================

function classifyIncome(v) {
  const n = Number(v);

  if (isNaN(n) || n < 0) {
    return null;
  }

  if (n < LOWER_MAX) {
    return 'Lower Class';
  }

  if (n <= MIDDLE_MAX) {
    return 'Middle Class';
  }

  return 'Upper Class';
}

// ======================================================
// TEXT HELPERS
// ======================================================

function titleCase(s) {
  if (!s) return '';

  return String(s)
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function buildFullName(ext = {}) {
  const parts = [];

  if (ext.firstName) {
    parts.push(ext.firstName);
  }

  if (ext.middleName) {
    parts.push(ext.middleName);
  }

  if (ext.lastName) {
    parts.push(ext.lastName);
  }

  if (!parts.length) {
    return '';
  }

  return titleCase(parts.join(' '));
}

// ======================================================
// NORMALIZE GENDER
// ======================================================

function normalizeGender(value) {
  if (!value) {
    return '';
  }

  const v = String(value)
    .trim()
    .toLowerCase();

  if (
    [
      'male',
      'm',
      'man',
      'lalaki',
      'l'
    ].includes(v)
  ) {
    return 'Male';
  }

  if (
    [
      'female',
      'f',
      'woman',
      'babae',
      'b'
    ].includes(v)
  ) {
    return 'Female';
  }

  return '';
}

// ======================================================
// NORMALIZE CIVIL STATUS
// ======================================================

function normalizeCivilStatus(value) {
  if (!value) {
    return '';
  }

  const v = String(value)
    .trim()
    .toLowerCase();

  if (v.includes('single')) {
    return 'Single';
  }

  if (v.includes('married')) {
    return 'Married';
  }

  if (
    v.includes('widowed') ||
    v.includes('widow')
  ) {
    return 'Widowed';
  }

  if (
    v.includes('separated') ||
    v.includes('legally separated')
  ) {
    return 'Separated';
  }

  return '';
}

// ======================================================
// MERGE FRONT + BACK OCR RESULTS
// ======================================================

function mergeExtractions(front = {}, back = {}) {
  return {
    lastName:
      front.lastName ||
      back.lastName ||
      '',

    firstName:
      front.firstName ||
      back.firstName ||
      '',

    middleName:
      front.middleName ||
      back.middleName ||
      '',

    birthdate:
      front.birthdate ||
      back.birthdate ||
      '',

    address:
      front.address ||
      back.address ||
      '',

    gender:
      normalizeGender(
        front.gender ||
        back.gender ||
        ''
      ),

    civilStatus:
      normalizeCivilStatus(
        front.civilStatus ||
        back.civilStatus ||
        ''
      )
  };
}

// ======================================================
// GEMINI OCR
//
// IMPORTANT:
// The API key is NOT placed here.
// React sends the image to Laravel.
//
// React
//   ↓
// Laravel /api/gemini/ocr
//   ↓
// Gemini API
//   ↓
// Laravel JSON response
//   ↓
// React form
// ======================================================

async function extractWithGemini(file, side = 'front') {
  if (!file) {
    throw new Error('No image file selected.');
  }

  const formData = new FormData();

  formData.append('image', file);
  formData.append('side', side);

  const response = await fetch(
    'http://127.0.0.1:8000/api/gemini/ocr',
    {
      method: 'POST',
      body: formData
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      'Invalid response from Laravel server.'
    );
  }

  if (!response.ok) {
    console.error(
      'Gemini OCR backend error:',
      data
    );

    throw new Error(
      data?.message ||
      data?.error ||
      'Gemini OCR request failed.'
    );
  }

  console.log(
    `Gemini ${side.toUpperCase()} RESULT:`,
    data?.data
  );

  return data?.data || {};
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function UserRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    birthdate: '',
    gender: '',
    purok: '',
    civil_status: '',
    monthly_salary: '',
    income_class: '',
    is_voter: false
  });

  // ====================================================
  // AUTO-FILLED FIELD TRACKING
  // ====================================================

  const [autoFilled, setAutoFilled] = useState({});

  // ====================================================
  // FRONT ID
  // ====================================================

  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [frontStatus, setFrontStatus] = useState('idle');
  const [frontText, setFrontText] = useState('');
  const [frontResult, setFrontResult] = useState({});
  const [showFrontRaw, setShowFrontRaw] = useState(false);

  const frontRef = useRef(null);

  // ====================================================
  // BACK ID
  // ====================================================

  const [backFile, setBackFile] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [backStatus, setBackStatus] = useState('idle');
  const [backText, setBackText] = useState('');
  const [backResult, setBackResult] = useState({});
  const [showBackRaw, setShowBackRaw] = useState(false);

  const backRef = useRef(null);

  // ====================================================
  // OTHER STATES
  // ====================================================

  const [filledCount, setFilledCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const navigate = useNavigate();
  const { registerUser } = useAuth();

  // ====================================================
  // FORM FIELD HANDLER
  // ====================================================

  const setField = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));

    // If user manually changes an auto-filled field,
    // remove the "from ID" indicator.
    setAutoFilled(prev => ({
      ...prev,
      [key]: false
    }));
  };

  // ====================================================
  // SALARY HANDLER
  // ====================================================

  const handleSalary = value => {
    const incomeClass = classifyIncome(value);

    setForm(prev => ({
      ...prev,
      monthly_salary: value,
      income_class: incomeClass || ''
    }));
  };

  // ====================================================
  // APPLY OCR EXTRACTIONS
  // ====================================================

  const applyExtractions = (
    frontExt = {},
    backExt = {}
  ) => {
    const merged = mergeExtractions(
      frontExt,
      backExt
    );

    const fullName = buildFullName(merged);

    const newlyFilled = {};

    let count = 0;

    setForm(prev => {
      const updated = {
        ...prev
      };

      // ----------------------------------------------
      // FULL NAME
      // ----------------------------------------------

      if (
        fullName &&
        !prev.name
      ) {
        updated.name = fullName;

        newlyFilled.name = true;

        count++;
      }

      // ----------------------------------------------
      // BIRTHDATE
      // ----------------------------------------------

      if (
        merged.birthdate &&
        !prev.birthdate
      ) {
        updated.birthdate =
          merged.birthdate;

        newlyFilled.birthdate = true;

        count++;
      }

      // ----------------------------------------------
      // ADDRESS
      // ----------------------------------------------

      if (
        merged.address &&
        !prev.address
      ) {
        updated.address =
          merged.address;

        newlyFilled.address = true;

        count++;
      }

      // ----------------------------------------------
      // GENDER
      // ----------------------------------------------

      const normalizedGender =
        normalizeGender(
          merged.gender
        );

      if (
        normalizedGender &&
        !prev.gender
      ) {
        updated.gender =
          normalizedGender;

        newlyFilled.gender = true;

        count++;
      }

      // ----------------------------------------------
      // CIVIL STATUS
      // ----------------------------------------------

      const normalizedCivilStatus =
        normalizeCivilStatus(
          merged.civilStatus
        );

      if (
        normalizedCivilStatus &&
        !prev.civil_status
      ) {
        updated.civil_status =
          normalizedCivilStatus;

        newlyFilled.civil_status = true;

        count++;
      }

      return updated;
    });

    setAutoFilled(prev => ({
      ...prev,
      ...newlyFilled
    }));

    setFilledCount(prev => prev + count);

    return count;
  };

  // ====================================================
  // FRONT ID UPLOAD
  //
  // FRONT:
  // - Last Name
  // - First Name
  // - Middle Name
  // - Birthdate
  // - Address
  // ====================================================

  const handleFront = async e => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // ----------------------------------------------
    // FILE VALIDATION
    // ----------------------------------------------

    if (
      !ACCEPTED.includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      toast.error(
        'Front ID: Image only (JPG/PNG/WEBP), max 8MB.'
      );

      return;
    }

    // ----------------------------------------------
    // SAVE FILE
    // ----------------------------------------------

    setFrontFile(file);

    // ----------------------------------------------
    // PREVIEW
    // ----------------------------------------------

    const reader = new FileReader();

    reader.onload = ev => {
      setFrontPreview(
        ev.target.result
      );
    };

    reader.readAsDataURL(file);

    // ----------------------------------------------
    // STATUS
    // ----------------------------------------------

    setFrontStatus('scanning');

    setShowFrontRaw(false);

    try {
      // --------------------------------------------
      // SEND TO LARAVEL + GEMINI
      // --------------------------------------------

      const result =
        await extractWithGemini(
          file,
          'front'
        );

      console.log(
        'Gemini FRONT:',
        result
      );

      // --------------------------------------------
      // NORMALIZE FRONT RESULT
      // --------------------------------------------

      const normalizedResult = {
        lastName:
          result?.lastName || '',

        firstName:
          result?.firstName || '',

        middleName:
          result?.middleName || '',

        birthdate:
          result?.birthdate || '',

        address:
          result?.address || '',

        // Front should not fill these.
        gender: '',

        civilStatus: ''
      };

      console.log(
        'NORMALIZED FRONT:',
        normalizedResult
      );

      // --------------------------------------------
      // SAVE RESULT
      // --------------------------------------------

      setFrontResult(
        normalizedResult
      );

      setFrontText(
        JSON.stringify(
          normalizedResult,
          null,
          2
        )
      );

      setFrontStatus('done');

      // --------------------------------------------
      // MERGE WITH CURRENT BACK RESULT
      // --------------------------------------------

      const n =
        applyExtractions(
          normalizedResult,
          backResult
        );

      if (n > 0) {
        toast.success(
          `Front scanned — ${n} field${
            n > 1 ? 's' : ''
          } auto-filled!`
        );
      } else {
        toast(
          'Front scanned. Please review the extracted information.',
          {
            icon: 'ℹ️'
          }
        );
      }
    } catch (err) {
      console.error(
        'FRONT OCR ERROR:',
        err
      );

      setFrontStatus('error');

      toast.error(
        err.message ||
        'Failed to scan front of ID.'
      );
    }
  };

  // ====================================================
  // BACK ID UPLOAD
  //
  // BACK:
  // - Gender
  // - Civil Status
  // ====================================================

  const handleBack = async e => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // ----------------------------------------------
    // FILE VALIDATION
    // ----------------------------------------------

    if (
      !ACCEPTED.includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      toast.error(
        'Back ID: Image only (JPG/PNG/WEBP), max 8MB.'
      );

      return;
    }

    // ----------------------------------------------
    // SAVE FILE
    // ----------------------------------------------

    setBackFile(file);

    // ----------------------------------------------
    // PREVIEW
    // ----------------------------------------------

    const reader = new FileReader();

    reader.onload = ev => {
      setBackPreview(
        ev.target.result
      );
    };

    reader.readAsDataURL(file);

    // ----------------------------------------------
    // STATUS
    // ----------------------------------------------

    setBackStatus('scanning');

    setShowBackRaw(false);

    try {
      // --------------------------------------------
      // SEND BACK IMAGE TO LARAVEL + GEMINI
      // --------------------------------------------

      const result =
        await extractWithGemini(
          file,
          'back'
        );

      console.log(
        'Gemini BACK RAW:',
        result
      );

      // --------------------------------------------
      // NORMALIZE BACK RESULT
      // --------------------------------------------

      const normalizedResult = {
        gender:
          normalizeGender(
            result?.gender
          ),

        civilStatus:
          normalizeCivilStatus(
            result?.civilStatus
          )
      };

      console.log(
        'NORMALIZED BACK:',
        normalizedResult
      );

      // --------------------------------------------
      // SAVE BACK RESULT
      // --------------------------------------------

      setBackResult(
        normalizedResult
      );

      setBackText(
        JSON.stringify(
          normalizedResult,
          null,
          2
        )
      );

      setBackStatus('done');

      // --------------------------------------------
      // IMPORTANT:
      // Use frontResult state directly.
      //
      // DO NOT use frontText here because React
      // state updates are asynchronous.
      // --------------------------------------------

      const n =
        applyExtractions(
          frontResult,
          normalizedResult
        );

      if (n > 0) {
        toast.success(
          `Back scanned — ${n} field${
            n > 1 ? 's' : ''
          } auto-filled!`
        );
      } else {
        toast(
          'Back scanned, but Gender/Civil Status could not be detected.',
          {
            icon: '⚠️'
          }
        );
      }
    } catch (err) {
      console.error(
        'BACK OCR ERROR:',
        err
      );

      setBackStatus('error');

      toast.error(
        err.message ||
        'Failed to scan back of ID.'
      );
    }
  };

  // ====================================================
  // REMOVE FRONT
  // ====================================================

  const removeFront = () => {
    setFrontFile(null);
    setFrontPreview(null);
    setFrontStatus('idle');
    setFrontText('');
    setFrontResult({});
    setShowFrontRaw(false);

    if (frontRef.current) {
      frontRef.current.value = '';
    }
  };

  // ====================================================
  // REMOVE BACK
  // ====================================================

  const removeBack = () => {
    setBackFile(null);
    setBackPreview(null);
    setBackStatus('idle');
    setBackText('');
    setBackResult({});
    setShowBackRaw(false);

    if (backRef.current) {
      backRef.current.value = '';
    }
  };

  // ====================================================
  // SUBMIT REGISTRATION
  // ====================================================

  const handleSubmit = async e => {
    e.preventDefault();

    // ----------------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------------

    if (
      form.password !==
      form.password_confirmation
    ) {
      toast.error(
        'Passwords do not match'
      );

      return;
    }

    // ----------------------------------------------
    // SALARY VALIDATION
    // ----------------------------------------------

    if (!form.income_class) {
      toast.error(
        'Enter your monthly salary.'
      );

      return;
    }

    // ----------------------------------------------
    // FRONT ID REQUIRED
    // ----------------------------------------------

    if (!frontFile) {
      toast.error(
        'Please upload the FRONT of your ID.'
      );

      return;
    }

    // ----------------------------------------------
    // PREVENT SUBMIT WHILE OCR IS RUNNING
    // ----------------------------------------------

    if (
      frontStatus === 'scanning' ||
      backStatus === 'scanning'
    ) {
      toast.error(
        'ID still scanning.'
      );

      return;
    }

    setLoading(true);

    try {
      const payload =
        new FormData();

      // --------------------------------------------
      // NORMAL FORM DATA
      // --------------------------------------------

      Object.entries(form).forEach(
        ([key, value]) => {
          payload.append(
            key,
            value
          );
        }
      );

      // --------------------------------------------
      // FRONT ID FILE
      // --------------------------------------------

      payload.append(
        'id_document',
        frontFile
      );

      // --------------------------------------------
      // STRUCTURED OCR DATA
      //
      // Instead of:
      //
      // frontText + '\n' + backText
      //
      // send proper JSON.
      // --------------------------------------------

      payload.append(
        'ocr_extracted_text',
        JSON.stringify(
          {
            front: frontResult,
            back: backResult
          },
          null,
          2
        )
      );

      console.log(
        'FINAL FORM:',
        form
      );

      console.log(
        'FINAL OCR DATA:',
        {
          front: frontResult,
          back: backResult
        }
      );

      // --------------------------------------------
      // REGISTER USER
      // --------------------------------------------

      await registerUser(
        payload
      );

      toast.success(
        'Registration successful!'
      );

      queueMicrotask(() => {
        navigate(
          '/dashboard',
          {
            replace: true
          }
        );
      });
    } catch (err) {
      console.error(
        'REGISTRATION ERROR:',
        err
      );

      const errors =
        err.response?.data?.errors;

      if (errors) {
        Object.values(errors)
          .flat()
          .forEach(msg => {
            toast.error(msg);
          });
      } else {
        toast.error(
          err.response?.data?.message ||
          'Registration failed'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // UI HELPERS
  // ====================================================

  const input =
    'w-full rounded-2xl border border-[#d4c29a] bg-[#faf7ef] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c9a227] transition';

  const afInput = key =>
    `${input} ${
      autoFilled[key]
        ? 'border-[#c9a227] bg-[#fffbf0] ring-1 ring-[#c9a227]/40'
        : ''
    }`;

  const afLabel = key =>
    `flex items-center text-sm font-semibold mb-2 ${
      autoFilled[key]
        ? 'text-[#8b6b2e]'
        : 'text-[#2f3e2e]'
    }`;

  const badge = key =>
    autoFilled[key] && (
      <span className="inline-flex items-center gap-1 ml-2 text-[10px] font-semibold text-[#8b6b2e] bg-[#fdf6e3] border border-[#ecd9a0] rounded-full px-2 py-0.5">
        <Sparkles size={10} />
        from ID
      </span>
    );

  // ====================================================
  // STATUS ICON
  // ====================================================

  const StatusIcon = ({
    status
  }) => {
    if (
      status === 'scanning'
    ) {
      return (
        <Loader2
          size={15}
          className="animate-spin text-[#8b6b2e]"
        />
      );
    }

    if (
      status === 'done'
    ) {
      return (
        <CheckCircle2
          size={15}
          className="text-[#2f5d3f]"
        />
      );
    }

    if (
      status === 'error'
    ) {
      return (
        <XCircle
          size={15}
          className="text-red-500"
        />
      );
    }

    return null;
  };

  // ====================================================
  // STATUS TEXT
  // ====================================================

  const StatusText = ({
    status
  }) => {
    if (
      status === 'scanning'
    ) {
      return (
        <span className="text-sm text-[#8b6b2e] font-medium">
          Scanning with Gemini…
        </span>
      );
    }

    if (
      status === 'done'
    ) {
      return (
        <span className="text-sm text-[#2f5d3f] font-medium">
          Scanned successfully
        </span>
      );
    }

    if (
      status === 'error'
    ) {
      return (
        <span className="text-sm text-red-500 font-medium">
          Scan failed
        </span>
      );
    }

    return null;
  };

  // ====================================================
  // ID UPLOAD CARD
  // ====================================================

  const IdCard = ({
    side,
    file,
    preview,
    status,
    rawText,
    showRaw,
    setShowRaw,
    inputRef,
    onUpload,
    onRemove
  }) => (
    <div className="flex-1">
      <p className="text-xs font-semibold text-[#2f3e2e] mb-2 uppercase tracking-wide">
        {side === 'front'
          ? '① Front (name / birthdate / address)'
          : '② Back (sex / civil status)'}
      </p>

      {!file ? (
        <label
          htmlFor={`id-${side}`}
          className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[#d4c29a] bg-[#faf7ef] rounded-2xl py-7 cursor-pointer hover:border-[#c9a227] hover:bg-[#fbf3da] transition"
        >
          <Upload
            size={22}
            className="text-[#7d5b2f]"
          />

          <span className="text-xs font-medium text-[#2f3e2e]">
            Click to upload {side} side
          </span>

          <span className="text-[11px] text-gray-400">
            JPG, PNG, WEBP — max 8MB
          </span>

          <input
            id={`id-${side}`}
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      ) : (
        <div className="border border-[#d4c29a] bg-[#faf7ef] rounded-2xl p-3">
          <div className="flex gap-3 items-start">
            <img
              src={preview}
              alt={`${side} ID`}
              className="w-24 h-20 object-cover rounded-xl border border-[#d4c29a] flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#2f3e2e] truncate">
                {file.name}
              </p>

              <p className="text-[11px] text-gray-400 mb-1">
                {(file.size / 1024).toFixed(0)} KB
              </p>

              <div className="flex items-center gap-1.5">
                <StatusIcon
                  status={status}
                />

                <StatusText
                  status={status}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-[11px] font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <RotateCcw size={11} />
                  Remove
                </button>

                {rawText && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowRaw(
                        s => !s
                      )
                    }
                    className="flex items-center gap-0.5 text-[11px] font-semibold text-[#7d5b2f] hover:text-[#c9a227]"
                  >
                    {showRaw ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}

                    Raw JSON
                  </button>
                )}
              </div>
            </div>
          </div>

          {showRaw && (
            <pre className="mt-2 text-[10px] text-gray-500 whitespace-pre-wrap bg-white border border-[#d4c29a]/40 rounded-xl p-2 max-h-32 overflow-y-auto">
              {rawText ||
                '(empty)'}
            </pre>
          )}
        </div>
      )}
    </div>
  );

  // ====================================================
  // INCOME BADGE
  // ====================================================

  const incomeBadge = () => {
    if (!form.income_class) {
      return null;
    }

    const s = {
      'Lower Class': {
        bg: '#eef6ee',
        text: '#2f5d3f',
        border: '#bfe0c2'
      },

      'Middle Class': {
        bg: '#fdf6e3',
        text: '#8b6b2e',
        border: '#ecd9a0'
      },

      'Upper Class': {
        bg: '#fbeaea',
        text: '#8b1a1a',
        border: '#e7b8b8'
      }
    }[form.income_class];

    return (
      <div
        className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border"
        style={{
          background: s.bg,
          color: s.text,
          borderColor: s.border
        }}
      >
        <CheckCircle2 size={15} />

        Classified as:

        <strong>
          {form.income_class}
        </strong>
      </div>
    );
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen relative py-10 px-4 overflow-hidden">

      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('/catalina.jpg')"
        }}
      />

      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#2f3e2e]/80 via-black/70 to-[#7d5b2f]/70" />

      <div className="relative z-10 max-w-3xl mx-auto">

        <div className="bg-white/95 backdrop-blur-xl border border-[#c9a227]/30 rounded-3xl shadow-2xl overflow-hidden">

          {/* Top gold line */}
          <div className="h-2 bg-gradient-to-r from-[#c9a227] via-[#8b6b2e] to-[#2f5d3f]" />

          <div className="p-8">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="text-center mb-8">

              <img
                src="/logo.png"
                alt="Logo"
                className="w-24 h-24 rounded-full border-4 border-[#c9a227] shadow-lg object-cover mx-auto"
              />

              <h2 className="mt-4 text-3xl font-bold text-[#2f3e2e]">
                Resident Registration
              </h2>

              <p className="text-[#7d5b2f] text-sm mt-1 font-medium">
                Create your Barangay Sta. Catalina account
              </p>
            </div>

            {/* ==================================================
                STEP 1 - ID UPLOAD
            ================================================== */}

            <div className="mb-8">

              <div className="flex items-center justify-between mb-2">

                <label className="text-sm font-semibold text-[#2f3e2e]">
                  Step 1 — Upload Government ID *
                </label>

                {filledCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8b6b2e] bg-[#fdf6e3] border border-[#ecd9a0] rounded-full px-2.5 py-1">
                    <Sparkles size={11} />

                    {filledCount} field
                    {filledCount > 1
                      ? 's'
                      : ''}{' '}
                    auto-filled
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Upload <strong>both sides</strong> of
                your PhilSys / National ID.
                Powered by Gemini AI.
              </p>

              <div className="flex gap-4">

                {/* FRONT */}
                <IdCard
                  side="front"
                  file={frontFile}
                  preview={frontPreview}
                  status={frontStatus}
                  rawText={frontText}
                  showRaw={showFrontRaw}
                  setShowRaw={
                    setShowFrontRaw
                  }
                  inputRef={frontRef}
                  onUpload={handleFront}
                  onRemove={removeFront}
                />

                {/* BACK */}
                <IdCard
                  side="back"
                  file={backFile}
                  preview={backPreview}
                  status={backStatus}
                  rawText={backText}
                  showRaw={showBackRaw}
                  setShowRaw={
                    setShowBackRaw
                  }
                  inputRef={backRef}
                  onUpload={handleBack}
                  onRemove={removeBack}
                />

              </div>

              {filledCount > 0 && (
                <p className="mt-2 text-xs text-[#8b6b2e]">
                  ✨ Fields highlighted in gold were
                  auto-filled — please review and
                  correct if needed.
                </p>
              )}
            </div>

            {/* ==================================================
                STEP 2
            ================================================== */}

            <div className="flex items-center gap-3 mb-6">

              <div className="h-px flex-1 bg-[#d4c29a]/50" />

              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Step 2 — Complete Your Details
              </span>

              <div className="h-px flex-1 bg-[#d4c29a]/50" />

            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* FULL NAME */}
                <div className="md:col-span-2">

                  <label
                    className={afLabel('name')}
                  >
                    Full Name *

                    {badge('name')}
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={e =>
                      setField(
                        'name',
                        e.target.value
                      )
                    }
                    className={afInput('name')}
                    placeholder="Juan Dela Cruz"
                    required
                  />

                </div>

                {/* EMAIL */}
                <div>

                  <label className="block text-sm font-semibold text-[#2f3e2e] mb-2">
                    Email *
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={e =>
                      setField(
                        'email',
                        e.target.value
                      )
                    }
                    className={input}
                    required
                  />

                </div>

                {/* PHONE */}
                <div>

                  <label className="block text-sm font-semibold text-[#2f3e2e] mb-2">
                    Phone *
                  </label>

                  <input
                    type="text"
                    value={form.phone}
                    onChange={e =>
                      setField(
                        'phone',
                        e.target.value
                      )
                    }
                    className={input}
                    placeholder="+63912..."
                    required
                  />

                </div>

                {/* PASSWORD */}
                <div>

                  <label className="block text-sm font-semibold text-[#2f3e2e] mb-2">
                    Password *
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPw
                          ? 'text'
                          : 'password'
                      }
                      value={form.password}
                      onChange={e =>
                        setField(
                          'password',
                          e.target.value
                        )
                      }
                      className={`${input} pr-12`}
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPw(
                          s => !s
                        )
                      }
                      className="absolute inset-y-0 right-4 flex items-center text-[#7d5b2f]"
                    >
                      {showPw ? (
                        <Eye size={20} />
                      ) : (
                        <EyeOff size={20} />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}
                <div>

                  <label className="block text-sm font-semibold text-[#2f3e2e] mb-2">
                    Confirm Password *
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showCpw
                          ? 'text'
                          : 'password'
                      }
                      value={
                        form.password_confirmation
                      }
                      onChange={e =>
                        setField(
                          'password_confirmation',
                          e.target.value
                        )
                      }
                      className={`${input} pr-12`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCpw(
                          s => !s
                        )
                      }
                      className="absolute inset-y-0 right-4 flex items-center text-[#7d5b2f]"
                    >
                      {showCpw ? (
                        <Eye size={20} />
                      ) : (
                        <EyeOff size={20} />
                      )}
                    </button>

                  </div>

                </div>

                {/* BIRTHDATE */}
                <div>

                  <label
                    className={afLabel(
                      'birthdate'
                    )}
                  >
                    Birthdate *

                    {badge(
                      'birthdate'
                    )}
                  </label>

                  <input
                    type="date"
                    value={
                      form.birthdate
                    }
                    onChange={e =>
                      setField(
                        'birthdate',
                        e.target.value
                      )
                    }
                    className={afInput(
                      'birthdate'
                    )}
                    required
                  />

                </div>

                {/* GENDER */}
                <div>

                  <label
                    className={afLabel(
                      'gender'
                    )}
                  >
                    Gender *

                    {badge('gender')}
                  </label>

                  <select
                    value={form.gender}
                    onChange={e =>
                      setField(
                        'gender',
                        e.target.value
                      )
                    }
                    className={afInput(
                      'gender'
                    )}
                    required
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option>
                      Male
                    </option>

                    <option>
                      Female
                    </option>

                    <option>
                      Other
                    </option>
                  </select>

                </div>

                {/* PUROK */}
                <div>

                  <label className="block text-sm font-semibold text-[#2f3e2e] mb-2">
                    Purok *
                  </label>

                  <select
                    value={form.purok}
                    onChange={e =>
                      setField(
                        'purok',
                        e.target.value
                      )
                    }
                    className={input}
                    required
                  >
                    <option value="">
                      Select Purok
                    </option>

                    {PUROKS.map(
                      purok => (
                        <option
                          key={purok}
                        >
                          {purok}
                        </option>
                      )
                    )}
                  </select>

                </div>

                {/* CIVIL STATUS */}
                <div>

                  <label
                    className={afLabel(
                      'civil_status'
                    )}
                  >
                    Civil Status *

                    {badge(
                      'civil_status'
                    )}
                  </label>

                  <select
                    value={
                      form.civil_status
                    }
                    onChange={e =>
                      setField(
                        'civil_status',
                        e.target.value
                      )
                    }
                    className={afInput(
                      'civil_status'
                    )}
                    required
                  >
                    <option value="">
                      Select Status
                    </option>

                    <option>
                      Single
                    </option>

                    <option>
                      Married
                    </option>

                    <option>
                      Widowed
                    </option>

                    <option>
                      Separated
                    </option>
                  </select>

                </div>

                {/* MONTHLY SALARY */}
                <div>

                  <label className="block text-sm font-semibold text-[#2f3e2e] mb-2">
                    Monthly Salary (₱) *
                  </label>

                  <div className="relative">

                    <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 text-sm">
                      ₱
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.monthly_salary
                      }
                      onChange={e =>
                        handleSalary(
                          e.target.value
                        )
                      }
                      className={`${input} pl-8`}
                      placeholder="e.g. 18000"
                      required
                    />

                  </div>

                  {incomeBadge()}

                </div>

                {/* ADDRESS */}
                <div className="md:col-span-2">

                  <label
                    className={afLabel(
                      'address'
                    )}
                  >
                    Home Address *

                    {badge('address')}
                  </label>

                  <input
                    type="text"
                    value={form.address}
                    onChange={e =>
                      setField(
                        'address',
                        e.target.value
                      )
                    }
                    className={afInput(
                      'address'
                    )}
                    placeholder="House No., Street, Brgy. Sta. Catalina"
                    required
                  />

                </div>

                {/* VOTER */}
                <div className="md:col-span-2">

                  <label className="flex items-center gap-3 cursor-pointer bg-[#faf7ef] border border-[#d4c29a] rounded-2xl px-4 py-3">

                    <input
                      type="checkbox"
                      checked={
                        form.is_voter
                      }
                      onChange={e =>
                        setField(
                          'is_voter',
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 accent-[#2f5d3f]"
                    />

                    <span className="text-sm text-[#2f3e2e]">
                      I am a registered voter in
                      Brgy. Sta. Catalina
                    </span>

                  </label>

                </div>

              </div>

              {/* ==================================================
                  SUBMIT
              ================================================== */}

              <button
                type="submit"
                disabled={
                  loading ||
                  frontStatus ===
                    'scanning' ||
                  backStatus ===
                    'scanning'
                }
                className="w-full bg-gradient-to-r from-[#2f5d3f] to-[#3f7d56] hover:from-[#264d34] hover:to-[#346947] text-white py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading
                  ? 'Creating Account…'
                  : 'Create Account'}
              </button>

            </form>

            {/* ==================================================
                FOOTER LINKS
            ================================================== */}

            <div className="mt-6 text-center space-y-2">

              <p className="text-sm text-gray-600">
                Already have an account?{' '}

                <Link
                  to="/login"
                  className="text-[#2f5d3f] font-semibold hover:text-[#c9a227] transition"
                >
                  Login here
                </Link>
              </p>

              <Link
                to="/"
                className="block text-xs text-gray-400 hover:text-[#7d5b2f] transition"
              >
                ← Back to Home
              </Link>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}