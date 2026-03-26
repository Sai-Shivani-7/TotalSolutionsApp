export default function Step7AssessmentNotes({ formData, updateFormData }) {
  const data = formData.assessmentNotes;

  const handleFieldChange = (field, value) => {
    updateFormData("assessmentNotes", (prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#ab1c1c] mb-6">
        Assessment Notes
      </h2>

      {/* Shape Assessments */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-4">
          Shape Copy Results
        </h3>
        <div className="space-y-4">
          {/* Cylinder */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700 w-32">
              Cylinder
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cylinderResult"
                  value="correct"
                  checked={data.cylinderResult === "correct"}
                  onChange={(e) =>
                    handleFieldChange("cylinderResult", e.target.value)
                  }
                  className="w-4 h-4 text-[#ab1c1c] focus:ring-[#ab1c1c]"
                />
                <span className="text-sm text-green-700">Correct</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cylinderResult"
                  value="incorrect"
                  checked={data.cylinderResult === "incorrect"}
                  onChange={(e) =>
                    handleFieldChange("cylinderResult", e.target.value)
                  }
                  className="w-4 h-4 text-[#ab1c1c] focus:ring-[#ab1c1c]"
                />
                <span className="text-sm text-red-700">Incorrect</span>
              </label>
            </div>
          </div>

          {/* Cube */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700 w-32">
              Cube
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cubeResult"
                  value="correct"
                  checked={data.cubeResult === "correct"}
                  onChange={(e) =>
                    handleFieldChange("cubeResult", e.target.value)
                  }
                  className="w-4 h-4 text-[#ab1c1c] focus:ring-[#ab1c1c]"
                />
                <span className="text-sm text-green-700">Correct</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cubeResult"
                  value="incorrect"
                  checked={data.cubeResult === "incorrect"}
                  onChange={(e) =>
                    handleFieldChange("cubeResult", e.target.value)
                  }
                  className="w-4 h-4 text-[#ab1c1c] focus:ring-[#ab1c1c]"
                />
                <span className="text-sm text-red-700">Incorrect</span>
              </label>
            </div>
          </div>

          {/* Rectangle */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rectangle Response
            </label>
            <input
              type="text"
              value={data.rectangleResponse}
              onChange={(e) =>
                handleFieldChange("rectangleResponse", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
              placeholder="Describe the child's response to the rectangle"
            />
          </div>
        </div>
      </div>

      {/* Therapist Notes */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-3">
          Therapist Notes
        </h3>
        <textarea
          value={data.therapistNotes}
          onChange={(e) => handleFieldChange("therapistNotes", e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Enter therapist notes and observations..."
        />
      </div>

      {/* Observation Notes */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-[#ab1c1c] mb-3">
          Observation Notes
        </h3>
        <textarea
          value={data.observationNotes}
          onChange={(e) => handleFieldChange("observationNotes", e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
          placeholder="Enter observation notes..."
        />
      </div>

      {/* Assessment Date */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assessment Date
        </label>
        <input
          type="date"
          value={data.assessmentDate}
          onChange={(e) => handleFieldChange("assessmentDate", e.target.value)}
          className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none"
        />
      </div>
    </div>
  );
}
