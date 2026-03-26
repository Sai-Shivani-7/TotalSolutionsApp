export default function Step1Demographics({ formData, updateFormData }) {

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const handleTherapyChange = (index, field, value) => {
    updateFormData("therapyStarted", (prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#ab1c1c] mb-6">Demographics</h2>
      <p className="text-sm text-gray-500 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        ℹ️ Fill in the child's details. All data is saved at the final step using the <strong>Save</strong> button.
      </p>

      {/* Child Details */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-4 flex items-center gap-2">
          <span>👤</span> Child Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
            <input type="text" name="childName" value={formData.childName} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
              placeholder="Child's full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
            <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Therapist Name</label>
            <input type="text" name="therapistName" value={formData.therapistName} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
              placeholder="Therapist name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Centre</label>
            <input type="text" name="centre" value={formData.centre || ""} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
              placeholder="Centre / clinic name" />
          </div>
        </div>
      </div>

      {/* Therapy Started */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-4 flex items-center gap-2">
          <span>⚕️</span> Therapy Started
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2 text-gray-600 font-medium">Therapy Type</th>
                <th className="text-left p-2 text-gray-600 font-medium">Started Date</th>
                <th className="text-left p-2 text-gray-600 font-medium">Therapist Name</th>
              </tr>
            </thead>
            <tbody>
              {formData.therapyStarted.map((therapy, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-2 font-medium text-gray-700">{therapy.type}</td>
                  <td className="p-2">
                    <input type="date" value={therapy.startedDate}
                      onChange={(e) => handleTherapyChange(index, "startedDate", e.target.value)}
                      className="w-full p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" />
                  </td>
                  <td className="p-2">
                    <input type="text" value={therapy.therapistName}
                      onChange={(e) => handleTherapyChange(index, "therapistName", e.target.value)}
                      className="w-full p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                      placeholder="Name" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Father Details */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-4 flex items-center gap-2">
          <span>👨</span> Father Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="Father's full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father Phone</label>
            <input type="tel" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="Phone number" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father WhatsApp</label>
            <input type="tel" name="fatherWhatsApp" value={formData.fatherWhatsApp} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="WhatsApp number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father Email</label>
            <input type="email" name="fatherEmail" value={formData.fatherEmail} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="Email address" />
          </div>
        </div>
      </div>

      {/* Mother Details */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-4 flex items-center gap-2">
          <span>👩</span> Mother Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother Name</label>
            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="Mother's full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother Phone</label>
            <input type="tel" name="motherPhone" value={formData.motherPhone} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="Phone number" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother WhatsApp</label>
            <input type="tel" name="motherWhatsApp" value={formData.motherWhatsApp} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="WhatsApp number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother Email</label>
            <input type="email" name="motherEmail" value={formData.motherEmail} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="Email address" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-4">Address</h3>
        <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Full address" />
      </div>

      {/* Additional */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-4 flex items-center gap-2">
          <span>📋</span> Additional Details
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pre-therapy Video Reference</label>
          <input type="text" name="preTherapyVideoRef" value={formData.preTherapyVideoRef} onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
            placeholder="Video file reference or link" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Therapy Added</label>
            <input type="text" name="newTherapyAdded" value={formData.newTherapyAdded} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="New therapy type" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of New Therapy</label>
            <input type="date" name="newTherapyDate" value={formData.newTherapyDate} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Therapist Name</label>
            <input type="text" name="newTherapistName" value={formData.newTherapistName} onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none" placeholder="Therapist for new therapy" />
          </div>
        </div>
      </div>
    </div>
  );
}
