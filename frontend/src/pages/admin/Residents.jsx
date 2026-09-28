import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

export default function AdminResidents() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FILTER STATES
  // =========================================================
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [purokFilter, setPurokFilter] = useState('');
  const [civilStatusFilter, setCivilStatusFilter] = useState('');
  const [incomeClassFilter, setIncomeClassFilter] = useState('');

  // =========================================================
  // ADD RESIDENT MODAL
  // =========================================================
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    birthdate: '',
    age: '',
    gender: '',
    mother_name: '',
    father_name: '',
    occupation: '',
    address: '',
    purok: '',
    phone: '',
    civil_status: '',
    income_class: 'Lower Class',
    is_voter: false,
  });

  // =========================================================
  // FETCH RESIDENTS
  // =========================================================
  const fetchResidents = () => {
    setLoading(true);

    const params = new URLSearchParams();

    // Search
    if (search) {
      params.set('search', search);
    }

    // Age
    if (ageFilter) {
      params.set('age', ageFilter);
    }

    // Gender
    if (genderFilter) {
      params.set('gender', genderFilter);
    }

    // Purok
    if (purokFilter) {
      params.set('purok', purokFilter);
    }

    // Civil Status
    if (civilStatusFilter) {
      params.set('civil_status', civilStatusFilter);
    }

    // Income Class
    if (incomeClassFilter) {
      params.set('income_class', incomeClassFilter);
    }

    api
      .get(`/admin/residents?${params.toString()}`)
      .then((response) => {
        setResidents(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          'Failed to fetch residents:',
          error
        );

        toast.error('Failed to load residents');
        setLoading(false);
      });
  };

  // =========================================================
  // FETCH WHEN FILTERS CHANGE
  // =========================================================
  useEffect(() => {
    fetchResidents();
  }, [
    search,
    ageFilter,
    genderFilter,
    purokFilter,
    civilStatusFilter,
    incomeClassFilter,
  ]);

  // =========================================================
  // CALCULATE AGE
  // =========================================================
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';

    const today = new Date();
    const birth = new Date(`${birthdate}T00:00:00`);

    if (Number.isNaN(birth.getTime())) {
      return '';
    }

    let age =
      today.getFullYear() -
      birth.getFullYear();

    const monthDifference =
      today.getMonth() -
      birth.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < birth.getDate()
      )
    ) {
      age--;
    }

    return age >= 0 ? age : '';
  };

  // =========================================================
  // CLEAR ALL FILTERS
  // =========================================================
  const clearFilters = () => {
    setSearch('');
    setAgeFilter('');
    setGenderFilter('');
    setPurokFilter('');
    setCivilStatusFilter('');
    setIncomeClassFilter('');
  };

  // =========================================================
  // ADD RESIDENT
  // =========================================================
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        '/admin/residents',
        form
      );

      toast.success('Resident added!');

      setShowForm(false);

      setForm({
        full_name: '',
        birthdate: '',
        age: '',
        gender: '',
        mother_name: '',
        father_name: '',
        occupation: '',
        address: '',
        purok: '',
        phone: '',
        civil_status: '',
        income_class: 'Lower Class',
        is_voter: false,
      });

      fetchResidents();

    } catch (error) {
      console.error(
        'Failed to add resident:',
        error
      );

      if (error.response?.data?.errors) {
        console.error(
          error.response.data.errors
        );
      }

      toast.error(
        'Failed to add resident'
      );
    }
  };

  // =========================================================
  // INCOME CLASS COLORS
  // =========================================================
  const clusterColors = {
    'Lower Class':
      'bg-green-100 text-green-800',

    'Middle Class':
      'bg-yellow-100 text-yellow-800',

    'Upper Class':
      'bg-purple-100 text-purple-800',
  };

  return (
    <AdminLayout>

      <div>

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold text-gray-800">
            Resident Management
          </h2>

          <button
            onClick={() =>
              setShowForm(true)
            }
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition text-sm font-semibold"
          >
            + Add Resident
          </button>

        </div>

        {/* =====================================================
            FILTER SECTION
        ====================================================== */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-5">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h3 className="font-semibold text-gray-800">
                Filter Residents
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                You can combine multiple filters.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-800 font-semibold"
            >
              Clear Filters
            </button>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">

            {/* =================================================
                SEARCH
            ================================================== */}
            <div>

              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Search Name
              </label>

              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>

            {/* =================================================
                AGE
            ================================================== */}
            <div>

              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Age
              </label>

              <input
                type="number"
                min="0"
                max="150"
                placeholder="Any age"
                value={ageFilter}
                onChange={(e) =>
                  setAgeFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>

            {/* =================================================
                GENDER
            ================================================== */}
            <div>

              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Gender
              </label>

              <select
                value={genderFilter}
                onChange={(e) =>
                  setGenderFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >

                <option value="">
                  All Genders
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {/* =================================================
                PUROK
            ================================================== */}
            <div>

              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Purok
              </label>

              <select
                value={purokFilter}
                onChange={(e) =>
                  setPurokFilter(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >

                <option value="">
                  All Puroks
                </option>

                <option value="Purok 1">
                  Purok 1
                </option>

                <option value="Purok 2">
                  Purok 2
                </option>

                <option value="Purok 3">
                  Purok 3
                </option>

                <option value="Purok 4">
                  Purok 4
                </option>

                <option value="Purok 5">
                  Purok 5
                </option>

                <option value="Purok 6">
                  Purok 6
                </option>

                <option value="Purok 7">
                  Purok 7
                </option>

                <option value="Purok 8">
                  Purok 8
                </option>

              </select>

            </div>

            {/* =================================================
                CIVIL STATUS
            ================================================== */}
            <div>

              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Civil Status
              </label>

              <select
                value={civilStatusFilter}
                onChange={(e) =>
                  setCivilStatusFilter(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >

                <option value="">
                  All Statuses
                </option>

                <option value="Single">
                  Single
                </option>

                <option value="Married">
                  Married
                </option>

                <option value="Widowed">
                  Widowed
                </option>

                <option value="Separated">
                  Separated
                </option>

              </select>

            </div>

            {/* =================================================
                INCOME CLASS
            ================================================== */}
            <div>

              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Income Class
              </label>

              <select
                value={incomeClassFilter}
                onChange={(e) =>
                  setIncomeClassFilter(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >

                <option value="">
                  All Classes
                </option>

                <option value="Lower Class">
                  Lower Class
                </option>

                <option value="Middle Class">
                  Middle Class
                </option>

                <option value="Upper Class">
                  Upper Class
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* =====================================================
            RESIDENT TABLE
        ====================================================== */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Name
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Age
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Gender
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Mother's Name
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Father's Name
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Occupation
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Purok
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Civil Status
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Income Class
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Voter
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {/* LOADING */}
                {loading && (
                  <tr>

                    <td
                      colSpan={10}
                      className="text-center py-8 text-gray-400"
                    >
                      Loading...
                    </td>

                  </tr>
                )}

                {/* NO RESULTS */}
                {!loading &&
                  residents.length === 0 && (
                    <tr>

                      <td
                        colSpan={10}
                        className="text-center py-8 text-gray-400"
                      >
                        No residents found.
                      </td>

                    </tr>
                  )}

                {/* RESIDENTS */}
                {!loading &&
                  residents.map((r) => (

                    <tr
                      key={r.id}
                      className="hover:bg-gray-50"
                    >

                      {/* NAME */}
                      <td className="px-4 py-3">

                        <p className="font-medium">
                          {r.full_name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {r.phone || 'No phone'}
                        </p>

                      </td>

                      {/* AGE */}
                      <td className="px-4 py-3 text-gray-600">
                        {r.age ?? 'N/A'}
                      </td>

                      {/* GENDER */}
                      <td className="px-4 py-3 text-gray-600">
                        {r.gender}
                      </td>

                      {/* MOTHER */}
                      <td className="px-4 py-3 text-gray-600">
                        {r.mother_name || 'N/A'}
                      </td>

                      {/* FATHER */}
                      <td className="px-4 py-3 text-gray-600">
                        {r.father_name || 'N/A'}
                      </td>

                      {/* OCCUPATION */}
                      <td className="px-4 py-3 text-gray-600">
                        {r.occupation || 'N/A'}
                      </td>

                      {/* PUROK */}
                      <td className="px-4 py-3 text-gray-600">
                        {r.purok}
                      </td>

                      {/* CIVIL STATUS */}
                      <td className="px-4 py-3 text-gray-600">
                        {r.civil_status}
                      </td>

                      {/* INCOME CLASS */}
                      <td className="px-4 py-3">

                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            clusterColors[
                              r.income_class
                            ] ||
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {r.income_class}
                        </span>

                      </td>

                      {/* VOTER */}
                      <td className="px-4 py-3">
                        {r.is_voter
                          ? '✅'
                          : '❌'}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* =====================================================
            ADD RESIDENT MODAL
        ====================================================== */}
        {showForm && (

          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">

            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl my-4">

              <h3 className="font-bold text-gray-800 text-lg mb-4">
                Add New Resident
              </h3>

              <form
                onSubmit={handleAdd}
                className="grid grid-cols-2 gap-4"
              >

                {/* FULL NAME */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        full_name:
                          e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  />

                </div>

                {/* BIRTHDATE */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birthdate
                  </label>

                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => {

                      const birthdate =
                        e.target.value;

                      const age =
                        calculateAge(
                          birthdate
                        );

                      setForm({
                        ...form,
                        birthdate,
                        age,
                      });

                    }}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  />

                </div>

                {/* AGE */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>

                  <input
                    type="number"
                    value={form.age}
                    readOnly
                    placeholder="Automatically calculated"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-100 cursor-not-allowed text-sm"
                  />

                </div>

                {/* GENDER */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>

                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gender:
                          e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  >

                    <option value="">
                      Select...
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* MOTHER NAME */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother's Name
                  </label>

                  <input
                    type="text"
                    value={form.mother_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        mother_name:
                          e.target.value,
                      })
                    }
                    placeholder="Mother's full name"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />

                </div>

                {/* FATHER NAME */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name
                  </label>

                  <input
                    type="text"
                    value={form.father_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        father_name:
                          e.target.value,
                      })
                    }
                    placeholder="Father's full name"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />

                </div>

                {/* OCCUPATION */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>

                  <input
                    type="text"
                    value={form.occupation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        occupation:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. Student, Farmer, Teacher"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />

                </div>

                {/* PHONE */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>

                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone:
                          e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />

                </div>

                {/* ADDRESS */}
                <div className="col-span-2">

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>

                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address:
                          e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  />

                </div>

                {/* PUROK */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purok
                  </label>

                  <select
                    value={form.purok}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        purok:
                          e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  >

                    <option value="">
                      Select...
                    </option>

                    <option>Purok 1</option>
                    <option>Purok 2</option>
                    <option>Purok 3</option>
                    <option>Purok 4</option>
                    <option>Purok 5</option>
                    <option>Purok 6</option>
                    <option>Purok 7</option>
                    <option>Purok 8</option>

                  </select>

                </div>

                {/* CIVIL STATUS */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Civil Status
                  </label>

                  <select
                    value={form.civil_status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        civil_status:
                          e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  >

                    <option value="">
                      Select...
                    </option>

                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                    <option>Separated</option>

                  </select>

                </div>

                {/* INCOME CLASS */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Income Class
                  </label>

                  <select
                    value={form.income_class}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        income_class:
                          e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    required
                  >

                    <option>
                      Lower Class
                    </option>

                    <option>
                      Middle Class
                    </option>

                    <option>
                      Upper Class
                    </option>

                  </select>

                </div>

                {/* VOTER */}
                <div className="col-span-2">

                  <label className="flex items-center gap-2 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={form.is_voter}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          is_voter:
                            e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />

                    <span className="text-sm text-gray-700">
                      Registered Voter
                    </span>

                  </label>

                </div>

                {/* BUTTONS */}
                <div className="col-span-2 flex gap-3 mt-2">

                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                    className="flex-1 border border-gray-300 py-2.5 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition"
                  >
                    Add Resident
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>

    </AdminLayout>
  );
}