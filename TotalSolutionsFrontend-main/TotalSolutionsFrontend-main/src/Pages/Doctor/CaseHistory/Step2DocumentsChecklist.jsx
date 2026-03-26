export default function Step2DocumentsChecklist({ formData, updateFormData }) {
  const handleCheckboxChange = (name) => {
    updateFormData(name, !formData[name]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const checklistItems = [
    { key: "consultationPaper", label: "Consultation Paper" },
    { key: "previousMedicalDocs", label: "Previous Medical Documents" },
    { key: "testReports", label: "Test Reports" },
    { key: "consentForm", label: "Consent Form" },
    { key: "parentConcerns", label: "Parent Concerns" },
    { key: "therapyChange", label: "Therapy Change" },
    { key: "therapistChange", label: "Therapist Change" },
    { key: "foodAllergy", label: "Food Allergy" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-[#ab1c1c] mb-6">
        Documents Checklist
      </h2>

      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-500 mb-4">
          Check all documents that have been collected from the parent.
        </p>

        <div className="space-y-3">
          {checklistItems.map(({ key, label }) => (
            <div key={key}>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData[key]}
                  onChange={() => handleCheckboxChange(key)}
                  className="w-5 h-5 text-[#ab1c1c] rounded border-gray-300 focus:ring-[#ab1c1c]"
                />
                <span className="text-sm font-medium text-gray-700">
                  {label}
                </span>
                {formData[key] && (
                  <span className="ml-auto text-green-600 text-xs font-medium">
                    ✓ Collected
                  </span>
                )}
              </label>

              {/* Show text area for Parent Concerns when checked */}
              {key === "parentConcerns" && formData.parentConcerns && (
                <div className="mt-2 ml-8">
                  <textarea
                    name="parentConcernsText"
                    value={formData.parentConcernsText}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
                    placeholder="Describe parent concerns..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-[#ab1c1c]">
              {checklistItems.filter((item) => formData[item.key]).length}
            </span>{" "}
            of {checklistItems.length} documents collected
          </p>
        </div>
      </div>
    </div>
  );
}
