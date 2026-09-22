import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'Fight/Altercation', icon: '👊', color: 'border-red-300 bg-red-50' },
  { value: 'Uncollected Garbage', icon: '🗑️', color: 'border-yellow-300 bg-yellow-50' },
  { value: 'Noise Complaint', icon: '📢', color: 'border-orange-300 bg-orange-50' },
  { value: 'Illegal Parking', icon: '🚗', color: 'border-purple-300 bg-purple-50' },
  { value: 'Broken Street Light', icon: '💡', color: 'border-blue-300 bg-blue-50' },
  { value: 'Flooding', icon: '🌊', color: 'border-cyan-300 bg-cyan-50' },
  { value: 'Other', icon: '⚠️', color: 'border-gray-300 bg-gray-50' },
];

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export default function ReportIncident() {
  const [form, setForm] = useState({ category: '', location: '', description: '' });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!form.category) {
      newErrors.category = 'Please select an incident type.';
    }

    if (!form.location.trim()) {
      newErrors.location = 'Location is required.';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters.';
    }

    // Photo validation (only if user selected a file)
    if (photo) {
      if (!ACCEPTED_IMAGE_TYPES.includes(photo.type)) {
        newErrors.photo = 'Only image files are allowed (JPG, PNG, WEBP, GIF). PDF and other files are not accepted.';
      } else if (photo.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.photo = 'Image size must be less than 5MB.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPhoto(null);
      setErrors(prev => ({ ...prev, photo: null }));
      return;
    }

    // Immediate validation when selecting file
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhoto(null);
      setErrors(prev => ({
        ...prev,
        photo: 'Only image files are allowed (JPG, PNG, WEBP, GIF). PDF and other files are not accepted.'
      }));
      e.target.value = ''; // clear the input
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhoto(null);
      setErrors(prev => ({
        ...prev,
        photo: 'Image size must be less than 5MB.'
      }));
      e.target.value = '';
      return;
    }

    setPhoto(file);
    setErrors(prev => ({ ...prev, photo: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (photo) data.append('photo', photo);

      await api.post('/incidents', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Incident reported successfully!');
      navigate('/my-reports');
    } catch (err) {
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="md:ml-56 p-4 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Report an Incident</h2>
        <p className="text-sm text-gray-500 mb-5">Help keep our barangay safe and clean.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Select Incident Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => {
                    setForm({ ...form, category: cat.value });
                    setErrors({ ...errors, category: null });
                  }}
                  className={`p-3 rounded-xl border-2 text-center transition ${
                    form.category === cat.value
                      ? 'border-blue-500 bg-blue-50'
                      : `${cat.color} border`
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <p className="text-xs font-medium text-gray-700">{cat.value}</p>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => {
                setForm({ ...form, location: e.target.value });
                setErrors({ ...errors, location: null });
              }}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.location ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="e.g. Near Purok 3 Basketball Court"
            />
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description * <span className="text-gray-400 font-normal">(min. 10 characters)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                setErrors({ ...errors, description: null });
              }}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                errors.description ? 'border-red-400' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Describe the incident in detail..."
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-red-500 text-xs">{errors.description}</p>
              ) : (
                <span></span>
              )}
              <p
                className={`text-xs ${
                  form.description.trim().length < 10
                    ? 'text-red-400'
                    : 'text-green-600'
                }`}
              >
                {form.description.trim().length}/10 characters
              </p>
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handlePhotoChange}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.photo ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Accepted: JPG, PNG, WEBP, GIF only. Max 5MB. PDF and other files are not allowed.
            </p>
            {errors.photo && (
              <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
            )}
            {photo && !errors.photo && (
              <p className="text-green-600 text-xs mt-1">
                ✓ Selected: {photo.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : '🚨 Submit Report'}
          </button>
        </form>
      </div>
    </UserLayout>
  );
}